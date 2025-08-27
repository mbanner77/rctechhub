"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ConsultingPhasesData } from "@/types/consulting-phases"
import { CheckCircle2 } from "lucide-react"

export default function ConsultingPhasesDisplay() {
  const [data, setData] = useState<ConsultingPhasesData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/data/consulting-phases", { cache: "no-store" })
        if (res.ok) {
          const json = (await res.json()) as ConsultingPhasesData
          setData(json)
        }
      } catch (e) {
        console.error("Error loading consulting phases:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

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
      <div className="max-w-3xl">
        <h2 className="text-3xl font-bold mb-3">{data.introTitle}</h2>
        <p className="text-muted-foreground mb-4">{data.introText}</p>
        {data.ctaText && <Button variant="default">{data.ctaText}</Button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.phases.map((phase) => (
          <Card key={phase.id} className="h-full">
            <CardHeader>
              <CardTitle className="text-xl">{phase.title}</CardTitle>
              {phase.description && (
                <p className="text-sm text-muted-foreground mt-1">{phase.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {phase.offers.map((offer) => (
                  <li key={offer.id} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>{offer.title}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
