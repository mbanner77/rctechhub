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
      const whereParts: string[] = [];
      const params: any[] = [];
      let pIndex = 1;
      for (const f of filters) {
        whereParts.push(`"${schema}"."${table}"."${f.col}" ${f.op} $${pIndex++}`);
        params.push(f.val);
      }
      const whereSql = whereParts.length ? ` where ${whereParts.join(" and ")}` : "";
      const orderSql = sortBy ? ` order by "${schema}"."${table}"."${sortBy}" ${sortDir}` : "";

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
