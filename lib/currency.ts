import type { CurrencyCode } from "@/types/site-config"

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const locales = currency === "CHF" ? "de-CH" : "de-DE"
  const currencySymbol = currency === "CHF" ? "CHF" : "€"
  const formatted = Number(amount || 0).toLocaleString(locales)
  // Keep simple suffix symbol placement as in existing codebase
  return currency === "CHF" ? `${formatted} ${currencySymbol}` : `${formatted} ${currencySymbol}`
}
