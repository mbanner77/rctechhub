"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import ActionDialog from "./action-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { analytics } from "@/lib/analytics"
import { sendFormConfirmationEmail, sendTeamNotificationEmail } from "@/lib/send-confirmation-email"
import { type mailRequest } from "@/types/mail-request"

interface ContactDialogProps {
  isOpen: boolean
  onClose: () => void
  serviceTitle?: string
}

export function ContactDialog({ isOpen, onClose, serviceTitle }: ContactDialogProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    phone: "",
    subject: serviceTitle || "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    // Validierung
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      toast({
        title: "Bitte füllen Sie alle Pflichtfelder aus",
        description: "Vorname, Nachname, E-Mail und Nachricht sind erforderlich.",
        variant: "destructive",
      })
      return
    }

    analytics.serviceClick('contact-form-submit', formData.subject || 'general')
    setIsSubmitting(true)

    try {
      // Send notification email to the RealCore team
      const fullName = `${formData.firstName} ${formData.lastName}`;
      const formDetails = {
        'Name': fullName,
        'E-Mail': formData.email,
        'Telefon': formData.phone || 'Nicht angegeben',
        'Firma': formData.company || 'Nicht angegeben',
        'Betreff': formData.subject || 'Allgemeine Anfrage',
        'Nachricht': formData.message
      };
      
      const teamEmailSent = await sendTeamNotificationEmail(
        formData.email,
        fullName,
        'Kontakt',
        formDetails
      );
      
      if (!teamEmailSent) {
        console.warn("Benachrichtigungs-E-Mail konnte nicht an das Team gesendet werden");
      }
      
      // Send confirmation email to the user
      const userEmailSent = await sendFormConfirmationEmail(
        formData.email,
        fullName,
        'Kontakt'
      );
      
      if (!userEmailSent) {
        console.warn("Bestätigungs-E-Mail konnte nicht an den Benutzer gesendet werden");
      }

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
      title="Kontaktanfrage"
      description="Füllen Sie das Formular aus, und wir melden uns zeitnah bei Ihnen."
      actionLabel={isSubmitting ? "Wird gesendet..." : "Anfrage senden"}
      onAction={handleSubmit}
      disabled={isSubmitting}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 px-1">
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
          <div className="space-y-2 px-1">
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

        <div className="space-y-2 px-1">
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

        <div className="grid grid-cols-2 gap-4 px-1">
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
          <div className="space-y-2 px-1">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+49 123 456789"
            />
          </div>
        </div>

        <div className="space-y-2 px-1">
          <Label htmlFor="subject">Betreff</Label>
          <Input
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Betreff Ihrer Anfrage"
          />
        </div>

        <div className="space-y-2 px-1">
          <Label htmlFor="interest">Ich interessiere mich für</Label>
          <Select value={formData.subject} onValueChange={(value) => handleSelectChange("subject", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Bitte wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SAP BTP Beratung">SAP BTP Beratung</SelectItem>
              <SelectItem value="SAP BTP Architektur">SAP BTP Architektur</SelectItem>
              <SelectItem value="SAP CAP Entwicklung">SAP CAP Entwicklung</SelectItem>
              <SelectItem value="SAP Integration">SAP Integration</SelectItem>
              <SelectItem value="SAP Fiori Entwicklung">SAP Fiori Entwicklung</SelectItem>
              <SelectItem value="SAP BTP Schulung">SAP BTP Schulung</SelectItem>
              <SelectItem value="Digitale Standortbestimmung">Digitale Standortbestimmung</SelectItem>
              <SelectItem value="Sonstiges">Sonstiges</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 px-1">
          <Label htmlFor="message">Ihre Nachricht</Label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="w-full min-h-[120px] p-2 border rounded-md"
            placeholder="Wie können wir Ihnen helfen?"
          ></textarea>
        </div>

        <div className="text-sm text-gray-500">
          <span className="text-red-500">*</span> Pflichtfelder
        </div>
      </div>
    </ActionDialog>
  )
}

export default ContactDialog
