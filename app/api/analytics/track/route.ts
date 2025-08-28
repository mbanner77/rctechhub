import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPool } from "@/lib/pg";
import dns from "node:dns";
import { setTimeout as delay } from "node:timers/promises";

async function ensureTable() {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      props JSONB,
      path TEXT,
      referrer TEXT,
      user_agent TEXT,
      session_id TEXT,
      ip INET,
      country_code TEXT,
      country_name TEXT,
      org TEXT,
      asn TEXT,
      hostname TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events (created_at DESC)`
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events (name)`
  );
  // IP enrichment cache
  await pool.query(`
    CREATE TABLE IF NOT EXISTS analytics_ip_enrichment (
      ip INET PRIMARY KEY,
      country_code TEXT,
      country_name TEXT,
      org TEXT,
      asn TEXT,
      hostname TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

function getClientIp(req: NextRequest): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const ip = xff.split(",")[0]?.trim();
    return ip || null;
  }
  return req.ip ?? null;
}

async function reverseDns(ip: string): Promise<string | null> {
  try {
    const names = await Promise.race([
      dns.promises.reverse(ip),
      (async () => { await delay(1500); throw new Error('timeout'); })(),
    ]) as string[];
    return Array.isArray(names) && names.length ? names[0] : null;
  } catch {
    return null;
  }
}

async function fetchGeo(ip: string): Promise<{ country_code?: string; country_name?: string; org?: string; asn?: string; hostname?: string }> {
  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, { cache: 'no-store' });
    if (!res.ok) throw new Error('geo http');
    const j: any = await res.json();
    const hostname = await reverseDns(ip);
    return {
      country_code: j?.country || undefined,
      country_name: j?.country_name || undefined,
      org: j?.org || j?.org_name || undefined,
      asn: j?.asn || undefined,
      hostname: hostname || undefined,
    };
  } catch {
    const hostname = await reverseDns(ip);
    return { hostname: hostname || undefined };
  }
}

async function getIpEnrichment(ip: string) {
  const pool = getPool();
  const cached = await pool.query(
    `SELECT country_code, country_name, org, asn, hostname, updated_at FROM analytics_ip_enrichment WHERE ip = $1`,
    [ip]
  );
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  if (cached.rowCount) {
    const row = cached.rows[0];
    const updated = row.updated_at ? new Date(row.updated_at).getTime() : 0;
    if (now - updated < weekMs) return row;
  }
  const geo = await fetchGeo(ip);
  await pool.query(
    `INSERT INTO analytics_ip_enrichment(ip, country_code, country_name, org, asn, hostname, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (ip) DO UPDATE SET country_code = EXCLUDED.country_code, country_name = EXCLUDED.country_name, org = EXCLUDED.org, asn = EXCLUDED.asn, hostname = EXCLUDED.hostname, updated_at = NOW()`,
    [ip, geo.country_code || null, geo.country_name || null, geo.org || null, geo.asn || null, geo.hostname || null]
  );
  return geo;
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable();

    const { name, props } = (await req.json().catch(() => ({}))) as {
      name?: string;
      props?: Record<string, any>;
    };

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Missing 'name'" }, { status: 400 });
    }

    // simple session id cookie
    const jar = await cookies();
    let sid = jar.get("sid")?.value;
    if (!sid) {
      sid = crypto.randomUUID();
    }

    const pool = getPool();
    const path = req.nextUrl.pathname + (req.nextUrl.search || "");
    const referrer = req.headers.get("referer");
    const userAgent = req.headers.get("user-agent");
    const ip = getClientIp(req);

    let geo: any = {};
    if (ip) {
      try { geo = await getIpEnrichment(ip); } catch {}
    }

    await pool.query(
      `INSERT INTO analytics_events(name, props, path, referrer, user_agent, session_id, ip, country_code, country_name, org, asn, hostname)
       VALUES ($1, $2::jsonb, $3, $4, $5, $6, $7::inet, $8, $9, $10, $11, $12)`,
      [name, JSON.stringify(props || {}), path, referrer, userAgent, sid, ip, geo.country_code || null, geo.country_name || null, geo.org || null, geo.asn || null, geo.hostname || null]
    );

    const res = new NextResponse(null, { status: 204 });
    // set cookie if newly created
    if (!jar.get("sid")?.value) {
      res.cookies.set({
        name: "sid",
        value: sid,
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }
    return res;
  } catch (e) {
    console.error("[analytics.track] error", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
