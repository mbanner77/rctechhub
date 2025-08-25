"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { RefreshCw, Database, Check, AlertTriangle, Info } from "lucide-react"

export default function DataStorageStatus() {
  const [status, setStatus] = useState<{
    services: { count: number; status: "ok" | "error" | "loading" }
    workshops: { count: number; status: "ok" | "error" | "loading" }
    bestPractices: { count: number; status: "ok" | "error" | "loading" }
    resources: { count: number; status: "ok" | "error" | "loading" }
    landingPage: { status: "ok" | "error" | "loading" }
    mailConfig: { status: "ok" | "error" | "loading" }
  }>({
    services: { count: 0, status: "loading" },
    workshops: { count: 0, status: "loading" },
    bestPractices: { count: 0, status: "loading" },
    resources: { count: 0, status: "loading" },
    landingPage: { status: "loading" },
    mailConfig: { status: "loading" },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const checkDataStorage = async () => {
      setIsLoading(true)
      try {
        // Prüfe Services
        try {
          const servicesResponse = await fetch("/api/unified-data/services", {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          })
          if (servicesResponse.ok) {
            const services = await servicesResponse.json()
            setStatus((prev) => ({
              ...prev,
              services: { count: services.length, status: "ok" },
            }))
          } else {
            setStatus((prev) => ({
              ...prev,
              services: { count: 0, status: "error" },
            }))
          }
        } catch (error) {
          setStatus((prev) => ({
            ...prev,
            services: { count: 0, status: "error" },
          }))
        }

        // Prüfe Workshops
        try {
          const workshopsResponse = await fetch("/api/unified-data/workshops", {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          })
          if (workshopsResponse.ok) {
            const workshops = await workshopsResponse.json()
            setStatus((prev) => ({
              ...prev,
              workshops: { count: workshops.length, status: "ok" },
            }))
          } else {
            setStatus((prev) => ({
              ...prev,
              workshops: { count: 0, status: "error" },
            }))
          }
        } catch (error) {
          setStatus((prev) => ({
            ...prev,
            workshops: { count: 0, status: "error" },
          }))
        }

        // Prüfe Best Practices
        try {
          const bestPracticesResponse = await fetch("/api/unified-data/best-practices", {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          })
          if (bestPracticesResponse.ok) {
            const bestPractices = await bestPracticesResponse.json()
            setStatus((prev) => ({
              ...prev,
              bestPractices: { count: bestPractices.length, status: "ok" },
            }))
          } else {
            setStatus((prev) => ({
              ...prev,
              bestPractices: { count: 0, status: "error" },
            }))
          }
        } catch (error) {
          setStatus((prev) => ({
            ...prev,
            bestPractices: { count: 0, status: "error" },
          }))
        }

        // Prüfe Resources
        try {
          const resourcesResponse = await fetch("/api/unified-data/resources", {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          })
          if (resourcesResponse.ok) {
            const resources = await resourcesResponse.json()
            setStatus((prev) => ({
              ...prev,
              resources: { count: resources.length, status: "ok" },
            }))
          } else {
            setStatus((prev) => ({
              ...prev,
              resources: { count: 0, status: "error" },
            }))
          }
        } catch (error) {
          setStatus((prev) => ({
            ...prev,
            resources: { count: 0, status: "error" },
          }))
        }

        // Prüfe Landing Page
        try {
          const landingPageResponse = await fetch("/api/landing-page", {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          })
          if (landingPageResponse.ok) {
            setStatus((prev) => ({
              ...prev,
              landingPage: { status: "ok" },
            }))
          } else {
            setStatus((prev) => ({
              ...prev,
              landingPage: { status: "error" },
            }))
          }
        } catch (error) {
          setStatus((prev) => ({
            ...prev,
            landingPage: { status: "error" },
          }))
        }

        // Prüfe Mail Config
        try {
          const mailConfigResponse = await fetch("/api/unified-data/mail-config", {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          })
          if (mailConfigResponse.ok) {
            setStatus((prev) => ({
              ...prev,
              mailConfig: { status: "ok" },
            }))
          } else {
            setStatus((prev) => ({
              ...prev,
              mailConfig: { status: "error" },
            }))
          }
        } catch (error) {
          setStatus((prev) => ({
            ...prev,
            mailConfig: { status: "error" },
          }))
        }
      } catch (error) {
        console.error("Fehler beim Prüfen des Datenspeichers:", error)
        toast({
          title: "Fehler",
          description: "Der Datenspeicher konnte nicht geprüft werden.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkDataStorage()
  }, [refreshKey])

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const getStatusBadge = (status: "ok" | "error" | "loading") => {
    if (status === "ok") {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Check className="w-3 h-3 mr-1" /> OK
        </Badge>
      )
    } else if (status === "error") {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <AlertTriangle className="w-3 h-3 mr-1" /> Fehler
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Laden...
        </Badge>
      )
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Datenspeicher-Status</CardTitle>
            <CardDescription>Status der verschiedenen Datenspeicher</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Aktualisieren
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <Database className="w-5 h-5 mr-2 text-blue-600" />
                <span>Services</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{status.services.count}</span>
                {getStatusBadge(status.services.status)}
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <Database className="w-5 h-5 mr-2 text-blue-600" />
                <span>Workshops</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{status.workshops.count}</span>
                {getStatusBadge(status.workshops.status)}
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <Database className="w-5 h-5 mr-2 text-blue-600" />
                <span>Best Practices</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{status.bestPractices.count}</span>
                {getStatusBadge(status.bestPractices.status)}
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <Database className="w-5 h-5 mr-2 text-blue-600" />
                <span>Resources</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{status.resources.count}</span>
                {getStatusBadge(status.resources.status)}
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <Database className="w-5 h-5 mr-2 text-blue-600" />
                <span>Landing Page</span>
              </div>
              <div className="flex items-center space-x-2">{getStatusBadge(status.landingPage.status)}</div>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <Database className="w-5 h-5 mr-2 text-blue-600" />
                <span>Mail Config</span>
              </div>
              <div className="flex items-center space-x-2">{getStatusBadge(status.mailConfig.status)}</div>
            </div>
          </div>

          <div className="flex items-start p-4 bg-blue-50 rounded-md">
            <Info className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p>
                Alle Daten werden im Vercel Blob Storage gespeichert und sind sowohl für den Admin-Bereich als auch für
                die öffentlichen Seiten verfügbar. Änderungen im Admin-Bereich werden sofort auf den öffentlichen Seiten
                sichtbar.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
