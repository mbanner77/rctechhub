import { NextResponse, type NextRequest } from "next/server"
import { getPool } from "@/lib/pg"
import { isAuthenticated, unauthorizedResponse } from "@/app/api/shared/auth-utils"

export async function GET(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) {
      return unauthorizedResponse()
    }
    const pool = getPool()
    const client = await pool.connect()
    try {
      const versionRes = await client.query<{ version: string }>("select version() as version")
      const countRes = await client.query<{ count: string }>("select count(*)::int as count from services")
      const lastUpdRes = await client.query<{ last: string | null }>(
        "select to_char(max(updated_at), 'YYYY-MM-DD" + " HH24:MI:SS') as last from services"
      )

      return NextResponse.json({
        version: versionRes.rows[0]?.version ?? "unknown",
        servicesCount: (countRes.rows[0]?.count as any) ?? 0,
        servicesLastUpdated: lastUpdRes.rows[0]?.last ?? null,
      })
    } finally {
      client.release()
    }
  } catch (err: any) {
    console.error("DB status error:", err)
    return NextResponse.json({ error: err?.message || "DB status error" }, { status: 500 })
  }
}
