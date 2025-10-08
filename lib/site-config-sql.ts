"use server";

import type { ISiteConfig, CurrencyCode, ContactInfo } from "@/types/site-config";
import { getPool } from "@/lib/pg";

async function ensureTable() {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_config (
      id INT PRIMARY KEY DEFAULT 1,
      currency TEXT NOT NULL CHECK (currency IN ('EUR','CHF')),
      contact_eur JSONB,
      contact_chf JSONB,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  // Ensure columns exist if table was created before
  await pool.query(`ALTER TABLE site_config ADD COLUMN IF NOT EXISTS contact_eur JSONB;`);
  await pool.query(`ALTER TABLE site_config ADD COLUMN IF NOT EXISTS contact_chf JSONB;`);
}

export async function getSiteConfigFromSQL(): Promise<ISiteConfig> {
  await ensureTable();
  const pool = getPool();
  const res = await pool.query<{ currency: CurrencyCode; contact_eur: ContactInfo | null; contact_chf: ContactInfo | null }>(
    `SELECT currency, contact_eur, contact_chf FROM site_config WHERE id = 1 LIMIT 1;`
  );
  if (res.rows.length > 0) {
    const row = res.rows[0];
    const c = row.currency;
    return { currency: c === "CHF" ? "CHF" : "EUR", contactEUR: row.contact_eur || undefined, contactCHF: row.contact_chf || undefined };
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
    `INSERT INTO site_config (id, currency, contact_eur, contact_chf) VALUES (1, $1, $2, $3)
     ON CONFLICT (id) DO UPDATE SET currency = EXCLUDED.currency, contact_eur = EXCLUDED.contact_eur, contact_chf = EXCLUDED.contact_chf, updated_at = NOW();`,
    [currency, config.contactEUR ?? null, config.contactCHF ?? null]
  );
  return true;
}
