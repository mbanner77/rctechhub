"use server";

import type { ISiteConfig, CurrencyCode } from "@/types/site-config";
import { getSiteConfigFromSQL, saveSiteConfigToSQL } from "@/lib/site-config-sql";
import { revalidatePath } from "next/cache";

export async function getSiteConfig(): Promise<ISiteConfig> {
  try {
    const cfg = await getSiteConfigFromSQL();
    // Basic validation and defaulting
    const currency: CurrencyCode = cfg?.currency === "CHF" ? "CHF" : "EUR";
    return { currency, contactEUR: cfg.contactEUR, contactCHF: cfg.contactCHF };
  } catch (e) {
    console.warn("getSiteConfig failed, defaulting to EUR", e);
    return { currency: "EUR" };
  }
}

export async function saveSiteConfig(config: ISiteConfig): Promise<boolean> {
  const currency: CurrencyCode = config?.currency === "CHF" ? "CHF" : "EUR";
  const ok = await saveSiteConfigToSQL({ currency, contactEUR: config.contactEUR, contactCHF: config.contactCHF });
  if (ok) {
    revalidatePath("/admin/site-config");
    revalidatePath("/api/unified-data/site-config");
    revalidatePath("/");
  }
  return ok;
}
