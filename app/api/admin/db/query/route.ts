import { NextResponse, type NextRequest } from "next/server"
import { getPool } from "@/lib/pg"
import { isAuthenticated, unauthorizedResponse } from "@/app/api/shared/auth-utils"

function isSelectOnly(sql: string) {
  const s = sql.trim().replace(/;\s*$/g, "")
  // very simple guard: must start with SELECT and must not contain forbidden keywords
  const upper = s.toUpperCase()
  const forbidden = ["INSERT ", "UPDATE ", "DELETE ", "DROP ", "ALTER ", "TRUNCATE ", "CREATE ", "GRANT ", "REVOKE ", "EXEC", "CALL"]
  if (!upper.startsWith("SELECT ")) return false
  return !forbidden.some((kw) => upper.includes(kw))
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) {
      return unauthorizedResponse()
    }
    const body = await request.json()
    const sql = String(body?.sql || "")
    if (!sql || !isSelectOnly(sql)) {
      return NextResponse.json({ error: "Nur read-only SELECT-Abfragen sind erlaubt." }, { status: 400 })
    }

    const pool = getPool()
    const client = await pool.connect()
    try {
      const limitedSql = `${sql}\nLIMIT 200` // safety cap
      const res = await client.query(limitedSql)
      const columns = res.fields.map((f) => f.name)
      return NextResponse.json({ columns, rows: res.rows })
    } finally {
      client.release()
    }
  } catch (err: any) {
    console.error("DB query error:", err)
    return NextResponse.json({ error: err?.message || "DB query error" }, { status: 500 })
  }
}
