"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Save, Trash2, Loader2 } from "lucide-react"
import { ConsultingPhasesData, ConsultingPhase, ConsultingPhaseOffer } from "@/types/consulting-phases"
import { useToast } from "@/hooks/use-toast"
import { RichTextEditor } from "@/components/ui/rich-text-editor"

export default function ConsultingPhasesManager() {
  const { toast } = useToast()
  const [data, setData] = useState<ConsultingPhasesData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/data/consulting-phases")
        const json = await res.json()
        setData(json)
      } catch (e) {
        console.error(e)
        toast({ title: "Fehler", description: "Daten konnten nicht geladen werden", variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [toast])

  const updateField = <K extends keyof ConsultingPhasesData>(key: K, value: ConsultingPhasesData[K]) => {
    if (!data) return
    setData({ ...data, [key]: value })
  }

  const updatePhase = (idx: number, patch: Partial<ConsultingPhase>) => {
    if (!data) return
    const phases = [...data.phases]
    phases[idx] = { ...phases[idx], ...patch }
    setData({ ...data, phases })
  }

  const addOffer = (phaseIdx: number) => {
    if (!data) return
    const phases = [...data.phases]
    const offers = [...phases[phaseIdx].offers]
    const id = `offer-${Math.random().toString(36).slice(2, 8)}`
    offers.push({ id, title: "Neues Angebot", price: 0, shortDescription: "", defaultSelected: false })
    phases[phaseIdx] = { ...phases[phaseIdx], offers }
    setData({ ...data, phases })
  }

  const updateOffer = (phaseIdx: number, offerIdx: number, patch: Partial<ConsultingPhaseOffer>) => {
    if (!data) return
    const phases = [...data.phases]
    const offers = [...phases[phaseIdx].offers]
    offers[offerIdx] = { ...offers[offerIdx], ...patch }
    phases[phaseIdx] = { ...phases[phaseIdx], offers }
    setData({ ...data, phases })
  }

  const removeOffer = (phaseIdx: number, offerIdx: number) => {
    if (!data) return
    const phases = [...data.phases]
    const offers = [...phases[phaseIdx].offers]
    offers.splice(offerIdx, 1)
    phases[phaseIdx] = { ...phases[phaseIdx], offers }
    setData({ ...data, phases })
  }

  const handleSave = async () => {
    if (!data) return
    setIsSaving(true)
    try {
      const res = await fetch("/api/data/consulting-phases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Save failed")
      toast({ title: "Gespeichert", description: "Beratungsbaukasten erfolgreich gespeichert" })
    } catch (e) {
      console.error(e)
      toast({ title: "Fehler", description: "Speichern fehlgeschlagen", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || !data) {
    return (
      <div className="flex items-center gap-2 py-6 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Lade Beratungsbaukasten...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {isSaving ? "Speichern..." : "Speichern"}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-3">
            <div className="space-y-2">
              <Label htmlFor="introTitle">Intro Titel</Label>
              <Input id="introTitle" value={data.introTitle} onChange={(e) => updateField("introTitle", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="introText">Intro Text</Label>
              <Textarea id="introText" value={data.introText} onChange={(e) => updateField("introText", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ctaText">CTA Text</Label>
              <Input id="ctaText" value={data.ctaText || ""} onChange={(e) => updateField("ctaText", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={data.phases[0]?.id || "phase-1"}>
        <TabsList>
          {data.phases.map((p) => (
            <TabsTrigger key={p.id} value={p.id}>{p.title}</TabsTrigger>
          ))}
        </TabsList>

        {data.phases.map((phase, phaseIdx) => (
          <TabsContent key={phase.id} value={phase.id}>
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`title-${phase.id}`}>Phasen Titel</Label>
                    <Input id={`title-${phase.id}`} value={phase.title} onChange={(e) => updatePhase(phaseIdx, { title: e.target.value })} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`desc-${phase.id}`}>Beschreibung</Label>
                    <RichTextEditor
                      value={phase.description || ""}
                      onChange={(html) => updatePhase(phaseIdx, { description: html })}
                      placeholder="Beschreibung der Phase als Rich Text"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Angebote</Label>
                    <Button variant="outline" size="sm" onClick={() => addOffer(phaseIdx)}>
                      <PlusCircle className="h-4 w-4 mr-2" /> Angebot hinzufügen
                    </Button>
                  </div>
                  <div className="grid gap-3">
                    {phase.offers.map((offer, offerIdx) => (
                      <div key={offer.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start">
                        <div className="md:col-span-4">
                          <Label className="sr-only">Titel</Label>
                          <Input
                            value={offer.title}
                            onChange={(e) => updateOffer(phaseIdx, offerIdx, { title: e.target.value })}
                            placeholder="Angebotstitel"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <Label className="sr-only">Kurzbeschreibung</Label>
                          <Input
                            value={offer.shortDescription || ""}
                            onChange={(e) => updateOffer(phaseIdx, offerIdx, { shortDescription: e.target.value })}
                            placeholder="Kurzbeschreibung"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="sr-only">Preis</Label>
                          <Input
                            type="number"
                            value={Number.isFinite(offer.price as number) ? String(offer.price) : ""}
                            onChange={(e) => {
                              const val = e.target.value.trim()
                              updateOffer(phaseIdx, offerIdx, { price: val === "" ? 0 : parseFloat(val) })
                            }}
                            placeholder="Preis"
                          />
                        </div>
                        <div className="md:col-span-2 flex items-center gap-2">
                          <input
                            id={`${offer.id}-defsel`}
                            type="checkbox"
                            className="h-4 w-4"
                            checked={!!offer.defaultSelected}
                            onChange={(e) => updateOffer(phaseIdx, offerIdx, { defaultSelected: e.target.checked })}
                          />
                          <Label htmlFor={`${offer.id}-defsel`}>Standard ausgewählt</Label>
                        </div>
                        <div className="md:col-span-1 flex md:justify-end">
                          <Button variant="destructive" size="icon" onClick={() => removeOffer(phaseIdx, offerIdx)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {phase.offers.length === 0 && (
                      <p className="text-sm text-muted-foreground">Noch keine Angebote. Fügen Sie das erste hinzu.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
