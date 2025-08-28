import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/pg";

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

    const totalPromise = pool.query(`SELECT COUNT(*)::int AS c, COUNT(DISTINCT session_id) AS s, COUNT(DISTINCT ip) AS ips FROM analytics_events ${whereSql}`, values);
    const topEventsPromise = pool.query(`SELECT name, COUNT(*)::int AS c FROM analytics_events ${whereSql} GROUP BY name ORDER BY c DESC LIMIT 10`, values);
    const topCountriesPromise = pool.query(`SELECT COALESCE(country_code,'?') AS country_code, COALESCE(country_name,'Unbekannt') AS country_name, COUNT(*)::int AS c FROM analytics_events ${whereSql} GROUP BY country_code, country_name ORDER BY c DESC LIMIT 10`, values);
    const topOrgsPromise = pool.query(`SELECT COALESCE(org,'Unbekannt') AS org, COUNT(*)::int AS c FROM analytics_events ${whereSql} GROUP BY org ORDER BY c DESC LIMIT 10`, values);

    const [totalRes, topEventsRes, topCountriesRes, topOrgsRes] = await Promise.all([
      totalPromise,
      topEventsPromise,
      topCountriesPromise,
      topOrgsPromise,
    ]);

    const totals = totalRes.rows[0] || { c: 0, s: 0, ips: 0 };

    return NextResponse.json({
      total: totals.c || 0,
      unique_sessions: parseInt(totals.s || 0, 10),
      unique_ips: parseInt(totals.ips || 0, 10),
      top_events: topEventsRes.rows,
      top_countries: topCountriesRes.rows,
      top_orgs: topOrgsRes.rows,
    });
  } catch (e) {
    console.error("[analytics.summary] error", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
