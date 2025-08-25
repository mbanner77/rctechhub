"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { initializeCms } from "@/lib/cms-client"

export default function InitCmsButton() {
  const [isInitializing, setIsInitializing] = useState(false)
  const { toast } = useToast()

  const handleInitialize = async () => {
    setIsInitializing(true)
    try {
      const success = await initializeCms()
      if (success) {
        toast({
          title: "CMS initialisiert",
          description: "Das CMS wurde erfolgreich mit Standardtexten initialisiert.",
        })
      } else {
        throw new Error("Fehler beim Initialisieren des CMS")
      }
    } catch (error) {
      console.error("Fehler beim Initialisieren des CMS:", error)
      toast({
        title: "Fehler",
        description: "Das CMS konnte nicht initialisiert werden.",
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <Button onClick={handleInitialize} disabled={isInitializing}>
      {isInitializing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Initialisiere CMS...
        </>
      ) : (
        "CMS initialisieren"
      )}
    </Button>
  )
}
