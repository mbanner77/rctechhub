"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { db } from "@/lib/db"

export default function DatabaseStatus() {
  const [status, setStatus] = useState({
    services: 0,
    workshops: 0,
    bestPractices: 0,
    resources: 0,
    mailConfig: 0,
    landingPage: 0,
    isLoading: true,
  })

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const services = await db.services.count()
        const workshops = await db.workshops.count()
        const bestPractices = await db.bestPractices.count()
        const resources = await db.resources.count()
        const mailConfig = await db.mailConfig.count()
        const landingPage = await db.landingPage.count()

        setStatus({
          services,
          workshops,
          bestPractices,
          resources,
          mailConfig,
          landingPage,
          isLoading: false,
        })
      } catch (error) {
        console.error("Fehler beim Prüfen des Datenbank-Status:", error)
        setStatus((prev) => ({ ...prev, isLoading: false }))
      }
    }

    checkStatus()
  }, [])

  if (status.isLoading) {
    return <div>Lade Datenbank-Status...</div>
  }

  const totalItems = status.services + status.workshops + status.bestPractices + status.resources
  const maxItems = 20 // Annahme: Maximal erwartete Anzahl von Elementen
  const progress = Math.min(100, (totalItems / maxItems) * 100)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm">Datenbankauslastung</span>
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex justify-between items-center">
          <span className="text-sm">Services</span>
          <Badge variant={status.services > 0 ? "default" : "outline"}>{status.services}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">Workshops</span>
          <Badge variant={status.workshops > 0 ? "default" : "outline"}>{status.workshops}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">Best Practices</span>
          <Badge variant={status.bestPractices > 0 ? "default" : "outline"}>{status.bestPractices}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">Resources</span>
          <Badge variant={status.resources > 0 ? "default" : "outline"}>{status.resources}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">Mail-Config</span>
          <Badge variant={status.mailConfig > 0 ? "default" : "outline"}>{status.mailConfig}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">Landing Page</span>
          <Badge variant={status.landingPage > 0 ? "default" : "outline"}>{status.landingPage}</Badge>
        </div>
      </div>
    </div>
  )
}
