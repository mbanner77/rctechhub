"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { StickyHeader } from "@/components/sticky-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Mail,
  Users,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Layers,
  BookOpen,
  Briefcase,
  LayoutGrid,
  MapPin,
  Clock,
  Share2,
  GraduationCap,
  Award,
  Code,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { pathfinderUnits } from "../pathfinder-units"
import { getUnitCards, mapUnitCardToPathfinderUnit } from "@/lib/unit-cards-service"
import { EnhancedFooter } from "@/components/enhanced-footer"
import DynamicWorkshopGrid from "@/components/dynamic-workshop-grid"
import { ExpertDetailDialog } from "@/components/expert-detail-dialog"
import { ContactDialog } from "@/components/contact-dialog"
import { WorkshopBookingDialog } from "@/components/workshop-booking-dialog"
import { Expert } from "@/types/expert"
import { useExpertsByIds } from "@/hooks/use-experts"
import { useCaseStudiesByUnitId } from "@/hooks/use-case-studies"
import { useSchulungenByUnitId } from "@/hooks/use-schulungen"
import { CaseStudies } from "@/components/case-studies"
import SchulungenDisplay from "@/components/schulungen-display"
import { useSiteConfig } from "@/hooks/use-site-config"
import { formatCurrency } from "@/lib/currency"
import { Approach, Step } from "@/types/unit-cards"
import { getClientWorkshops } from "@/lib/client-data-service"
import { fetchCurrentExperts } from "@/data/experts"

// Icon Map für Workshop-Karten
const iconMap: Record<string, React.ReactNode> = {
  Calendar: <Calendar className="h-8 w-8 mb-2" />,
  Lightbulb: <Lightbulb className="h-8 w-8 mb-2" />,
  BookOpen: <BookOpen className="h-8 w-8 mb-2" />,
  Briefcase: <Briefcase className="h-8 w-8 mb-2" />,
  Code: <Code className="h-8 w-8 mb-2" />,
  Settings: <Award className="h-8 w-8 mb-2" />,
  Users: <Users className="h-8 w-8 mb-2" />,
}

