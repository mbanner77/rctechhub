import { getPool } from "@/lib/pg"

let initialized = false

async function ensureTable() {
  if (initialized) return
  const pool = getPool()
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        category TEXT,
        technology_category TEXT,
        process_category TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
      CREATE INDEX IF NOT EXISTS idx_services_techcat ON services(technology_category);
      CREATE INDEX IF NOT EXISTS idx_services_processcat ON services(process_category);
      CREATE INDEX IF NOT EXISTS idx_services_data_gin ON services USING GIN (data);
    `)
    initialized = true
  } finally {
    client.release()
  }
}

export class ServicesRepo {
  static async getAll(): Promise<any[]> {
    await ensureTable()
    const pool = getPool()
    const res = await pool.query<{ data: any }>(
      "SELECT data FROM services ORDER BY updated_at DESC"
    )
    return res.rows.map((r) => r.data)
  }

  static async upsertMany(services: any[]): Promise<void> {
    if (!Array.isArray(services) || services.length === 0) return
    await ensureTable()
    const pool = getPool()
    const client = await pool.connect()
    try {
      await client.query("BEGIN")
      for (const svc of services) {
        const id = String(svc.id || "").trim()
        if (!id) continue
        // Normalize columns
        const category = svc.category ?? null
        const technology_category = svc.technologyCategory ?? null
        const process_category = svc.processCategory ?? null
        await client.query(
          `INSERT INTO services (id, data, category, technology_category, process_category, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           ON CONFLICT (id) DO UPDATE SET
             data = EXCLUDED.data,
             category = EXCLUDED.category,
             technology_category = EXCLUDED.technology_category,
             process_category = EXCLUDED.process_category,
             updated_at = NOW()`,
          [id, svc, category, technology_category, process_category]
        )
      }
      await client.query("COMMIT")
    } catch (e) {
      await client.query("ROLLBACK")
      throw e
    } finally {
      client.release()
    }
  }
}
