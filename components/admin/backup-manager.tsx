"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, RefreshCw, RotateCcw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale"

type BackupItem = {
  url: string
  name: string
  timestamp: number
}

type DataType = "services" | "workshops" | "best-practices" | "resources" | "landing-page" | "mail-config"

export default function BackupManager() {
  const { toast } = useToast()
  const [dataType, setDataType] = useState<DataType>("services")
  const [backups, setBackups] = useState<BackupItem[]>([])
  const [loading, setLoading] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null)

  // Lade die Backups beim ersten Rendern und wenn sich der Datentyp ändert
  useEffect(() => {
    loadBackups()
  }, [dataType])

  // Funktion zum Laden der Backups
  const loadBackups = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/backups?dataType=${dataType}`)
      if (!response.ok) {
        throw new Error(`Fehler beim Laden der Backups: ${response.statusText}`)
      }
      const data = await response.json()
      setBackups(data.backups || [])
    } catch (error) {
      console.error("Fehler beim Laden der Backups:", error)
      toast({
        title: "Fehler",
        description: "Die Backups konnten nicht geladen werden.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Funktion zum Wiederherstellen eines Backups
  const restoreBackup = async (backupUrl: string) => {
    setRestoring(true)
    try {
      const response = await fetch("/api/admin/backups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          backupUrl,
          dataType,
        }),
      })

      if (!response.ok) {
        throw new Error(`Fehler beim Wiederherstellen des Backups: ${response.statusText}`)
      }

      toast({
        title: "Erfolg",
        description: "Das Backup wurde erfolgreich wiederhergestellt.",
      })
    } catch (error) {
      console.error("Fehler beim Wiederherstellen des Backups:", error)
      toast({
        title: "Fehler",
        description: "Das Backup konnte nicht wiederhergestellt werden.",
        variant: "destructive",
      })
    } finally {
      setRestoring(false)
    }
  }

  // Funktion zum Formatieren des Zeitstempels
  const formatTimestamp = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: de })
    } catch (error) {
      return "Unbekanntes Datum"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Backup-Verwaltung</CardTitle>
        <CardDescription>Verwalten Sie Backups für verschiedene Datentypen</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Select value={dataType} onValueChange={(value) => setDataType(value as DataType)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Datentyp auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="services">Services</SelectItem>
                <SelectItem value="workshops">Workshops</SelectItem>
                <SelectItem value="best-practices">Best Practices</SelectItem>
                <SelectItem value="resources">Resources</SelectItem>
                <SelectItem value="landing-page">Landing Page</SelectItem>
                <SelectItem value="mail-config">Mail-Konfiguration</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadBackups} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Aktualisieren
            </Button>
          </div>

          <div className="border rounded-md">
            <div className="p-4">
              <h3 className="text-lg font-medium">Verfügbare Backups</h3>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : backups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Keine Backups gefunden für diesen Datentyp.
                </div>
              ) : (
                <div className="space-y-2 mt-4">
                  {backups.map((backup) => (
                    <div
                      key={backup.url}
                      className={`p-3 border rounded-md flex justify-between items-center cursor-pointer hover:bg-accent ${
                        selectedBackup === backup.url ? "bg-accent" : ""
                      }`}
                      onClick={() => setSelectedBackup(backup.url)}
                    >
                      <div>
                        <div className="font-medium">{backup.name}</div>
                        <div className="text-sm text-muted-foreground">{formatTimestamp(backup.timestamp)}</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          restoreBackup(backup.url)
                        }}
                        disabled={restoring}
                      >
                        {restoring && selectedBackup === backup.url ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="mr-2 h-4 w-4" />
                        )}
                        Wiederherstellen
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
