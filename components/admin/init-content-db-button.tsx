"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Database } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function InitContentDbButton() {
  const [isInitializing, setIsInitializing] = useState(false)

  const handleInitContentDb = async () => {
    if (
      !confirm("Möchten Sie die Content-Datenbank wirklich initialisieren? Alle vorhandenen Inhalte werden gelöscht.")
    ) {
      return
    }

    setIsInitializing(true)
    try {
      const response = await fetch("/api/admin/init-content-db", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message ||
            `Fehler beim Initialisieren der Content-Datenbank: ${response.status} ${response.statusText}`,
        )
      }

      const result = await response.json()
      toast({
        title: "Content-Datenbank initialisiert",
        description: `Die Content-Datenbank wurde erfolgreich initialisiert. ${result.count} Inhalte wurden erstellt.`,
      })

      // Seite neu laden, um die Änderungen zu sehen
      window.location.reload()
    } catch (error) {
      console.error("Error initializing content database:", error)
      toast({
        title: "Fehler",
        description:
          error instanceof Error ? error.message : "Die Content-Datenbank konnte nicht initialisiert werden.",
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleInitContentDb}
      disabled={isInitializing}
      className="flex items-center gap-2"
    >
      <Database className={`h-4 w-4 ${isInitializing ? "animate-pulse" : ""}`} />
      {isInitializing ? "Initialisiere..." : "Content-DB initialisieren"}
    </Button>
  )
}
