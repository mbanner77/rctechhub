"use client"

import { useState } from "react"
import { Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { saveText } from "@/lib/cms-client"
import type { TextContent } from "@/types/simple-cms"
import TextEditorDialog from "./text-editor-dialog"
import TextDisplay from "./text-display"
import type { JSX } from "react/jsx-runtime"

interface EditableTextProps {
  textKey: string
  defaultValue?: string
  category?: string
  description?: string
  className?: string
  as?: keyof JSX.IntrinsicElements
  editable?: boolean
}

export default function EditableText({
  textKey,
  defaultValue = "",
  category = "general",
  description = "",
  className = "",
  as = "span",
  editable = true,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localText, setLocalText] = useState<TextContent | null>(null)

  // Text zum Bearbeiten vorbereiten
  const handleEdit = () => {
    setLocalText({
      id: "",
      key: textKey,
      value: defaultValue,
      description,
      category,
      lastUpdated: new Date().toISOString(),
    })
    setIsEditing(true)
  }

  // Text speichern
  const handleSave = async (text: TextContent) => {
    try {
      await saveText(text)
      toast({
        title: "Text gespeichert",
        description: "Der Text wurde erfolgreich gespeichert.",
      })

      // Seite neu laden, um die Änderungen zu sehen
      window.location.reload()
    } catch (error) {
      toast({
        title: "Fehler beim Speichern",
        description: error instanceof Error ? error.message : "Der Text konnte nicht gespeichert werden.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="group relative inline-block">
      <TextDisplay textKey={textKey} defaultValue={defaultValue} className={className} as={as} />

      {editable && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleEdit}
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}

      <TextEditorDialog text={localText} isOpen={isEditing} onClose={() => setIsEditing(false)} onSave={handleSave} />
    </div>
  )
}
