"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Download, CheckCircle } from "lucide-react"
import Image from "next/image"
import { analytics } from "@/lib/analytics"

interface DownloadDialogProps {
  isOpen: boolean
  onClose: () => void
  resourceTitle?: string
  resourceType?: string
}

export default function DownloadDialog({
  isOpen,
  onClose,
  resourceTitle = "Dokument",
  resourceType = "whitepaper",
}: DownloadDialogProps) {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [acceptMarketing, setAcceptMarketing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Bestimme das Bild basierend auf dem Ressourcentyp
  const getImageUrl = () => {
    switch (resourceType) {
      case "template":
        return "/images/resource-template.png"
      case "bestpractice":
        return "/images/best-practice-btp-architecture.png"
      case "whitepaper":
      default:
        return "/images/resource-whitepaper.png"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
      
      // Track the download
      analytics.templateDownload(resourceTitle || 'unknown')

      // Simulate download after short delay
      setTimeout(() => {
        toast({
          title: "Download gestartet",
          description: `${resourceTitle} wird heruntergeladen...`,
        })

        // Reset after download
        setTimeout(() => {
          setIsSuccess(false)
          setEmail("")
          setName("")
          setCompany("")
          setAcceptMarketing(false)
          onClose()
        }, 1000)
      }, 1000)
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isSuccess ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Download bereit
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                {resourceTitle} herunterladen
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isSuccess
              ? "Vielen Dank! Ihr Download wird in Kürze starten."
              : "Bitte geben Sie Ihre Kontaktdaten ein, um den Download zu starten."}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative mb-4 w-full max-w-[200px] aspect-square">
              <Image src={getImageUrl() || "/placeholder.svg"} alt={resourceTitle} className="object-contain" fill />
              <div className="absolute -right-1 -bottom-1 bg-green-600 text-white rounded-full p-1">
                <Download className="h-4 w-4" />
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center">
              Falls der Download nicht automatisch startet,{" "}
              <button className="text-blue-600 hover:underline">klicken Sie hier</button>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image src={getImageUrl() || "/placeholder.svg"} alt={resourceTitle} className="object-contain" fill />
              </div>
              <div>
                <h3 className="font-medium">{resourceTitle}</h3>
                <p className="text-sm text-gray-500">
                  {resourceType === "template"
                    ? "Template"
                    : resourceType === "bestpractice"
                      ? "Best Practice"
                      : "Whitepaper"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Max Mustermann"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="max.mustermann@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Unternehmen</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Musterfirma GmbH"
                required
              />
            </div>
            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="marketing"
                checked={acceptMarketing}
                onCheckedChange={(checked) => setAcceptMarketing(checked as boolean)}
              />
              <Label htmlFor="marketing" className="text-sm font-normal leading-tight">
                Ich möchte regelmäßig über neue Templates, Best Practices und Schulungen informiert werden.
              </Label>
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Wird verarbeitet...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download starten
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
