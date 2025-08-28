import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/pg";
import { cookies } from "next/headers";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Reuse enrichment from the track route via dynamic import to avoid duplication
async function getEnricher() {
  const mod = await import("../track/route");
  return {
    getIpEnrichment: (mod as any).getIpEnrichment as (ip: string) => Promise<any>
  };
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const days = Math.max(1, Math.min(90, parseInt(searchParams.get("days") || "30", 10)));

    const pool = getPool();
    const sinceRes = await pool.query(
      `SELECT DISTINCT ip::text AS ip
       FROM analytics_events
       WHERE ip IS NOT NULL AND created_at >= NOW() - ($1 || ' days')::interval
       ORDER BY ip`,
      [days]
    );

    const ips: string[] = sinceRes.rows.map((r: any) => r.ip);
    if (!ips.length) return NextResponse.json({ updated: 0, ips: [] });

    const { getIpEnrichment } = await getEnricher();

    let updated = 0;
    for (const ip of ips) {
      try {
        const geo = await getIpEnrichment(ip);
        if (geo) updated++;
      } catch {}
    }

    // Optionally update denormalized columns on recent events for faster reads
    await pool.query(
      `UPDATE analytics_events e
       SET country_code = COALESCE(e.country_code, i.country_code),
           country_name = COALESCE(e.country_name, i.country_name),
           org = COALESCE(e.org, i.org),
           asn = COALESCE(e.asn, i.asn),
           hostname = COALESCE(e.hostname, i.hostname)
       FROM analytics_ip_enrichment i
       WHERE e.ip = i.ip AND e.created_at >= NOW() - ($1 || ' days')::interval`,
      [days]
    );

    return NextResponse.json({ updated, ips });
  } catch (e) {
    console.error("[analytics.enrich] error", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
