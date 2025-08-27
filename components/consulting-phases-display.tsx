"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ConsultingPhasesData, ConsultingPhase, ConsultingPhaseOffer } from "@/types/consulting-phases"
import { CheckCircle2 } from "lucide-react"

export default function ConsultingPhasesDisplay() {
  const [data, setData] = useState<ConsultingPhasesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [customer, setCustomer] = useState({ name: "", email: "", company: "", note: "" })
  const [submitting, setSubmitting] = useState(false)
  const configuratorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/data/consulting-phases", { cache: "no-store" })
        if (res.ok) {
          const json = (await res.json()) as ConsultingPhasesData
          setData(json)
          // initialize defaults
          const pre: Record<string, boolean> = {}
          json.phases.forEach((p: ConsultingPhase) =>
            p.offers.forEach((o: ConsultingPhaseOffer) => {
              if (o.defaultSelected) pre[o.id] = true
            })
          )
          setSelected(pre)
        }
      } catch (e) {
        console.error("Error loading consulting phases:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const currency = useMemo(() => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }), [])

  const offerPrice = (o?: ConsultingPhaseOffer) => (o?.price && Number.isFinite(o.price) ? o.price : 0)

  const totals = useMemo(() => {
    if (!data) return { perPhase: {} as Record<string, number>, grand: 0 }
    const perPhase: Record<string, number> = {}
    let grand = 0
    for (const phase of data.phases) {
      const sum = phase.offers.reduce((acc, o) => acc + (selected[o.id] ? offerPrice(o) : 0), 0)
      perPhase[phase.id] = sum
      grand += sum
    }
    return { perPhase, grand }
  }, [data, selected])

  const toggleOffer = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }))

  const scrollToConfigurator = () => {
    configuratorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const submitOrder = async () => {
    if (!data) return
    if (!customer.name || !customer.email) {
      alert("Bitte Name und E-Mail angeben.")
      return
    }
    const chosen: Array<{ phaseId: string; offerId: string; title: string; price: number }> = []
    data.phases.forEach((p) =>
      p.offers.forEach((o) => {
        if (selected[o.id]) chosen.push({ phaseId: p.id, offerId: o.id, title: o.title, price: offerPrice(o) })
      })
    )
    if (chosen.length === 0) {
      alert("Bitte wählen Sie mindestens ein Angebot aus.")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/orders/consulting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          items: chosen,
          total: totals.grand,
          meta: { source: "consulting-phases", createdAt: new Date().toISOString() },
        }),
      })
      if (!res.ok) throw new Error("Order failed")
      const result = await res.json()
      alert(`Vielen Dank! Ihre Anfrage wurde gesendet. Vorgangs-ID: ${result.id || "n/a"}`)
      setCustomer({ name: "", email: "", company: "", note: "" })
    } catch (e) {
      console.error(e)
      alert("Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!data) {
    return <div className="text-center text-muted-foreground py-8">Keine Daten verfügbar</div>
  }

  return (
    <div className="space-y-10">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-3">{data.introTitle}</h2>
        <p className="text-muted-foreground mb-6">{data.introText}</p>
        {data.ctaText && (
          <Button variant="default" onClick={scrollToConfigurator}>{data.ctaText}</Button>
        )}
      </div>

      <div ref={configuratorRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.phases.map((phase) => (
          <Card key={phase.id} className="h-full">
            <CardHeader>
              <CardTitle className="text-xl">{phase.title}</CardTitle>
              {phase.description && (
                <div className="text-sm text-muted-foreground mt-1" dangerouslySetInnerHTML={{ __html: phase.description }} />
              )}
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {phase.offers.map((offer) => (
                  <li key={offer.id} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4"
                      checked={!!selected[offer.id]}
                      onChange={() => toggleOffer(offer.id)}
                      aria-label={`Auswahl ${offer.title}`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium">{offer.title}</div>
                        <div className="text-sm text-muted-foreground">{currency.format(offerPrice(offer))}</div>
                      </div>
                      {offer.shortDescription && (
                        <div className="text-sm text-muted-foreground">{offer.shortDescription}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-right font-semibold">Summe Phase: {currency.format(totals.perPhase[phase.id] || 0)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold">Gesamtsumme</div>
            <div className="text-xl font-semibold">{currency.format(totals.grand)}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              className="border rounded px-3 py-2"
              placeholder="Ihr Name"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="E-Mail"
              type="email"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Unternehmen (optional)"
              value={customer.company}
              onChange={(e) => setCustomer({ ...customer, company: e.target.value })}
            />
            <textarea
              className="border rounded px-3 py-2 md:col-span-3"
              placeholder="Zusätzliche Hinweise (optional)"
              rows={3}
              value={customer.note}
              onChange={(e) => setCustomer({ ...customer, note: e.target.value })}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={submitOrder} disabled={submitting || totals.grand <= 0}>
              {submitting ? "Wird gesendet..." : "Auswahl bestellen"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
