import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/pg";

export async function GET(_req: NextRequest, { params }: { params: { key: string[] } }) {
  try {
    const rawKey = params.key.join("/");
    // Keep develop/ prefix behavior aligned with FileManager
    const key = process.env.ENVIRONMENT === "Develop" && !rawKey.startsWith("develop/")
      ? `develop/${rawKey}`
      : rawKey;

    const pool = getPool();
    const result = await pool.query(
      `SELECT value, content_type, is_binary FROM kv_store WHERE key = $1`,
      [key]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const row = result.rows[0];
    if (row.is_binary) {
      const base64: string | undefined = row.value?.base64;
      if (!base64) return NextResponse.json({ error: "Corrupt binary" }, { status: 500 });
      const data = Buffer.from(base64, "base64");
      return new NextResponse(data, {
        status: 200,
        headers: {
          "Content-Type": row.content_type || "application/octet-stream",
          "Cache-Control": "public, max-age=31536000, immutable"
        }
      });
    }

    // JSON content
    return NextResponse.json(row.value, {
      status: 200,
      headers: {
        "Content-Type": row.content_type || "application/json"
      }
    });
  } catch (err) {
    console.error("[files route] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
