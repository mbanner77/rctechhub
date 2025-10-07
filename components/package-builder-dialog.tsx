"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import ActionDialog from "./action-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Check, Mail, Phone } from "lucide-react"
import { analytics } from "@/lib/analytics"
import { useSiteConfig } from "@/hooks/use-site-config"
import { formatCurrency } from "@/lib/currency"
import { sendFormConfirmationEmail, sendTeamNotificationEmail } from "@/lib/send-confirmation-email"
import type { IService } from "@/types/service"
 

interface PackageBuilderDialogProps {
  isOpen: boolean
  onClose: () => void
}

interface ServiceOption {
  id: string
  name: string
  description: string
  price: number
  category: string
  phase: number
}

export default function PackageBuilderDialog({ isOpen, onClose }: PackageBuilderDialogProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  })
  const [step, setStep] = useState(1)
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState<boolean>(false)
  const { config } = useSiteConfig()

  const toggleService = (serviceId: string) => {
    const service = serviceOptions.find(s => s.id === serviceId)
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId))
      analytics.serviceClick(service?.name || serviceId, 'package-builder-deselect')
    } else {
      setSelectedServices([...selectedServices, serviceId])
      analytics.serviceClick(service?.name || serviceId, 'package-builder-select')
    }
  }

  // Load consulting services from DB when dialog opens
  useEffect(() => {
    const fetchServices = async () => {
      setIsLoadingServices(true)
      try {
        const res = await fetch(`/api/unified-data/services`, { cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: IService[] = await res.json()
        // Map DB services to dialog options
        const mapped: ServiceOption[] = (data || [])
          .filter(s => typeof s.phase === 'number' && s.title)
          .map((s) => ({
            id: s.id,
            name: s.title,
            description: s.description,
            price: s.price,
            category: s.category,
            phase: s.phase,
          }))
        setServiceOptions(mapped)
      } catch (err) {
        console.error("Fehler beim Laden der Beratungsangebote:", err)
        toast({
          title: "Services konnten nicht geladen werden",
          description: "Bitte versuchen Sie es später erneut.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingServices(false)
      }
    }
    if (isOpen) {
      fetchServices()
    }
  }, [isOpen, toast])

  const handleToggleService = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId))
    } else {
      setSelectedServices([...selectedServices, serviceId])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setContactInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleNext = async () => {
    if (step === 1 && selectedServices.length === 0) {
      toast({
        title: "Bitte wählen Sie mindestens einen Service",
        description: "Um fortzufahren, müssen Sie mindestens einen Service auswählen.",
        variant: "destructive",
      })
      return
    }

    if (step === 2) {
      if (!contactInfo.name || !contactInfo.email) {
        toast({
          title: "Bitte füllen Sie die Pflichtfelder aus",
          description: "Name und E-Mail sind erforderlich.",
          variant: "destructive",
        })
        return
      }

      // Setze den Ladezustand
      setIsSubmitting(true)

      try {
        // Sammle die ausgewählten Services für die Anfrage
        const selectedServiceDetails = selectedServices.map((serviceId) => {
          const service = serviceOptions.find((s) => s.id === serviceId)
          return {
            id: service?.id,
            name: service?.name,
            price: service?.price,
          }
        })

        // Erstelle das Anfrageobjekt
        const requestData = {
          contact: contactInfo,
          services: selectedServiceDetails,
          totalPrice: calculateTotalPrice(),
          requestDate: new Date().toISOString(),
        }

        // Create form details for team notification email
        const formDetails: Record<string, string> = {
          'Name': contactInfo.name,
          'E-Mail': contactInfo.email,
          'Unternehmen': contactInfo.company || 'Nicht angegeben',
          'Telefon': contactInfo.phone || 'Nicht angegeben',
          'Nachricht': contactInfo.notes || 'Keine Nachricht'
        };
        
        // Add selected services to form details
        selectedServiceDetails.forEach((service, index) => {
          if (service.name && service.price) {
            formDetails[`Service ${index + 1}`] = `${service.name} - ${formatCurrency(Number(service.price || 0), config.currency)}`;
          }
        });
        formDetails['Gesamtpreis'] = `${formatCurrency(calculateTotalPrice(), config.currency)}`;
        
        // Send notification email to the team
        const teamEmailSent = await sendTeamNotificationEmail(
          contactInfo.email,
          contactInfo.name,
          'Beratungsbaukasten',
          formDetails
        );
        
        if (!teamEmailSent) {
          console.warn("Team-Benachrichtigungsmail konnte nicht gesendet werden");
        }
        
        // Create content for user confirmation email
        const servicesList = selectedServiceDetails
          .map(service => service.name && service.price ? 
            `<li>${service.name} - ${formatCurrency(Number(service.price || 0), config.currency)}</li>` : '')
          .join('');
          
        const confirmationContent = `
          Ihre Anfrage für das folgende individuelle Beratungspaket ist bei uns eingegangen:
          <ul>
            ${servicesList}
          </ul>
          <p><strong>Gesamtpreis:</strong> ${formatCurrency(calculateTotalPrice(), config.currency)}</p>
        `;
        
        // Send confirmation email to the user
        const userEmailSent = await sendFormConfirmationEmail(
          contactInfo.email,
          contactInfo.name,
          'Beratungsbaukasten',
          confirmationContent
        );
        
        if (!userEmailSent) {
          console.warn("Bestätigungsmail konnte nicht an den Benutzer gesendet werden");
        }
        
        console.log("Anfrage wird gesendet:", requestData);
        
        // Erfolgreiche Anfrage
        toast({
          title: "Anfrage erfolgreich gesendet",
          description: "Vielen Dank für Ihre Anfrage. Wir werden uns in Kürze bei Ihnen melden.",
        })

        // Zurücksetzen und Dialog schließen
        resetForm()
        onClose()
      } catch (error) {
        console.error("Fehler beim Senden der Anfrage:", error)
        toast({
          title: "Fehler beim Senden der Anfrage",
          description: "Bitte versuchen Sie es später erneut oder kontaktieren Sie uns direkt.",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }

      return
    }

    setStep(step + 1)
  }

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const calculateTotalPrice = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = serviceOptions.find((s) => s.id === serviceId)
      return total + (service?.price || 0)
    }, 0)
  }

  const renderServiceSelection = () => {
    if (isLoadingServices) {
      return (
        <div className="flex items-center justify-center h-40 text-sm text-gray-600">
          Services werden geladen...
        </div>
      )
    }

    if (!serviceOptions.length) {
      return (
        <div className="flex items-center justify-center h-40 text-sm text-gray-600">
          Keine Beratungsangebote gefunden.
        </div>
      )
    }
    // Gruppiere Services nach Phase
    const servicesByPhase: Record<number, ServiceOption[]> = {}
    serviceOptions.forEach((service) => {
      if (!servicesByPhase[service.phase]) {
        servicesByPhase[service.phase] = []
      }
      servicesByPhase[service.phase].push(service)
    })

    const phases = Object.keys(servicesByPhase).map(Number).sort()

    return (
      <div className="space-y-6 overflow-y-auto overflow-x-hidden max-h-[50vh]">
        {phases.map((phase) => (
          <div key={phase} className="space-y-3 relative">
            <h3 className="font-medium sticky top-0 bg-background z-10 py-3 px-0 mb-4 border-b shadow-sm">
              Phase {phase}:{" "}
              {phase === 1 ? "Analyse" : phase === 2 ? "Design" : phase === 3 ? "Implementierung" : "Go-Live"}
            </h3>
            <div className="space-y-3 mt-8">
              {servicesByPhase[phase].map((service) => (
                <Card
                  key={service.id}
                  className={`transition-colors w-full ${
                    selectedServices.includes(service.id) 
                      ? "border-green-500 bg-green-50 shadow-md" 
                      : "hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start">
                      <Checkbox
                        id={service.id}
                        checked={selectedServices.includes(service.id)}
                        onCheckedChange={() => handleToggleService(service.id)}
                        className="mt-1 flex-shrink-0"
                      />
                      <div className="ml-3 flex-1 min-w-0 w-full">
                        <Label htmlFor={service.id} className="font-medium cursor-pointer text-sm sm:text-base break-words w-full">
                          {service.name}
                        </Label>
                        <p className="text-xs sm:text-sm text-gray-600 break-words w-full overflow-hidden">{service.description}</p>
                        <div className="flex flex-wrap gap-2 justify-between items-center mt-3 w-full">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded truncate">{service.category}</span>
                          <span className="font-medium text-sm sm:text-base whitespace-nowrap font-bold">{formatCurrency(Number(service.price || 0), config.currency)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-white p-4 rounded-lg sticky bottom-0 border-t border-gray-200 shadow-md mt-6 z-20">
          <div className="flex justify-between items-center">
            <span className="font-medium">Ausgewählte Services:</span>
            <span className="font-semibold">{selectedServices.length}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="font-medium">Gesamtpreis:</span>
            <span className="text-lg font-bold text-green-700">{formatCurrency(calculateTotalPrice(), config.currency)}</span>
          </div>
        </div>
      </div>
    )
  }

  const renderContactForm = () => {
    return (
      <div className="space-y-4 overflow-x-hidden">
        <div className="bg-gray-50 p-4 rounded-lg mb-4 overflow-y-auto overflow-x-hidden max-h-[30vh] sm:max-h-fit">
          <h3 className="font-medium mb-3 sticky top-0 bg-gray-50 py-2 z-10 border-b">Ihre Auswahl</h3>
          <div className="pt-1">
            <ul className="space-y-2 text-sm">
              {selectedServices.map((serviceId) => {
                const service = serviceOptions.find((s) => s.id === serviceId)
                return service ? (
                  <li key={serviceId} className="flex items-start">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="break-words">{service.name}</span>
                  </li>
                ) : null
              })}
            </ul>
          </div>
          <div className="flex justify-between items-center mt-4 font-medium sticky bottom-0 bg-gray-50 py-2 z-10 border-t">
            <span>Gesamtpreis:</span>
            <span className="font-bold">{formatCurrency(calculateTotalPrice(), config.currency)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="block mb-1">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={contactInfo.name}
              onChange={handleInputChange}
              placeholder="Ihr Name"
              required
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="email" className="block mb-1">
              E-Mail <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={contactInfo.email}
              onChange={handleInputChange}
              placeholder="ihre-email@beispiel.de"
              required
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone" className="block mb-1">Telefon</Label>
            <Input
              id="phone"
              name="phone"
              value={contactInfo.phone}
              onChange={handleInputChange}
              placeholder="+49 123 456789"
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="company" className="block mb-1">Unternehmen</Label>
            <Input
              id="company"
              name="company"
              value={contactInfo.company}
              onChange={handleInputChange}
              placeholder="Ihr Unternehmen"
              className="w-full"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notes" className="block mb-1">Nachricht</Label>
          <textarea
            id="notes"
            name="notes"
            value={contactInfo.notes}
            onChange={handleInputChange}
            className="w-full min-h-[100px] p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Weitere Informationen oder Anforderungen..."
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-600 pt-2">
          <div className="flex items-center mb-2 sm:mb-0">
            <Phone className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>+49 123 456789</span>
          </div>
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>techhub@realcore.de</span>
          </div>
        </div>
      </div>
    )
  }

  const resetForm = () => {
    setSelectedServices([])
    setContactInfo({
      name: "",
      email: "",
      phone: "",
      company: "",
      notes: "",
    })
    setStep(1)
  }

  return (
    <ActionDialog
      isOpen={isOpen}
      onClose={onClose}
      title={step === 1 ? "Individuelles Beratungspaket zusammenstellen" : "Kontaktinformationen"}
      description={
        step === 1
          ? "Wählen Sie die gewünschten Services für Ihr maßgeschneidertes Beratungspaket."
          : "Bitte geben Sie Ihre Kontaktdaten an, damit wir Ihnen ein Angebot erstellen können."
      }
    >
      <div className="space-y-4 overflow-x-hidden w-full">
        {step === 1 ? renderServiceSelection() : renderContactForm()}

        <div className="flex justify-between pt-5 pb-2 flex-wrap gap-3 sm:flex-nowrap mt-4 border-t w-full">
          {step > 1 ? (
            <Button variant="outline" onClick={handlePrevious} className="min-w-[100px]">
              Zurück
            </Button>
          ) : (
            <Button variant="outline" onClick={onClose} className="min-w-[100px]">
              Abbrechen
            </Button>
          )}
          <Button 
            onClick={handleNext} 
            className="bg-green-600 hover:bg-green-700 ml-auto min-w-[140px] font-medium" 
            disabled={isSubmitting}
          >
            {step === 2 ? (
              isSubmitting ? (
                <>
                  <span className="mr-2">Wird gesendet...</span>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </>
              ) : (
                "Anfrage senden"
              )
            ) : (
              <>
                Weiter
                <ArrowRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </ActionDialog>
  )
}
