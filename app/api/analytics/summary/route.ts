import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/pg";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const pool = getPool();
    const { searchParams } = req.nextUrl;

    const name = searchParams.get("name") || undefined;
    const q = searchParams.get("q") || undefined;
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;

    const where: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (name) { where.push(`e.name = $${idx++}`); values.push(name); }
    if (q) { where.push(`(e.path ILIKE $${idx} OR e.referrer ILIKE $${idx} OR e.user_agent ILIKE $${idx} OR CAST(e.props AS TEXT) ILIKE $${idx})`); values.push(`%${q}%`); idx++; }
    if (from) { where.push(`e.created_at >= $${idx++}`); values.push(new Date(from)); }
    if (to) { where.push(`e.created_at <= $${idx++}`); values.push(new Date(to)); }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const totalsRes = await pool.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(DISTINCT e.session_id)::int AS unique_sessions,
         COUNT(DISTINCT e.ip)::int AS unique_ips
       FROM analytics_events e
       ${whereSql}`,
      values
    );

    const topEventsRes = await pool.query(
      `SELECT e.name, COUNT(*)::int AS c
       FROM analytics_events e
       ${whereSql}
       GROUP BY 1
       ORDER BY c DESC
       LIMIT 10`,
      values
    );

    const topCountriesRes = await pool.query(
      `SELECT 
         COALESCE(e.country_code, i.country_code) AS country_code,
         COALESCE(e.country_name, i.country_name) AS country_name,
         COUNT(*)::int AS c
       FROM analytics_events e
       LEFT JOIN analytics_ip_enrichment i ON e.ip = i.ip
       ${whereSql}
       GROUP BY 1,2
       ORDER BY c DESC
       LIMIT 10`,
      values
    );

    const topOrgsRes = await pool.query(
      `SELECT COALESCE(e.org, i.org) AS org, COUNT(*)::int AS c
       FROM analytics_events e
       LEFT JOIN analytics_ip_enrichment i ON e.ip = i.ip
       ${whereSql}
       GROUP BY 1
       ORDER BY c DESC
       LIMIT 10`,
      values
    );

    const totals = totalsRes.rows[0] || { total: 0, unique_sessions: 0, unique_ips: 0 };

    return NextResponse.json({
      total: totals.total || 0,
      unique_sessions: totals.unique_sessions || 0,
      unique_ips: totals.unique_ips || 0,
      top_events: topEventsRes.rows,
      top_countries: topCountriesRes.rows,
      top_orgs: topOrgsRes.rows,
    });
  } catch (e) {
    console.error("[analytics.summary] error", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
