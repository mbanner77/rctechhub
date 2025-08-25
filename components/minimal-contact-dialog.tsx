"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import ActionDialog from "./action-dialog"
import { analytics } from "@/lib/analytics"
import { sendFormConfirmationEmail, sendTeamNotificationEmail } from "@/lib/send-confirmation-email"

interface MinimalContactDialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  context?: string // Additional context to be sent with the email
  emailType?: string // Type of inquiry for email subject (default: "Kontakt")
}

export function MinimalContactDialog({ 
  isOpen, 
  onClose, 
  title = "Kontaktanfrage",
  description = "Füllen Sie das Formular aus, und wir melden uns zeitnah bei Ihnen.",
  context,
  emailType = "Kontakt"
}: MinimalContactDialogProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    phone: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    // Validierung
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Bitte füllen Sie alle Pflichtfelder aus",
        description: "Vorname, Nachname und E-Mail sind erforderlich.",
        variant: "destructive",
      })
      return
    }

    analytics.serviceClick('minimal-contact-form-submit', context || 'general')
    setIsSubmitting(true)

    try {
      // Send notification email to the RealCore team
      const fullName = `${formData.firstName} ${formData.lastName}`;
      const formDetails = {
        'Name': fullName,
        'E-Mail': formData.email,
        'Telefon': formData.phone || 'Nicht angegeben',
        'Firma': formData.company || 'Nicht angegeben',
        'Betreff': title,
        'Kontext': context || 'Allgemeine Anfrage'
      };
      
      const teamEmailSent = await sendTeamNotificationEmail(
        formData.email,
        fullName,
        emailType,
        formDetails
      );
      
      if (!teamEmailSent) {
        console.warn("Benachrichtigungs-E-Mail konnte nicht an das Team gesendet werden");
      }
      
      // Send confirmation email to the user
      const userEmailSent = await sendFormConfirmationEmail(
        formData.email,
        fullName,
        emailType
      );
      
      if (!userEmailSent) {
        console.warn("Bestätigungs-E-Mail konnte nicht an den Benutzer gesendet werden");
      }

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        phone: "",
      });

      toast({
        title: "Nachricht gesendet",
        description: "Vielen Dank für Ihre Nachricht. Wir werden uns in Kürze bei Ihnen melden.",
      })

      onClose()
    } catch (error) {
      console.error("Fehler beim Senden der Nachricht:", error)
      toast({
        title: "Fehler beim Senden",
        description: "Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ActionDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      actionLabel={isSubmitting ? "Wird gesendet..." : "Anfrage senden"}
      onAction={handleSubmit}
      disabled={isSubmitting}
    >
      <div className="space-y-4 px-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              Vorname <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Vorname"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">
              Nachname <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Nachname"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            E-Mail <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="ihre-email@beispiel.de"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Unternehmen</Label>
          <Input
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Unternehmen"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefonnummer</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+49 123 456789"
          />
        </div>

        {context && (
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Anfrage bezüglich:</strong> {context}
            </p>
          </div>
        )}

        <div className="text-sm text-gray-500">
          <span className="text-red-500">*</span> Pflichtfelder
        </div>
      </div>
    </ActionDialog>
  )
}

export default MinimalContactDialog
