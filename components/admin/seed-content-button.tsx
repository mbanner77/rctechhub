"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { FileText, RefreshCw } from "lucide-react"

export default function SeedContentButton() {
  const [isSeeding, setIsSeeding] = useState(false)

  const handleSeedContent = async () => {
    if (
      !confirm("Möchten Sie wirklich die Standardinhalte initialisieren? Dies kann bestehende Inhalte überschreiben.")
    ) {
      return
    }

    setIsSeeding(true)

    try {
      const response = await fetch("/api/admin/seed-content", {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Inhalte initialisiert",
          description: "Die Standardinhalte wurden erfolgreich initialisiert.",
        })
      } else {
        const error = await response.json()
        throw new Error(error.message || "Fehler bei der Initialisierung der Inhalte")
      }
    } catch (error) {
      console.error("Error seeding content:", error)
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Fehler bei der Initialisierung der Inhalte",
        variant: "destructive",
      })
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <Button onClick={handleSeedContent} disabled={isSeeding} variant="outline">
      {isSeeding ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Initialisiere...
        </>
      ) : (
        <>
          <FileText className="mr-2 h-4 w-4" />
          Standardinhalte initialisieren
        </>
      )}
    </Button>
  )
}
