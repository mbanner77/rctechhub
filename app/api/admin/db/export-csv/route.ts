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
    const sortBy = searchParams.get("sortBy") || undefined;
    const sortDir = (searchParams.get("sortDir") || "asc").toLowerCase();
    const filtersRaw = searchParams.get("filters");
    const capParam = Number(searchParams.get("cap") || 5000);

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
        // ignore
      }
    }

    const cap = Math.min(Math.max(1, isFinite(capParam) ? capParam : 5000), 100000);

    const pool = getPool();
    const client = await pool.connect();
    try {
      const whereParts: string[] = [];
      const params: any[] = [];
      let pIndex = 1;
      for (const f of filters) {
        whereParts.push(`"${schema}"."${table}"."${f.col}" ${f.op} $${pIndex++}`);
        params.push(f.val);
      }
      const whereSql = whereParts.length ? ` where ${whereParts.join(" and ")}` : "";
      const orderSql = sortBy ? ` order by "${schema}"."${table}"."${sortBy}" ${sortDir}` : "";
      const q = `select * from "${schema}"."${table}"${whereSql}${orderSql} limit $${pIndex}`;
      params.push(cap);

      const res = await client.query(q, params);
      const columns = res.fields.map((f: any) => f.name);

      // Build CSV
      const escape = (val: any) => {
        if (val == null) return "";
        const s = typeof val === "string" ? val : JSON.stringify(val);
        const needsQuotes = /[",\n\r]/.test(s);
        const esc = s.replace(/"/g, '""');
        return needsQuotes ? `"${esc}"` : esc;
      };
      const header = columns.join(",");
      const lines: string[] = [header];
      for (const row of res.rows as any[]) {
        const line = columns.map((c: string) => escape((row as any)[c])).join(",");
        lines.push(line);
      }
      const csv = lines.join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename=${schema}.${table}.csv`,
          "Cache-Control": "no-store",
        },
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("DB export-csv error:", err);
    return NextResponse.json({ error: err?.message || "DB export-csv error" }, { status: 500 });
  }
}