export default function PathfinderUnitPageClient() {  
  const router = useRouter()
  const { config } = useSiteConfig()
  const { id } = useParams() as { id: string }
  const [activeTab, setActiveTab] = useState("overview")
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [isWorkshopDialogOpen, setIsWorkshopDialogOpen] = useState(false)
  const [selectedWorkshop, setSelectedWorkshop] = useState<any>(null)
  const [availableWorkshops, setAvailableWorkshops] = useState<any[]>([])
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null)
  const [isExpertDetailOpen, setIsExpertDetailOpen] = useState(false)
  const [unit, setUnit] = useState<any>(null)
  const [allUnits, setAllUnits] = useState<any[]>([])
  const [nextUnit, setNextUnit] = useState<any>(null)
  const [prevUnit, setPrevUnit] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [overrideExpertIds, setOverrideExpertIds] = useState<string[] | null>(null)
  
  // Define handlers
  const handleUnitChange = (value: string) => {
    router.push(`/pathfinder/${value}`)
  }

  // Resolve preferred contacts by unit title to expert IDs if not provided by unit data
  useEffect(() => {
    async function resolvePreferredContacts() {
      if (!unit || isLoading) return;

      // If unit already defines contacts, do not override
      if ((unit.contactPersonIds && unit.contactPersonIds.length > 0) || (unit.showContactPersons && unit.showContactPersons === true)) {
        setOverrideExpertIds(null);
        return;
      }

      // Map unit titles to preferred contact name pairs
      const preferredByTitle: Record<string, Array<{ firstName: string; lastName: string }>> = {
        'Digital Core': [
          { firstName: 'Arne', lastName: 'Steinkamp' },
          { firstName: 'Silke', lastName: 'Griewel' },
        ],
        'Platform Elevation': [
          { firstName: 'Silke', lastName: 'Griewel' },
          { firstName: 'Till', lastName: 'Dannapfel' },
        ],
        'Adaptive Integration': [
          { firstName: 'Christian', lastName: 'Niermann' },
          { firstName: 'Arne', lastName: 'Steinkamp' },
        ],
        'Data-Driven Decision': [
          { firstName: 'Till', lastName: 'Dannapfel' },
          { firstName: 'Timon', lastName: 'Neuenbauer' },
        ],
        // Support both the correct and legacy title spellings
        'Business Simplified': [
          { firstName: 'Benjamin', lastName: 'Kunold' },
          { firstName: 'Can', lastName: 'Karaduman' },
        ],
        'Business Simpliyer': [
          { firstName: 'Benjamin', lastName: 'Kunold' },
          { firstName: 'Can', lastName: 'Karaduman' },
        ],
        'XaaS Transformation': [
          { firstName: 'Can', lastName: 'Karaduman' },
          { firstName: 'Timon', lastName: 'Neuenbauer' },
        ],
      };

      const wanted = preferredByTitle[unit.title as string];
      if (!wanted || wanted.length === 0) {
        setOverrideExpertIds(null);
        return;
      }

      try {
        const experts = await fetchCurrentExperts();
        const ids = wanted
          .map(w => experts.find(e => e.firstName === w.firstName && e.name === w.lastName)?.id)
          .filter((id): id is string => !!id);

        if (ids.length > 0) {
          setOverrideExpertIds(ids);
        } else {
          setOverrideExpertIds(null);
        }
      } catch (e) {
        setOverrideExpertIds(null);
      }
    }

    resolvePreferredContacts();
  }, [unit, isLoading]);

  const handleExpertClick = (expert: Expert, openContactDialog: boolean = false) => {
    // Ensure contact dialog only opens when explicitly requested
    const expertCopy = { ...expert, showContactDialog: openContactDialog }
    setSelectedExpert(expertCopy)
    setIsExpertDetailOpen(true)
  }

  const handleContactClick = () => {
    setIsContactOpen(true)
  }

  const handleWorkshopClick = () => {
    // If there are workshops available for this unit, show the first one
    // Otherwise, show a generic workshop booking dialog
    if (availableWorkshops.length > 0) {
      setSelectedWorkshop(availableWorkshops[0])
    } else {
      // Create a generic workshop entry for this unit
      setSelectedWorkshop({
        id: `workshop-${unit?.id}`,
        title: `${unit?.title} Workshop`,
        description: `Entdecken Sie die Möglichkeiten von ${unit?.title} in einem praxisorientierten Workshop.`,
        duration: "1-2 Tage",
        audience: "IT-Leitung, Architekten, Entwickler",
        price: 2500,
        icon: "Users",
        benefits: [
          `Umfassende Einführung in ${unit?.title}`,
          "Best Practices und Implementierungsstrategien",
          "Hands-on Erfahrung mit den wichtigsten Tools"
        ],
        unitId: unit?.id
      })
    }
    setIsWorkshopDialogOpen(true)
  }
  
  // First load the unit data before initializing any hooks
  useEffect(() => {
    if (!isLoading) return // Prevent re-execution if already loaded
    
    async function loadUnitData() {
      try {
        console.log(`[PathfinderUnitPageClient] Starte Laden von Unit-Daten für ID: ${id}`)
        
        // Try to load real Unit Cards from API first
        const unitCards = await getUnitCards()
        console.log(`[PathfinderUnitPageClient] ${unitCards.length} aktive Unit Cards geladen`)
        
        // Convert to Pathfinder format
        const mappedUnits = unitCards.map(card => mapUnitCardToPathfinderUnit(card))
        
        // Store only real units for dropdown and navigation (no mock data)
        setAllUnits(mappedUnits)
        
        const idStr = id as string
        
        // Search for Units with matching ID (string comparisons only)
        const matchingUnit = mappedUnits.find((u: any) => 
          u.id === idStr || 
          (u.originalId && u.originalId.toString() === idStr) ||
          (u.originalId && u.originalId === parseInt(idStr, 10))
        )
        
        if (matchingUnit) {
          console.log(`[PathfinderUnitPageClient] Gefundene Unit Card: id=${matchingUnit.id}, title=${matchingUnit.title}`)
          setUnit(matchingUnit)
          setIsLoading(false)
          return
        } else {
          console.log(`[PathfinderUnitPageClient] Keine Unit Card gefunden für ID: ${id}`)
          router.push("/pathfinder")
        }
      } catch (error) {
        console.error("[PathfinderUnitPageClient] Fehler beim Laden der Unit Card:", error)
        
        router.push("/pathfinder")
      } finally {
        setIsLoading(false)
      }
    }
    
    loadUnitData()
  }, [id, router, isLoading]) // Use isLoading instead of dataLoaded
  
  // Update previous and next units based on all available units
  useEffect(() => {
    if (allUnits.length > 0 && unit) {
      const currentIndex = allUnits.findIndex(u => u.id === id)
      if (currentIndex !== -1) {
        const nextUnitIndex = (currentIndex + 1) % allUnits.length
        const prevUnitIndex = (currentIndex - 1 + allUnits.length) % allUnits.length
        
        // Set next and prev units for navigation
        setNextUnit(allUnits[nextUnitIndex])
        setPrevUnit(allUnits[prevUnitIndex])
      }
    }
  }, [allUnits, id, unit])
  
  // Only load data hooks when unit is available and isLoading is false
  // Check if we should show contact persons or regular experts
  const shouldShowContactPersons = !isLoading && unit && unit.showContactPersons && unit.contactPersonIds?.length > 0;
  const shouldShowExperts = !isLoading && unit && !shouldShowContactPersons && unit.expertIds?.length > 0;
  
  // Use useMemo to prevent array recreation on every render
  const expertIds = useMemo(() => {
    // Highest priority: explicit overrides derived from preferred contact names
    if (overrideExpertIds && overrideExpertIds.length > 0) return overrideExpertIds;
    if (shouldShowContactPersons) return unit.contactPersonIds || [];
    if (shouldShowExperts) return unit.expertIds || [];
    return [];
  }, [overrideExpertIds, shouldShowContactPersons, shouldShowExperts, unit?.contactPersonIds, unit?.expertIds]);
  
  // Test hooks one by one
  const { experts: unitExperts, loading: expertsLoading } = useExpertsByIds(expertIds)
  const { caseStudies: dynamicCaseStudies, loading: caseStudiesLoading } = useCaseStudiesByUnitId(!isLoading && unit ? unit.id || null : null)
  const { schulungen: dynamicSchulungen, loading: schulungenLoading } = useSchulungenByUnitId(!isLoading && unit ? unit.id || null : null)

  if (!unit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-2xl">Lade Inhalte...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <StickyHeader />

      {/* Hero Section */}
      <section className="relative bg-[url('/images/gradient-export.png')] bg-cover bg-center text-white overflow-hidden py-20">
          <div className="flex absolute inset-0 divide-x divide-white/10">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-full h-full"></div>
            ))}
          </div>
          <div className="container mx-auto px-4 relative z-10">
            {/* Unit Navigation - now inside hero */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Link href="/pathfinder" className="text-sm text-white/80 hover:text-white">
                    Pathfinder
                  </Link>
                  <ChevronRight className="h-4 w-4 text-white/80" />
                  <span className="text-sm font-medium text-white">{unit.title}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Button size="sm" asChild className="bg-white text-green-700 hover:bg-gray-100">
                    <Link href="/pathfinder">
                      <LayoutGrid className="mr-2 h-4 w-4" />
                      Alle Units anzeigen
                    </Link>
                  </Button>
                  <div className="w-full sm:w-auto">
                    <Select value={id} onValueChange={handleUnitChange}>
                      <SelectTrigger className="w-full sm:w-[250px] bg-gray-200 text-black border-gray-300 hover:bg-gray-300">
                        <SelectValue placeholder="Wähle eine Pathfinder Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {allUnits.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2 space-y-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-2">{unit.title}</h1>
                  <p className="text-xl md:text-2xl opacity-90">{unit.shortDescription}</p>
                </div>
                <p className="text-lg opacity-80">{unit.description}</p>
                <div className="flex flex-wrap gap-2">
                  {unit.technologies &&
                    unit.technologies.slice(0, 4).map((tech: any) => (
                      <Badge
                        key={typeof tech === "string" ? tech : tech.id}
                        className="bg-white/20 hover:bg-white/30 text-white"
                      >
                        {typeof tech === "string" ? tech : tech.name}
                      </Badge>
                    ))}
                  {unit.technologies && unit.technologies.length > 4 && (
                    <Badge className="bg-white/20 hover:bg-white/30 text-white">
                      +{unit.technologies.length - 4} weitere
                    </Badge>
                  )}
                </div>
                <div className="pt-4 flex flex-wrap gap-4">
                  <Button onClick={handleContactClick} className="bg-white text-green-700 hover:bg-gray-100">
                    Kontakt aufnehmen
                  </Button>
                  <Button onClick={handleWorkshopClick} className="bg-gray-200 text-black hover:bg-gray-300 border-2 shadow-lg hover:shadow-xl transition-all">
                    Workshop buchen
                  </Button>
                </div>
              </div>
              <div className="md:w-1/2 relative">
                <div className="relative w-full h-[300px] md:h-[400px]">
                  <Image
                    src={unit.heroImage || unit.image || `/images/pathfinder-${unit.category || 'core-systems'}.png`}
                    alt={unit.title}
                    fill
                    className="object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(unit.title)}`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quote Section */}
        {unit.quote && (
          <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
              <blockquote className="text-center">
                <p className="text-xl md:text-2xl font-medium italic text-gray-700 max-w-4xl mx-auto">"{unit.quote}"</p>
              </blockquote>
            </div>
          </section>
        )}

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="overview">Übersicht</TabsTrigger>
                <TabsTrigger value="approach">Vorgehen</TabsTrigger>
                {/* Temporarily deactivated tabs as per request - no meaningful content available yet 
                <TabsTrigger value="case-studies">Fallstudien</TabsTrigger>
                <TabsTrigger value="resources">Ressourcen</TabsTrigger>
                */}
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-12 animate-in fade-in-50 duration-300">
                {/* Benefits and Challenges */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Benefits */}
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <CheckCircle2 className="mr-2 h-6 w-6 text-green-500" />
                      Ihre Vorteile
                    </h2>
                    <div className="space-y-4">
                      {unit.benefits &&
                        unit.benefits.map((benefit: any, index: number) => (
                          <Card key={index} className="overflow-hidden">
                            <div className={`h-1 ${benefit.colorClass}`} />
                            <CardContent className="p-5">
                              <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                              <p className="text-gray-600 mb-3">{benefit.description}</p>
                              {benefit.outcome && (
                                <div
                                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white ${benefit.colorClass}`}
                                >
                                  {benefit.outcome}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>

                  {/* Challenges */}
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <AlertCircle className="mr-2 h-6 w-6 text-amber-500" />
                      Herausforderungen
                    </h2>
                    <div className="space-y-4">
                      {unit.challenges &&
                        unit.challenges.map((challenge: any, index: number) => (
                          <Card key={index}>
                            <CardContent className="p-5">
                              <h3 className="text-lg font-semibold mb-2">{challenge.title}</h3>
                              <p className="text-gray-600">{challenge.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Contact Persons / Experts - Only show if we have experts/contact persons */}
                {!expertsLoading && unitExperts && unitExperts.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <Users className="mr-2 h-6 w-6 text-cyan-500" />
                      {'Ihre Ansprechpartner'}
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6 items-stretch">
                      {unitExperts.map((expert: any, index: number) => (
                        <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                          <div className="relative h-64">
                            {expert.image ? (
                              <Image
                                src={expert.image || "/placeholder.svg"}
                                alt={`${expert.firstName} ${expert.name}`}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = `/placeholder.svg?height=300&width=300&query=professional+portrait`
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400">Kein Bild verfügbar</span>
                              </div>
                            )}
                          </div>
                          <CardContent className="p-5 flex flex-col min-h-[300px] flex-1">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold mb-1">{expert.firstName} {expert.name}</h3>
                              <p className="text-gray-600 mb-3">{expert.role}</p>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {expert.expertise &&
                                  expert.expertise.slice(0, 3).map((item: string) => (
                                    <Badge key={item} variant="outline">
                                      {item}
                                    </Badge>
                                  ))}
                                {expert.expertise && expert.expertise.length > 3 && (
                                  <Badge variant="outline">+{expert.expertise.length - 3}</Badge>
                                )}
                              </div>
                              {(expert.experience || expert.certifications) && (
                                <div className="space-y-2 mb-4">
                                  {expert.experience && (
                                    <p className="text-sm">
                                      <span className="font-medium">Erfahrung:</span> {expert.experience}
                                    </p>
                                  )}
                                  {expert.certifications && (
                                    <p className="text-sm">
                                      <span className="font-medium">Zertifizierungen:</span> {expert.certifications}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-auto">
                              <Button
                                className="flex-1 min-w-[200px] bg-[#6BB14B] hover:bg-green-700 text-white"
                                onClick={() => handleExpertClick(expert, false)}
                              >
                                Profil ansehen
                              </Button>
                              <Button
                                className="flex-1 min-w-[200px] bg-[#85C916] text-white hover:bg-green-700"
                                onClick={() => handleExpertClick(expert, true)}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Kontakt aufnehmen
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Case Studies in Overview */}
                {!caseStudiesLoading && dynamicCaseStudies && dynamicCaseStudies.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <Briefcase className="mr-2 h-6 w-6 text-blue-500" />
                      Fallstudien
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {dynamicCaseStudies.slice(0, 2).map((caseStudy) => (
                        <Card key={caseStudy.id} className="overflow-hidden hover:shadow-md transition-shadow">
                          <div className="relative h-48">
                            {caseStudy.image ? (
                              <Image
                                src={caseStudy.image}
                                alt={caseStudy.title}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(caseStudy.title)}`;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400">Kein Bild verfügbar</span>
                              </div>
                            )}
                          </div>
                          <CardContent className="p-5">
                            <h3 className="text-lg font-semibold mb-2">{caseStudy.title}</h3>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{caseStudy.summary}</p>
                            <div className="flex justify-between items-center">
                              <Badge variant="secondary">{caseStudy.industry}</Badge>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setActiveTab("case-studies")}
                              >
                                Details anzeigen
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    {dynamicCaseStudies.length > 2 && (
                      <div className="flex justify-center mt-6">
                        <Button 
                          variant="outline"
                          onClick={() => setActiveTab("case-studies")}
                        >
                          Alle Fallstudien anzeigen
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Schulungen in Overview */}
                {!schulungenLoading && dynamicSchulungen && dynamicSchulungen.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <GraduationCap className="mr-2 h-6 w-6 text-indigo-500" />
                      Schulungen & Trainings
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {dynamicSchulungen.slice(0, 2).map((schulung) => (
                        <Card key={schulung.id} className="h-full flex flex-col">
                          <CardContent className="p-5 flex-grow">
                            <div className="flex items-center mb-3">
                              <BookOpen className="h-5 w-5 text-primary mr-2" />
                              <h3 className="text-lg font-semibold">{schulung.title}</h3>
                            </div>
                            <div className="flex flex-col space-y-2 mb-4">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Kategorie:</span>
                                <span className="text-sm">{schulung.category}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Dauer:</span>
                                <span className="text-sm">{schulung.duration}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Preis:</span>
                                <span className="text-sm">
                                  {typeof schulung.price === 'number' && schulung.price > 0 ? formatCurrency(Number(schulung.price || 0), config.currency) : 'Kostenlos'}
                                </span>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => setActiveTab("resources")}
                            >
                              Details anzeigen
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    {dynamicSchulungen.length > 2 && (
                      <div className="flex justify-center mt-6">
                        <Button 
                          variant="outline"
                          onClick={() => setActiveTab("resources")}
                        >
                          Alle Schulungen anzeigen
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Case Studies Tab */}
              {/* Temporarily deactivated Fallstudien tab as per request - no meaningful content available yet */}
              {/* <TabsContent value="case-studies" className="space-y-12 animate-in fade-in-50 duration-300">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Briefcase className="mr-2 h-6 w-6 text-blue-500" />
                  Fallstudien
                </h2>
                
                {!caseStudiesLoading && dynamicCaseStudies && dynamicCaseStudies.length > 0 ? (
                  <CaseStudies 
                    caseStudies={dynamicCaseStudies} 
                    loading={caseStudiesLoading} 
                    gradient={unit.gradient} 
                  />
                ) : (
                  unit.caseStudies && unit.caseStudies.length > 0 ? (
                    <CaseStudies 
                      caseStudies={unit.caseStudies} 
                      loading={false} 
                      gradient={unit.gradient} 
                    />
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Keine Fallstudien verfügbar</p>
                    </div>
                  )
                )}
              </TabsContent> */}

              {/* Approach Tab */}
              <TabsContent value="approach" className="space-y-12 animate-in fade-in-50 duration-300">
                <div>
                  <h2 className="text-2xl font-bold mb-6">Unser Vorgehen</h2>
                  
                  {unit.approach && unit.approach.length > 0 ? (
                    <>
                      {unit.approach.map((approach: Approach, index: number) => (
                        <div key={index} className="mb-8">
                          <p className="text-gray-700 mb-6 text-lg">{approach.description}</p>
                          
                          {approach.steps && approach.steps.length > 0 && (
                            <div className="space-y-10 mt-6">
                              {approach.steps.map((step: Step, stepIndex: number) => (
                                <div key={stepIndex} className="border-t border-gray-100 pt-8">
                                  <div className="flex items-start">
                                    <div className={`rounded-full text-white w-10 h-10 flex items-center justify-center text-xl font-bold bg-gradient-to-r ${unit.gradient} mr-5`}>
                                      {
                                        (
                                          (unit.approach
                                            ? unit.approach
                                                .slice(0, index)
                                                .reduce((sum: number, a: Approach) => sum + (a.steps ? a.steps.length : 0), 0)
                                            : 0
                                          ) + stepIndex + 1
                                        )
                                      }
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                                      <p className="text-gray-600 mb-6">{step.description}</p>
                                      
                                      <div className="grid md:grid-cols-2 gap-8">
                                        {/* Aktivitäten */}
                                        <div>
                                          <h4 className="text-base font-medium mb-3 flex items-center">
                                            <Clock className="h-5 w-5 text-blue-400 mr-2" />
                                            Aktivitäten
                                          </h4>
                                          {step.activities && step.activities.length > 0 ? (
                                            <ul className="space-y-3">
                                              {step.activities.map((activity: string, actIndex: number) => (
                                                <li key={actIndex} className="flex items-start">
                                                  <span className="text-blue-400 mr-2">•</span>
                                                  <span className="text-gray-600">{activity}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          ) : (
                                            <p className="text-gray-500 text-sm">Keine Aktivitäten definiert</p>
                                          )}
                                        </div>
                                        
                                        {/* Ergebnisse */}
                                        <div>
                                          <h4 className="text-base font-medium mb-3 flex items-center">
                                            <CheckCircle2 className="h-5 w-5 text-green-400 mr-2" />
                                            Ergebnisse
                                          </h4>
                                          {step.results && step.results.length > 0 ? (
                                            <ul className="space-y-3">
                                              {step.results.map((result: string, resIndex: number) => (
                                                <li key={resIndex} className="flex items-start">
                                                  <span className="text-green-400 mr-2">•</span>
                                                  <span className="text-gray-600">{result}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          ) : (
                                            <p className="text-gray-500 text-sm">Keine Ergebnisse definiert</p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  ) : (
                    unit.title !== 'Digital Core' ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Noch keine Vorgangsdetails für diese Unit definiert</p>
                      </div>
                    ) : null
                  )}
                </div>
              </TabsContent>
              
              {/* Resources Tab - Temporarily deactivated as per request - no meaningful content available yet 
              <TabsContent value="resources" className="space-y-12 animate-in fade-in-50 duration-300">
                {/* Schulungen Section */}
                {/* <div>
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <GraduationCap className="mr-2 h-6 w-6 text-indigo-500" />
                    Schulungen & Trainings
                  </h2>
                  {!schulungenLoading && dynamicSchulungen && dynamicSchulungen.length > 0 ? (
                    <div className="mb-8">
                      <SchulungenDisplay unitId={id} maxItems={6} />
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Keine Schulungen für diese Pathfinder Unit verfügbar</p>
                    </div>
                  )}
                </div> */}
                
                {/* Workshops Section */}
                {/* {unit.workshops && unit.workshops.length > 0 && (
                  <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <Briefcase className="mr-2 h-6 w-6 text-blue-600" />
                      Workshops & Angebote
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {unit.workshops.map((workshop, index) => (
                        <Card key={index} className="overflow-hidden">
                          <CardContent className="p-6">
                            <div className="flex flex-col items-center mb-4">
                              {iconMap[workshop.icon] || <Calendar className="h-8 w-8 mb-2" />}
                              <h3 className="text-lg font-semibold text-center">{workshop.title}</h3>
                            </div>
                            <p className="text-gray-600 text-center mb-4">{workshop.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )} */}
              {/* </TabsContent> */}
            </Tabs>
          </div>
        </section>

        {/* Navigation to other units */}
        {prevUnit && nextUnit && (
          <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8 text-center">Entdecken Sie weitere Pathfinder Units</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <Link href={`/pathfinder/${prevUnit.id}`}>
                  <Card className="overflow-hidden h-full hover:shadow-md transition-shadow cursor-pointer">
                    <div className={`h-2 bg-gradient-to-r ${prevUnit.gradient}`} />
                    <CardContent className="p-6 flex items-center">
                      <ChevronLeft className="h-6 w-6 mr-4" />
                      <div>
                        <h3 className="font-semibold">{prevUnit.title}</h3>
                        <p className="text-sm text-gray-600">{prevUnit.shortDescription}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <Link href={`/pathfinder/${nextUnit.id}`}>
                  <Card className="overflow-hidden h-full hover:shadow-md transition-shadow cursor-pointer">
                    <div className={`h-2 bg-gradient-to-r ${nextUnit.gradient}`} />
                    <CardContent className="p-6 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{nextUnit.title}</h3>
                        <p className="text-sm text-gray-600">{nextUnit.shortDescription}</p>
                      </div>
                      <ChevronRight className="h-6 w-6 ml-4" />
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </section>
        )}

      <EnhancedFooter />

      {/* Expert Detail Dialog */}
      <ExpertDetailDialog
        open={isExpertDetailOpen}
        onOpenChange={setIsExpertDetailOpen}
        expert={selectedExpert}
      />

      {/* Contact Dialog */}
      <ContactDialog
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        serviceTitle={unit?.title}
      />

      {/* Workshop Booking Dialog */}
      {selectedWorkshop && (
        <WorkshopBookingDialog
          isOpen={isWorkshopDialogOpen}
          onClose={() => setIsWorkshopDialogOpen(false)}
          workshop={selectedWorkshop}
        />
      )}
    </div>
  )
}
