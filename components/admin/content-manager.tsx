"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Plus, Save, Trash2, Search, RefreshCw, AlertCircle } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import InitContentDbButton from "./init-content-db-button"

// Typen für Content-Management
type ContentType = "text" | "structured" | "section" | "page"

interface Content {
  id: string
  type: ContentType
  key: string
  category: string
  createdAt: string
  updatedAt: string
}

interface TextContent extends Content {
  type: "text"
  value: string
  description?: string
}

interface StructuredContent extends Content {
  type: "structured"
  fields: Record<string, any>
}

interface ContentSearchParams {
  type?: ContentType
  key?: string
  category?: string
  query?: string
  page?: number
  limit?: number
}

// Funktionen für Content-Service
async function searchContent(params: ContentSearchParams): Promise<Content[]> {
  try {
    const queryParams = new URLSearchParams()
    if (params.type) queryParams.append("type", params.type)
    if (params.key) queryParams.append("key", params.key)
    if (params.category) queryParams.append("category", params.category)
    if (params.query) queryParams.append("query", params.query)
    if (params.page) queryParams.append("page", params.page.toString())
    if (params.limit) queryParams.append("limit", params.limit.toString())

    console.log(`Fetching content with params: ${queryParams.toString()}`)
    const response = await fetch(`/api/content?${queryParams.toString()}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Error response from API:", errorData)
      throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`Received ${data.length} content items`)
    return data
  } catch (error) {
    console.error("Error searching content:", error)
    throw error
  }
}

async function saveContent(content: Content): Promise<Content | null> {
  try {
    console.log("Saving content:", content)
    const response = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Error response from API:", errorData)
      throw new Error(`Failed to save content: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error saving content:", error)
    throw error
  }
}

async function deleteContent(id: string): Promise<boolean> {
  try {
    console.log(`Deleting content with ID: ${id}`)
    const response = await fetch(`/api/content/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Error response from API:", errorData)
      throw new Error(`Failed to delete content: ${response.status} ${response.statusText}`)
    }

    return true
  } catch (error) {
    console.error("Error deleting content:", error)
    throw error
  }
}

async function extractStaticTexts(): Promise<{ success: boolean; count: number }> {
  try {
    console.log("Extracting static texts")
    const response = await fetch("/api/admin/extract-static-texts", {
      method: "POST",
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Error response from API:", errorData)
      throw new Error(`Failed to extract static texts: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    console.log("Extraction result:", result)
    return result
  } catch (error) {
    console.error("Error extracting static texts:", error)
    throw error
  }
}

export default function ContentManager() {
  const [activeTab, setActiveTab] = useState<ContentType>("text")
  const [searchParams, setSearchParams] = useState<ContentSearchParams>({
    type: "text",
    page: 1,
    limit: 20,
  })
  const [searchResults, setSearchResults] = useState<Content[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState<any>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  // Suche nach Inhalten
  useEffect(() => {
    async function performSearch() {
      setIsSearching(true)
      setError(null)
      try {
        const results = await searchContent({ ...searchParams, type: activeTab })
        setSearchResults(results)
        setDebugInfo({ searchParams: { ...searchParams, type: activeTab }, resultCount: results.length })
      } catch (error) {
        console.error("Error searching content:", error)
        setError(error instanceof Error ? error.message : "Unbekannter Fehler bei der Suche")
        toast({
          title: "Fehler bei der Suche",
          description: error instanceof Error ? error.message : "Die Inhalte konnten nicht geladen werden.",
          variant: "destructive",
        })
      } finally {
        setIsSearching(false)
      }
    }

    performSearch()
  }, [searchParams, activeTab])

  // Inhalt zum Bearbeiten auswählen
  const handleSelectContent = (content: Content) => {
    setSelectedContent(content)
    setEditedContent(JSON.parse(JSON.stringify(content)))
    setIsEditing(true)
  }

  // Neuen Inhalt erstellen
  const handleCreateContent = () => {
    const now = new Date().toISOString()
    let newContent: any = {
      id: "",
      createdAt: now,
      updatedAt: now,
    }

    if (activeTab === "text") {
      newContent = {
        ...newContent,
        type: "text",
        key: "",
        value: "",
        description: "",
        category: "",
      }
    } else if (activeTab === "structured") {
      newContent = {
        ...newContent,
        type: "structured",
        key: "",
        fields: {},
        category: "",
      }
    }

    setSelectedContent(null)
    setEditedContent(newContent)
    setIsEditing(true)
  }

  // Inhalt speichern
  const handleSaveContent = async () => {
    if (!editedContent) return
    setError(null)

    try {
      const savedContent = await saveContent(editedContent)

      if (savedContent) {
        toast({
          title: "Inhalt gespeichert",
          description: "Der Inhalt wurde erfolgreich gespeichert.",
        })

        // Aktualisiere die Suchergebnisse
        const updatedResults = searchResults.map((content) => (content.id === savedContent.id ? savedContent : content))

        if (!selectedContent) {
          updatedResults.unshift(savedContent)
        }

        setSearchResults(updatedResults)
        setSelectedContent(savedContent)
        setEditedContent(JSON.parse(JSON.stringify(savedContent)))
      } else {
        throw new Error("Der Inhalt konnte nicht gespeichert werden.")
      }
    } catch (error) {
      console.error("Error saving content:", error)
      setError(error instanceof Error ? error.message : "Unbekannter Fehler beim Speichern")
      toast({
        title: "Fehler beim Speichern",
        description: error instanceof Error ? error.message : "Der Inhalt konnte nicht gespeichert werden.",
        variant: "destructive",
      })
    }
  }

  // Inhalt löschen
  const handleDeleteContent = async () => {
    if (!selectedContent || !selectedContent.id) return
    setError(null)

    if (!confirm("Möchten Sie diesen Inhalt wirklich löschen?")) {
      return
    }

    try {
      const success = await deleteContent(selectedContent.id)

      if (success) {
        toast({
          title: "Inhalt gelöscht",
          description: "Der Inhalt wurde erfolgreich gelöscht.",
        })

        // Aktualisiere die Suchergebnisse
        const updatedResults = searchResults.filter((content) => content.id !== selectedContent.id)
        setSearchResults(updatedResults)
        setSelectedContent(null)
        setEditedContent(null)
        setIsEditing(false)
      } else {
        throw new Error("Der Inhalt konnte nicht gelöscht werden.")
      }
    } catch (error) {
      console.error("Error deleting content:", error)
      setError(error instanceof Error ? error.message : "Unbekannter Fehler beim Löschen")
      toast({
        title: "Fehler beim Löschen",
        description: error instanceof Error ? error.message : "Der Inhalt konnte nicht gelöscht werden.",
        variant: "destructive",
      })
    }
  }

  // Statische Texte extrahieren
  const handleExtractStaticTexts = async () => {
    setIsExtracting(true)
    setError(null)
    try {
      const result = await extractStaticTexts()

      if (result.success) {
        toast({
          title: "Statische Texte extrahiert",
          description: `${result.count} statische Texte wurden erfolgreich extrahiert und in die Datenbank geladen.`,
        })
        // Aktualisiere die Suchergebnisse
        const results = await searchContent({ ...searchParams, type: activeTab })
        setSearchResults(results)
      } else {
        throw new Error("Die statischen Texte konnten nicht extrahiert werden.")
      }
    } catch (error) {
      console.error("Error extracting static texts:", error)
      setError(error instanceof Error ? error.message : "Unbekannter Fehler beim Extrahieren")
      toast({
        title: "Fehler beim Extrahieren",
        description: error instanceof Error ? error.message : "Die statischen Texte konnten nicht extrahiert werden.",
        variant: "destructive",
      })
    } finally {
      setIsExtracting(false)
    }
  }

  // Suchparameter aktualisieren
  const updateSearchParam = (key: keyof ContentSearchParams, value: any) => {
    setSearchParams((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Zurück zur ersten Seite
    }))
  }

  // Bearbeiteten Inhalt aktualisieren
  const updateEditedContent = (key: string, value: any) => {
    setEditedContent((prev: any) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Feld in bearbeitetem strukturierten Inhalt aktualisieren
  const updateStructuredField = (fieldKey: string, value: any) => {
    setEditedContent((prev: any) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldKey]: value,
      },
    }))
  }

  // Neues Feld zu strukturiertem Inhalt hinzufügen
  const addStructuredField = () => {
    const fieldKey = prompt("Feldname:")
    if (!fieldKey) return

    setEditedContent((prev: any) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldKey]: "",
      },
    }))
  }

  // Feld aus strukturiertem Inhalt entfernen
  const removeStructuredField = (fieldKey: string) => {
    setEditedContent((prev: any) => {
      const fields = { ...prev.fields }
      delete fields[fieldKey]
      return {
        ...prev,
        fields,
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Content-Manager</h2>
        <div className="flex space-x-2">
          <InitContentDbButton />
          <Button onClick={handleCreateContent}>
            <Plus className="mr-2 h-4 w-4" />
            Neuer Inhalt
          </Button>
          <Button variant="outline" onClick={handleExtractStaticTexts} disabled={isExtracting}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isExtracting ? "animate-spin" : ""}`} />
            {isExtracting ? "Extrahiere..." : "Statische Texte extrahieren"}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ContentType)}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="text">Texte</TabsTrigger>
          <TabsTrigger value="structured">Strukturierte Inhalte</TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Suche</CardTitle>
                  <CardDescription>Suchen Sie nach Inhalten</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="search-query">Suchbegriff</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="search-query"
                        placeholder="Suchbegriff eingeben"
                        value={searchParams.query || ""}
                        onChange={(e) => updateSearchParam("query", e.target.value)}
                      />
                      <Button variant="outline" size="icon">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="search-key">Schlüssel</Label>
                    <Input
                      id="search-key"
                      placeholder="Schlüssel eingeben"
                      value={searchParams.key || ""}
                      onChange={(e) => updateSearchParam("key", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="search-category">Kategorie</Label>
                    <Input
                      id="search-category"
                      placeholder="Kategorie eingeben"
                      value={searchParams.category || ""}
                      onChange={(e) => updateSearchParam("category", e.target.value)}
                    />
                  </div>

                  <div className="pt-4">
                    <h3 className="font-medium mb-2">Suchergebnisse</h3>
                    {isSearching ? (
                      <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="p-2">
                            <Skeleton className="h-5 w-full mb-1" />
                            <Skeleton className="h-3 w-3/4" />
                          </div>
                        ))}
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">Keine Ergebnisse gefunden</div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {searchResults.map((content) => (
                          <div
                            key={content.id}
                            className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                              selectedContent?.id === content.id ? "bg-gray-100" : ""
                            }`}
                            onClick={() => handleSelectContent(content)}
                          >
                            <div className="font-medium truncate">{content.key}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {content.type}
                              </Badge>
                              <span>{content.category}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
                {debugInfo && (
                  <CardFooter>
                    <details className="text-xs text-gray-500 w-full">
                      <summary>Debug-Informationen</summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                        {JSON.stringify(debugInfo, null, 2)}
                      </pre>
                    </details>
                  </CardFooter>
                )}
              </Card>
            </div>

            <div className="md:col-span-2">
              {isEditing && editedContent ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{selectedContent ? "Inhalt bearbeiten" : "Neuen Inhalt erstellen"}</CardTitle>
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={handleSaveContent}>
                          <Save className="mr-2 h-4 w-4" />
                          Speichern
                        </Button>
                        {selectedContent && (
                          <Button variant="destructive" onClick={handleDeleteContent}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Löschen
                          </Button>
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      {editedContent.type === "text"
                        ? "Bearbeiten Sie den Textinhalt"
                        : "Bearbeiten Sie den strukturierten Inhalt"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="content-key">Schlüssel</Label>
                      <Input
                        id="content-key"
                        value={editedContent.key || ""}
                        onChange={(e) => updateEditedContent("key", e.target.value)}
                        placeholder="Eindeutiger Schlüssel für diesen Inhalt"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content-category">Kategorie</Label>
                      <Input
                        id="content-category"
                        value={editedContent.category || ""}
                        onChange={(e) => updateEditedContent("category", e.target.value)}
                        placeholder="Kategorie für diesen Inhalt"
                      />
                    </div>

                    {editedContent.type === "text" ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="content-value">Wert</Label>
                          <Textarea
                            id="content-value"
                            value={editedContent.value || ""}
                            onChange={(e) => updateEditedContent("value", e.target.value)}
                            placeholder="Inhalt des Textes"
                            rows={5}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="content-description">Beschreibung</Label>
                          <Input
                            id="content-description"
                            value={editedContent.description || ""}
                            onChange={(e) => updateEditedContent("description", e.target.value)}
                            placeholder="Beschreibung des Inhalts (optional)"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label>Felder</Label>
                          <Button variant="outline" size="sm" onClick={addStructuredField}>
                            <Plus className="mr-2 h-4 w-4" />
                            Feld hinzufügen
                          </Button>
                        </div>

                        {Object.entries(editedContent.fields || {}).map(([key, value]) => (
                          <div key={key} className="space-y-2 border p-4 rounded-md">
                            <div className="flex justify-between items-center">
                              <Label htmlFor={`field-${key}`}>{key}</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeStructuredField(key)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <Textarea
                              id={`field-${key}`}
                              value={(value as string) || ""}
                              onChange={(e) => updateStructuredField(key, e.target.value)}
                              rows={3}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  {selectedContent && (
                    <CardFooter>
                      <div className="text-xs text-gray-500 w-full">
                        <div>ID: {selectedContent.id}</div>
                        <div>Erstellt: {new Date(selectedContent.createdAt).toLocaleString()}</div>
                        <div>Aktualisiert: {new Date(selectedContent.updatedAt).toLocaleString()}</div>
                      </div>
                    </CardFooter>
                  )}
                </Card>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-gray-500">Wählen Sie einen Inhalt aus oder erstellen Sie einen neuen Inhalt</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="structured" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Suche</CardTitle>
                  <CardDescription>Suchen Sie nach strukturierten Inhalten</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="search-query-structured">Suchbegriff</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="search-query-structured"
                        placeholder="Suchbegriff eingeben"
                        value={searchParams.query || ""}
                        onChange={(e) => updateSearchParam("query", e.target.value)}
                      />
                      <Button variant="outline" size="icon">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="search-key-structured">Schlüssel</Label>
                    <Input
                      id="search-key-structured"
                      placeholder="Schlüssel eingeben"
                      value={searchParams.key || ""}
                      onChange={(e) => updateSearchParam("key", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="search-category-structured">Kategorie</Label>
                    <Input
                      id="search-category-structured"
                      placeholder="Kategorie eingeben"
                      value={searchParams.category || ""}
                      onChange={(e) => updateSearchParam("category", e.target.value)}
                    />
                  </div>

                  <div className="pt-4">
                    <h3 className="font-medium mb-2">Suchergebnisse</h3>
                    {isSearching ? (
                      <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="p-2">
                            <Skeleton className="h-5 w-full mb-1" />
                            <Skeleton className="h-3 w-3/4" />
                          </div>
                        ))}
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">Keine Ergebnisse gefunden</div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {searchResults.map((content) => (
                          <div
                            key={content.id}
                            className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                              selectedContent?.id === content.id ? "bg-gray-100" : ""
                            }`}
                            onClick={() => handleSelectContent(content)}
                          >
                            <div className="font-medium truncate">{content.key}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {content.type}
                              </Badge>
                              <span>{content.category}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
                {debugInfo && (
                  <CardFooter>
                    <details className="text-xs text-gray-500 w-full">
                      <summary>Debug-Informationen</summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                        {JSON.stringify(debugInfo, null, 2)}
                      </pre>
                    </details>
                  </CardFooter>
                )}
              </Card>
            </div>

            <div className="md:col-span-2">
              {isEditing && editedContent ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{selectedContent ? "Inhalt bearbeiten" : "Neuen Inhalt erstellen"}</CardTitle>
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={handleSaveContent}>
                          <Save className="mr-2 h-4 w-4" />
                          Speichern
                        </Button>
                        {selectedContent && (
                          <Button variant="destructive" onClick={handleDeleteContent}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Löschen
                          </Button>
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      {editedContent.type === "text"
                        ? "Bearbeiten Sie den Textinhalt"
                        : "Bearbeiten Sie den strukturierten Inhalt"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="content-key-structured">Schlüssel</Label>
                      <Input
                        id="content-key-structured"
                        value={editedContent.key || ""}
                        onChange={(e) => updateEditedContent("key", e.target.value)}
                        placeholder="Eindeutiger Schlüssel für diesen Inhalt"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content-category-structured">Kategorie</Label>
                      <Input
                        id="content-category-structured"
                        value={editedContent.category || ""}
                        onChange={(e) => updateEditedContent("category", e.target.value)}
                        placeholder="Kategorie für diesen Inhalt"
                      />
                    </div>

                    {editedContent.type === "text" ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="content-value-structured">Wert</Label>
                          <Textarea
                            id="content-value-structured"
                            value={editedContent.value || ""}
                            onChange={(e) => updateEditedContent("value", e.target.value)}
                            placeholder="Inhalt des Textes"
                            rows={5}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="content-description-structured">Beschreibung</Label>
                          <Input
                            id="content-description-structured"
                            value={editedContent.description || ""}
                            onChange={(e) => updateEditedContent("description", e.target.value)}
                            placeholder="Beschreibung des Inhalts (optional)"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label>Felder</Label>
                          <Button variant="outline" size="sm" onClick={addStructuredField}>
                            <Plus className="mr-2 h-4 w-4" />
                            Feld hinzufügen
                          </Button>
                        </div>

                        {Object.entries(editedContent.fields || {}).map(([key, value]) => (
                          <div key={key} className="space-y-2 border p-4 rounded-md">
                            <div className="flex justify-between items-center">
                              <Label htmlFor={`field-${key}-structured`}>{key}</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeStructuredField(key)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <Textarea
                              id={`field-${key}-structured`}
                              value={(value as string) || ""}
                              onChange={(e) => updateStructuredField(key, e.target.value)}
                              rows={3}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  {selectedContent && (
                    <CardFooter>
                      <div className="text-xs text-gray-500 w-full">
                        <div>ID: {selectedContent.id}</div>
                        <div>Erstellt: {new Date(selectedContent.createdAt).toLocaleString()}</div>
                        <div>Aktualisiert: {new Date(selectedContent.updatedAt).toLocaleString()}</div>
                      </div>
                    </CardFooter>
                  )}
                </Card>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-gray-500">Wählen Sie einen Inhalt aus oder erstellen Sie einen neuen Inhalt</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
