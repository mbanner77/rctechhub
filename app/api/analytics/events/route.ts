import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/pg";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const pool = getPool();
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const offset = (page - 1) * limit;
    const name = searchParams.get("name") || undefined;
    const q = searchParams.get("q") || undefined;
    const from = searchParams.get("from") || undefined; // ISO date (YYYY-MM-DD)
    const to = searchParams.get("to") || undefined;     // ISO date (YYYY-MM-DD)

    const where: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (name) {
      where.push(`e.name = $${idx++}`);
      values.push(name);
    }
    if (q) {
      where.push(`(e.path ILIKE $${idx} OR e.referrer ILIKE $${idx} OR e.user_agent ILIKE $${idx} OR CAST(e.props AS TEXT) ILIKE $${idx})`);
      values.push(`%${q}%`);
      idx++;
    }
    if (from) {
      // Start of the given day (inclusive)
      const d = new Date(from)
      where.push(`e.created_at >= $${idx++}`);
      values.push(d);
    }
    if (to) {
      // Exclusive upper bound: next day 00:00
      const d = new Date(to)
      d.setDate(d.getDate() + 1)
      where.push(`e.created_at < $${idx++}`);
      values.push(d);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const totalRes = await pool.query(`SELECT COUNT(*)::int AS c FROM analytics_events e ${whereSql}`, values);
    const total = totalRes.rows[0]?.c || 0;

    const dataRes = await pool.query(
      `SELECT e.id, e.name, e.props, e.path, e.referrer, e.user_agent, e.session_id, e.ip,
              COALESCE(e.country_code, i.country_code) AS country_code,
              COALESCE(e.country_name, i.country_name) AS country_name,
              COALESCE(e.org, i.org) AS org,
              COALESCE(e.asn, i.asn) AS asn,
              COALESCE(e.hostname, i.hostname) AS hostname,
              e.created_at
       FROM analytics_events e
       LEFT JOIN analytics_ip_enrichment i ON e.ip = i.ip
       ${whereSql}
       ORDER BY e.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, limit, offset]
    );

    return NextResponse.json({ page, limit, total, items: dataRes.rows });
  } catch (e) {
    console.error("[analytics.events] error", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
