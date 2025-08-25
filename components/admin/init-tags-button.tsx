"use client"

import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { db } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"
import { Loader2, RefreshCw } from "lucide-react"
import { useState } from "react"

/**
 * Initialize Tags Button Component
 * 
 * This component provides a button to scan the database for existing tags
 * and create formal tag entries in the tags table.
 */
export default function InitTagsButton() {
  const [isLoading, setIsLoading] = useState(false)

  // Function to initialize tags
  const initializeTags = async () => {
    setIsLoading(true)
    try {
      // Get all existing tags from the tags table
      const existingTags = await db.tags.toArray()
      const existingTagNames = new Set(existingTags.map(tag => tag.name))

      // Collect all unique tags from services and knowledge hub content
      const uniqueTags = new Set<string>()
      const tagCounts = new Map<string, number>()

      // Check services
      const services = await db.services.toArray()
      services.forEach(service => {
        service.technologies.forEach(tech => {
          uniqueTags.add(tech)
          tagCounts.set(tech, (tagCounts.get(tech) || 0) + 1)
        })
      })

      // Check knowledge hub content
      const knowledgeHubItems = await db.knowledgeHubContent.toArray()
      knowledgeHubItems.forEach(item => {
        if (item.tags) {
          item.tags.forEach(tag => {
            uniqueTags.add(tag)
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
          })
        }
      })

      // Filter out tags that already exist
      const newTags = Array.from(uniqueTags).filter(tag => !existingTagNames.has(tag))

      // Create new tag objects
      const now = new Date().toISOString()
      const tagsToAdd = newTags.map(tagName => ({
        id: uuidv4(),
        name: tagName,
        count: tagCounts.get(tagName) || 0,
        createdAt: now,
        updatedAt: now
      }))

      // Add new tags to database
      if (tagsToAdd.length > 0) {
        await db.tags.bulkAdd(tagsToAdd)

        toast({
          title: "Tags initialisiert",
          description: `${tagsToAdd.length} neue Tags wurden erstellt.`
        })
      } else {
        toast({
          title: "Keine neuen Tags",
          description: "Es wurden keine neuen Tags gefunden."
        })
      }

      // Update counts for existing tags
      let updatedCount = 0
      for (const existingTag of existingTags) {
        const newCount = tagCounts.get(existingTag.name) || 0
        if (existingTag.count !== newCount) {
          await db.tags.update(existingTag.id, { 
            count: newCount,
            updatedAt: now
          })
          updatedCount++
        }
      }

      if (updatedCount > 0) {
        toast({
          title: "Tag-Zähler aktualisiert",
          description: `${updatedCount} bestehende Tags wurden aktualisiert.`
        })
      }

      return true
    } catch (error) {
      console.error("Error initializing tags:", error)
      toast({
        title: "Fehler",
        description: "Beim Initialisieren der Tags ist ein Fehler aufgetreten.",
        variant: "destructive"
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={initializeTags}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Tags werden initialisiert...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          Tags initialisieren
        </>
      )}
    </Button>
  )
}
