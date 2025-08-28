import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPool } from "@/lib/pg";
import dns from "node:dns";
import { setTimeout as delay } from "node:timers/promises";

// Ensure Node.js runtime (dns module) and no static caching
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
  // Backfill columns if table existed before
  await pool.query(`ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS country_code TEXT`);
  await pool.query(`ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS country_name TEXT`);
  await pool.query(`ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS org TEXT`);
  await pool.query(`ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS asn TEXT`);
  await pool.query(`ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS hostname TEXT`);
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
  // Prefer standard proxy headers
  const candidates = [
    req.headers.get("x-forwarded-for"),
    req.headers.get("x-real-ip"),
    req.headers.get("cf-connecting-ip"),
    req.headers.get("x-client-ip"),
    req.headers.get("forwarded"),
    req.headers.get("fly-client-ip"),
    req.headers.get("x-vercel-forwarded-for"),
    req.headers.get("true-client-ip"),
    req.headers.get("fastly-client-ip"),
  ];
  for (const v of candidates) {
    if (!v) continue;
    // x-forwarded-for can contain a list. forwarded header can be in key=value format
    const first = v.split(",")[0].trim();
    const ip = first.replace(/^for=/i, "").replace(/"/g, "");
    if (ip) return ip;
  }
  return null;
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
  // Helper with timeout
  const withTimeout = async (p: Promise<Response>, ms = 2000) => {
    return Promise.race([
      p,
      (async () => { await delay(ms); throw new Error('timeout'); })(),
    ]) as Promise<Response>;
  };

  try {
    // Skip private/local addresses
    if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|127\.|::1|fc00:|fd00:)/.test(ip)) {
      const hostname = await reverseDns(ip);
      return { country_code: 'ZZ', country_name: 'Private/Local', hostname: hostname || undefined };
    }

    // Provider 1: ipapi.co
    try {
      const res = await withTimeout(fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, { cache: 'no-store' }));
      if (res.ok) {
        const j: any = await res.json().catch(() => ({}));
        if (j && (j.country || j.country_name || j.org || j.asn)) {
          const hostname = await reverseDns(ip);
          return {
            country_code: j.country || undefined,
            country_name: j.country_name || undefined,
            org: j.org || j.org_name || undefined,
            asn: j.asn || undefined,
            hostname: hostname || undefined,
          };
        }
      }
    } catch {}

    // Provider 2: ipwho.is (no key, generous free tier)
    try {
      const res2 = await withTimeout(fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, { cache: 'no-store' }));
      if (res2.ok) {
        const j2: any = await res2.json().catch(() => ({}));
        if (j2 && (j2.country_code || j2.country || j2.connection?.org || j2.connection?.asn)) {
          const hostname = await reverseDns(ip);
          return {
            country_code: (j2.country_code || j2.country || '').toString() || undefined,
            country_name: j2.country || undefined,
            org: j2.connection?.org || undefined,
            asn: j2.connection?.asn?.toString() || undefined,
            hostname: hostname || undefined,
          };
        }
      }
    } catch {}

    // Fallback: only reverse DNS
    const hostname = await reverseDns(ip);
    return { hostname: hostname || undefined };
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
