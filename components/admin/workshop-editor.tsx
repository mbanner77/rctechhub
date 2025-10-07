"use client"

import { useState, useEffect, useRef, createRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Trash2, Save, Edit, Check, RefreshCw, Download, Upload, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { defaultWorkshops } from "@/data/default-workshops"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { sanitizeWorkshop, type IWorkshop } from "@/lib/db"
import { useSiteConfig } from "@/hooks/use-site-config"
import { formatCurrency } from "@/lib/currency"
import { getClientWorkshops, saveClientWorkshops } from "@/lib/client-data-service"

export default function WorkshopEditor() {
  const [workshops, setWorkshops] = useState<IWorkshop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editMode, setEditMode] = useState<Record<string, boolean>>({})
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const workshopRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
  const { config } = useSiteConfig()

  // Initialisiere den Edit-Mode für alle Workshops
  useEffect(() => {
    setEditMode((prev) => {
      const newEditMode = { ...prev }
      let changed = false

      workshops.forEach((workshop) => {
        if (!(workshop.id in newEditMode)) {
          newEditMode[workshop.id] = false
          changed = true
        }
      })

      return changed ? newEditMode : prev
    })

    workshopRefs.current = workshops.map((_: any, i: number) => workshopRefs.current[i] ?? createRef());
  }, [workshops])

  useEffect(() => {
    const loadWorkshops = async () => {
      setIsLoading(true)
      setError(null)

      console.log("[WORKSHOPS-EDITOR] Lade Workshops Inhalte...");

      try {
        const workshopsContent = await getClientWorkshops();
        console.log(
          "[WORKSHOPS-EDITOR] Workshops content loaded from server:",
          workshopsContent.length
        );

        setWorkshops(workshopsContent);
      } catch (error) {
        console.error(
          "[WORKSHOPS-EDITOR] Error loading from server, trying local database:",
          error
        );
        setError(`Error loading workshops: ${error instanceof Error ? error.message : "Unknown error"}`)
      } finally {
        setIsLoading(false)
      }
    }
    loadWorkshops()
  }, [])

  const createEmptyWorkshop = (): IWorkshop => ({
    id: `workshop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: "",
    description: "",
    price: 0,
    duration: "",
    icon: "Users", // Default icon
    benefits: [],
    unitId: "",
    audience: "",
  })

  const handleAddWorkshop = () => {
    const newWorkshop = createEmptyWorkshop()
    setWorkshops([...workshops, newWorkshop])

    setTimeout(() => {
      workshopRefs.current[workshopRefs.current.length - 1].current.scrollIntoView({ behavior: 'smooth' })
      setEditMode({ ...editMode, [newWorkshop.id]: true }) // Neuer Workshop ist automatisch im Edit-Modus
    }, 100);
  }

  const handleRemoveWorkshop = (index: number) => {
    if (!confirm(`Möchten Sie den Workshop "${workshops[index].title}" wirklich löschen?`)) {
      return
    }

    const newWorkshops = [...workshops]
    const removedWorkshop = newWorkshops.splice(index, 1)[0]
    console.log("removedWorkshop:", removedWorkshop)

    // Entferne den Edit-Mode für den gelöschten Workshop
    const newEditMode = { ...editMode }
    delete newEditMode[removedWorkshop.id]

    setEditMode(newEditMode)
    setWorkshops(newWorkshops.length > 0 ? newWorkshops : [createEmptyWorkshop()])
  }

  const handleWorkshopChange = (index: number, field: string, value: any) => {
    const newWorkshops = [...workshops]
    newWorkshops[index] = { ...newWorkshops[index], [field]: value }
    setWorkshops(newWorkshops)
  }

  const handleArrayFieldChange = (index: number, field: string, value: string) => {
    const newWorkshops = [...workshops]
    newWorkshops[index] = {
      ...newWorkshops[index],
      [field]: value.split("\n").filter((item) => item.trim() !== ""),
    }
    setWorkshops(newWorkshops)
  }

  const toggleEditMode = (workshopId: string) => {
    setEditMode({ ...editMode, [workshopId]: !editMode[workshopId] })
  }

  const handleSave = async (workshop?: IWorkshop) => {
    setIsSaving(true)
    setError(null)

    if (workshop) {
      if (
        workshop.title === "" ||
        workshop.description === "" ||
        workshop.duration === "" ||
        workshop.price === 0
      ) {
        toast({
          title: "Fehler",
          description: "Bitte alle Pflichtfelder ausfüllen.",
          variant: "destructive",
        })
        return;
      } else {
        toggleEditMode(workshop.id);
      }
    }

    try {
      const validWorkshops = workshops.map((workshop) => {
        if (!workshop.id) {
          workshop.id = `workshop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
        return sanitizeWorkshop(workshop)
      })

      const saveWorkshopsSuccess = saveClientWorkshops(validWorkshops);

      if (!saveWorkshopsSuccess) {
        throw new Error("Save operation failed");
      }

      const newEditMode: Record<string, boolean> = {}
      validWorkshops.forEach((workshop) => {
        newEditMode[workshop.id] = false
      })
      setEditMode(newEditMode)

      toast({
        title: "Gespeichert",
        description: "Die Workshops wurden erfolgreich gespeichert.",
      })
    } catch (error) {
      console.error("Fehler beim Speichern:", error)
      setError(`Fehler beim Speichern: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`)
      toast({
        title: "Fehler",
        description: "Die Workshops konnten nicht gespeichert werden.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setShowResetDialog(true)
  }

  const confirmReset = async () => {
    try {
      const sanitizedWorkshops = defaultWorkshops.map(sanitizeWorkshop)
      setWorkshops(sanitizedWorkshops)

      setShowResetDialog(false)
      toast({
        title: "Zurückgesetzt",
        description: "Die Workshops wurden auf die Standardwerte zurückgesetzt.",
      })
    } catch (error) {
      console.error("Fehler beim Zurücksetzen:", error)
      toast({
        title: "Fehler",
        description: "Die Workshops konnten nicht zurückgesetzt werden.",
        variant: "destructive",
      })
    }
  }

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(workshops, null, 2)
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

      const exportFileDefaultName = `workshops-export-${new Date().toISOString().slice(0, 10)}.json`

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileDefaultName)
      linkElement.click()

      toast({
        title: "Exportiert",
        description: "Die Workshops wurden erfolgreich exportiert.",
      })
    } catch (error) {
      console.error("Fehler beim Exportieren:", error)
      toast({
        title: "Fehler",
        description: "Die Workshops konnten nicht exportiert werden.",
        variant: "destructive",
      })
    }
  }

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    fileInputRef.current = input

    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target?.result as string)

          if (!Array.isArray(importedData)) {
            throw new Error("Importierte Daten sind kein Array")
          }

          // Validiere und sanitisiere die importierten Daten
          const validatedData = importedData.map((item) =>
            sanitizeWorkshop({
              id: item.id || `workshop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: item.title || "",
              description: item.description || "",
              price: typeof item.price === "number" ? item.price : 0,
              duration: item.duration || "",
              icon: item.icon || "Users",
              benefits: Array.isArray(item.benefits) ? item.benefits : [],
            }),
          )

          setWorkshops(validatedData)

          toast({
            title: "Importiert",
            description: `${validatedData.length} Workshops wurden erfolgreich importiert.`,
          })
        } catch (error) {
          console.error("Fehler beim Importieren:", error)
          toast({
            title: "Fehler",
            description: "Die Datei konnte nicht importiert werden. Bitte überprüfen Sie das Format.",
            variant: "destructive",
          })
        }
      }
      reader.readAsText(file)
    }

    input.click()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Lade Workshops...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold">Workshops bearbeiten</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            <Button onClick={handleExport} variant="outline" className="flex items-center">
              <Download className="mr-2 h-4 w-4" />
              Exportieren
            </Button>
            <Button onClick={handleImport} variant="outline" className="flex items-center">
              <Upload className="mr-2 h-4 w-4" />
              Importieren
            </Button>
            <Button onClick={handleReset} variant="outline" className="flex items-center">
              <RefreshCw className="mr-2 h-4 w-4" />
              Zurücksetzen
            </Button>
            <Button onClick={handleAddWorkshop} variant="outline" className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Neuer Workshop
            </Button>
            <Button onClick={() => handleSave()} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSaving ? "Wird gespeichert..." : "Alle speichern"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {workshops.map((workshop, index) => (
          <Card
            key={workshop.id || `temp-${index}`}
            ref={workshopRefs.current[index] as unknown as React.RefObject<HTMLDivElement>}
            className={`overflow-hidden ${editMode[workshop.id] ? "border-green-500" : ""}`}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {editMode[workshop.id] ? (
                      <Input
                        value={workshop.title || ""}
                        onChange={(e) => handleWorkshopChange(index, "title", e.target.value)}
                        className="font-semibold text-lg"
                        placeholder="Titel des Workshops"
                      />
                    ) : (
                      workshop.title || "Neuer Workshop"
                    )}
                  </h3>
                  {editMode[workshop.id] ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                      onClick={async () => {
                        await handleSave(workshop);
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                      onClick={() => toggleEditMode(workshop.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}

                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveWorkshop(index)}
                  disabled={workshops.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {editMode[workshop.id] ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor={`icon-${index}`}>Icon</Label>
                      <select
                        id={`icon-${index}`}
                        className="w-full p-2 border rounded-md"
                        value={workshop.icon || "Users"}
                        onChange={(e) => handleWorkshopChange(index, "icon", e.target.value)}
                      >
                        <option value="Users">Users</option>
                        <option value="Lightbulb">Lightbulb</option>
                        <option value="Calendar">Calendar</option>
                        <option value="BookOpen">BookOpen</option>
                        <option value="Code">Code</option>
                        <option value="Settings">Settings</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`price-${index}`}>Preis</Label>
                      <Input
                        id={`price-${index}`}
                        type="number"
                        value={workshop.price || 0}
                        onChange={(e) => handleWorkshopChange(index, "price", Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`duration-${index}`}>Dauer</Label>
                      <Input
                        id={`duration-${index}`}
                        value={workshop.duration || ""}
                        onChange={(e) => handleWorkshopChange(index, "duration", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`audience-${index}`}>Zielgruppe</Label>
                      <Input
                        id={`audience-${index}`}
                        value={workshop.audience || ""}
                        onChange={(e) => handleWorkshopChange(index, "audience", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`unitId-${index}`}>Pathfinder-Einheit</Label>
                      <select
                        id={`unitId-${index}`}
                        className="w-full p-2 border rounded-md"
                        value={workshop.unitId || ""}
                        onChange={(e) => handleWorkshopChange(index, "unitId", e.target.value)}
                      >
                        <option value="">Keine Einheit</option>
                        <option value="digital-core">Digital Core</option>
                        <option value="cloud-foundation">Cloud Foundation</option>
                        <option value="adaptive-integration">Adaptive Integration</option>
                        <option value="data-driven-decisions">Data-Driven Decisions</option>
                        <option value="business-simplified">Business Simplified</option>
                        <option value="xaas-transformation">XaaS Transformation</option>
                        <option value="other">Sonstige</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <Label htmlFor={`description-${index}`}>Beschreibung</Label>
                    <Textarea
                      id={`description-${index}`}
                      rows={3}
                      value={workshop.description || ""}
                      onChange={(e) => handleWorkshopChange(index, "description", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`benefits-${index}`}>Vorteile (einer pro Zeile)</Label>
                    <Textarea
                      id={`benefits-${index}`}
                      rows={4}
                      value={(workshop.benefits || []).join("\n")}
                      onChange={(e) => handleArrayFieldChange(index, "benefits", e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                // Ansichtsmodus
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <span className="font-medium">Icon:</span> {workshop.icon || "Users"}
                    </div>
                    <div className="space-y-2">
                      <span className="font-medium">Preis:</span> {typeof workshop.price === 'number' && workshop.price > 0 ? formatCurrency(Number(workshop.price || 0), config.currency) : 'Kostenlos'}
                    </div>
                    <div className="space-y-2">
                      <span className="font-medium">Dauer:</span> {workshop.duration || ""}
                    </div>
                    <div className="space-y-2">
                      <span className="font-medium">Zielgruppe:</span> {workshop.audience || ""}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div>
                      <span className="font-medium">Pathfinder-Einheit:</span> {
                        workshop.unitId ? (
                          {
                            "digital-core": "Digital Core",
                            "cloud-foundation": "Cloud Foundation",
                            "adaptive-integration": "Adaptive Integration",
                            "data-driven-decisions": "Data-Driven Decisions",
                            "business-simplified": "Business Simplified",
                            "xaas-transformation": "XaaS Transformation",
                            "other": "Sonstige"
                          }[workshop.unitId] || workshop.unitId
                        ) : ""
                      }
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium">Beschreibung:</span>
                    <p className="mt-1">{workshop.description || ""}</p>
                  </div>
                  {workshop.benefits && workshop.benefits.length > 0 && (
                    <div>
                      <span className="font-medium">Vorteile:</span>
                      <ul className="list-disc pl-5 mt-1">
                        {workshop.benefits.map((benefit: string, i: number) => (
                          <li key={i}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Workshops zurücksetzen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie alle Workshops auf die Standardwerte zurücksetzen möchten? Diese Aktion kann
              nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReset} className="bg-red-600 hover:bg-red-700">
              Zurücksetzen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
