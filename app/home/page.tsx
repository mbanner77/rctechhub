"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import SearchFilters from "@/components/search-filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// Fügen Sie den Import für das Menu-Icon hinzu
import { MapPin, Phone, Mail, Linkedin, Instagram, Facebook, ArrowRight, BookOpen, Menu, XIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import InnovationFactory from "@/components/innovation-factory"
import KnowledgeHubGallery from "@/components/knowledge-hub-gallery"
import DigitalMaturityAssessment from "@/components/digital-maturity-assessment"
import ChallengeForm from "@/components/challenge-form"
import { useEffect, useRef, useState } from "react"
import AssessmentDialog from "@/components/assessment-dialog"
import WorkshopBookingDialog from "@/components/workshop-booking-dialog"
import PackageBuilderDialog from "@/components/package-builder-dialog"
import DownloadDialog from "@/components/download-dialog"
import LearnMoreDialog from "@/components/learn-more-dialog"
import TrainingCatalogDialog from "@/components/training-catalog-dialog"
import { useToast } from "@/hooks/use-toast"
import { sendFormConfirmationEmail, sendTeamNotificationEmail } from "@/lib/send-confirmation-email"

import DynamicServiceGrid from "@/components/dynamic-service-grid"
import DynamicWorkshopGrid from "@/components/dynamic-workshop-grid"
import DynamicBestPractices from "@/components/dynamic-best-practices"
import DynamicResources from "@/components/dynamic-resources"
import ConsultingPhasesDisplay from "@/components/consulting-phases-display"
import { StickyHeader } from "@/components/sticky-header"
import { EnhancedFooter } from "@/components/enhanced-footer"
import { analytics } from "@/lib/analytics"

export default function Home() {
  // search query "Beratungsangebote"
  const [query, setQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  // end of search query

  const [isAssessmentDialogOpen, setIsAssessmentDialogOpen] = useState(false)
  const [isWorkshopDialogOpen, setIsWorkshopDialogOpen] = useState(false)
  const [isPackageBuilderDialogOpen, setIsPackageBuilderDialogOpen] = useState(false)
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false)
  const [isLearnMoreDialogOpen, setIsLearnMoreDialogOpen] = useState(false)
  const [isTrainingCatalogDialogOpen, setIsTrainingCatalogDialogOpen] = useState(false)
  const { toast } = useToast()
  
  // Kontaktformular-States
  const [contactFormData, setContactFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    message: ""
  })
  const [isContactSubmitting, setIsContactSubmitting] = useState(false)
  const [isContactSubmitted, setIsContactSubmitted] = useState(false)
  const [selectedWorkshop, setSelectedWorkshop] = useState({
    title: "",
    duration: "",
    price: 0,
  })
  const [selectedResource, setSelectedResource] = useState({
    title: "",
    type: "whitepaper" as "template" | "bestpractice" | "whitepaper",
  })
  const [selectedBestPractice, setSelectedBestPractice] = useState({
    title: "",
    category: "",
  })
  // Fügen Sie den State für das mobile Menü hinzu
  // Fügen Sie diese Zeile zu den anderen useState-Deklarationen hinzu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Refs für die Scroll-Funktionalität
  const servicesRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to hackathon if arriving with hash
  useEffect(() => {
    const hashRaw = typeof window !== 'undefined' ? window.location.hash : ''
    const hash = hashRaw.toLowerCase()
    const smoothScrollById = (id: string) => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }

    // Hackathon anchors
    if (hash === '#hackathon' || hash === '#hackaton') {
      const doScroll = () => smoothScrollById('hackathon')
      doScroll()
      const t = setTimeout(doScroll, 300)
      return () => clearTimeout(t)
    }

    // Consulting Phases anchor (btp-konfigurator)
    if (hash === '#btp-konfigurator') {
      const doScroll = () => smoothScrollById('btp-konfigurator')
      doScroll()
      const t = setTimeout(doScroll, 300)
      return () => clearTimeout(t)
    }

    // Digitale Standortbestimmung anchor
    if (hash === '#standortbestimmung') {
      const doScroll = () => smoothScrollById('standortbestimmung')
      doScroll()
      const t = setTimeout(doScroll, 300)
      return () => clearTimeout(t)
    }

    // Knowledge Hub (Templates) anchor
    if (hash === '#templates') {
      const doScroll = () => smoothScrollById('templates')
      doScroll()
      const t = setTimeout(doScroll, 300)
      return () => clearTimeout(t)
    }
  }, [])

  // Open Training Catalog dialog if query parameter openTrainingskatalog=1 is present
  useEffect(() => {
    if (typeof window === 'undefined') return
    const search = window.location.search || ''
    if (!search) return
    const params = new URLSearchParams(search)
    const open = params.get('openTrainingskatalog')
    if (open === '1') {
      setIsTrainingCatalogDialogOpen(true)
    }
  }, [])

  const handleWorkshopClick = (title: string, duration: string, price: number) => {
    analytics.dialogOpen('workshop-booking', title)
    setSelectedWorkshop({ title, duration, price })
    setIsWorkshopDialogOpen(true)
  }

  const handleDownloadClick = (title: string, type: "template" | "bestpractice" | "whitepaper") => {
    analytics.dialogOpen('download', `${type}-${title}`)
    setSelectedResource({ title, type })
    setIsDownloadDialogOpen(true)
  }

  const handleLearnMoreClick = (title: string, category: string) => {
    analytics.dialogOpen('learn-more', `${category}-${title}`)
    setSelectedBestPractice({ title, category })
    setIsLearnMoreDialogOpen(true)
  }

  // Emit debounced analytics for search and filters
  useEffect(() => {
    const t = setTimeout(() => {
      if ((query || '').trim().length) {
        analytics.search(query)
      }
    }, 400)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    const t = setTimeout(() => {
      analytics.filtersChange(activeFilters)
    }, 300)
    return () => clearTimeout(t)
  }, [activeFilters])

  // Funktion zum Scrollen zu einem bestimmten Abschnitt
  const scrollToSection = (sectionRef: React.RefObject<HTMLDivElement | null>) => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleSubmitContactForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsContactSubmitting(true)
    
    // Store form reference before async operations
    const form = event.currentTarget
    
    try {
      const formData = new FormData(form)
      const firstName = formData.get('firstname') as string
      const lastName = formData.get('lastname') as string
      const email = formData.get('email') as string
      const company = formData.get('company') as string
      const message = formData.get('message') as string
      
      // Update form data state
      setContactFormData({
        firstName,
        lastName,
        email,
        company,
        message
      })
      
      // Validate required fields
      if (!firstName || !lastName || !email || !message) {
        toast({
          title: "Fehler beim Senden",
          description: "Bitte füllen Sie alle Pflichtfelder aus.",
          variant: "destructive",
        })
        setIsContactSubmitting(false)
        return
      }
      
      const userName = `${firstName} ${lastName}`
      
      // Send confirmation email to the user
      const userConfirmation = await sendFormConfirmationEmail(
        email,
        userName,
        "Kontaktformular"
      )
      
      // Notify the team
      const teamNotification = await sendTeamNotificationEmail(
        email,
        userName,
        "Kontaktformular",
        {
          "Vorname": firstName,
          "Nachname": lastName,
          "E-Mail": email,
          "Unternehmen": company || "Nicht angegeben",
          "Nachricht": message
        }
      )
      
      if (userConfirmation && teamNotification) {
        // Show success message
        toast({
          title: "Nachricht gesendet",
          description: "Ihre Nachricht wurde erfolgreich gesendet. Wir werden uns bald bei Ihnen melden.",
        })
        
        // Reset the form and state using the stored reference
        form.reset()
        setIsContactSubmitted(true)
        analytics.serviceClick('contact-form-submit', 'home-page')
      } else {
        throw new Error("Fehler beim Senden der E-Mails")
      }
    } catch (error) {
      console.error("Error submitting contact form:", error)
      toast({
        title: "Fehler beim Senden",
        description: "Es gab einen Fehler beim Senden Ihrer Nachricht. Bitte versuchen Sie es später noch einmal.",
        variant: "destructive",
      })
    } finally {
      setIsContactSubmitting(false)
    }
  }

  return (
    <div className="">
      <StickyHeader />
      <div className="min-h-screen bg-gray-50">

        {/* Ersetzen Sie den Header-Bereich mit dieser aktualisierten Version, die eine mobile Navigation enthält */}
        {/* <header className="bg-white shadow-sm">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <Image src="/images/rc-logo.png" alt="RealCore Logo" width={150} height={40} className="h-10 w-auto" />
              </Link> */}

        {/* Desktop Navigation */}
        {/* <nav className="hidden md:flex space-x-6">
                <Link href="/home" className="text-gray-800 font-medium hover:text-green-600">
                  Home
                </Link>
                <Link href="#services" className="text-gray-800 font-medium hover:text-green-600">
                  Beratungsangebote
                </Link>
                <Link href="#assessment" className="text-gray-800 font-medium hover:text-green-600">
                  Standortbestimmung
                </Link>
                <Link href="#workshops" className="text-gray-800 font-medium hover:text-green-600">
                  Workshops
                </Link>
                <Link href="#innovation" className="text-gray-800 font-medium hover:text-green-600">
                  Innovation Factory
                </Link>
                <Link href="#hackathon" className="text-gray-800 font-medium hover:text-green-600">
                  Hackathon
                </Link>
                <Link href="#templates" className="text-gray-800 font-medium hover:text-green-600">
                  Templates
                </Link>
                <Link href="#knowledge" className="text-gray-800 font-medium hover:text-green-600">
                  Knowledge Hub
                </Link>
                <Link href="#contact" className="text-gray-800 font-medium hover:text-green-600">
                  Kontakt
                </Link>
                <Link href="/btp-services" className="text-gray-800 font-medium hover:text-green-600">
                  BTP Services
                </Link>
              </nav> */}

        {/* Mobile Menu Button */}
        {/* <button
                className="md:hidden text-gray-800 focus:outline-none"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <XIcon className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div> */}

        {/* Mobile Navigation */}
        {/* {mobileMenuOpen && (
              <div className="md:hidden bg-white border-t py-2">
                <div className="container mx-auto px-4 space-y-2">
                  <Link
                    href="/home"
                    className="block py-2 text-gray-800 font-medium hover:text-green-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="#services"
                    className="block py-2 text-gray-800 font-medium hover:text-green-600"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      scrollToSection(servicesRef)
                    }}
                  >
                    Beratungsangebote
                  </Link>
                  <Link
                    href="#assessment"
                    className="block py-2 text-gray-800 font-medium hover:text-green-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Standortbestimmung
                  </Link>
                  <Link
                    href="#workshops"
                    className="block py-2 text-gray-800 font-medium hover:text-green-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Workshops
                  </Link>
                  <Link
                    href="#innovation"
                    className="block py-2 text-gray-800 font-medium hover:text-green-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Innovation Factory
                  </Link>
                  <Link
                    href="#hackathon"
                    className="block py-2 text-gray-800 font-medium hover:text-green-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Hackathon
                  </Link>
                  <Link
                    href="#templates"
                    className="block py-2 text-gray-800 font-medium hover:text-green-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Templates
                  </Link>
                  <Link
                    href="#knowledge"
                    className="block py-2 text-gray-800 font-medium hover:text-green-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Knowledge Hub
                  </Link>
                  <Link
                    href="#contact"
                    className="block py-2 text-gray-800 font-medium hover:text-green-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Kontakt
                  </Link>
                  <Link
                    href="/btp-services"
                    className="block py-2 text-gray-800 font-medium hover:text-green-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    BTP Services
                  </Link>
                </div>
              </div>
            )}
          </header> */}

        <div className="relative bg-[url('/images/gradient-export.png')] bg-cover bg-center text-white overflow-hidden py-20">
        <div className="flex absolute inset-0 divide-x divide-white/10">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-full h-full"></div>
          ))}
        </div>
          <div className="container mx-auto px-4 relative">
            <div className="flex flex-col md:min-h-[15vh] md:flex-row md:items-center justify-between">
              <div className="md:w-1/2 mb-8 md:mb-0 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">RealCore Tech Expertise</h1>
                <p className="text-xl mb-6">
                  Ihr Beratungsbaukasten für SAP, Open Source & Microsoft - alles aus einer Hand
                </p>
              </div>
              <div className="md:w-1/2 md:pl-8 flex flex-col items-center md:items-start">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-white text-green-700 hover:bg-gray-100"
                    onClick={() => scrollToSection(servicesRef)}
                  >
                    Angebote entdecken
                  </Button>
                  <Button
                    size="lg"
                    className="bg-gray-200 text-black hover:bg-gray-300 border-2 shadow-lg hover:shadow-xl transition-all"
                    onClick={() => setIsAssessmentDialogOpen(true)}
                  >
                    Standortbestimmung
                  </Button>
                </div>
                <div className="mt-5 flex items-center">
                  <div className="flex items-center space-x-2 text-xl font-semibold">
                    <span>Start Smart.</span>
                    <ArrowRight className="h-4 w-4" />
                    <span>Disrupt Fast.</span>
                    <ArrowRight className="h-4 w-4" />
                    <span>Evolve Always.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 py-8">
          <div id="services" ref={servicesRef} className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              RealCore-Tech Beratungsangebote zu Festpreisen
            </h1>
            <p className="text-lg text-gray-600">
              Entdecken Sie unsere technischen Beratungsangebote zu SAP, Open Source und Microsoft - alles aus einer Hand
            </p>
          </div>

          <div className="mb-8">
            <SearchFilters
              onSearchQueryChange={setQuery}
              onFiltersChange={setActiveFilters}
              filters={availableCategories}
            />
          </div>

          <DynamicServiceGrid
            searchQuery={query}
            filters={activeFilters}
            onCategoriesChange={setAvailableCategories}
          />



          <div id="standortbestimmung" className="sr-only" />
          <div id="assessment" className="mt-20 mb-16">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Digitale Standortbestimmung</h2>
              <p className="text-lg text-gray-600">
                Ermitteln Sie den Digitalisierungsgrad Ihrer SAP-Landschaft mit unserer wissenschaftlich fundierten
                Methodik
              </p>
            </div>

            <DigitalMaturityAssessment />
          </div>

          <div id="workshops" className="mt-20 mb-16">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Workshops & Beratungsansatz</h2>
              <p className="text-lg text-gray-600">
                Unser digital moderierter Beratungsansatz mit maßgeschneiderten Workshops
              </p>
            </div>

            <DynamicWorkshopGrid />
            <div id="btp-konfigurator" className="mt-16">
              <ConsultingPhasesDisplay />
            </div>
          </div>

          <div id="innovation" className="mt-20 mb-16">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Innovation Factory</h2>
              <p className="text-lg text-gray-600">
                Die SAP BTP ist für uns die ideale Basis, um Ihre Use Cases in die Cloud zu bringen
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <p className="mb-6">
                In Kombination mit unserem bewährten end-to-end Ansatz entstehen schnell und skalierbar Lösungen, die
                überzeugen. Denn wir hören dem Nutzer erstmal zu und stellen somit sicher, dass Sie auch wirklich Ihre
                größten Herausforderungen auf die richtige Art und Weise angehen.
              </p>
            </div>

            <InnovationFactory />

            <div id="hackathon" className="mt-16">
              <h3 className="text-2xl font-bold text-center mb-6">Hackathon Challenge</h3>
              <ChallengeForm />
            </div>
          </div>

          <div id="templates" className="mt-20 mb-16">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Knowledge Hub</h2>
              <p className="text-lg text-gray-600">
                Beschleunigen Sie Ihre Projekte mit unseren vorgefertigten Templates und bewährten Best Practices
              </p>
            </div>

            <KnowledgeHubGallery />
          </div>

          {/* <div id="knowledge" className="mt-20 mb-16">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Knowledge Hub</h2>
              <p className="text-lg text-gray-600">Schulungen, Best Practices und Know-How rund um die SAP BTP</p>
            </div>

            <Tabs defaultValue="schulungen" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="schulungen">Schulungen</TabsTrigger>
                <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
                <TabsTrigger value="ressourcen">Ressourcen</TabsTrigger>
              </TabsList>

              <TabsContent value="schulungen" className="mt-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <BookOpen className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-600">Online-Kurs</span>
                      </div>
                      <h3 className="text-lg font-bold mb-2">SAP BTP Grundlagen</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Einführung in die SAP Business Technology Platform und ihre Komponenten.
                      </p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Dauer: 4 Stunden</span>
                        <span className="font-medium">490 €</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <BookOpen className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-600">Workshop</span>
                      </div>
                      <h3 className="text-lg font-bold mb-2">SAP CAP Entwicklung</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Hands-on Training zur Entwicklung mit dem SAP Cloud Application Programming Model.
                      </p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Dauer: 2 Tage</span>
                        <span className="font-medium">1.490 €</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <BookOpen className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-600">Webinar</span>
                      </div>
                      <h3 className="text-lg font-bold mb-2">SAP Integration Suite</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Überblick über die Integrationsszenarien und -tools der SAP Integration Suite.
                      </p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Dauer: 2 Stunden</span>
                        <span className="font-medium">Kostenlos</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 text-center">
                  <Button variant="outline" className="mr-2" onClick={() => setIsTrainingCatalogDialogOpen(true)}>
                    Alle Schulungen anzeigen
                  </Button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    onClick={() => {
                      setSelectedResource({
                        title: "Schulungskatalog",
                        type: "whitepaper",
                      })
                      setIsDownloadDialogOpen(true)
                    }}
                  >
                    Schulungskatalog herunterladen
                  </button>
                </div>
              </TabsContent>

              <TabsContent value="best-practices" className="mt-6">
                <DynamicBestPractices />
              </TabsContent>

              <TabsContent value="ressourcen" className="mt-6">
                <DynamicResources />
              </TabsContent>
            </Tabs>
          </div> */}

          <div id="contact" className="max-w-4xl mx-auto mt-20 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Kontaktieren Sie uns</h2>
            <p className="text-center mb-8">
              Haben Sie Fragen zu unseren Angeboten? Unser Expertenteam steht Ihnen gerne zur Verfügung.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <form className="space-y-4" onSubmit={handleSubmitContactForm}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstname">Vorname</Label>
                      <Input 
                        id="firstname" 
                        name="firstname" 
                        placeholder="Vorname" 
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastname">Nachname</Label>
                      <Input 
                        id="lastname" 
                        name="lastname" 
                        placeholder="Nachname" 
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">E-Mail</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="ihre-email@beispiel.de" 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Unternehmen</Label>
                    <Input 
                      id="company" 
                      name="company" 
                      placeholder="Unternehmen" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Nachricht</Label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      className="w-full p-2 border rounded-md"
                      placeholder="Wie können wir Ihnen helfen?"
                      required
                    ></textarea>
                  </div>
                  <Button 
                    className="w-full" 
                    type="submit"
                    disabled={isContactSubmitting}
                  >
                    {isContactSubmitting ? "Wird gesendet..." : "Nachricht senden"}
                  </Button>
                </form>
              </div>
              <div className="flex flex-col justify-center">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4">RealCore GmbH</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 mr-3 text-green-600 mt-0.5" />
                      <span>
                        Im Welterbe 2
                        <br />
                        45141 Essen
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 mr-3 text-green-600" />
                      <span>+49 201 486 399 80</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 mr-3 text-green-600" />
                      <span>techhub@realcore.de</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Folgen Sie uns</h4>
                    <div className="flex space-x-4">
                      <a href="https://linkedin.com/company/realcore-group-gmbh" className="text-gray-600 hover:text-green-600">
                        <Linkedin className="w-6 h-6" />
                      </a>
                      <a href="https://www.facebook.com/RealCoreGroup" className="text-gray-600 hover:text-green-600">
                        <Facebook className="w-6 h-6" />
                      </a>
                      <a href="https://instagram.com/realcoregroupgmbh/" className="text-gray-600 hover:text-green-600">
                        <Instagram className="w-6 h-6" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <EnhancedFooter />

        {/* Dialoge */}
        <AssessmentDialog isOpen={isAssessmentDialogOpen} onClose={() => setIsAssessmentDialogOpen(false)} />

        <WorkshopBookingDialog
          isOpen={isWorkshopDialogOpen}
          onClose={() => setIsWorkshopDialogOpen(false)}
          workshop={{
            title: selectedWorkshop.title,
            duration: selectedWorkshop.duration,
            price: selectedWorkshop.price
          }}
        />

        <PackageBuilderDialog isOpen={isPackageBuilderDialogOpen} onClose={() => setIsPackageBuilderDialogOpen(false)} />

        <DownloadDialog
          isOpen={isDownloadDialogOpen}
          onClose={() => setIsDownloadDialogOpen(false)}
          resourceTitle={selectedResource.title}
          resourceType={selectedResource.type}
        />

        <LearnMoreDialog
          isOpen={isLearnMoreDialogOpen}
          onClose={() => setIsLearnMoreDialogOpen(false)}
          title={selectedBestPractice.title}
          category={selectedBestPractice.category}
          onDownload={() => {
            setIsLearnMoreDialogOpen(false)
            setTimeout(() => {
              handleDownloadClick(`${selectedBestPractice.title} Whitepaper`, "whitepaper")
            }, 100)
          }}
        />

        <TrainingCatalogDialog
          isOpen={isTrainingCatalogDialogOpen}
          onClose={() => setIsTrainingCatalogDialogOpen(false)}
        />
      </div>
    </div>
  )
}
