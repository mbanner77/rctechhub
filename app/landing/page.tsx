"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, ChevronRight, Briefcase, Code, Layers, Zap, Award, Clock, CheckCircle, MapPin, Phone, Mail, Facebook, Linkedin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getClientLandingPage } from "@/lib/client-data-service"
import { defaultLandingPage } from "@/data/landing-page-data"
import type { ILandingPageData } from "@/types/landing-page"
import { StickyHeader } from "@/components/sticky-header"
import { BackToTop } from "@/components/back-to-top"
import { EnhancedFooter } from "@/components/enhanced-footer"
import { PathfinderUnits } from "@/components/pathfinder-units"
import StarterPackages from "@/components/starter-packages"
import { analytics } from "@/lib/analytics"
import { useRouter } from "next/navigation"
import { sendFormConfirmationEmail, sendTeamNotificationEmail } from "@/lib/send-confirmation-email"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ImageWithFallback } from "@/components/ui/image-with-fallback"

// Hilfsfunktion zum Rendern von Icons basierend auf dem Namen
const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const iconMap: Record<string, React.ReactNode> = {
    Briefcase: <Briefcase className={className} />,
    Code: <Code className={className} />,
    Layers: <Layers className={className} />,
    Zap: <Zap className={className} />,
    Award: <Award className={className} />,
    Clock: <Clock className={className} />,
    CheckCircle: <CheckCircle className={className} />,
    ArrowRight: <ArrowRight className={className} />,
    ChevronRight: <ChevronRight className={className} />,
  }

  return <>{iconMap[name] || <Briefcase className={className} />}</>
}

