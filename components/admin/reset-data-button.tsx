"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw, Loader2 } from "lucide-react"

export default function ResetDataButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const { toast } = useToast()

  const handleReset = async () => {
    setIsResetting(true)
    try {
      const response = await fetch("/api/data/reset", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`Fehler beim Zurücksetzen der Daten: ${response.statusText}`)
      }

      toast({
        title: "Daten zurückgesetzt",
        description: "Alle Daten wurden erfolgreich auf die Standardwerte zurückgesetzt.",
      })
    } catch (error) {
      console.error("Fehler beim Zurücksetzen der Daten:", error)
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Die Daten konnten nicht zurückgesetzt werden.",
        variant: "destructive",
      })
    } finally {
      setIsResetting(false)
      setIsDialogOpen(false)
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setIsDialogOpen(true)} className="flex items-center">
        <RefreshCw className="mr-2 h-4 w-4" />
        Daten zurücksetzen
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Daten zurücksetzen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie alle Daten auf die Standardwerte zurücksetzen möchten? Diese Aktion kann nicht
              rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleReset()
              }}
              disabled={isResetting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isResetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird zurückgesetzt...
                </>
              ) : (
                "Zurücksetzen"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
