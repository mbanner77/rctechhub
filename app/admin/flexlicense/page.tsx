"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Tier = { fromYear: number; percent: number }

type SlaPreset = { label: string; multiplier: number; response: string; availability: string }

type FlexConfig = {
  priceIndexPct: number
  discountTiers: Tier[]
  slaPresets: Record<string, SlaPreset>
  ui: {
    hostingLabel: string
    minProjectVolume: number
    maxProjectVolume: number
    defaultProjectVolume: number
    minYears: number
    maxYears: number
    defaultYears: number
  }
}

const DEFAULTS: FlexConfig = {
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

export default function FlexLicenseAdminPage() {
  const [cfg, setCfg] = useState<FlexConfig>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/admin/flexlicense', { cache: 'no-store' })
        const body = await res.json()
        if (!res.ok) throw new Error(body?.error || `HTTP ${res.status}`)
        setCfg(body.config as FlexConfig)
      } catch (e: any) {
        setError(e?.message || 'Fehler beim Laden der Konfiguration')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const setTier = (idx: number, key: keyof Tier, val: number) => {
    const next = [...cfg.discountTiers]
    const t = { ...next[idx], [key]: val }
    next[idx] = t
    setCfg({ ...cfg, discountTiers: next })
  }

  const addTier = () => setCfg({ ...cfg, discountTiers: [...cfg.discountTiers, { fromYear: 1, percent: 1 }] })
  const removeTier = (idx: number) => setCfg({ ...cfg, discountTiers: cfg.discountTiers.filter((_, i) => i !== idx) })

  const setSla = (name: string, key: keyof SlaPreset, val: string | number) => {
    setCfg({ ...cfg, slaPresets: { ...cfg.slaPresets, [name]: { ...cfg.slaPresets[name], [key]: val } as SlaPreset } })
  }

  const save = async () => {
    try {
      setSaving(true)
      setError(null)
      setMessage(null)
      const res = await fetch('/api/admin/flexlicense', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ config: cfg }) })
      const body = await res.json()
      if (!res.ok) throw new Error(body?.error || `HTTP ${res.status}`)
      setMessage('Konfiguration gespeichert')
    } catch (e: any) {
      setError(e?.message || 'Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">FlexLicence pflegen</h1>
      {loading ? (
        <div>Lade…</div>
      ) : (
        <>
          {error && <div className="text-red-600">{error}</div>}
          {message && <div className="text-green-700">{message}</div>}

          <Card>
            <CardHeader><CardTitle>Allgemein</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Preisindexierung (% p.a.)</Label>
                <Input type="number" value={cfg.priceIndexPct} onChange={e=>setCfg({...cfg, priceIndexPct: Number(e.target.value)})} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Rabattstaffel</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {cfg.discountTiers.map((t,idx)=> (
                <div key={idx} className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                  <div>
                    <Label>ab Jahr</Label>
                    <Input type="number" value={t.fromYear} onChange={e=>setTier(idx,'fromYear', Number(e.target.value))} />
                  </div>
                  <div>
                    <Label>Rabatt (%)</Label>
                    <Input type="number" value={t.percent} onChange={e=>setTier(idx,'percent', Number(e.target.value))} />
                  </div>
                  <div className="col-span-2 flex gap-2">
                    <Button type="button" variant="outline" onClick={addTier}>Tier hinzufügen</Button>
                    <Button type="button" variant="destructive" onClick={()=>removeTier(idx)}>Entfernen</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>SLA Presets</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(cfg.slaPresets).map((name)=> {
                const p = cfg.slaPresets[name]
                return (
                  <div key={name} className="grid md:grid-cols-5 gap-3">
                    <div>
                      <Label>Key</Label>
                      <Input value={name} readOnly />
                    </div>
                    <div>
                      <Label>Label</Label>
                      <Input value={p.label} onChange={e=> setSla(name, 'label', e.target.value)} />
                    </div>
                    <div>
                      <Label>Multiplier</Label>
                      <Input type="number" step="0.01" value={p.multiplier} onChange={e=> setSla(name, 'multiplier', Number(e.target.value))} />
                    </div>
                    <div>
                      <Label>Reaktionszeit</Label>
                      <Input value={p.response} onChange={e=> setSla(name, 'response', e.target.value)} />
                    </div>
                    <div>
                      <Label>Verfügbarkeit</Label>
                      <Input value={p.availability} onChange={e=> setSla(name, 'availability', e.target.value)} />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>UI & Grenzen</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Label Hosting</Label>
                <Input value={cfg.ui.hostingLabel} onChange={e=> setCfg({...cfg, ui: { ...cfg.ui, hostingLabel: e.target.value }})} />
              </div>
              <div>
                <Label>Min. Projektvolumen</Label>
                <Input type="number" value={cfg.ui.minProjectVolume} onChange={e=> setCfg({...cfg, ui: { ...cfg.ui, minProjectVolume: Number(e.target.value) }})} />
              </div>
              <div>
                <Label>Max. Projektvolumen</Label>
                <Input type="number" value={cfg.ui.maxProjectVolume} onChange={e=> setCfg({...cfg, ui: { ...cfg.ui, maxProjectVolume: Number(e.target.value) }})} />
              </div>
              <div>
                <Label>Default Projektvolumen</Label>
                <Input type="number" value={cfg.ui.defaultProjectVolume} onChange={e=> setCfg({...cfg, ui: { ...cfg.ui, defaultProjectVolume: Number(e.target.value) }})} />
              </div>
              <div>
                <Label>Min. Jahre</Label>
                <Input type="number" value={cfg.ui.minYears} onChange={e=> setCfg({...cfg, ui: { ...cfg.ui, minYears: Number(e.target.value) }})} />
              </div>
              <div>
                <Label>Max. Jahre</Label>
                <Input type="number" value={cfg.ui.maxYears} onChange={e=> setCfg({...cfg, ui: { ...cfg.ui, maxYears: Number(e.target.value) }})} />
              </div>
              <div>
                <Label>Default Jahre</Label>
                <Input type="number" value={cfg.ui.defaultYears} onChange={e=> setCfg({...cfg, ui: { ...cfg.ui, defaultYears: Number(e.target.value) }})} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={save} disabled={saving}>{saving ? 'Speichere…' : 'Speichern'}</Button>
          </div>
        </>
      )}
    </div>
  )
}
