"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Database, RefreshCw } from "lucide-react"

export default function InitDatabase() {
  const [isInitializing, setIsInitializing] = useState(false)

  const handleInitDatabase = async () => {
    if (
      !confirm(
        "Möchten Sie die Datenbank wirklich initialisieren? Dies erstellt die erforderlichen Tabellen, falls sie nicht existieren.",
      )
    ) {
      return
    }

    setIsInitializing(true)

    try {
      const response = await fetch("/api/admin/init-database", {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Datenbank initialisiert",
          description: "Die Datenbank wurde erfolgreich initialisiert.",
        })
      } else {
        const error = await response.json()
        throw new Error(error.message || "Fehler bei der Initialisierung der Datenbank")
      }
    } catch (error) {
      console.error("Error initializing database:", error)
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Fehler bei der Initialisierung der Datenbank",
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datenbank initialisieren</CardTitle>
        <CardDescription>Initialisieren Sie die Datenbank für das Content-Management-System</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleInitDatabase} disabled={isInitializing} className="w-full">
          {isInitializing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Initialisiere...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Datenbank initialisieren
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
