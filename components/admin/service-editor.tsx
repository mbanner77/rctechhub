"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { defaultServices } from "@/data/default-data"
import { AlertCircle, Save, Trash, Plus, Download, Upload } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { db, sanitizeService } from "@/lib/db"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ServiceItemList } from "@/components/admin/general-components/ServiceListItem"
import {
  changeServiceListItem,
  addServiceListItem,
  deleteServiceListItem,
} from "@/components/admin/general-components/model/ServiceListItem"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,} from "@/components/ui/alert-dialog"
import { RichTextEditor } from "@/components/ui/rich-text-editor"


export default function ServiceEditor() {
  const importRef = useRef<HTMLInputElement | null>(null);
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const { toast } = useToast()
  const [hasServiceBeenAdded, setHasServiceBeenAdded] = useState<boolean | null>(null)

  const servicesRef = useRef(null);

  useEffect(() => {
    const loadServices = async () => {
      setIsLoading(true)
      setSaveError(null)
      setSaveSuccess(null)
      try {
        console.log("[SERVICE-EDITOR] Lade Services aus der Datenbank...")
        const response = await fetch('/api/data/services', { method: 'get' })
        const data = await response.json()
        if (data) {
          setServices(data)
          setError(null)
        } else {
          console.log("[SERVICE-EDITOR] Keine Services in der Datenbank gefunden, verwende Standarddaten")
          const sanitizedServices = defaultServices.map(sanitizeService)
          setServices(sanitizedServices)

          // Initialisiere die Datenbank mit Standarddaten
          try {
            console.log("[SERVICE-EDITOR] Datenbank mit Standarddaten initialisiert")
          } catch (dbError) {
            console.error("[SERVICE-EDITOR] Fehler beim Initialisieren der Datenbank:", dbError)
            setError("Fehler beim Initialisieren der Datenbank. Standarddaten werden nur temporär verwendet.")
          }
        }
      } catch (err) {
        console.error("[SERVICE-EDITOR] Fehler beim Laden der Services:", err)
        setServices(defaultServices.map(sanitizeService))
        setError("Fehler beim Laden der Services. Standarddaten werden verwendet.")
      } finally {
        setIsLoading(false)
      }
    }
    loadServices()
  }, []);

  useEffect(() => {
    scrollToServiceWhenAddedToCards(services, hasServiceBeenAdded);
  }, [services, hasServiceBeenAdded]);

  const scrollToServiceWhenAddedToCards = (services: any, hasServiceBeenAdded: any) => {
    if (services.length > 0 && hasServiceBeenAdded) {
      const lastAddedService = document.getElementById(`${services[services.length - 1].id}`);
      if (lastAddedService) {
        lastAddedService.scrollIntoView({ behavior: 'smooth', block: 'start' });
        lastAddedService.focus();
      }
    }
  }

  const handleSave = async () => {
    setSaveError(null)
    setSaveSuccess(null)
    try {
      console.log("[SERVICE-EDITOR] Speichere Services in der Datenbank...")

      // Bereinige die Services vor dem Speichern
      const sanitizedServices = services.map(sanitizeService)

      const response = await fetch("/api/data/services", {
        method: "post",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: JSON.stringify(sanitizedServices),
      })

      if (response.ok) {
        console.log("[SERVICE-EDITOR] Services erfolgreich in der Datenbank gespeichert")
        setSaveSuccess("Services erfolgreich in der Datenbank gespeichert.")
        toast({
          title: "Erfolg",
          description: "Services erfolgreich gespeichert.",
        })
      }
    } catch (err) {
      console.error("[SERVICE-EDITOR] Fehler beim Speichern der Services:", err)
      setSaveError(`Fehler beim Speichern der Services: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`)
      toast({
        title: "Fehler",
        description: "Fehler beim Speichern der Services.",
        variant: "destructive",
      })
    }
  }

  const handleAddService = () => {
    const serviceId = `service-${Date.now()}`;
    const newService = {
      id: serviceId,
      title: "Neuer Service",
      description: "Service Beschreibung",
      category: "Allgemein",
      image: "/placeholder.svg",
      price: 0,
      duration: "1 Tag",
      featured: false,
      isStarterPackage: false,
      technologies: [],
      included: [],
      notIncluded: [],
      process: [],
      phase: 1,
      technologyCategory: "",
      processCategory: "",
    };
    setServices([...services, newService]);
    setHasServiceBeenAdded(true);
  }

  const handleDeleteService = (id: string) => {
    const updatedServices = services.filter((service) => service.id !== id)
    setServices(updatedServices)
  }

  const handleServiceChange = (id: string, field: string, value: any) => {
    const updatedServices = services.map((service) => {
      if (service.id === id) {
        return { ...service, [field]: value }
      }
      return service
    });
    setServices(updatedServices);
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(services, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = "services.json"

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
          setServices(importedData)
          toast({
            title: "Import erfolgreich",
            description: `${importedData.length} Services importiert.`,
          })
        } else {
          toast({
            title: "Import fehlgeschlagen",
            description: "Die importierte Datei enthält keine gültige Service-Liste.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("[SERVICE-EDITOR] Import error:", error)
        toast({
          title: "Import fehlgeschlagen",
          description: "Die Datei konnte nicht verarbeitet werden.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  // Generic handler for included/notIncluded using model functions
  const handleListChange = (
    serviceId: string,
    listName: 'included' | 'notIncluded',
    idx: number,
    value: string
  ) => {
    setServices(services => changeServiceListItem(services, serviceId, listName, idx, value));
  };

  const handleAddListItem = (
    serviceId: string,
    listName: 'included' | 'notIncluded'
  ) => {
    setServices(services => addServiceListItem(services, serviceId, listName));
  };

  const handleDeleteListItem = (
    serviceId: string,
    listName: 'included' | 'notIncluded',
    idx: number
  ) => {
    setServices(services => deleteServiceListItem(services, serviceId, listName, idx));
  };

  const handleChangeProcessStep = (serviceId: string, idx: number, value: { title: string | undefined, description: string | undefined }) => {
    const updatedServices = services.map(service => {
      if (service.id === serviceId) {
        const process = Array.isArray(service.process) ? [...service.process] : [];
        process[idx] = { ...process[idx], ...value };
        return { ...service, process };
      }
      return service;
    });

    setServices(updatedServices);
    // Note: No need to manually save after edit as the global save button handles this
  };

  const handleAddprocessStep = (serviceId: string) => {
    const updatedServices = services.map(service =>
      service.id === serviceId
        ? { ...service, process: [...(service.process || []), { title: '', description: '' }] }
        : service
    );
    setServices(updatedServices);
  };

  const handleDeleteProcessStep = (serviceId: string, idx: number) => {
    const updatedServices = services.map(service => {
      if (service.id === serviceId) {
        const process = Array.isArray(service.process) ? [...service.process] : [];
        process.splice(idx, 1);
        return { ...service, process };
      }
      return service;
    });
    setServices(updatedServices);
  };

  const handleListSave = (serviceId: string, listName: 'included' | 'notIncluded', updated: string[]) => {
    const updatedServices = services.map(service =>
      service.id === serviceId ? { ...service, [listName]: updated } : service
    )
    setServices(updatedServices);
  };

  if (isLoading) {
    return <div className="text-center py-8">Lade Services...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Service-Editor</h2>
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
        <Alert variant="success">
          <AlertTitle>Erfolg</AlertTitle>
          <AlertDescription>{saveSuccess}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <Button onClick={
            handleAddService
          }>
            <Plus className="mr-2 h-4 w-4" /> Service hinzufügen
          </Button>
          <Button onClick={handleSave} variant="default">
            <Save className="mr-2 h-4 w-4" /> Speichern
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button className="hidden md:inline-flex" onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" /> Exportieren
          </Button>
          <div className="relative">
            <input
                type="file"
                id="import-file"
                className="hidden"
                onChange={handleImport}
                accept=".json"
                ref={importRef}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="hidden md:inline-flex">
                  <Upload className="ml-2 h-4 w-4" />Importieren
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Dadurch wird die aktuelle Konfiguration überschrieben.<br/>
                    Vergessen Sie nicht, Ihre Änderungen zu speichern.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={() => importRef.current?.click()}>Fortfahren</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {services.map((service) => (
          <Card key={service.id} id={service.id} ref={servicesRef}>
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <CardTitle className="flex-1 text-lg">Service bearbeiten</CardTitle>
                <div className="mx-4">
                  <Button variant="destructive" onClick={() => handleDeleteService(service.id)}>
                    <Trash />
                  </Button>
                </div>
              </div>
              {/* Tabs for Service Details and Leistungsumfang */}
              <div className="mt-4">
                <Tabs defaultValue="details">
                  <TabsList>
                    <TabsTrigger value="details">Service Details</TabsTrigger>
                    <TabsTrigger value="umfang">Leistungsumfang und Ablauf beschreiben</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details">
                    {/* Existing CardContent moved here */}
                    <CardContent>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor={`title-${service.id}`}>Titel</Label>
                          <Input
                            id={`title-${service.id}`}
                            value={service.title}
                            onChange={(e) => handleServiceChange(service.id, "title", e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`description-${service.id}`}>Beschreibung</Label>
                          <RichTextEditor
                            value={service.description}
                            onChange={(value) => handleServiceChange(service.id, "description", value)}
                            placeholder="Service-Beschreibung eingeben..."
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`category-${service.id}`}>Kategorie</Label>
                          <Select
                            value={service.category}
                            onValueChange={(value) => handleServiceChange(service.id, "category", value)}
                          >
                            <SelectTrigger id={`category-${service.id}`}>
                              <SelectValue placeholder="Kategorie auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Allgemein">Allgemein</SelectItem>
                              <SelectItem value="Beratung">Beratung</SelectItem>
                              <SelectItem value="Entwicklung">Entwicklung</SelectItem>
                              <SelectItem value="Integration">Integration</SelectItem>
                              <SelectItem value="Schulung">Schulung</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Neue Technologie-Kategorie */}
                        <div className="grid gap-2">
                          <Label htmlFor={`technologyCategory-${service.id}`}>Technologie-Kategorie</Label>
                          <Select
                            value={service.technologyCategory || ""}
                            onValueChange={(value) => handleServiceChange(service.id, "technologyCategory", value)}
                          >
                            <SelectTrigger id={`technologyCategory-${service.id}`}>
                              <SelectValue placeholder="Technologie-Kategorie auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Keine">Keine</SelectItem>
                              <SelectItem value="SAP">SAP</SelectItem>
                              <SelectItem value="Microsoft">Microsoft</SelectItem>
                              <SelectItem value="Open Source">Open Source</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Neue Prozess-Kategorie */}
                        <div className="grid gap-2">
                          <Label htmlFor={`processCategory-${service.id}`}>Prozess-Kategorie</Label>
                          <Select
                            value={service.processCategory || ""}
                            onValueChange={(value) => handleServiceChange(service.id, "processCategory", value)}
                          >
                            <SelectTrigger id={`processCategory-${service.id}`}>
                              <SelectValue placeholder="Prozess-Kategorie auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Keine">Keine</SelectItem>
                              <SelectItem value="Operate">Operate</SelectItem>
                              <SelectItem value="Innovate">Innovate</SelectItem>
                              <SelectItem value="Ideate">Ideate</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor={`image-${service.id}`}>Bild-URL</Label>
                          <Input
                            id={`image-${service.id}`}
                            value={service.image}
                            onChange={(e) => handleServiceChange(service.id, "image", e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`price-${service.id}`}>Preis</Label>
                          <Input
                            id={`price-${service.id}`}
                            type="number"
                            value={service.price}
                            onChange={(e) => handleServiceChange(service.id, "price", Number(e.target.value))}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`duration-${service.id}`}>Dauer</Label>
                          <Input
                            id={`duration-${service.id}`}
                            value={service.duration}
                            onChange={(e) => handleServiceChange(service.id, "duration", e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`phase-${service.id}`}>Phase</Label>
                          <Input
                            id={`phase-${service.id}`}
                            type="number"
                            value={service.phase}
                            onChange={(e) => handleServiceChange(service.id, "phase", Number(e.target.value))}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`featured-${service.id}`}
                            checked={service.featured}
                            onCheckedChange={(checked) => handleServiceChange(service.id, "featured", checked)}
                          />
                          <Label htmlFor={`featured-${service.id}`}>Empfohlen</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`starter-package-${service.id}`}
                            checked={service.isStarterPackage}
                            onCheckedChange={(checked) => handleServiceChange(service.id, "isStarterPackage", checked)}
                          />
                          <Label htmlFor={`starter-package-${service.id}`}>StarterPackage</Label>
                        </div>
                      </div>
                    </CardContent>
                  </TabsContent>
                  <TabsContent value="umfang">
                    <CardContent>
                      <div className="grid gap-4">
                        {/* Enthaltende Leistungen (Included Services) */}
                        <ServiceItemList
                          headline="Enthaltende Leistungen"
                          items={service.included}
                          onSave={updated => handleListSave(service.id, 'included', updated)}
                        />
                        {/* Nicht enthaltende Leistungen (Not Included Services) */}
                        <ServiceItemList
                          headline="Nicht enthaltende Leistungen"
                          items={service.notIncluded}
                          onSave={updated => handleListSave(service.id, 'notIncluded', updated)}
                        />
                      </div>
                      <div className="grid gap-4">
                        <h3 className="text-lg font-semibold mb-2">Ablauf</h3>
                        <div className="space-y-2" id={`process-container-${service.id}`}>
                          {Array.isArray(service.process) && service.process.length > 0 && service.process.map((item: { title: string, description: string }, idx: number) => (
                            <div className="grid gap-2" key={idx}>
                              <Label htmlFor={`process-${service.id}-${idx}`}>Prozessschritt #{idx + 1}</Label>
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <Input
                                    value={item.title}
                                    onChange={e => handleChangeProcessStep(service.id, idx, { title: e.target.value, description: item.description })}
                                    placeholder={`Titel #${idx + 1}`}
                                    className="flex-1"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteProcessStep(service.id, idx)}
                                    aria-label={`Delete item ${idx + 1}`}
                                  >
                                    Löschen
                                  </Button>
                                </div>
                                <RichTextEditor
                                  value={item.description}
                                  onChange={(value) => handleChangeProcessStep(service.id, idx, { title: item.title, description: value })}
                                  placeholder={`Beschreibung #${idx + 1}`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mb-4"
                          onClick={() => handleAddprocessStep(service.id)}
                        >
                          Hinzufügen
                        </Button>
                      </div>
                    </CardContent>
                  </TabsContent>
                </Tabs>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
