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

    if (!table) {
      return NextResponse.json({ error: "Parameter 'table' fehlt" }, { status: 400 });
    }
    if (!isValidIdent(schema) || !isValidIdent(table)) {
      return NextResponse.json({ error: "Ungültiger Schema- oder Tabellenname" }, { status: 400 });
    }

    const pool = getPool();
    const client = await pool.connect();
    try {
      const colsSql = `
        select column_name as name,
               data_type as type,
               is_nullable = 'YES' as nullable,
               ordinal_position as position
        from information_schema.columns
        where table_schema = $1 and table_name = $2
        order by ordinal_position
      `;
      const pkSql = `
        select a.attname as col
        from pg_index i
        join pg_attribute a on a.attrelid = i.indrelid and a.attnum = any(i.indkey)
        where i.indrelid = ($1::text ||'.'|| $2::text)::regclass
          and i.indisprimary
      `;
      const [colsRes, pkRes] = await Promise.all([
        client.query(colsSql, [schema, table]),
        client.query(pkSql, [schema, table])
      ]);
      const pkCols = new Set(pkRes.rows.map((r: any) => r.col));
      const columns = colsRes.rows.map((r: any) => ({
        name: r.name as string,
        type: r.type as string,
        nullable: !!r.nullable,
        position: Number(r.position),
        isPrimaryKey: pkCols.has(r.name)
      }));
      return NextResponse.json({ columns });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("DB table-schema error:", err);
    return NextResponse.json({ error: err?.message || "DB table-schema error" }, { status: 500 });
  }
}
