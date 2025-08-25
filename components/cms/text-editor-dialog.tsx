"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { saveText } from "@/lib/cms-client"
import type { TextContent } from "@/types/simple-cms"

interface TextEditorDialogProps {
  text: TextContent | null
  isOpen: boolean
  onClose: () => void
  onSave: (text: TextContent) => void
}

export default function TextEditorDialog({ text, isOpen, onClose, onSave }: TextEditorDialogProps) {
  const [editedText, setEditedText] = useState<TextContent | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Wenn sich der Text ändert, aktualisiere den bearbeiteten Text
  useEffect(() => {
    if (text) {
      setEditedText({ ...text })
    } else {
      setEditedText({
        id: "",
        key: "",
        value: "",
        description: "",
        category: "",
        lastUpdated: "",
      })
    }
  }, [text])

  // Funktion zum Aktualisieren eines Felds im bearbeiteten Text
  const updateField = (field: keyof TextContent, value: string) => {
    if (editedText) {
      setEditedText({
        ...editedText,
        [field]: value,
      })
    }
  }

  // Funktion zum Speichern des bearbeiteten Texts
  const handleSave = async () => {
    if (!editedText) return

    // Validierung
    if (!editedText.key || !editedText.value || !editedText.category) {
      toast({
        title: "Fehler",
        description: "Schlüssel, Wert und Kategorie sind erforderlich.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      const savedText = await saveText(editedText)
      onSave(savedText)
      toast({
        title: "Text gespeichert",
        description: "Der Text wurde erfolgreich gespeichert.",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Fehler beim Speichern",
        description: error instanceof Error ? error.message : "Der Text konnte nicht gespeichert werden.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{text?.id ? "Text bearbeiten" : "Neuen Text erstellen"}</DialogTitle>
        </DialogHeader>

        {editedText && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="key" className="text-right">
                Schlüssel
              </Label>
              <Input
                id="key"
                value={editedText.key}
                onChange={(e) => updateField("key", e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Kategorie
              </Label>
              <Input
                id="category"
                value={editedText.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                Wert
              </Label>
              <Textarea
                id="value"
                value={editedText.value}
                onChange={(e) => updateField("value", e.target.value)}
                className="col-span-3"
                rows={5}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Beschreibung
              </Label>
              <Input
                id="description"
                value={editedText.description || ""}
                onChange={(e) => updateField("description", e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Speichern..." : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
