"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { db, ITag } from "@/lib/db"
import { Plus, Save, Trash2, Upload, ExternalLink, FilePlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import Image from "next/image"

// Define the case study interface
interface CaseStudy {
  id: string
  title: string
  industry: string
  image: string
  tags: string[]
  client: string
  clientLogo: string
  location: string
  summary: string
  challenge: string
  solution: string
  results: string
  detailPdf?: string
  unitId?: string // Optional: to associate with a specific pathfinder unit
}

// Industries options
const industries = [
  "Automobilindustrie", 
  "Chemie", 
  "Finanzen", 
  "Gesundheitswesen", 
  "Handel", 
  "Industrie",
  "Logistik", 
  "Maschinenbau", 
  "Öffentlicher Sektor", 
  "Pharma", 
  "Telekommunikation", 
  "Versorgung",
  "Other"
]

// Pathfinder unit options (from the existing code)
const pathfinderUnitOptions = [
  { id: "digital-core", title: "Digital Core" },
  { id: "platform-elevation", title: "Platform Elevation" },
  { id: "adaptive-integration", title: "Adaptive Integration" },
  { id: "data-driven-decisions", title: "Data-Driven Decisions" },
  { id: "business-simplified", title: "Business Simplified" },
  { id: "xaas-transformation", title: "XaaS Transformation" }
]

export function CaseStudiesEditor() {
  // State for case studies
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([])
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null)
  const [editedCaseStudy, setEditedCaseStudy] = useState<CaseStudy | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState<{ image: boolean; pdf: boolean }>({
    image: false,
    pdf: false,
  })

  // State for tag management
  const [newTag, setNewTag] = useState<string>("")
  const [availableTags, setAvailableTags] = useState<ITag[]>([])
  const [selectedTagToAdd, setSelectedTagToAdd] = useState<string>("")

  // Load case studies and available tags on component mount
  useEffect(() => {
    loadCaseStudies()
    loadAvailableTags()
  }, [])
  
  // Function to load available tags from the database
  async function loadAvailableTags() {
    try {
      const tags = await db.tags.toArray()
      setAvailableTags(tags)
    } catch (error) {
      console.error("Error loading tags:", error)
      toast({
        title: "Fehler beim Laden der Tags",
        description: "Die verfügbaren Tags konnten nicht geladen werden.",
        variant: "destructive",
      })
    }
  }

  // Function to load case studies
  async function loadCaseStudies() {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/case-studies")
      if (!response.ok) {
        throw new Error(`Failed to load case studies: ${response.status}`)
      }
      const data = await response.json()
      setCaseStudies(data || [])
    } catch (error) {
      console.error("Error loading case studies:", error)
      toast({
        title: "Fehler beim Laden",
        description: "Die Case Studies konnten nicht geladen werden.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to create a new case study
  const handleCreateCaseStudy = () => {
    const now = new Date().toISOString()
    const newId = `case-${now}-${Math.random().toString(36).substring(2, 9)}`
    
    const newCaseStudy: CaseStudy = {
      id: newId,
      title: "",
      industry: "Industrie",
      image: "/images/case-study-default.png", // Default image
      tags: [],
      client: "",
      clientLogo: "/images/logo-default.png", // Default logo
      location: "Deutschland",
      summary: "",
      challenge: "",
      solution: "",
      results: "",
    }

    setSelectedCaseStudy(null)
    setEditedCaseStudy(newCaseStudy)
  }

  // Function to select a case study for editing
  const handleSelectCaseStudy = (caseStudy: CaseStudy) => {
    setSelectedCaseStudy(caseStudy)
    setEditedCaseStudy({ ...caseStudy })
  }

  // Function to update edited case study
  const handleCaseStudyChange = (field: keyof CaseStudy, value: any) => {
    if (!editedCaseStudy) return
    
    setEditedCaseStudy({
      ...editedCaseStudy,
      [field]: value,
    })
  }

  // Function to add a tag from the dropdown
  const handleAddTag = () => {
    if (!selectedTagToAdd || !editedCaseStudy) return
    
    if (editedCaseStudy.tags.includes(selectedTagToAdd)) {
      toast({
        title: "Tag existiert bereits",
        description: "Dieser Tag existiert bereits in der Liste.",
        variant: "destructive",
      })
      return
    }
    
    setEditedCaseStudy({
      ...editedCaseStudy,
      tags: [...editedCaseStudy.tags, selectedTagToAdd],
    })
    setSelectedTagToAdd("")
  }

  // Function to remove a tag
  const handleRemoveTag = (tagToRemove: string) => {
    if (!editedCaseStudy) return
    
    setEditedCaseStudy({
      ...editedCaseStudy,
      tags: editedCaseStudy.tags.filter(tag => tag !== tagToRemove),
    })
  }

  // Function to save a case study
  const handleSaveCaseStudy = async () => {
    if (!editedCaseStudy) return
    
    // Validation
    if (!editedCaseStudy.title.trim()) {
      toast({
        title: "Titel fehlt",
        description: "Bitte geben Sie einen Titel ein.",
        variant: "destructive",
      })
      return
    }

    if (!editedCaseStudy.summary.trim()) {
      toast({
        title: "Zusammenfassung fehlt",
        description: "Bitte geben Sie eine Zusammenfassung ein.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    
    try {
      // Prepare the updated list of case studies
      let updatedCaseStudies: CaseStudy[]
      
      if (selectedCaseStudy) {
        // Editing an existing case study
        updatedCaseStudies = caseStudies.map(cs => 
          cs.id === editedCaseStudy.id ? editedCaseStudy : cs
        )
      } else {
        // Adding a new case study
        updatedCaseStudies = [...caseStudies, editedCaseStudy]
      }
      
      // Save to API
      const response = await fetch("/api/admin/case-studies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedCaseStudies),
      })
      
      if (!response.ok) {
        throw new Error("Failed to save case study")
      }
      
      // Update state
      setCaseStudies(updatedCaseStudies)
      setSelectedCaseStudy(editedCaseStudy)
      
      toast({
        title: "Case Study gespeichert",
        description: "Die Case Study wurde erfolgreich gespeichert.",
      })
    } catch (error) {
      console.error("Error saving case study:", error)
      toast({
        title: "Fehler beim Speichern",
        description: "Die Case Study konnte nicht gespeichert werden.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Function to delete a case study
  const handleDeleteCaseStudy = async () => {
    if (!editedCaseStudy || !window.confirm("Möchten Sie diese Case Study wirklich löschen?")) {
      return
    }
    
    setIsSaving(true)
    
    try {
      // Remove the case study from the list
      const updatedCaseStudies = caseStudies.filter(cs => cs.id !== editedCaseStudy.id)
      
      // Save to API
      const response = await fetch("/api/admin/case-studies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedCaseStudies),
      })
      
      if (!response.ok) {
        throw new Error("Failed to delete case study")
      }
      
      // Update state
      setCaseStudies(updatedCaseStudies)
      setSelectedCaseStudy(null)
      setEditedCaseStudy(null)
      
      toast({
        title: "Case Study gelöscht",
        description: "Die Case Study wurde erfolgreich gelöscht.",
      })
    } catch (error) {
      console.error("Error deleting case study:", error)
      toast({
        title: "Fehler beim Löschen",
        description: "Die Case Study konnte nicht gelöscht werden.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Function to upload an image
  const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedCaseStudy || !event.target.files || event.target.files.length === 0) {
      return
    }
    
    const file = event.target.files[0]
    setIsUploading({ ...isUploading, image: true })
    
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "image")
      
      const response = await fetch("/api/admin/case-studies/upload", {
        method: "POST",
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error("Failed to upload image")
      }
      
      const data = await response.json()
      
      // Update the case study with the new image URL
      setEditedCaseStudy({
        ...editedCaseStudy,
        image: data.url,
      })
      
      toast({
        title: "Bild hochgeladen",
        description: "Das Bild wurde erfolgreich hochgeladen.",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Fehler beim Hochladen",
        description: "Das Bild konnte nicht hochgeladen werden.",
        variant: "destructive",
      })
    } finally {
      setIsUploading({ ...isUploading, image: false })
      // Clear the input
      event.target.value = ""
    }
  }

  // Function to upload a PDF
  const handleUploadPdf = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedCaseStudy || !event.target.files || event.target.files.length === 0) {
      return
    }
    
    const file = event.target.files[0]
    setIsUploading({ ...isUploading, pdf: true })
    
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "pdf")
      
      const response = await fetch("/api/admin/case-studies/upload", {
        method: "POST",
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error("Failed to upload PDF")
      }
      
      const data = await response.json()
      
      // Update the case study with the new PDF URL
      setEditedCaseStudy({
        ...editedCaseStudy,
        detailPdf: data.url,
      })
      
      toast({
        title: "PDF hochgeladen",
        description: "Die PDF-Datei wurde erfolgreich hochgeladen.",
      })
    } catch (error) {
      console.error("Error uploading PDF:", error)
      toast({
        title: "Fehler beim Hochladen",
        description: "Die PDF-Datei konnte nicht hochgeladen werden.",
        variant: "destructive",
      })
    } finally {
      setIsUploading({ ...isUploading, pdf: false })
      // Clear the input
      event.target.value = ""
    }
  }

  // Function to upload a client logo
  const handleUploadClientLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedCaseStudy || !event.target.files || event.target.files.length === 0) {
      return
    }
    
    const file = event.target.files[0]
    setIsUploading({ ...isUploading, image: true })
    
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "image")
      
      const response = await fetch("/api/admin/case-studies/upload", {
        method: "POST",
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error("Failed to upload client logo")
      }
      
      const data = await response.json()
      
      // Update the case study with the new logo URL
      setEditedCaseStudy({
        ...editedCaseStudy,
        clientLogo: data.url,
      })
      
      toast({
        title: "Logo hochgeladen",
        description: "Das Client-Logo wurde erfolgreich hochgeladen.",
      })
    } catch (error) {
      console.error("Error uploading client logo:", error)
      toast({
        title: "Fehler beim Hochladen",
        description: "Das Client-Logo konnte nicht hochgeladen werden.",
        variant: "destructive",
      })
    } finally {
      setIsUploading({ ...isUploading, image: false })
      // Clear the input
      event.target.value = ""
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left column for case study list */}
      <div className="md:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Case Studies</CardTitle>
              <Button onClick={handleCreateCaseStudy}>
                <Plus className="mr-2 h-4 w-4" /> Neu
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-[calc(100%-88px)] overflow-auto">
            {isLoading ? (
              // Show skeleton loaders while loading
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-2">
                    <Skeleton className="h-5 w-full mb-1" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            ) : caseStudies.length === 0 ? (
              // Show message when no case studies found
              <div className="text-center py-4 text-gray-500">
                Keine Case Studies vorhanden
              </div>
            ) : (
              // Show the list of case studies
              <div className="space-y-2">
                {caseStudies.map((caseStudy) => (
                  <div
                    key={caseStudy.id}
                    className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                      selectedCaseStudy?.id === caseStudy.id ? "bg-gray-100" : ""
                    }`}
                    onClick={() => handleSelectCaseStudy(caseStudy)}
                  >
                    <div className="font-medium truncate">{caseStudy.title}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {caseStudy.industry}
                      </Badge>
                      {caseStudy.unitId && (
                        <Badge variant="secondary" className="text-xs">
                          {pathfinderUnitOptions.find(u => u.id === caseStudy.unitId)?.title || caseStudy.unitId}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right column for editing */}
      <div className="md:col-span-2">
        {editedCaseStudy ? (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {selectedCaseStudy ? "Case Study bearbeiten" : "Neue Case Study"}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleSaveCaseStudy}
                    disabled={isSaving}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Speichern..." : "Speichern"}
                  </Button>
                  {selectedCaseStudy && (
                    <Button
                      variant="destructive"
                      onClick={handleDeleteCaseStudy}
                      disabled={isSaving}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Löschen
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="basic">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Grunddaten</TabsTrigger>
                  <TabsTrigger value="content">Inhalt</TabsTrigger>
                  <TabsTrigger value="files">Dateien</TabsTrigger>
                </TabsList>
                
                {/* Basic Information Tab */}
                <TabsContent value="basic" className="space-y-4 mt-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Titel</Label>
                    <Input
                      id="title"
                      value={editedCaseStudy.title}
                      onChange={(e) => handleCaseStudyChange("title", e.target.value)}
                      placeholder="Titel der Case Study"
                    />
                  </div>

                  {/* Industry */}
                  <div className="space-y-2">
                    <Label htmlFor="industry">Branche</Label>
                    <Select
                      value={editedCaseStudy.industry}
                      onValueChange={(value) => handleCaseStudyChange("industry", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Branche auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Client */}
                  <div className="space-y-2">
                    <Label htmlFor="client">Kunde</Label>
                    <Input
                      id="client"
                      value={editedCaseStudy.client}
                      onChange={(e) => handleCaseStudyChange("client", e.target.value)}
                      placeholder="Name des Kunden"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Standort</Label>
                    <Input
                      id="location"
                      value={editedCaseStudy.location}
                      onChange={(e) => handleCaseStudyChange("location", e.target.value)}
                      placeholder="z.B. Deutschland, Österreich, Schweiz"
                    />
                  </div>

                  {/* Pathfinder Unit */}
                  <div className="space-y-2">
                    <Label htmlFor="unitId">Pathfinder Unit (optional)</Label>
                    <Select
                      value={editedCaseStudy.unitId || ""}
                      onValueChange={(value) => handleCaseStudyChange("unitId", value || undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Unit auswählen (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle Units (nicht spezifisch)</SelectItem>
                        {pathfinderUnitOptions.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Wenn eine Unit ausgewählt wird, erscheint die Case Study automatisch auf der jeweiligen Detailseite.
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {editedCaseStudy.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {tag}
                          <Trash2
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => handleRemoveTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-grow">
                        <Select value={selectedTagToAdd} onValueChange={setSelectedTagToAdd}>
                          <SelectTrigger>
                            <SelectValue placeholder="Tag auswählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTags.length > 0 ? (
                              availableTags
                                .filter(tag => !editedCaseStudy.tags.includes(tag.name))
                                .map((tag) => (
                                  <SelectItem key={tag.id} value={tag.name}>
                                    {tag.name}
                                    {tag.category && ` (${tag.category})`}
                                  </SelectItem>
                                ))
                            ) : (
                              <SelectItem value="no-tags" disabled>
                                Keine Tags verfügbar
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        type="button" 
                        size="sm" 
                        onClick={handleAddTag} 
                        disabled={!selectedTagToAdd}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {availableTags.length === 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Bitte erstellen Sie Tags im Tag-Manager, bevor Sie sie hier verwenden.
                      </p>
                    )}
                    {availableTags.length > 0 && availableTags.filter(tag => !editedCaseStudy.tags.includes(tag.name)).length === 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Alle verfügbaren Tags wurden bereits hinzugefügt.
                      </p>
                    )}
                  </div>
                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-4 mt-4">
                  {/* Summary */}
                  <div className="space-y-2">
                    <Label htmlFor="summary">Zusammenfassung</Label>
                    <Textarea
                      id="summary"
                      value={editedCaseStudy.summary}
                      onChange={(e) => handleCaseStudyChange("summary", e.target.value)}
                      placeholder="Kurze Zusammenfassung der Case Study"
                      className="min-h-[80px]"
                    />
                  </div>

                  {/* Challenge */}
                  <div className="space-y-2">
                    <Label htmlFor="challenge">Herausforderung</Label>
                    <Textarea
                      id="challenge"
                      value={editedCaseStudy.challenge}
                      onChange={(e) => handleCaseStudyChange("challenge", e.target.value)}
                      placeholder="Beschreibung der Herausforderung"
                      className="min-h-[80px]"
                    />
                  </div>

                  {/* Solution */}
                  <div className="space-y-2">
                    <Label htmlFor="solution">Lösung</Label>
                    <Textarea
                      id="solution"
                      value={editedCaseStudy.solution}
                      onChange={(e) => handleCaseStudyChange("solution", e.target.value)}
                      placeholder="Beschreibung der Lösung"
                      className="min-h-[80px]"
                    />
                  </div>

                  {/* Results */}
                  <div className="space-y-2">
                    <Label htmlFor="results">Ergebnisse</Label>
                    <Textarea
                      id="results"
                      value={editedCaseStudy.results}
                      onChange={(e) => handleCaseStudyChange("results", e.target.value)}
                      placeholder="Beschreibung der Ergebnisse"
                      className="min-h-[80px]"
                    />
                  </div>
                </TabsContent>

                {/* Files Tab */}
                <TabsContent value="files" className="space-y-4 mt-4">
                  {/* Case Study Image */}
                  <div className="space-y-2">
                    <Label>Case Study Bild</Label>
                    {editedCaseStudy.image && (
                      <div className="mb-2 relative w-full h-48 border rounded-md overflow-hidden">
                        <Image
                          src={editedCaseStudy.image}
                          alt={editedCaseStudy.title || "Case Study Image"}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadImage}
                        id="case-study-image"
                        className="hidden"
                        disabled={isUploading.image}
                      />
                      <Label
                        htmlFor="case-study-image"
                        className="flex items-center gap-2 cursor-pointer text-sm px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md"
                      >
                        <Upload className="h-4 w-4" />
                        {isUploading.image ? "Uploading..." : "Bild hochladen"}
                      </Label>
                      <p className="text-xs text-gray-500">
                        Empfohlene Größe: 1200x800px, Format: JPG oder PNG
                      </p>
                    </div>
                  </div>

                  {/* Client Logo */}
                  <div className="space-y-2 mt-6">
                    <Label>Kunden-Logo</Label>
                    {editedCaseStudy.clientLogo && (
                      <div className="mb-2 border rounded-md overflow-hidden p-4 bg-gray-50 flex justify-center">
                        <div className="relative w-48 h-24">
                          <Image
                            src={editedCaseStudy.clientLogo}
                            alt={editedCaseStudy.client || "Client Logo"}
                            fill
                            style={{ objectFit: "contain" }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadClientLogo}
                        id="client-logo"
                        className="hidden"
                        disabled={isUploading.image}
                      />
                      <Label
                        htmlFor="client-logo"
                        className="flex items-center gap-2 cursor-pointer text-sm px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md"
                      >
                        <Upload className="h-4 w-4" />
                        {isUploading.image ? "Uploading..." : "Logo hochladen"}
                      </Label>
                      <p className="text-xs text-gray-500">
                        Empfohlene Größe: 300x150px, Format: PNG mit Transparenz
                      </p>
                    </div>
                  </div>

                  {/* Detail PDF */}
                  <div className="space-y-2 mt-6">
                    <Label>Detail PDF (optional)</Label>
                    {editedCaseStudy.detailPdf && (
                      <div className="mb-2 flex items-center gap-2">
                        <div className="px-4 py-2 rounded-md border flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <FilePlus className="h-5 w-5 text-blue-500" />
                            <span>
                              {editedCaseStudy.detailPdf.split("/").pop() || "Case Study PDF"}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(editedCaseStudy.detailPdf, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={handleUploadPdf}
                        id="detail-pdf"
                        className="hidden"
                        disabled={isUploading.pdf}
                      />
                      <Label
                        htmlFor="detail-pdf"
                        className="flex items-center gap-2 cursor-pointer text-sm px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md"
                      >
                        <Upload className="h-4 w-4" />
                        {isUploading.pdf ? "Uploading..." : "PDF hochladen"}
                      </Label>
                      <p className="text-xs text-gray-500">
                        Optionales detailliertes PDF der Case Study zum Download
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            {/* Removed redundant save button in CardFooter */}
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center text-center p-8">
            <div>
              <h3 className="text-lg font-medium mb-2">Keine Case Study ausgewählt</h3>
              <p className="text-gray-500 mb-4">
                Wählen Sie eine bestehende Case Study aus oder erstellen Sie eine neue.
              </p>
              <Button onClick={handleCreateCaseStudy}>
                <Plus className="mr-2 h-4 w-4" /> Neue Case Study
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