export default function LandingPage() {
  const [landingPage, setLandingPage] = useState<ILandingPageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [isContactSubmitting, setIsContactSubmitting] = useState(false)
  const [isContactSubmitted, setIsContactSubmitted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Handle contact form submission
  const handleContactSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
        "Kontaktformular - Landing Page"
      )
      
      // Notify the team
      const teamNotification = await sendTeamNotificationEmail(
        email,
        userName,
        "Kontaktformular - Landing Page",
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
        analytics.serviceClick('contact-form-submit', 'landing-page')
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

  // Hash-based smooth scrolling with retries for dynamically mounted sections
  useEffect(() => {
    const scrollWithOffset = (el: HTMLElement) => {
      const header = document.querySelector('header') as HTMLElement | null
      const headerH = header?.offsetHeight ?? 88
      const y = el.getBoundingClientRect().top + window.scrollY - (headerH + 8)
      window.scrollTo({ top: y, behavior: 'smooth' })
    }

    const scrollToId = (id: string) => {
      const attempts = [0, 150, 400, 800]
      attempts.forEach((delay) => {
        setTimeout(() => {
          const el = document.getElementById(id)
          if (el) {
            console.log(`[LANDING] Scrolling to #${id} (delay ${delay}ms)`) 
            scrollWithOffset(el)
          }
        }, delay)
      })
    }

    const handleHashChange = () => {
      const hash = window.location.hash
      console.log("[LANDING] Hash changed:", hash)
      if (hash === '#contact') scrollToId('contact')
      if (hash === '#pathfinder') scrollToId('pathfinder')
    }

    window.addEventListener('hashchange', handleHashChange)
    if (window.location.hash) {
      console.log("[LANDING] Initial hash:", window.location.hash)
      handleHashChange()
    }
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const loadLandingPage = useCallback(async () => {
    console.log("[LANDING] loadLandingPage aufgerufen")
    setIsLoading(true)
    try {
      const data = await getClientLandingPage()
      console.log("[LANDING] Landingpage geladen:", data)
      setLandingPage(data)
    } catch (error) {
      console.error("[LANDING] Fehler beim Laden der Landing Page:", error)
      setLandingPage(JSON.parse(JSON.stringify(defaultLandingPage)))
    } finally {
      setIsLoading(false)
    }
  }, [])

    // Manuelles Neuladen der Daten
  const handleRefresh = () => {
    console.log("[LANDING] Manuelles Neuladen der Daten")
    loadLandingPage()
  }

  useEffect(() => {
    loadLandingPage()
  }, [loadLandingPage])

  if (isLoading || !landingPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-2xl">Lade Inhalte...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <StickyHeader />

      {/* Debug-Button (nur in Entwicklungsumgebung) */}
      {process.env.NODE_ENV === "development" && (
        <button
          onClick={handleRefresh}
          className="fixed bottom-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-md shadow-md"
        >
          Daten neu laden
        </button>
      )}

      {/* Hero Section */}
      <section className="relative text-white overflow-hidden hero-section">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/gradient-export.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'scroll'
          }}
        />
        <div className="flex absolute inset-0 divide-x divide-white/10 z-10">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-full h-full"></div>
          ))}
        </div>

        {/* Mobile: Image stacks on top with negative margin */}
        <div className="block md:hidden w-full h-[25vh] relative -mt-[12.5vh] z-20">
          <Image
            src={"/images/core-hero.webp"}
            alt="Hero Illustration"
            width={2000}
            height={1000}
            className="w-full h-full object-cover"
            priority
          />
        </div>

        {/* Desktop: Image takes right side */}
        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-3/5 z-20">
          <Image
            src={"/images/core-hero.webp"}
            alt="Hero Illustration" 
            width={2000}
            height={1000}
            className="h-full w-full object-cover"
            priority
          />
        </div>

        <div className="container mx-auto px-4 relative z-20 md:flex md:items-center max-md:mb-12 md:h-[50vh]">
          <div className="flex flex-col md:flex-row items-center -mt-8 md:mt-0">
            <div className="w-full md:w-2/5 text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 leading-tight">{landingPage.hero.title}</h1>
              <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6 text-gray-100 leading-relaxed">{landingPage.hero.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
                <Link href="/home">
                  <button 
                    onClick={() => analytics.serviceClick('hero-button', 'navigation')}
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-md px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium bg-gray-200 hover:bg-gray-300 text-black h-10 sm:h-12 transition-all duration-200"
                  >
                    {landingPage.hero.secondaryButtonText}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards - auf mobilen Geräten ausgeblendet */}
      <section className="hidden sm:block py-10 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
              Warum RealCore Ihr optimaler Technologiepartner ist
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
              Mit über 15 Jahren Erfahrung in der Entwicklung und Integration von Unternehmenslösungen bieten wir
              technologieübergreifende Expertise, die messbare Ergebnisse liefert.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {landingPage.featureCards.map((feature) => (
              <Card key={feature.id} className="border-t-4 border-t-green-600 hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-4 sm:p-6">
                  <div className="bg-green-100 text-green-600 p-2 sm:p-3 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-3 sm:mb-4">
                    <DynamicIcon name={feature.icon} className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-10 sm:py-12 md:py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{landingPage.technologySection.title}</h2>
              <p className="text-gray-700 mb-4 sm:mb-6 text-base sm:text-lg">
                {landingPage.technologySection.subtitle}
              </p>
              <div className="space-y-3 sm:space-y-4">
                {landingPage.technologySection.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">{feature.title}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/home">
                <button 
                  onClick={() => analytics.serviceClick('technology-section-button', 'navigation')}
                  className="mt-6 sm:mt-8 inline-flex items-center justify-center rounded-md px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-gray-200 hover:bg-gray-300 text-black h-8 sm:h-10"
                >
                  {landingPage.technologySection.buttonText}
                  <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </Link>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="w-full max-w-md relative">
                <ImageWithFallback
                  src={landingPage.technologySection.image}
                  alt="Technology Expertise"
                  width={500}
                  height={400}
                  className="rounded-lg shadow-xl max-w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="py-10 sm:py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-12">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{landingPage.approachSection.title}</h2>
              <p className="text-gray-700 mb-4 sm:mb-6 text-base sm:text-lg">{landingPage.approachSection.subtitle}</p>
              <div className="space-y-3 sm:space-y-4">
                {landingPage.approachSection.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">{feature.title}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/home?packageType=starter-package#services" passHref>
                <button 
                  onClick={() => analytics.serviceClick('approach-section-button', 'navigation')}
                  className="mt-6 sm:mt-8 inline-flex items-center justify-center rounded-md px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-gray-200 hover:bg-gray-300 text-black h-8 sm:h-10"
                >
                  {landingPage.approachSection.buttonText}
                  <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </Link>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative rounded-lg overflow-hidden shadow-xl w-full max-w-md">
                <ImageWithFallback
                  src={landingPage.approachSection.image}
                  fallbackSrc="/images/modular-consulting.png"
                  alt="Our Approach"
                  width={500}
                  height={400}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <div className="p-4 sm:p-6 text-white">
                    <p className="text-base sm:text-lg font-semibold">"Start Smart. Disrupt Fast. Evolve Always."</p>
                    <p className="text-xs sm:text-sm opacity-80">
                      Unser Motto für erfolgreiche digitale Transformation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Innovation Section */}
      {/* <section className="py-10 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-12">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <Image
                src="/images/innovation-workshop.png"
                alt="Innovation Factory"
                width={500}
                height={400}
                className="rounded-lg shadow-xl max-w-full h-auto"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{landingPage.innovationSection.title}</h2>
              <p className="text-gray-700 mb-4 sm:mb-6 text-base sm:text-lg">
                {landingPage.innovationSection.subtitle}
              </p>
              <div className="space-y-3 sm:space-y-4">
                {landingPage.innovationSection.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">{feature.title}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/home#workshops">
                <button 
                  onClick={() => analytics.serviceClick('innovation-section-button', 'navigation')}
                  className="mt-6 sm:mt-8 inline-flex items-center justify-center rounded-md px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white h-8 sm:h-10"
                >
                  {landingPage.innovationSection.buttonText}
                  <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section> */}

      {/* Section removed: CTA Section with "Bereit für Ihren Technologie-Boost?" */}

      {/* Starter Packages Section */}
      <StarterPackages />

      {/* Pathfinder Units Section */}
      <PathfinderUnits />

      {/* Success Stories */}
      <section className="py-10 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Erfolgsgeschichten unserer Kunden</h2>
            <p className="text-gray-600 text-base sm:text-lg">
              Sehen Sie, wie wir Unternehmen dabei geholfen haben, ihre technologischen Herausforderungen zu meistern
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {landingPage.successStories.map((story) => (
              <div
                key={story.id}
                className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow h-full"
              >
                <div className="h-36 sm:h-40 md:h-48 relative overflow-hidden">
                  {/* Verwende immer den grünen Farbverlauf für Erfolgsgeschichten ohne gültiges Bild */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-800" />
                  {/* Zeige Bild nur an, wenn ein gültiges Bild vorhanden ist */}
                  {story.backgroundImage && story.backgroundImage !== "" && !story.backgroundImage.includes("placeholder") && (
                    <Image
                      src={story.backgroundImage}
                      alt={story.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        // Bei Fehler Bild ausblenden, damit Farbverlauf sichtbar wird
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <h3 className="text-white text-xl sm:text-2xl font-bold px-4 text-center">{story.title}</h3>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="mb-3 sm:mb-4">
                    {story.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded mr-2 mb-2"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">{story.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DynamicIcon
                        name={story.achievement.icon}
                        className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 mr-1"
                      />
                      <span className="text-xs sm:text-sm font-medium">{story.achievement.text}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 sm:py-12 md:py-16 bg-gray-100 text-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{landingPage.statsSection.title}</h2>
            <p className="text-base sm:text-lg md:text-xl opacity-90">{landingPage.statsSection.subtitle}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            {landingPage.statsSection.stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-2 text-gray">
                  {stat.value}
                  <span>{stat.suffix}</span>
                </div>
                <p className="text-base sm:text-lg opacity-80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-10 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Kontaktieren Sie uns</h2>
            <p className="text-center mb-8 text-gray-600">
              Haben Sie Fragen zu unseren Angeboten? Unser Expertenteam steht Ihnen gerne zur Verfügung.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <form className="space-y-4" onSubmit={handleContactSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstname" className="block text-sm font-medium mb-1">Vorname</label>
                      <input type="text" id="firstname" name="firstname" placeholder="Vorname" className="w-full p-2 border rounded-md" required/>
                    </div>
                    <div>
                      <label htmlFor="lastname" className="block text-sm font-medium mb-1">Nachname</label>
                      <input type="text" id="lastname" name="lastname" placeholder="Nachname" className="w-full p-2 border rounded-md" required/>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">E-Mail</label>
                    <input type="email" id="email" name="email" placeholder="ihre-email@beispiel.de" className="w-full p-2 border rounded-md" required/>
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium mb-1">Unternehmen</label>
                    <input type="text" id="company" name="company" placeholder="Unternehmen" className="w-full p-2 border rounded-md" />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1">Nachricht</label>
                    <textarea
                      id="message"
                      rows={4}
                      name="message"
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
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Kontaktdaten</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                      <span>Im Welterbe 2, 45141 Essen</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-green-600 mr-2" />
                      <a href="tel:+49 201 48639980" className="hover:text-green-600">
                        +49 201 48639980
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-green-600 mr-2" />
                      <a href="mailto:techhub@realcore.de" className="hover:text-green-600">
                        techhub@realcore.de
                      </a>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Social Media</h3>
                  <div className="flex space-x-4">
                    <a href="https://www.facebook.com/RealCoreGroup" className="text-gray-600 hover:text-green-600">
                      <Facebook className="h-6 w-6" />
                    </a>
                    <a href="https://linkedin.com/company/realcore-group-gmbh" className="text-gray-600 hover:text-green-600">
                      <Linkedin className="h-6 w-6" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Innovation Section */}
      {/* <section className="py-10 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-12">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <ImageWithFallback
                src={landingPage.innovationSection.image}
                fallbackSrc="/images/innovation-workshop.png"
                alt="Innovation Factory"
                width={500}
                height={400}
                className="rounded-lg shadow-xl max-w-full h-auto"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{landingPage.innovationSection.title}</h2>
              <p className="text-gray-700 mb-4 sm:mb-6 text-base sm:text-lg">
                {landingPage.innovationSection.subtitle}
              </p>
              <div className="space-y-3 sm:space-y-4">
                {landingPage.innovationSection.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">{feature.title}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/home#workshops">
                <button 
                  onClick={() => analytics.serviceClick('innovation-section-button', 'navigation')}
                  className="mt-6 sm:mt-8 inline-flex items-center justify-center rounded-md px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-gray-200 hover:bg-gray-300 text-black h-8 sm:h-10"
                >
                  {landingPage.innovationSection.buttonText}
                  <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section> */}
      
      {/* Footer */}
      <EnhancedFooter />
      
      <BackToTop />
    </div>
  )
}
