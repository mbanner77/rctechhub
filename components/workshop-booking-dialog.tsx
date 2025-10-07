"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  CalendarIcon,
  Users,
  Lightbulb,
  CalendarPlus2Icon as CalendarIcon2,
  BookOpen,
  Code,
  Settings,
} from "lucide-react"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { sendFormConfirmationEmail, sendTeamNotificationEmail } from "@/lib/send-confirmation-email"
import { useSiteConfig } from "@/hooks/use-site-config"
import { formatCurrency } from "@/lib/currency"

// Hilfsfunktion zum Rendern des Icons basierend auf dem Icon-Namen
const renderIcon = (iconName: string) => {
  switch (iconName) {
    case "Users":
      return <Users className="h-6 w-6 text-green-600" />
    case "Lightbulb":
      return <Lightbulb className="h-6 w-6 text-green-600" />
    case "Calendar":
      return <CalendarIcon2 className="h-6 w-6 text-green-600" />
    case "BookOpen":
      return <BookOpen className="h-6 w-6 text-green-600" />
    case "Code":
      return <Code className="h-6 w-6 text-green-600" />
    case "Settings":
      return <Settings className="h-6 w-6 text-green-600" />
    default:
      return <Users className="h-6 w-6 text-green-600" />
  }
}

export function WorkshopBookingDialog({ isOpen, onClose, workshop }) {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { config } = useSiteConfig()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create form details for team notification email
      const formDetails: Record<string, string> = {
        'Name': name,
        'E-Mail': email,
        'Unternehmen': company || 'Nicht angegeben',
        'Workshop': workshop?.title || 'Unbekannt',
        'Datum': date ? format(date, 'PPP', { locale: de }) : 'Nicht angegeben',
        'Nachricht': message || 'Keine Nachricht',
        'Preis': workshop?.price ? `${formatCurrency(Number(workshop.price || 0), config.currency)}` : 'Nicht angegeben'
      };
      
      // Send notification email to the team
      const teamEmailSent = await sendTeamNotificationEmail(
        email,
        name,
        'Workshop',
        formDetails
      );
      
      if (!teamEmailSent) {
        console.warn("Team-Benachrichtigungsmail konnte nicht gesendet werden");
      }
      
      // Create content for user confirmation email
      const confirmationContent = `
        Ihre Anfrage für den folgenden Workshop ist bei uns eingegangen:
        <br/><br/>
        <strong>${workshop?.title}</strong><br/>
        ${workshop?.description || ''}<br/><br/>
        <strong>Gewünschtes Datum:</strong> ${date ? format(date, 'PPP', { locale: de }) : 'Nicht angegeben'}<br/>
        <strong>Preis:</strong> ${workshop?.price ? `${formatCurrency(Number(workshop.price || 0), config.currency)}` : 'Nicht angegeben'}
      `;
      
      // Send confirmation email to the user
      const userEmailSent = await sendFormConfirmationEmail(
        email,
        name,
        'Workshop',
        confirmationContent
      );
      
      if (!userEmailSent) {
        console.warn("Bestätigungsmail konnte nicht an den Benutzer gesendet werden");
      }
      
      toast({
        title: "Workshop-Anfrage gesendet",
        description: `Ihre Anfrage für den Workshop "${workshop?.title}" wurde erfolgreich gesendet.`,
      })

      // Formular zurücksetzen
      setDate(undefined)
      setName("")
      setEmail("")
      setCompany("")
      setMessage("")

      // Dialog schließen
      onClose()
    } catch (error) {
      console.error("Fehler beim Senden der Workshop-Anfrage:", error)
      toast({
        title: "Fehler",
        description: "Beim Senden Ihrer Anfrage ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!workshop) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              {renderIcon(workshop.icon)}
            </div>
            {workshop.title}
          </DialogTitle>
          <DialogDescription>{workshop.description}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex items-center">
            <span className="font-medium mr-2">Dauer:</span> {workshop.duration}
          </div>
          <div className="flex items-center">
            <span className="font-medium mr-2">Preis:</span> {typeof workshop.price === 'number' && workshop.price > 0 ? formatCurrency(Number(workshop.price || 0), config.currency) : 'Kostenlos'}
          </div>
        </div>

        {workshop.benefits && workshop.benefits.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">Vorteile:</h4>
            <ul className="list-disc pl-5">
              {workshop.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Gewünschtes Datum</Label>
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: de }) : "Datum auswählen"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  modifiers={{
                    past: { before: new Date(
                        new Date().getFullYear(),
                        new Date().getMonth(),
                        new Date().getDate() + 1
                    ) },
                    weekend: (date) => date.getDay() === 0 || date.getDay() === 6,
                  }}
                  modifiersClassNames={{
                    past: "text-gray-400",
                    weekend: "text-gray-400",
                  }}
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => {
                    setDate(selectedDate)
                    setDatePopoverOpen(false)
                  } }
                  disabled={[
                    (date) => date < new Date(),
                    (date) => date.getDay() === 0 || date.getDay() === 6,
                  ]}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Unternehmen</Label>
            <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Nachricht (optional)</Label>
            <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Wird gesendet..." : "Workshop anfragen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default WorkshopBookingDialog
