"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Plus, Search, Trash2, RefreshCw, Edit } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { fetchAllTexts, searchTexts, deleteText, initializeCms } from "@/lib/cms-client"
import type { TextContent, TextSearchParams } from "@/types/simple-cms"
import TextEditorDialog from "./text-editor-dialog"

export default function TextManager() {
  const [texts, setTexts] = useState<TextContent[]>([])
  const [filteredTexts, setFilteredTexts] = useState<TextContent[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isInitializing, setIsInitializing] = useState(false)
  const [selectedText, setSelectedText] = useState<TextContent | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  // Texte laden
  const loadTexts = async () => {
    setIsLoading(true)
    try {
      const data = await fetchAllTexts()
      setTexts(data)

      // Kategorien extrahieren
      const uniqueCategories = Array.from(new Set(data.map((text) => text.category)))
      setCategories(uniqueCategories.sort())

      // Texte filtern
      filterTexts(data, activeCategory, searchQuery)
    } catch (error) {
      toast({
        title: "Fehler beim Laden der Texte",
        description: error instanceof Error ? error.message : "Die Texte konnten nicht geladen werden.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Beim ersten Laden Texte abrufen
  useEffect(() => {
    loadTexts()
  }, [])

  // Texte filtern
  const filterTexts = (allTexts: TextContent[], category: string, query: string) => {
    let filtered = [...allTexts]

    // Nach Kategorie filtern
    if (category !== "all") {
      filtered = filtered.filter((text) => text.category === category)
    }

    // Nach Suchbegriff filtern
    if (query) {
      const lowerQuery = query.toLowerCase()
      filtered = filtered.filter(
        (text) =>
          text.key.toLowerCase().includes(lowerQuery) ||
          text.value.toLowerCase().includes(lowerQuery) ||
          (text.description && text.description.toLowerCase().includes(lowerQuery)),
      )
    }

    setFilteredTexts(filtered)
  }

  // Wenn sich die Kategorie oder der Suchbegriff ändert, Texte filtern
  useEffect(() => {
    filterTexts(texts, activeCategory, searchQuery)
  }, [activeCategory, searchQuery, texts])

  // Suche durchführen
  const handleSearch = async () => {
    if (!searchQuery) {
      filterTexts(texts, activeCategory, "")
      return
    }

    setIsLoading(true)
    try {
      const params: TextSearchParams = { query: searchQuery }
      if (activeCategory !== "all") {
        params.category = activeCategory
      }

      const results = await searchTexts(params)
      setFilteredTexts(results)
    } catch (error) {
      toast({
        title: "Fehler bei der Suche",
        description: error instanceof Error ? error.message : "Die Suche konnte nicht durchgeführt werden.",
        variant: "destructive",
      })
      filterTexts(texts, activeCategory, searchQuery)
    } finally {
      setIsLoading(false)
    }
  }

  // Text löschen
  const handleDeleteText = async (text: TextContent) => {
    if (!confirm(`Möchten Sie den Text "${text.key}" wirklich löschen?`)) {
      return
    }

    try {
      const success = await deleteText(text.id)
      if (success) {
        toast({
          title: "Text gelöscht",
          description: `Der Text "${text.key}" wurde erfolgreich gelöscht.`,
        })

        // Texte neu laden
        loadTexts()
      } else {
        throw new Error("Der Text konnte nicht gelöscht werden.")
      }
    } catch (error) {
      toast({
        title: "Fehler beim Löschen",
        description: error instanceof Error ? error.message : "Der Text konnte nicht gelöscht werden.",
        variant: "destructive",
      })
    }
  }

  // CMS initialisieren
  const handleInitializeCms = async () => {
    if (!confirm("Möchten Sie das CMS wirklich initialisieren? Alle vorhandenen Texte werden gelöscht.")) {
      return
    }

    setIsInitializing(true)
    try {
      const success = await initializeCms()
      if (success) {
        toast({
          title: "CMS initialisiert",
          description: "Das CMS wurde erfolgreich initialisiert und mit Beispieltexten gefüllt.",
        })

        // Texte neu laden
        loadTexts()
      } else {
        throw new Error("Das CMS konnte nicht initialisiert werden.")
      }
    } catch (error) {
      toast({
        title: "Fehler bei der Initialisierung",
        description: error instanceof Error ? error.message : "Das CMS konnte nicht initialisiert werden.",
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  // Text zum Bearbeiten auswählen
  const handleEditText = (text: TextContent) => {
    setSelectedText(text)
    setIsEditorOpen(true)
  }

  // Neuen Text erstellen
  const handleCreateText = () => {
    setSelectedText(null)
    setIsEditorOpen(true)
  }

  // Text speichern
  const handleSaveText = (text: TextContent) => {
    // Texte neu laden
    loadTexts()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Text-Manager</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleInitializeCms} disabled={isInitializing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isInitializing ? "animate-spin" : ""}`} />
            {isInitializing ? "Initialisiere..." : "CMS initialisieren"}
          </Button>
          <Button onClick={handleCreateText}>
            <Plus className="mr-2 h-4 w-4" />
            Neuer Text
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Suche nach Texten..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={handleSearch}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="all">Alle</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{activeCategory === "all" ? "Alle Texte" : `Texte in Kategorie "${activeCategory}"`}</span>
                <Badge variant="outline">
                  {filteredTexts.length} {filteredTexts.length === 1 ? "Text" : "Texte"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Texte werden geladen...</div>
              ) : filteredTexts.length === 0 ? (
                <div className="text-center py-4">Keine Texte gefunden</div>
              ) : (
                <div className="space-y-4">
                  {filteredTexts.map((text) => (
                    <div key={text.id} className="p-4 border rounded-md hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{text.key}</div>
                          <div className="text-sm text-gray-500 mt-1">{text.description || "Keine Beschreibung"}</div>
                          <div className="mt-2">{text.value}</div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditText(text)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteText(text)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <Badge variant="outline" className="mr-2">
                          {text.category}
                        </Badge>
                        <span>Zuletzt aktualisiert: {new Date(text.lastUpdated).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TextEditorDialog
        text={selectedText}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveText}
      />
    </div>
  )
}
