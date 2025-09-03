import { NextResponse, type NextRequest } from "next/server";
import { getPool } from "@/lib/pg";
import { isAuthenticated, unauthorizedResponse } from "@/app/api/shared/auth-utils";

function isValidIdent(v: string) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(v);
}

const allowedOps = new Set(["=", "<>", "<", ">", "<=", ">=", "LIKE", "ILIKE"]);

export async function GET(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) {
      return unauthorizedResponse();
    }
    const { searchParams } = new URL(request.url);
    const schema = searchParams.get("schema") || "public";
    const table = searchParams.get("table");
    const limitParam = Number(searchParams.get("limit") || 50);
    const offsetParam = Number(searchParams.get("offset") || 0);
    const sortBy = searchParams.get("sortBy") || undefined;
    const sortDir = (searchParams.get("sortDir") || "asc").toLowerCase();
    // Optional JSON-path sorting
    const sortJsonBase = searchParams.get("sortJsonBase") || undefined;
    const sortJsonPath = (searchParams.get("sortJsonPath") || "").split(",").filter(Boolean);
    const sortJsonText = (searchParams.get("sortJsonText") || "true").toLowerCase() === "true";
    const filtersRaw = searchParams.get("filters");

    if (!table) {
      return NextResponse.json({ error: "Parameter 'table' fehlt" }, { status: 400 });
    }
    if (!isValidIdent(schema) || !isValidIdent(table)) {
      return NextResponse.json({ error: "Ungültiger Schema- oder Tabellenname" }, { status: 400 });
    }
    if (sortBy && !isValidIdent(sortBy)) {
      return NextResponse.json({ error: "Ungültige Sortierspalte" }, { status: 400 });
    }
    if (!["asc", "desc"].includes(sortDir)) {
      return NextResponse.json({ error: "Ungültige Sortierrichtung" }, { status: 400 });
    }

    type Filter = { col: string; op: string; val: string };
    let filters: Filter[] = [];
    if (filtersRaw) {
      try {
        const parsed = JSON.parse(filtersRaw) as Filter[];
        if (Array.isArray(parsed)) {
          for (const f of parsed) {
            if (!f || !isValidIdent(f.col)) continue;
            const op = String(f.op || "=").toUpperCase();
            if (!allowedOps.has(op)) continue;
            filters.push({ col: f.col, op, val: String(f.val ?? "") });
          }
        }
      } catch {
        // ignore bad filters
      }
    }

    const limit = Math.min(Math.max(1, isFinite(limitParam) ? limitParam : 50), 200);
    const offset = Math.max(0, isFinite(offsetParam) ? offsetParam : 0);

    const pool = getPool();
    const client = await pool.connect();
    try {
      // Load column list for validation
      const colsRes = await client.query(
        `select column_name as name, data_type as type from information_schema.columns where table_schema = $1 and table_name = $2`,
        [schema, table]
      );
      const allowedCols = new Set<string>(colsRes.rows.map((r: any) => String(r.name)));
      const jsonCols = new Set<string>(colsRes.rows.filter((r: any) => String(r.type).toLowerCase().includes("json")).map((r: any) => String(r.name)));
      const allowedColsArray = Array.from(allowedCols);
      if (sortBy && !allowedCols.has(sortBy)) {
        return NextResponse.json({ error: `Ungültige Sortierspalte '${sortBy}'. Erlaubt: ${allowedColsArray.join(", ")}` }, { status: 400 });
      }
      if (sortJsonBase) {
        if (!isValidIdent(sortJsonBase) || !jsonCols.has(sortJsonBase)) {
          return NextResponse.json({ error: `Ungültige JSON-Sortierspalte '${sortJsonBase}'. Erlaubte JSON-Spalten: ${Array.from(jsonCols).join(", ")}` }, { status: 400 });
        }
        for (const seg of sortJsonPath) {
          if (!isValidIdent(seg)) {
            return NextResponse.json({ error: `Ungültiger JSON-Pfad-Segment '${seg}'` }, { status: 400 });
          }
        }
      }
      // Parse filters; allow either simple column filter or JSON-path filter objects
      type AnyFilter = { col?: string; op: string; val: string; jsonBase?: string; jsonPath?: string[]; text?: boolean };
      let parsedFilters: AnyFilter[] = filters as AnyFilter[];
      const validateAndNormalizeFilters: AnyFilter[] = [];
      for (const f of parsedFilters) {
        if (f.jsonBase) {
          // JSON filter
          const base = String(f.jsonBase);
          if (!isValidIdent(base) || !jsonCols.has(base)) {
            return NextResponse.json({ error: `Ungültiger JSON-Filter: Basis '${base}' ist keine JSON-Spalte.` }, { status: 400 });
          }
          const path = (f.jsonPath || []).map((p) => String(p));
          if (!path.length) {
            return NextResponse.json({ error: `JSON-Filter benötigt einen Pfad (jsonPath)` }, { status: 400 });
          }
          for (const seg of path) {
            if (!isValidIdent(seg)) {
              return NextResponse.json({ error: `Ungültiges JSON-Pfad-Segment '${seg}'` }, { status: 400 });
            }
          }
          validateAndNormalizeFilters.push({ op: f.op, val: f.val, jsonBase: base, jsonPath: path, text: f.text !== false });
        } else if (f.col) {
          const col = String(f.col);
          if (!allowedCols.has(col)) {
            return NextResponse.json({ error: `Ungültiger Filter auf Spalte '${col}'. Erlaubt: ${allowedColsArray.join(", ")}` }, { status: 400 });
          }
          validateAndNormalizeFilters.push({ col, op: f.op, val: f.val });
        }
      }

      const whereParts: string[] = [];
      const params: any[] = [];
      let pIndex = 1;
      for (const f of validateAndNormalizeFilters) {
        if (f.jsonBase) {
          // build json path expression: base -> 'a' -> 'b' (->> last if text)
          const chain = [
            `"${schema}"."${table}"."${f.jsonBase}"`,
            ...f.jsonPath!.slice(0, -1).map((seg) => `-> '${seg}'`),
            (f.text !== false ? `->> '${f.jsonPath![f.jsonPath!.length - 1]}'` : `-> '${f.jsonPath![f.jsonPath!.length - 1]}'`),
          ].join(" ");
          whereParts.push(`${chain} ${f.op} $${pIndex++}`);
          params.push(f.val);
        } else if (f.col) {
          whereParts.push(`"${schema}"."${table}"."${f.col}" ${f.op} $${pIndex++}`);
          params.push(f.val);
        }
      }
      const whereSql = whereParts.length ? ` where ${whereParts.join(" and ")}` : "";
      let orderSql = "";
      if (sortBy) {
        orderSql = ` order by "${schema}"."${table}"."${sortBy}" ${sortDir}`;
      } else if (sortJsonBase && sortJsonPath.length) {
        const pathChain = [
          `"${schema}"."${table}"."${sortJsonBase}"`,
          ...sortJsonPath.slice(0, -1).map((seg) => `-> '${seg}'`),
          (sortJsonText ? `->> '${sortJsonPath[sortJsonPath.length - 1]}'` : `-> '${sortJsonPath[sortJsonPath.length - 1]}'`),
        ].join(" ");
        orderSql = ` order by ${pathChain} ${sortDir}`;
      }

      const q = `select * from "${schema}"."${table}"${whereSql}${orderSql} limit $${pIndex} offset $${pIndex + 1}`;
      params.push(limit, offset);
      const res = await client.query(q, params);
      const columns = res.fields.map((f: any) => f.name);

      // total count
      let total: number | null = null;
      try {
        const cnt = await client.query(
          `select count(*)::int as cnt from "${schema}"."${table}"${whereSql}`,
          params.slice(0, params.length - 2)
        );
        total = (cnt.rows[0]?.cnt as any) ?? null;
      } catch {
        total = null;
      }

      return NextResponse.json({ columns, rows: res.rows, limit, offset, total });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("DB table-rows error:", err);
    return NextResponse.json({ error: err?.message || "DB table-rows error" }, { status: 500 });
  }
}
