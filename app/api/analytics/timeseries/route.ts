import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/pg";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Returns time-bucketed totals and unique sessions
// GET /api/analytics/timeseries?from=ISO&to=ISO&interval=hour|day&name=optional&q=optional
export async function GET(req: NextRequest) {
  try {
    const pool = getPool();
    const { searchParams } = req.nextUrl;

    const name = searchParams.get("name") || undefined;
    const q = searchParams.get("q") || undefined;
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;
    const interval = (searchParams.get("interval") || "day").toLowerCase() as "hour" | "day" | "week";

    const where: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (name) { where.push(`e.name = $${idx++}`); values.push(name); }
    if (q) { where.push(`(e.path ILIKE $${idx} OR e.referrer ILIKE $${idx} OR e.user_agent ILIKE $${idx} OR CAST(e.props AS TEXT) ILIKE $${idx})`); values.push(`%${q}%`); idx++; }
    if (from) { where.push(`e.created_at >= $${idx++}`); values.push(new Date(from)); }
    if (to) { const d = new Date(to); d.setDate(d.getDate() + 1); where.push(`e.created_at < $${idx++}`); values.push(d); }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const timeBucket = interval === 'hour' ? 'hour' : interval === 'week' ? 'week' : 'day';

    const res = await pool.query(
      `WITH buckets AS (
         SELECT date_trunc('${timeBucket}', e.created_at) AS ts,
                COUNT(*)::int AS total,
                COUNT(DISTINCT e.session_id)::int AS unique_sessions
         FROM analytics_events e
         ${whereSql}
         GROUP BY 1
       )
       SELECT ts, total, unique_sessions
       FROM buckets
       ORDER BY ts ASC`
      , values
    );

    return NextResponse.json({ interval: timeBucket, items: res.rows });
  } catch (e) {
    console.error('[analytics.timeseries] error', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
