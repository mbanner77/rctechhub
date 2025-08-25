"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Trash2, Plus, Save, Undo, ImageIcon, RefreshCw, Loader2 } from "lucide-react"
import type { ILandingPageData } from "@/types/landing-page"
import { getClientLandingPage, saveClientLandingPage } from "@/lib/client-data-service"
import { defaultLandingPage } from "@/data/landing-page-data"
import WorkshopForm from "@/app/admin/workshops/page"
import WorkshopEditor from "./workshop-editor"

export default function LandingPageEditor() {
  const [landingPage, setLandingPage] = useState<ILandingPageData | null>(null)
  const [activeTab, setActiveTab] = useState("hero")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) // Hinzufügen eines Refresh-Keys
  const [hasChanges, setHasChanges] = useState(false)

  // Verfügbare Icons für Feature Cards
  const availableIcons = [
    "Briefcase",
    "Layers",
    "Code",
    "Zap",
    "Database",
    "Users",
    "Shield",
    "Award",
    "Clock",
    "CheckCircle",
    "ArrowRight",
    "ChevronRight",
  ]

  // Lade die Landingpage-Daten beim ersten Rendern und wenn der Refresh-Key sich ändert
  const loadLandingPage = useCallback(async () => {
    console.log("[EDITOR] loadLandingPage aufgerufen")
    setIsLoading(true)
    try {
      // Füge einen Cache-Buster-Parameter hinzu
      const data = await getClientLandingPage()
      console.log("[EDITOR] Landingpage geladen:", data)
      setLandingPage(data)
      setHasChanges(false)
    } catch (error) {
      console.error("[EDITOR] Fehler beim Laden der Landing Page:", error)
      toast({
        title: "Fehler beim Laden",
        description: "Die Landing Page konnte nicht geladen werden. Standarddaten werden verwendet.",
        variant: "destructive",
      })
      setLandingPage(JSON.parse(JSON.stringify(defaultLandingPage)))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLandingPage()
  }, [loadLandingPage, refreshKey])

  // Höre auf das benutzerdefinierte Event für Landingpage-Updates
  useEffect(() => {
    const handleLandingPageUpdated = () => {
      console.log("[EDITOR] landingpage-updated Event empfangen, lade neu")
      setRefreshKey((prev) => prev + 1)
    }

    window.addEventListener("landingpage-updated", handleLandingPageUpdated)

    return () => {
      window.removeEventListener("landingpage-updated", handleLandingPageUpdated)
    }
  }, [])

  // Manuelles Neuladen der Daten
  const handleRefresh = () => {
    console.log("[EDITOR] Manuelles Neuladen der Daten")
    setRefreshKey((prev) => prev + 1)
  }

  // Speichere die Landingpage-Daten
  const handleSave = async () => {
    if (!landingPage) return

    console.log("[EDITOR] handleSave aufgerufen")
    setIsSaving(true)
    try {
      const success = await saveClientLandingPage(landingPage)
      if (success) {
        toast({
          title: "Erfolgreich gespeichert",
          description: "Die Landing Page wurde erfolgreich gespeichert.",
        })
        setHasChanges(false)

        // Lade die Daten neu, um sicherzustellen, dass die neuesten Änderungen angezeigt werden
        console.log("[EDITOR] Lade Daten nach dem Speichern neu")
        handleRefresh()
      } else {
        toast({
          title: "Fehler beim Speichern",
          description: "Die Landing Page konnte nicht gespeichert werden.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[EDITOR] Fehler beim Speichern der Landing Page:", error)
      toast({
        title: "Fehler beim Speichern",
        description: "Die Landing Page konnte nicht gespeichert werden.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Setze die Landingpage-Daten auf die Standardwerte zurück
  const handleReset = () => {
    console.log("[EDITOR] handleReset aufgerufen")
    if (window.confirm("Möchten Sie wirklich alle Änderungen verwerfen und auf die Standardwerte zurücksetzen?")) {
      setLandingPage(JSON.parse(JSON.stringify(defaultLandingPage)))
      setHasChanges(true)
      toast({
        title: "Zurückgesetzt",
        description: "Die Landing Page wurde auf die Standardwerte zurückgesetzt.",
      })
    }
  }

  // Aktualisiere ein Feld in der Landingpage
  const updateField = (section: keyof ILandingPageData, field: string, value: any) => {
    if (!landingPage) return

    console.log(`[EDITOR] updateField: ${section}.${field} = ${value}`)
    setLandingPage({
      ...landingPage,
      [section]: {
        ...landingPage[section],
        [field]: value,
      },
    })
    setHasChanges(true)
  }

  // Aktualisiere ein Feld in einem Array
  const updateArrayItem = (
    section: keyof ILandingPageData,
    arrayField: string,
    index: number,
    field: string,
    value: any,
  ) => {
    if (!landingPage) return

    console.log(`[EDITOR] updateArrayItem: ${section}.${arrayField}[${index}].${field} = ${value}`)
    let array: any[]
    if (arrayField) {
      array = [...(landingPage[section] as any)[arrayField]]
      array[index] = {
        ...array[index],
        [field]: value,
      }
      setLandingPage({
        ...landingPage,
        [section]: {
          ...landingPage[section],
          [arrayField]: array,
        },
      })
    } else {
      array = [...(landingPage[section] as any)]
      array[index] = {
        ...array[index],
        [field]: value,
      }
      setLandingPage({
        ...landingPage,
        [section]: array,
      })
    }
    setHasChanges(true)
  }

  // Füge ein Element zu einem Array hinzu
  const addArrayItem = (section: keyof ILandingPageData, arrayField: string, newItem: any) => {
    if (!landingPage) return

    console.log(`[EDITOR] addArrayItem: ${section}.${arrayField}`)
    let array: any[]
    if (arrayField) {
      array = [...(landingPage[section] as any)[arrayField], newItem]
      setLandingPage({
        ...landingPage,
        [section]: {
          ...landingPage[section],
          [arrayField]: array,
        },
      })
    } else {
      array = [...(landingPage[section] as any), newItem]
      setLandingPage({
        ...landingPage,
        [section]: array,
      })
    }
    setHasChanges(true)
  }

  // Entferne ein Element aus einem Array
  const removeArrayItem = (section: keyof ILandingPageData, arrayField: string, index: number) => {
    if (!landingPage) return

    console.log(`[EDITOR] removeArrayItem: ${section}.${arrayField}[${index}]`)
    let array: any[]
    if (arrayField) {
      array = [...(landingPage[section] as any)[arrayField]]
      array.splice(index, 1)
      setLandingPage({
        ...landingPage,
        [section]: {
          ...landingPage[section],
          [arrayField]: array,
        },
      })
    } else {
      array = [...(landingPage[section] as any)]
      array.splice(index, 1)
      setLandingPage({
        ...landingPage,
        [section]: array,
      })
    }
    setHasChanges(true)
  }

  // Aktualisiere ein verschachteltes Feld
  const updateNestedField = (
    section: keyof ILandingPageData,
    index: number,
    nestedField: string,
    field: string,
    value: any,
  ) => {
    if (!landingPage) return

    console.log(`[EDITOR] updateNestedField: ${section}[${index}].${nestedField}.${field} = ${value}`)
    const array = [...(landingPage[section] as any)]
    array[index] = {
      ...array[index],
      [nestedField]: {
        ...array[index][nestedField],
        [field]: value,
      },
    }

    setLandingPage({
      ...landingPage,
      [section]: array,
    })
    setHasChanges(true)
  }

  if (isLoading || !landingPage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Landing Page Editor</CardTitle>
          <CardDescription>Lade Daten...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Landing Page Editor</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Lade...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Neu laden
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={isSaving || isLoading}>
            <Undo className="mr-2 h-4 w-4" />
            Zurücksetzen
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || isLoading || !hasChanges}
            variant={hasChanges ? "default" : "outline"}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {hasChanges ? "Speichern*" : "Speichern"}
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-8 w-full">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="technology">Technologie</TabsTrigger>
          <TabsTrigger value="approach">Ansatz</TabsTrigger>
          <TabsTrigger value="success">Erfolge</TabsTrigger>
          <TabsTrigger value="stats">Statistiken</TabsTrigger>
          <TabsTrigger value="innovation">Innovation</TabsTrigger>
          <TabsTrigger value="workshops">Workshops</TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hero-Bereich</CardTitle>
              <CardDescription>Bearbeiten Sie den Hero-Bereich der Landing Page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hero-title">Titel</Label>
                  <Input
                    id="hero-title"
                    value={landingPage.hero.title}
                    onChange={(e) => updateField("hero", "title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hero-subtitle">Untertitel</Label>
                  <Textarea
                    id="hero-subtitle"
                    value={landingPage.hero.subtitle}
                    onChange={(e) => updateField("hero", "subtitle", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hero-primary-button">Primärer Button Text</Label>
                    <Input
                      id="hero-primary-button"
                      value={landingPage.hero.primaryButtonText}
                      onChange={(e) => updateField("hero", "primaryButtonText", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hero-secondary-button">Sekundärer Button Text</Label>
                    <Input
                      id="hero-secondary-button"
                      value={landingPage.hero.secondaryButtonText}
                      onChange={(e) => updateField("hero", "secondaryButtonText", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hero-bg-image">Hintergrundbild URL</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="hero-bg-image"
                        value={landingPage.hero.backgroundImage}
                        onChange={(e) => updateField("hero", "backgroundImage", e.target.value)}
                      />
                      <Button variant="outline" size="icon" title="Vorschau">
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hero-image">Hero-Bild URL</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="hero-image"
                        value={landingPage.hero.heroImage}
                        onChange={(e) => updateField("hero", "heroImage", e.target.value)}
                      />
                      <Button variant="outline" size="icon" title="Vorschau">
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Cards */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature-Karten</CardTitle>
              <CardDescription>Bearbeiten Sie die Feature-Karten der Landing Page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-end">
                <Button
                  onClick={() =>
                    addArrayItem("featureCards", "", {
                      id: `feature-${Date.now()}`,
                      icon: "Briefcase",
                      title: "Neues Feature",
                      description: "Beschreibung des neuen Features",
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Feature hinzufügen
                </Button>
              </div>

              {landingPage.featureCards.map((feature, index) => (
                <Card key={feature.id} className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Feature {index + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem("featureCards", "", index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`feature-title-${index}`}>Titel</Label>
                        <Input
                          id={`feature-title-${index}`}
                          value={feature.title}
                          onChange={(e) => updateArrayItem("featureCards", "", index, "title", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`feature-icon-${index}`}>Icon</Label>
                        <Select
                          value={feature.icon}
                          onValueChange={(value) => updateArrayItem("featureCards", "", index, "icon", value)}
                        >
                          <SelectTrigger id={`feature-icon-${index}`}>
                            <SelectValue placeholder="Icon auswählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableIcons.map((icon) => (
                              <SelectItem key={icon} value={icon}>
                                {icon}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`feature-description-${index}`}>Beschreibung</Label>
                      <Textarea
                        id={`feature-description-${index}`}
                        value={feature.description}
                        onChange={(e) => updateArrayItem("featureCards", "", index, "description", e.target.value)}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technology Section */}
        <TabsContent value="technology" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technologie-Bereich</CardTitle>
              <CardDescription>Bearbeiten Sie den Technologie-Bereich der Landing Page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tech-title">Titel</Label>
                  <Input
                    id="tech-title"
                    value={landingPage.technologySection.title}
                    onChange={(e) => updateField("technologySection", "title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tech-subtitle">Untertitel</Label>
                  <Textarea
                    id="tech-subtitle"
                    value={landingPage.technologySection.subtitle}
                    onChange={(e) => updateField("technologySection", "subtitle", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tech-image">Bild URL</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="tech-image"
                      value={landingPage.technologySection.image}
                      onChange={(e) => updateField("technologySection", "image", e.target.value)}
                    />
                    <Button variant="outline" size="icon" title="Vorschau">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tech-button">Button Text</Label>
                  <Input
                    id="tech-button"
                    value={landingPage.technologySection.buttonText}
                    onChange={(e) => updateField("technologySection", "buttonText", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Features</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        addArrayItem("technologySection", "features", {
                          title: "Neues Feature",
                          description: "Beschreibung des neuen Features",
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Feature hinzufügen
                    </Button>
                  </div>

                  {landingPage.technologySection.features.map((feature, index) => (
                    <Card key={index} className="border border-gray-200">
                      <CardContent className="pt-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Feature {index + 1}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeArrayItem("technologySection", "features", index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`tech-feature-title-${index}`}>Titel</Label>
                          <Input
                            id={`tech-feature-title-${index}`}
                            value={feature.title}
                            onChange={(e) =>
                              updateArrayItem("technologySection", "features", index, "title", e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`tech-feature-desc-${index}`}>Beschreibung</Label>
                          <Input
                            id={`tech-feature-desc-${index}`}
                            value={feature.description}
                            onChange={(e) =>
                              updateArrayItem("technologySection", "features", index, "description", e.target.value)
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approach Section */}
        <TabsContent value="approach" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ansatz-Bereich</CardTitle>
              <CardDescription>Bearbeiten Sie den Ansatz-Bereich der Landing Page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="approach-title">Titel</Label>
                  <Input
                    id="approach-title"
                    value={landingPage.approachSection.title}
                    onChange={(e) => updateField("approachSection", "title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="approach-subtitle">Untertitel</Label>
                  <Textarea
                    id="approach-subtitle"
                    value={landingPage.approachSection.subtitle}
                    onChange={(e) => updateField("approachSection", "subtitle", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="approach-image">Bild URL</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="approach-image"
                      value={landingPage.approachSection.image}
                      onChange={(e) => updateField("approachSection", "image", e.target.value)}
                    />
                    <Button variant="outline" size="icon" title="Vorschau">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="approach-button">Button Text</Label>
                  <Input
                    id="approach-button"
                    value={landingPage.approachSection.buttonText}
                    onChange={(e) => updateField("approachSection", "buttonText", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Features</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        addArrayItem("approachSection", "features", {
                          title: "Neues Feature",
                          description: "Beschreibung des neuen Features",
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Feature hinzufügen
                    </Button>
                  </div>

                  {landingPage.approachSection.features.map((feature, index) => (
                    <Card key={index} className="border border-gray-200">
                      <CardContent className="pt-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Feature {index + 1}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeArrayItem("approachSection", "features", index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`approach-feature-title-${index}`}>Titel</Label>
                          <Input
                            id={`approach-feature-title-${index}`}
                            value={feature.title}
                            onChange={(e) =>
                              updateArrayItem("approachSection", "features", index, "title", e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`approach-feature-desc-${index}`}>Beschreibung</Label>
                          <Input
                            id={`approach-feature-desc-${index}`}
                            value={feature.description}
                            onChange={(e) =>
                              updateArrayItem("approachSection", "features", index, "description", e.target.value)
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Success Stories */}
        <TabsContent value="success" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Erfolgsgeschichten</CardTitle>
              <CardDescription>Bearbeiten Sie die Erfolgsgeschichten der Landing Page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-end">
                <Button
                  onClick={() =>
                    addArrayItem("successStories", "", {
                      id: `story-${Date.now()}`,
                      title: "Neue Erfolgsgeschichte",
                      industry: "Branche",
                      backgroundImage: "/images/placeholder.png",
                      tags: ["Tag 1", "Tag 2"],
                      description: "Beschreibung der Erfolgsgeschichte",
                      achievement: {
                        icon: "Award",
                        text: "Errungenschaft",
                      },
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Erfolgsgeschichte hinzufügen
                </Button>
              </div>

              {landingPage.successStories.map((story, index) => (
                <Card key={story.id} className={ story.title.includes("Neu") ? "border border-green-500" : "border border-gray-200"}> {/* Highlight new stories */}
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Erfolgsgeschichte {index + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem("successStories", "", index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`story-title-${index}`}>Titel</Label>
                        <Input
                          id={`story-title-${index}`}
                          value={story.title}
                          onChange={(e) => updateArrayItem("successStories", "", index, "title", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`story-industry-${index}`}>Branche</Label>
                        <Input
                          id={`story-industry-${index}`}
                          value={story.industry}
                          onChange={(e) => updateArrayItem("successStories", "", index, "industry", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`story-image-${index}`}>Hintergrundbild URL</Label>
                      <div className="flex space-x-2">
                        <Input
                          id={`story-image-${index}`}
                          value={story.backgroundImage}
                          onChange={(e) =>
                            updateArrayItem("successStories", "", index, "backgroundImage", e.target.value)
                          }
                        />
                        <Button variant="outline" size="icon" title="Vorschau">
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`story-tags-${index}`}>Tags (durch Komma getrennt)</Label>
                      <Input
                        id={`story-tags-${index}`}
                        value={story.tags.join(", ")}
                        onChange={(e) =>
                          updateArrayItem(
                            "successStories",
                            "",
                            index,
                            "tags",
                            e.target.value.split(",").map((tag) => tag.trim()),
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`story-description-${index}`}>Beschreibung</Label>
                      <Textarea
                        id={`story-description-${index}`}
                        value={story.description}
                        onChange={(e) => updateArrayItem("successStories", "", index, "description", e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Errungenschaft</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`story-achievement-icon-${index}`}>Icon</Label>
                          <Select
                            value={story.achievement.icon}
                            onValueChange={(value) =>
                              updateNestedField("successStories", index, "achievement", "icon", value)
                            }
                          >
                            <SelectTrigger id={`story-achievement-icon-${index}`}>
                              <SelectValue placeholder="Icon auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableIcons.map((icon) => (
                                <SelectItem key={icon} value={icon}>
                                  {icon}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`story-achievement-text-${index}`}>Text</Label>
                          <Input
                            id={`story-achievement-text-${index}`}
                            value={story.achievement.text}
                            onChange={(e) =>
                              updateNestedField("successStories", index, "achievement", "text", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )).reverse() /* Reverse the order to show the latest story first */}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Section */}
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statistik-Bereich</CardTitle>
              <CardDescription>Bearbeiten Sie den Statistik-Bereich der Landing Page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stats-title">Titel</Label>
                  <Input
                    id="stats-title"
                    value={landingPage.statsSection.title}
                    onChange={(e) => updateField("statsSection", "title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stats-subtitle">Untertitel</Label>
                  <Input
                    id="stats-subtitle"
                    value={landingPage.statsSection.subtitle}
                    onChange={(e) => updateField("statsSection", "subtitle", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Statistiken</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        addArrayItem("statsSection", "stats", {
                          value: 0,
                          label: "Neue Statistik",
                          suffix: "",
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Statistik hinzufügen
                    </Button>
                  </div>

                  {landingPage.statsSection.stats.map((stat, index) => (
                    <Card key={index} className="border border-gray-200">
                      <CardContent className="pt-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Statistik {index + 1}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeArrayItem("statsSection", "stats", index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`stat-value-${index}`}>Wert</Label>
                            <Input
                              id={`stat-value-${index}`}
                              type="number"
                              value={stat.value}
                              onChange={(e) =>
                                updateArrayItem(
                                  "statsSection",
                                  "stats",
                                  index,
                                  "value",
                                  Number.parseInt(e.target.value, 10),
                                )
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`stat-label-${index}`}>Beschriftung</Label>
                            <Input
                              id={`stat-label-${index}`}
                              value={stat.label}
                              onChange={(e) => updateArrayItem("statsSection", "stats", index, "label", e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`stat-suffix-${index}`}>Suffix (z.B. %, +)</Label>
                            <Input
                              id={`stat-suffix-${index}`}
                              value={stat.suffix || ""}
                              onChange={(e) =>
                                updateArrayItem("statsSection", "stats", index, "suffix", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Innovation Section */}
        <TabsContent value="innovation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Innovations-Bereich</CardTitle>
              <CardDescription>Bearbeiten Sie den Innovations-Bereich der Landing Page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="innovation-title">Titel</Label>
                  <Input
                    id="innovation-title"
                    value={landingPage.innovationSection.title}
                    onChange={(e) => updateField("innovationSection", "title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="innovation-subtitle">Untertitel</Label>
                  <Textarea
                    id="innovation-subtitle"
                    value={landingPage.innovationSection.subtitle}
                    onChange={(e) => updateField("innovationSection", "subtitle", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="innovation-image">Bild URL</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="innovation-image"
                      value={landingPage.innovationSection.image}
                      onChange={(e) => updateField("innovationSection", "image", e.target.value)}
                    />
                    <Button variant="outline" size="icon" title="Vorschau">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="innovation-button">Button Text</Label>
                  <Input
                    id="innovation-button"
                    value={landingPage.innovationSection.buttonText}
                    onChange={(e) => updateField("innovationSection", "buttonText", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Features</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        addArrayItem("innovationSection", "features", {
                          title: "Neues Feature",
                          description: "Beschreibung des neuen Features",
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Feature hinzufügen
                    </Button>
                  </div>

                  {landingPage.innovationSection.features.map((feature, index) => (
                    <Card key={index} className="border border-gray-200">
                      <CardContent className="pt-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Feature {index + 1}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeArrayItem("innovationSection", "features", index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`innovation-feature-title-${index}`}>Titel</Label>
                          <Input
                            id={`innovation-feature-title-${index}`}
                            value={feature.title}
                            onChange={(e) =>
                              updateArrayItem("innovationSection", "features", index, "title", e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`innovation-feature-desc-${index}`}>Beschreibung</Label>
                          <Input
                            id={`innovation-feature-desc-${index}`}
                            value={feature.description}
                            onChange={(e) =>
                              updateArrayItem("innovationSection", "features", index, "description", e.target.value)
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workshops">
          <WorkshopEditor />
        </TabsContent>
      </Tabs>
    </div>
  )
}
