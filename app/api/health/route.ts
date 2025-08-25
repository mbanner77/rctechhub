import { NextResponse } from "next/server";
import { getPool } from "@/lib/pg";

export async function GET() {
  const info: Record<string, unknown> = {
    status: "ok",
    time: new Date().toISOString(),
    db: { connected: false as boolean, error: null as string | null },
  };

  try {
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
