import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/pg"

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

export async function GET(_request: NextRequest) {
  try {
    const pool = getPool()
    const client = await pool.connect()
    try {
      await client.query(`create table if not exists flexlicense_config (id int primary key default 1, data jsonb not null, updated_at timestamp without time zone default now())`)
      const res = await client.query<{ data: any }>(`select data from flexlicense_config where id=1`)
      const data = res.rows[0]?.data || defaultConfig
      return NextResponse.json({ config: data }, { headers: { 'Cache-Control': 'no-store' } })
    } finally {
      client.release()
    }
  } catch (e: any) {
    console.error('[flexlicense-public][GET] error', e)
    return NextResponse.json({ config: defaultConfig }, { status: 200 })
  }
}
