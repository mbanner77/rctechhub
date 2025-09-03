import { NextResponse, type NextRequest } from "next/server";
import { getPool } from "@/lib/pg";
import { isAuthenticated, unauthorizedResponse } from "@/app/api/shared/auth-utils";

function isValidIdent(v: string) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(v);
}

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

    if (!table) {
      return NextResponse.json({ error: "Parameter 'table' fehlt" }, { status: 400 });
    }
    if (!isValidIdent(schema) || !isValidIdent(table)) {
      return NextResponse.json({ error: "Ungültiger Schema- oder Tabellenname" }, { status: 400 });
    }

    const limit = Math.min(Math.max(1, isFinite(limitParam) ? limitParam : 50), 200);
    const offset = Math.max(0, isFinite(offsetParam) ? offsetParam : 0);

    const pool = getPool();
    const client = await pool.connect();
    try {
      const q = `select * from "${schema}"."${table}" limit $1 offset $2`;
      const res = await client.query(q, [limit, offset]);
      const columns = res.fields.map((f) => f.name);

      // Try to get a total count for basic pagination (optional, may be slow on huge tables)
      let total: number | null = null;
      try {
        const cnt = await client.query(
          `select count(*)::int as cnt from "${schema}"."${table}"`
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
