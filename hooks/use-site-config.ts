"use client"

import { useEffect, useState } from "react"
import type { ISiteConfig, CurrencyCode } from "@/types/site-config"

export function useSiteConfig() {
  const [config, setConfig] = useState<ISiteConfig>({ currency: "EUR" })
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/unified-data/site-config", { cache: "no-store" })
        const data = await res.json()
        const currency: CurrencyCode = data?.currency === "CHF" ? "CHF" : "EUR"
        setConfig({ currency })
        setError(null)
      } catch (e) {
        console.error("Failed to load site-config", e)
        setError("Fehler beim Laden der Einstellungen")
        setConfig({ currency: "EUR" })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { config, setConfig, loading, error }
}
