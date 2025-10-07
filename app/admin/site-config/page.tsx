"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { CurrencyCode, ISiteConfig } from "@/types/site-config"

export default function SiteConfigPage() {
  const [currency, setCurrency] = useState<CurrencyCode>("EUR")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<null | "ok" | "err">(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/unified-data/site-config", { cache: "no-store" })
        const data: ISiteConfig = await res.json()
        setCurrency(data?.currency === "CHF" ? "CHF" : "EUR")
      } catch (e) {
        console.error("SiteConfig laden fehlgeschlagen", e)
      }
    }
    load()
  }, [])

  const save = async () => {
    try {
      setSaving(true)
      setSaved(null)
      const res = await fetch("/api/unified-data/site-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency }),
      })
      if (res.ok) {
        setSaved("ok")
      } else {
        setSaved("err")
      }
    } catch (e) {
      console.error("SiteConfig speichern fehlgeschlagen", e)
      setSaved("err")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Seiteneinstellungen</CardTitle>
          <CardDescription>Währungsauswahl für Preisangaben (Standard: Euro)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Währung für Preise</Label>
            <RadioGroup value={currency} onValueChange={(v) => setCurrency((v as CurrencyCode) || "EUR")}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2 border rounded-md p-3">
                <RadioGroupItem value="EUR" id="cur-eur" />
                <Label htmlFor="cur-eur" className="cursor-pointer">Euro (EUR)</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-3">
                <RadioGroupItem value="CHF" id="cur-chf" />
                <Label htmlFor="cur-chf" className="cursor-pointer">Schweizer Franken (CHF)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={save} disabled={saving}>{saving ? "Speichern…" : "Speichern"}</Button>
            {saved === "ok" && <span className="text-sm text-green-600">Gespeichert</span>}
            {saved === "err" && <span className="text-sm text-red-600">Fehler beim Speichern</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
