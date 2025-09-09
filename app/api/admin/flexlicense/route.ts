import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/pg"
import { isAuthenticated, unauthorizedResponse } from "@/app/api/shared/auth-utils"

// Ensure table exists and return client
async function ensureTable() {
  const pool = getPool()
  const client = await pool.connect()
  try {
    await client.query(`
      create table if not exists flexlicense_config (
        id int primary key default 1,
        data jsonb not null,
        updated_at timestamp without time zone default now()
      )
    `)
    return client
  } catch (e) {
    client.release()
    throw e
  }
}

const defaultConfig = {
  priceIndexPct: 2,
  discountTiers: [
    { fromYear: 3, percent: 3 },
    { fromYear: 5, percent: 5 },
    { fromYear: 10, percent: 10 },
  ],
  slaPresets: {
    Bronze: { label: "Bronze", multiplier: 1.0, response: "48h", availability: "97.0%" },
    Silver: { label: "Silver", multiplier: 1.08, response: "24h", availability: "98.5%" },
    Gold: { label: "Gold", multiplier: 1.16, response: "8h", availability: "99.5%" },
    Platinum: { label: "Platinum", multiplier: 1.25, response: "4h", availability: "99.9%" },
  },
  ui: {
    hostingLabel: "Betrieb inkludiert",
    minProjectVolume: 100000,
    maxProjectVolume: 2000000,
    defaultProjectVolume: 500000,
    minYears: 3,
    maxYears: 10,
    defaultYears: 5,
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) return unauthorizedResponse()
    const client = await ensureTable()
    try {
      const res = await client.query<{ data: any }>(`select data from flexlicense_config where id=1`)
      const data = res.rows[0]?.data || defaultConfig
      return NextResponse.json({ config: data })
    } finally {
      client.release()
    }
  } catch (e: any) {
    console.error('[flexlicense-admin][GET] error', e)
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) return unauthorizedResponse()
    const body = await request.json()
    const config = body?.config
    if (!config || typeof config !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    const client = await ensureTable()
    try {
      await client.query(`
        insert into flexlicense_config (id, data, updated_at)
        values (1, $1::jsonb, now())
        on conflict (id) do update set data=excluded.data, updated_at=excluded.updated_at
      `, [JSON.stringify(config)])
      return NextResponse.json({ ok: true })
    } finally {
      client.release()
    }
  } catch (e: any) {
    console.error('[flexlicense-admin][PUT] error', e)
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 })
  }
}
