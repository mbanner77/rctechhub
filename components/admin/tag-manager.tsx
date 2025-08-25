"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { synchronizeTags, updateTagReferences, removeTagReferences } from "@/lib/tag-utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { Plus, Save, Trash2, Edit, Search, AlertCircle, Info } from "lucide-react"
import { db, ITag } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

/**
 * Technology Tag Manager Component
 * 
 * This component allows content managers to maintain and manage technology tags
 * (create, edit, delete) across the application.
 * 
 * Features:
 * - List all existing technology tags
 * - Add new tags
 * - Edit tag names
 * - Delete tags (with reference cleanup)
 * - Filter and search tags
 */
export function TagManager() {
  // State for tags
  const [tags, setTags] = useState<ITag[]>([])
  const [filteredTags, setFilteredTags] = useState<ITag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [showUnused, setShowUnused] = useState(false)
  
  // State for tag editing
  const [editingTag, setEditingTag] = useState<ITag | null>(null)
  const [editedName, setEditedName] = useState("")
  const [editedCategory, setEditedCategory] = useState<string>("none")

  // State for new tag creation
  const [newTagName, setNewTagName] = useState("")
  const [newTagCategory, setNewTagCategory] = useState<string>("none")
  
  // Available tag categories
  const tagCategories = [
    "Entwicklung",
    "Integration",
    "Plattform",
    "Frontend",
    "Backend",
    "Datenbank",
    "Cloud",
    "Sicherheit",
    "Werkzeuge",
    "Programmiersprachen",
    "Frameworks"
  ]

  // Load tags on component mount
  useEffect(() => {
    loadTags()
  }, [])

  // Filter tags when search query, category filter, or tags change
  useEffect(() => {
    filterTags()
  }, [searchQuery, categoryFilter, tags, showUnused])

  // Function to load all tags
  async function loadTags() {
    setIsLoading(true)
    try {
      // Get all tags from the database
      const allTags = await db.tags.toArray()
      setTags(allTags)
    } catch (error) {
      console.error("Error loading tags:", error)
      toast({
        title: "Fehler beim Laden",
        description: "Die Tags konnten nicht geladen werden.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to filter tags based on search query and category
  function filterTags() {
    let filtered = [...tags]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(tag => 
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by category
    if (categoryFilter && categoryFilter !== "all") {
      filtered = filtered.filter(tag => tag.category === categoryFilter)
    }

    // Filter unused tags if requested
    if (showUnused) {
      filtered = filtered.filter(tag => tag.count === 0)
    }

    setFilteredTags(filtered)
  }

  // Function to create a new tag
  async function handleCreateTag() {
    if (!newTagName.trim()) {
      toast({
        title: "Fehlerhafter Tag",
        description: "Der Tag-Name darf nicht leer sein.",
        variant: "destructive",
      })
      return
    }

    // Check if tag already exists
    const existingTag = tags.find(t => t.name.toLowerCase() === newTagName.toLowerCase())
    if (existingTag) {
      toast({
        title: "Tag existiert bereits",
        description: `Ein Tag mit dem Namen "${newTagName}" existiert bereits.`,
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const now = new Date().toISOString()
      const newTag: ITag = {
        id: uuidv4(),
        name: newTagName.trim(),
        category: newTagCategory === "none" ? undefined : newTagCategory,
        count: 0,
        createdAt: now,
        updatedAt: now
      }

      // Save to database
      await db.tags.add(newTag)

      // Update state
      setTags(prev => [...prev, newTag])
      
      // Reset form
      setNewTagName("")
      setNewTagCategory("none")
      
      toast({
        title: "Tag erstellt",
        description: `Der Tag "${newTag.name}" wurde erfolgreich erstellt.`
      })
    } catch (error) {
      console.error("Error creating tag:", error)
      toast({
        title: "Fehler beim Erstellen",
        description: "Der Tag konnte nicht erstellt werden.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Function to prepare tag for editing
  function handleEditStart(tag: ITag) {
    setEditingTag(tag)
    setEditedName(tag.name)
    setEditedCategory(tag.category || "none")
  }

  // Function to save edited tag
  async function handleSaveEdit() {
    if (!editingTag) return
    
    if (!editedName.trim()) {
      toast({
        title: "Fehlerhafter Tag",
        description: "Der Tag-Name darf nicht leer sein.",
        variant: "destructive",
      })
      return
    }

    // Check if another tag already has the same name (ignore current tag)
    const existingTag = tags.find(t => 
      t.id !== editingTag.id && 
      t.name.toLowerCase() === editedName.toLowerCase()
    )
    if (existingTag) {
      toast({
        title: "Tag existiert bereits",
        description: `Ein Tag mit dem Namen "${editedName}" existiert bereits.`,
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const now = new Date().toISOString()
      const updatedTag: ITag = {
        ...editingTag,
        name: editedName.trim(),
        category: editedCategory === "none" ? undefined : editedCategory,
        updatedAt: now
      }

      // Update in database
      await db.tags.update(editingTag.id, updatedTag)

      // Update all references to this tag
      await updateTagReferences(editingTag.name, updatedTag.name)

      // Update state
      setTags(prev => prev.map(t => t.id === updatedTag.id ? updatedTag : t))
      
      // Reset editing state
      setEditingTag(null)
      
      toast({
        title: "Tag aktualisiert",
        description: `Der Tag wurde erfolgreich aktualisiert.`
      })
    } catch (error) {
      console.error("Error updating tag:", error)
      toast({
        title: "Fehler beim Aktualisieren",
        description: "Der Tag konnte nicht aktualisiert werden.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Function to handle tag deletion
  async function handleDeleteTag(tag: ITag) {
    setIsSaving(true)
    try {
      // Remove from database
      await db.tags.delete(tag.id)

      // Remove references to this tag
      await removeTagReferences(tag.name)

      // Update state
      setTags(prev => prev.filter(t => t.id !== tag.id))
      
      toast({
        title: "Tag gelöscht",
        description: `Der Tag "${tag.name}" wurde erfolgreich gelöscht.`
      })
    } catch (error) {
      console.error("Error deleting tag:", error)
      toast({
        title: "Fehler beim Löschen",
        description: "Der Tag konnte nicht gelöscht werden.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Tag reference management is now handled by the centralized tag-utils

  // Function to synchronize tag counts
  async function handleSynchronizeTags() {
    setIsLoading(true)
    try {
      // Use the centralized synchronization utility
      const stats = await synchronizeTags()
      
      // Refresh tags after synchronization
      const updatedTags = await db.tags.toArray()
      setTags(updatedTags)

      toast({
        title: "Tags synchronisiert",
        description: `${stats.total} Tags wurden erfolgreich synchronisiert. ${stats.created} neue Tags erstellt, ${stats.updated} aktualisiert.`
      })
    } catch (error) {
      console.error("Error synchronizing tags:", error)
      toast({
        title: "Fehler bei der Synchronisierung",
        description: "Die Tags konnten nicht synchronisiert werden.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technologie-Tags verwalten</CardTitle>
        <CardDescription>
          Verwalten Sie alle Technologie-Tags, die im Portal verwendet werden. 
          Änderungen an Tags werden in allen referenzierenden Entitäten aktualisiert.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-2 flex-grow">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tags durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {tagCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleSynchronizeTags()}
              disabled={isLoading || isSaving}
            >
              Tags synchronisieren
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button disabled={isLoading || isSaving}>
                  <Plus className="h-4 w-4 mr-2" />
                  Neuer Tag
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Neuen Tag erstellen</DialogTitle>
                  <DialogDescription>
                    Erstellen Sie einen neuen Technologie-Tag.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tagName">Tag-Name</Label>
                    <Input
                      id="tagName"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="z.B. React, SAP BTP, Node.js"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tagCategory">Kategorie (optional)</Label>
                    <Select
                      value={newTagCategory}
                      onValueChange={setNewTagCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kategorie auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Keine Kategorie</SelectItem>
                        {tagCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Abbrechen</Button>
                  </DialogClose>
                  <Button onClick={handleCreateTag} disabled={isSaving}>
                    {isSaving ? "Wird erstellt..." : "Tag erstellen"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tags list */}
        {isLoading ? (
          // Loading state
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex flex-col gap-2 w-full">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-1/6" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTags.length > 0 ? (
          // Tags list
          <div className="space-y-3">
            {filteredTags.map((tag) => (
              <div
                key={tag.id}
                className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 p-4 border rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{tag.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {tag.count} {tag.count === 1 ? "Referenz" : "Referenzen"}
                    </Badge>
                    {tag.category && (
                      <Badge variant="secondary" className="text-xs">
                        {tag.category}
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Erstellt: {new Date(tag.createdAt).toLocaleDateString()}
                    {tag.updatedAt !== tag.createdAt && 
                      ` · Aktualisiert: ${new Date(tag.updatedAt).toLocaleDateString()}`}
                  </span>
                </div>
                <div className="flex gap-2 ml-auto">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => handleEditStart(tag)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tag bearbeiten</DialogTitle>
                        <DialogDescription>
                          Bearbeiten Sie den Tag. Die Änderungen werden in allen referenzierenden Entitäten aktualisiert.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="editTagName">Tag-Name</Label>
                          <Input
                            id="editTagName"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="editTagCategory">Kategorie (optional)</Label>
                          <Select
                            value={editedCategory}
                            onValueChange={setEditedCategory}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Kategorie auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Keine Kategorie</SelectItem>
                              {tagCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Abbrechen</Button>
                        </DialogClose>
                        <Button onClick={handleSaveEdit} disabled={isSaving}>
                          {isSaving ? "Wird gespeichert..." : "Änderungen speichern"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tag löschen</AlertDialogTitle>
                        <AlertDialogDescription>
                          Sind Sie sicher, dass Sie den Tag "{tag.name}" löschen möchten? 
                          Der Tag wird aus allen {tag.count} Referenzen entfernt.
                          Diese Aktion kann nicht rückgängig gemacht werden.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteTag(tag)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Tag löschen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // No results
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-muted p-3">
              <Info className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Keine Tags gefunden</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery || categoryFilter !== "all"
                ? "Keine Tags entsprechen Ihren Filterkriterien."
                : "Es wurden noch keine Tags erstellt."}
            </p>
            {(searchQuery || categoryFilter !== "all") && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("")
                  setCategoryFilter("all")
                }}
                className="mt-4"
              >
                Filter zurücksetzen
              </Button>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {filteredTags.length} von {tags.length} Tags
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowUnused(!showUnused)}
        >
          {showUnused ? "Alle Tags anzeigen" : "Nur unbenutzte Tags anzeigen"}
        </Button>
      </CardFooter>
    </Card>
  )
}
