"use client"

import React, { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title as CTitle, Tooltip as CTooltip, Legend as CLegend } from "chart.js"
import { Bar } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, CTitle, CTooltip, CLegend)

// SLA presets
const SLA_PRESETS: Record<string, { label: string; multiplier: number; response: string; availability: string }> = {
  Bronze: { label: "Bronze", multiplier: 1.0, response: "48h", availability: "97.0%" },
  Silver: { label: "Silver", multiplier: 1.08, response: "24h", availability: "98.5%" },
  Gold: { label: "Gold", multiplier: 1.16, response: "8h", availability: "99.5%" },
  Platinum: { label: "Platinum", multiplier: 1.25, response: "4h", availability: "99.9%" },
}

function formatEUR(n: number) {
  try {
    return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)
  } catch {
    return `${n.toLocaleString("de-DE")} €`
  }
}

function npv(cashflows: number[], rate: number) {
  // cashflows are monthly, rate is yearly; convert to monthly discount factor
  const r = Math.pow(1 + rate, 1 / 12) - 1
  return cashflows.reduce((acc, cf, i) => acc + cf / Math.pow(1 + r, i + 1), 0)
}

export default function FlexLicenseConfigurator() {
  const { toast } = useToast()

  // Step state
  const [step, setStep] = useState<number>(1)

  // Inputs
  const [projectVolume, setProjectVolume] = useState<number>(500_000)
  const [termYears, setTermYears] = useState<number>(5)
  const [hosting, setHosting] = useState<boolean>(true)
  const [sla, setSla] = useState<keyof typeof SLA_PRESETS>("Gold")
  // Geschäftsregeln: feste Preisindexierung 2% p.a., feste Rabattstaffel
  const PRICE_INDEX_PCT = 2
  const discountByYear = (year: number): number => {
    if (year >= 10) return 10
    if (year >= 5) return 5
    if (year >= 3) return 3
    return 0
  }

  // Contact
  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")

  // Calculation
  const calc = useMemo(() => {
    const months = termYears * 12

    // Base: amortize project volume over term
    const baseMonthly = projectVolume / months

    // Hosting overhead ~8% of base
    const hostingMonthly = hosting ? baseMonthly * 0.08 : 0

    // SLA multiplier on service portion (hosting+service) – apply on (base + hosting)
    const slaMult = SLA_PRESETS[sla].multiplier

    // apply indexation p.a. and discounts after discountStartYear
    const monthlyIndex = Math.pow(1 + PRICE_INDEX_PCT / 100, 1 / 12) - 1

    const cashflows: number[] = []
    for (let m = 1; m <= months; m++) {
      const year = Math.ceil(m / 12)
      const discount = discountByYear(year) / 100
      const base = (baseMonthly + hostingMonthly) * slaMult
      const indexed = base * Math.pow(1 + monthlyIndex, m - 1)
      const discounted = indexed * (1 - discount)
      cashflows.push(discounted)
    }

    const monthlyNow = cashflows[0]
    const total = cashflows.reduce((a, b) => a + b, 0)
    const npv10 = npv(cashflows, 0.10)

    return {
      monthly: monthlyNow,
      total,
      npv: npv10,
      series: cashflows,
    }
  }, [projectVolume, termYears, hosting, sla])

  const submit = async () => {
    try {
      // Basic validation
      if (!name.trim() || !company.trim() || !email.trim()) {
        toast({ title: "Eingaben unvollständig", description: "Bitte Name, Firma und E-Mail angeben.", variant: "destructive" })
        return
      }
      const emailOk = /.+@.+\..+/.test(email)
      if (!emailOk) {
        toast({ title: "Ungültige E-Mail", description: "Bitte eine gültige E-Mail-Adresse angeben.", variant: "destructive" })
        return
      }
      const payload = {
        projectVolume,
        termYears,
        hosting,
        sla,
        priceIndexPct: PRICE_INDEX_PCT,
        discountTiers: [
          { fromYear: 3, percent: 3 },
          { fromYear: 5, percent: 5 },
          { fromYear: 10, percent: 10 },
        ],
        results: calc,
        contact: { name, company, email, phone, message },
      }

      const res = await fetch("/api/flexlicense/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("Request failed")

      toast({ title: "Anfrage versendet", description: "Wir melden uns zeitnah mit einem Angebot." })
      setStep(4)
    } catch (e) {
      console.error(e)
      toast({ title: "Fehler", description: "Bitte prüfen Sie Ihre Eingaben und versuchen Sie es erneut.", variant: "destructive" })
    }
  }

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Digitalisierung ohne CapEx – mit dem RealCore FlexLicense Konfigurator</h1>
        <p className="mt-3 text-gray-600">
          Budgethürden bremsen Ihre Projekte? Mit dem RealCore FlexLicense brauchen Sie keine großen Investitionen mehr: Sie konfigurieren Ihr
          Wunschprojekt online – Laufzeit, Service-Level und Projektvolumen – und erhalten sofort eine transparente Kostenübersicht.
        </p>
        <ul className="mt-4 grid gap-2 text-gray-800">
          <li>• Planbare Raten statt hoher Einmalinvestition</li>
          <li>• SLA nach Wahl – von Bronze bis Platinum</li>
          <li>• Individuelle Anfrage in Minuten – wir liefern das passende Angebot</li>
        </ul>
        <p className="mt-2 text-gray-600">So wird Digitalisierung schnell, flexibel und kalkulierbar. Starten Sie jetzt!</p>
      </div>

      {/* Steps */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Step 1 */}
          <Card>
            <CardHeader>
              <CardTitle>1 · Projektparameter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Projektvolumen (EUR)</Label>
                <div className="flex items-center gap-3">
                  <Slider value={[projectVolume]} min={100000} max={2000000} step={10000} onValueChange={(v)=>setProjectVolume(Math.min(2_000_000, Math.max(100_000, v[0])))} className="flex-1" />
                  <Input value={projectVolume} onChange={(e)=>{
                    const n = Number(e.target.value) || 0
                    setProjectVolume(Math.min(2_000_000, Math.max(100_000, n)))
                  }} className="w-40"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Laufzeit (Jahre)</Label>
                  <Select value={String(termYears)} onValueChange={(v)=>setTermYears(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Array.from({length:8},(_,i)=>3+i).map(y=> (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-start gap-2 pt-6">
                  <Checkbox id="hosting" checked={hosting} onCheckedChange={(v)=>setHosting(Boolean(v))} />
                  <div>
                    <Label htmlFor="hosting">Betrieb inkludiert</Label>
                    <div className="text-xs text-gray-500">Optionaler Betrieb/Hosting wird in die Monatsrate eingerechnet.</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card>
            <CardHeader>
              <CardTitle>2 · SLA-Variante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={sla} onValueChange={(v)=>setSla(v as keyof typeof SLA_PRESETS)}>
                <SelectTrigger><SelectValue placeholder="SLA wählen"/></SelectTrigger>
                <SelectContent>
                  {Object.keys(SLA_PRESETS).map(k => (
                    <SelectItem key={k} value={k}>{SLA_PRESETS[k].label} — Reaktion {SLA_PRESETS[k].response}, Verfügbarkeit {SLA_PRESETS[k].availability}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card>
            <CardHeader>
              <CardTitle>3 · Staffelpreise & Indexierung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <div className="p-3 rounded-md border bg-gray-50">
                <div className="font-semibold mb-1">Feste Rabattstaffel</div>
                <ul className="list-disc ml-5 space-y-1">
                  <li>ab Jahr 3: 3%</li>
                  <li>ab Jahr 5: 5%</li>
                  <li>ab Jahr 10: 10%</li>
                </ul>
              </div>
              <div className="p-3 rounded-md border bg-gray-50">
                <div className="font-semibold mb-1">Preisindexierung</div>
                <div>Fest: {PRICE_INDEX_PCT}% p.a.</div>
              </div>
              <div className="text-xs text-gray-500">Hinweis: Die Staffelrabatte werden automatisch auf die Monatsraten ab dem jeweiligen Jahr angewendet.</div>
            </CardContent>
          </Card>

          {/* Step 4 */}
          <Card>
            <CardHeader>
              <CardTitle>4 · Ergebnis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 rounded-md border">
                  <div className="text-xs text-gray-500">Monatliche Rate</div>
                  <div className="text-xl font-bold">{formatEUR(calc.monthly)}</div>
                </div>
                <div className="p-3 rounded-md border">
                  <div className="text-xs text-gray-500">Gesamtkosten (Laufzeit)</div>
                  <div className="text-xl font-bold">{formatEUR(calc.total)}</div>
                </div>
                <div className="p-3 rounded-md border">
                  <div className="text-xs text-gray-500">NPV @ 10% WACC</div>
                  <div className="text-xl font-bold">{formatEUR(calc.npv)}</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-xs text-gray-500 mb-2">Opex vs. Capex</div>
                <div className="bg-white p-3 rounded-md border">
                  <Bar
                    data={{
                      labels: ["CapEx", "OpEx"],
                      datasets: [
                        {
                          label: "Kosten",
                          data: [projectVolume, calc.total],
                          backgroundColor: ["#84cc16", "#10b981"],
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: { legend: { display: false } },
                      scales: { x: { grid: { display: false } }, y: { ticks: { callback: (v)=>`${v}` } } },
                      maintainAspectRatio: false,
                    }}
                    height={140}
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500">Hinweis: Neue Funktionen oder Releases separat buchbar.</div>
            </CardContent>
          </Card>

          {/* Step 5 */}
          <Card>
            <CardHeader>
              <CardTitle>5 · Unverbindliche Anfrage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label>Name</Label>
                  <Input value={name} onChange={(e)=>setName(e.target.value)} />
                </div>
                <div>
                  <Label>Firma</Label>
                  <Input value={company} onChange={(e)=>setCompany(e.target.value)} />
                </div>
                <div>
                  <Label>E-Mail</Label>
                  <Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
                </div>
                <div>
                  <Label>Telefon</Label>
                  <Input value={phone} onChange={(e)=>setPhone(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Nachricht (optional)</Label>
                <Input value={message} onChange={(e)=>setMessage(e.target.value)} />
              </div>
              <div className="flex justify-end">
                <Button onClick={submit} className="bg-green-600 hover:bg-green-700">Unverbindliche Anfrage stellen</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ihre Auswahl</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><span className="text-gray-500">Projektvolumen:</span> {formatEUR(projectVolume)}</div>
              <div><span className="text-gray-500">Laufzeit:</span> {termYears} Jahre</div>
              <div><span className="text-gray-500">SLA:</span> {SLA_PRESETS[sla].label}</div>
              <div><span className="text-gray-500">Betrieb:</span> {hosting ? "Ja" : "Nein"}</div>
              <div><span className="text-gray-500">Preisindex:</span> {PRICE_INDEX_PCT}% p.a.</div>
              <div><span className="text-gray-500">Rabatte:</span> 3% ab Jahr 3 · 5% ab Jahr 5 · 10% ab Jahr 10</div>
              <hr className="my-2" />
              <div className="font-semibold">Monatlich: {formatEUR(calc.monthly)}</div>
              <div>Gesamt: {formatEUR(calc.total)}</div>
              <div>NPV @10%: {formatEUR(calc.npv)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Warum FlexLicense?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-2">
              <p>Planbare Raten statt hoher Einmalinvestition.</p>
              <p>SLA nach Wahl – von Bronze bis Platinum.</p>
              <p>Individuelle Anfrage in Minuten – wir liefern das passende Angebot.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
