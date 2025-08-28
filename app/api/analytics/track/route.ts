import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPool } from "@/lib/pg";

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
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events (created_at DESC)`
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events (name)`
  );
}

function getClientIp(req: NextRequest): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const ip = xff.split(",")[0]?.trim();
    return ip || null;
  }
  return req.ip ?? null;
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

    await pool.query(
      `INSERT INTO analytics_events(name, props, path, referrer, user_agent, session_id, ip)
       VALUES ($1, $2::jsonb, $3, $4, $5, $6, $7::inet)`,
      [name, JSON.stringify(props || {}), path, referrer, userAgent, sid, ip]
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
