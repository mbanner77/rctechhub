"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { defaultResources } from "@/data/default-data"
import { AlertCircle, Save, Trash, Plus, Download, Upload } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { db, sanitizeResource } from "@/lib/db"

export default function ResourceEditor() {
  const [resources, setResources] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadResources = async () => {
      setIsLoading(true)
      setSaveError(null)
      setSaveSuccess(null)
      try {
        console.log("[RESOURCE-EDITOR] Lade Resources aus der Datenbank...")
        const dbResources = await db.resources.toArray()

        if (Array.isArray(dbResources) && dbResources.length > 0) {
          console.log("[RESOURCE-EDITOR] Resources aus der Datenbank geladen:", dbResources.length)
          setResources(dbResources)
          setError(null)
        } else {
          console.log("[RESOURCE-EDITOR] Keine Resources in der Datenbank gefunden, verwende Standarddaten")
          const sanitizedResources = defaultResources.map(sanitizeResource)
          setResources(sanitizedResources)

          // Initialisiere die Datenbank mit Standarddaten
          try {
            await db.resources.clear()
            await db.resources.bulkPut(sanitizedResources)
            console.log("[RESOURCE-EDITOR] Datenbank mit Standarddaten initialisiert")
          } catch (dbError) {
            console.error("[RESOURCE-EDITOR] Fehler beim Initialisieren der Datenbank:", dbError)
            setError("Fehler beim Initialisieren der Datenbank. Standarddaten werden nur temporär verwendet.")
          }
        }
      } catch (err) {
        console.error("[RESOURCE-EDITOR] Fehler beim Laden der Resources:", err)
        setResources(defaultResources.map(sanitizeResource))
        setError("Fehler beim Laden der Resources. Standarddaten werden verwendet.")
      } finally {
        setIsLoading(false)
      }
    }

    loadResources()
  }, [])

  const handleSave = async () => {
    setSaveError(null)
    setSaveSuccess(null)
    try {
      console.log("[RESOURCE-EDITOR] Speichere Resources in der Datenbank...")

      // Bereinige die Resources vor dem Speichern
      const sanitizedResources = resources.map(sanitizeResource)

      // Lösche alle vorhandenen Resources
      await db.resources.clear()

      // Füge die Resources einzeln hinzu
      await db.resources.bulkPut(sanitizedResources)

      console.log("[RESOURCE-EDITOR] Resources erfolgreich in der Datenbank gespeichert")
      setSaveSuccess("Resources erfolgreich in der Datenbank gespeichert.")
      toast({
        title: "Erfolg",
        description: "Resources erfolgreich gespeichert.",
      })
    } catch (err) {
      console.error("[RESOURCE-EDITOR] Fehler beim Speichern der Resources:", err)
      setSaveError(`Fehler beim Speichern der Resources: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`)
      toast({
        title: "Fehler",
        description: "Fehler beim Speichern der Resources.",
        variant: "destructive",
      })
    }
  }

  const handleAddResource = () => {
    const newResource = {
      id: `resource-${Date.now()}`,
      title: "Neue Resource",
      description: "Resource Beschreibung",
      category: "Allgemein",
      image: "/placeholder.svg",
      featured: false,
      downloadUrl: "",
      externalUrl: "",
    }
    setResources([...resources, newResource])
  }

  const handleDeleteResource = (id: string) => {
    setResources(resources.filter((resource) => resource.id !== id))
  }

  const handleResourceChange = (id: string, field: string, value: any) => {
    setResources(
      resources.map((resource) => {
        if (resource.id === id) {
          return { ...resource, [field]: value }
        }
        return resource
      }),
    )
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(resources, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = "resources.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importedData = JSON.parse(content)

        if (Array.isArray(importedData)) {
          setResources(importedData)
          toast({
            title: "Import erfolgreich",
            description: `${importedData.length} Resources importiert.`,
          })
        } else {
          toast({
            title: "Import fehlgeschlagen",
            description: "Die importierte Datei enthält keine gültige Resource-Liste.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("[RESOURCE-EDITOR] Import error:", error)
        toast({
          title: "Import fehlgeschlagen",
          description: "Die Datei konnte nicht verarbeitet werden.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  if (isLoading) {
    return <div className="text-center py-8">Lade Resources...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Resource-Editor</h2>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {saveError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Speicherfehler</AlertTitle>
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      {saveSuccess && (
        <Alert variant="success" className="bg-green-50 text-green-800 border-green-200">
          <AlertTitle>Erfolg</AlertTitle>
          <AlertDescription>{saveSuccess}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <Button onClick={handleAddResource}>
            <Plus className="mr-2 h-4 w-4" /> Resource hinzufügen
          </Button>
          <Button onClick={handleSave} variant="default">
            <Save className="mr-2 h-4 w-4" /> Speichern
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" /> Exportieren
          </Button>
          <div className="relative">
            <input
              type="file"
              id="import-file"
              className="absolute inset-0 opacity-0 w-full cursor-pointer"
              onChange={handleImport}
              accept=".json"
            />
            <Button variant="outline" className="relative">
              <Upload className="mr-2 h-4 w-4" /> Importieren
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {resources.map((resource) => (
          <Card key={resource.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Resource bearbeiten</CardTitle>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteResource(resource.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor={`title-${resource.id}`}>Titel</Label>
                  <Input
                    id={`title-${resource.id}`}
                    value={resource.title}
                    onChange={(e) => handleResourceChange(resource.id, "title", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`description-${resource.id}`}>Beschreibung</Label>
                  <Textarea
                    id={`description-${resource.id}`}
                    value={resource.description}
                    onChange={(e) => handleResourceChange(resource.id, "description", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`category-${resource.id}`}>Kategorie</Label>
                  <Select
                    value={resource.category}
                    onValueChange={(value) => handleResourceChange(resource.id, "category", value)}
                  >
                    <SelectTrigger id={`category-${resource.id}`}>
                      <SelectValue placeholder="Kategorie auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Allgemein">Allgemein</SelectItem>
                      <SelectItem value="Dokument">Dokument</SelectItem>
                      <SelectItem value="Vorlage">Vorlage</SelectItem>
                      <SelectItem value="Werkzeug">Werkzeug</SelectItem>
                      <SelectItem value="Tutorial">Tutorial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`image-${resource.id}`}>Bild-URL</Label>
                  <Input
                    id={`image-${resource.id}`}
                    value={resource.image}
                    onChange={(e) => handleResourceChange(resource.id, "image", e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`featured-${resource.id}`}
                    checked={resource.featured}
                    onCheckedChange={(checked) => handleResourceChange(resource.id, "featured", checked)}
                  />
                  <Label htmlFor={`featured-${resource.id}`}>Empfohlen</Label>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`downloadUrl-${resource.id}`}>Download-URL</Label>
                  <Input
                    id={`downloadUrl-${resource.id}`}
                    value={resource.downloadUrl}
                    onChange={(e) => handleResourceChange(resource.id, "downloadUrl", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`externalUrl-${resource.id}`}>Externe URL</Label>
                  <Input
                    id={`externalUrl-${resource.id}`}
                    value={resource.externalUrl}
                    onChange={(e) => handleResourceChange(resource.id, "externalUrl", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
