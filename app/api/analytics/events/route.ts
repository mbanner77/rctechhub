import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/pg";

export async function GET(req: NextRequest) {
  try {
    const pool = getPool();
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const offset = (page - 1) * limit;
    const name = searchParams.get("name") || undefined;
    const q = searchParams.get("q") || undefined;
    const from = searchParams.get("from") || undefined; // ISO date
    const to = searchParams.get("to") || undefined;     // ISO date

    const where: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (name) {
      where.push(`name = $${idx++}`);
      values.push(name);
    }
    if (q) {
      where.push(`(path ILIKE $${idx} OR referrer ILIKE $${idx} OR user_agent ILIKE $${idx} OR CAST(props AS TEXT) ILIKE $${idx})`);
      values.push(`%${q}%`);
      idx++;
    }
    if (from) {
      where.push(`created_at >= $${idx++}`);
      values.push(new Date(from));
    }
    if (to) {
      where.push(`created_at <= $${idx++}`);
      values.push(new Date(to));
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const totalRes = await pool.query(`SELECT COUNT(*)::int AS c FROM analytics_events ${whereSql}`, values);
    const total = totalRes.rows[0]?.c || 0;

    const dataRes = await pool.query(
      `SELECT id, name, props, path, referrer, user_agent, session_id, ip,
              country_code, country_name, org, asn, hostname,
              created_at
       FROM analytics_events
       ${whereSql}
       ORDER BY created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, limit, offset]
    );

    return NextResponse.json({ page, limit, total, items: dataRes.rows });
  } catch (e) {
    console.error("[analytics.events] error", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
