import { NextResponse } from "next/server";
import { getPool } from "@/lib/pg";

export async function GET() {
  const info: Record<string, unknown> = {
    status: "ok",
    time: new Date().toISOString(),
    db: { connected: false as boolean, error: null as string | null },
    databaseUrl: { host: null as string | null, port: null as string | null, db: null as string | null, sslmode: null as string | null },
  };

  try {
    // parse DATABASE_URL parts for diagnostics (no credentials)
    const raw = process.env.DATABASE_URL;
    if (raw) {
      try {
        const u = new URL(raw);
        info.databaseUrl = {
          host: u.hostname || null,
          port: u.port || (u.protocol.startsWith("postgres") ? "5432" : null),
          db: u.pathname ? u.pathname.replace("/", "") : null,
          sslmode: u.searchParams.get("sslmode") || null,
        };
      } catch {
        info.databaseUrl = { host: "(unparseable)", port: null, db: null, sslmode: null };
      }
    }

    const pool = getPool();
    // simple connectivity check
    const client = await pool.connect();
    try {
      await client.query("SELECT 1");
      info.db = { connected: true, error: null };
    } finally {
      client.release();
    }
  } catch (e: any) {
    info.db = { connected: false, error: e?.message ?? String(e) };
  }

  return NextResponse.json(info, { status: 200 });
}
