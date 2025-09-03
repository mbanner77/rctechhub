import { NextResponse, type NextRequest } from "next/server";
import { getPool } from "@/lib/pg";
import { isAuthenticated, unauthorizedResponse } from "@/app/api/shared/auth-utils";

export async function GET(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) {
      return unauthorizedResponse();
    }
    const pool = getPool();
    const client = await pool.connect();
    try {
      const sql = `
        select table_schema as schema, table_name as name
        from information_schema.tables
        where table_type = 'BASE TABLE'
          and table_schema not in ('pg_catalog','information_schema')
        order by table_schema, table_name
      `;
      const res = await client.query<{ schema: string; name: string }>(sql);
      return NextResponse.json({ tables: res.rows });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("DB list tables error:", err);
    return NextResponse.json({ error: err?.message || "DB list tables error" }, { status: 500 });
  }
}
