"use server";

import type { ISiteConfig, CurrencyCode } from "@/types/site-config";
import { getPool } from "@/lib/pg";

async function ensureTable() {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_config (
      id INT PRIMARY KEY DEFAULT 1,
      currency TEXT NOT NULL CHECK (currency IN ('EUR','CHF')),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export async function getSiteConfigFromSQL(): Promise<ISiteConfig> {
  await ensureTable();
  const pool = getPool();
  const res = await pool.query<{ currency: CurrencyCode }>(
    `SELECT currency FROM site_config WHERE id = 1 LIMIT 1;`
  );
  if (res.rows.length > 0) {
    const c = res.rows[0].currency;
    return { currency: c === "CHF" ? "CHF" : "EUR" };
  }
  // Insert default if not present
  await pool.query(
    `INSERT INTO site_config (id, currency) VALUES (1, 'EUR') ON CONFLICT (id) DO NOTHING;`
  );
  return { currency: "EUR" };
}

export async function saveSiteConfigToSQL(config: ISiteConfig): Promise<boolean> {
  await ensureTable();
  const pool = getPool();
  const currency: CurrencyCode = config.currency === "CHF" ? "CHF" : "EUR";
  await pool.query(
    `INSERT INTO site_config (id, currency) VALUES (1, $1)
     ON CONFLICT (id) DO UPDATE SET currency = EXCLUDED.currency, updated_at = NOW();`,
    [currency]
  );
  return true;
}
