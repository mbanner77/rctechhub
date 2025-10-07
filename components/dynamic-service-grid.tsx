"use client"

import { useState, useEffect, useRef, useLayoutEffect } from "react"
import Image from "next/image"
import { Check, ShoppingCart, Share2, Star, Clock, Calendar, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { defaultServices } from "@/data/default-data"
import ProcessView from "@/components/process-view"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import SelectedServicesDialog from "./selected-services-dialog"
import { useRouter, useSearchParams } from "next/navigation"
import { parseQuillHTML } from "@/lib/html-parser"
import MinimalContactDialog from "@/components/minimal-contact-dialog"
import { generateServiceOnePagerPDF } from "@/lib/onepager"
import { useSiteConfig } from "@/hooks/use-site-config"
import { formatCurrency } from "@/lib/currency"

export default function DynamicServiceGrid({
  searchQuery,
  filters,
  onCategoriesChange,
}: {
  searchQuery: string
  filters: string[]
  onCategoriesChange?: (categories: string[]) => void
}) {
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTechnologyCategory, setSelectedTechnologyCategory] = useState<string | null>(null)
  const [selectedProcessCategory, setSelectedProcessCategory] = useState<string | null>(null)
  const [isStarterPackage, setIsStarterPackage] = useState<boolean>(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [showProcessView, setShowProcessView] = useState(false)
  const [date, setDate] = useState<Date>()
  const [isSelectedServicesDialogOpen, setIsSelectedServicesDialogOpen] = useState(false)
  const { toast } = useToast();
  const searchParams = useSearchParams()
  const [openDialogServiceId, setOpenDialogServiceId] = useState<string | null>(null)
  const router = useRouter();
  const servicesElementRef = useRef<HTMLElement | null>(null)
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  const [contactContext, setContactContext] = useState<string | undefined>(undefined)
  const [contactDialogTitle, setContactDialogTitle] = useState<string | undefined>(undefined)
  const [contactEmailType, setContactEmailType] = useState<string | undefined>(undefined)
  const { config } = useSiteConfig()
  
  // Pagination state
  const ITEMS_PER_PAGE = 6
  const [visibleItemsCount, setVisibleItemsCount] = useState(ITEMS_PER_PAGE)

  useEffect(() => {
    const loadServices = async () => {
      try {
        console.log("[DYNAMIC-SERVICE-GRID] Lade Services aus der Datenbank...")
        setIsLoading(true)
        // Get services from API (Blob Storage)
        const response = await fetch('/api/data/services',
          { method: 'get' }
        )
        const dbServices = await response.json()
        if (dbServices && dbServices.length > 0) {
          console.log("[DYNAMIC-SERVICE-GRID] Services aus der Datenbank geladen:", dbServices.length)
          setServices(dbServices)
          setError(null)
        } else {
          console.log("[DYNAMIC-SERVICE-GRID] Keine Services in der Datenbank gefunden, verwende Standarddaten")
          setServices(defaultServices)
        }
      } catch (err) {
        console.error("[DYNAMIC-SERVICE-GRID] Fehler beim Laden der Services:", err)
        setServices(defaultServices)
        setError("Fehler beim Laden der Services. Standarddaten werden verwendet.")
      } finally {
        setIsLoading(false)
      }
    }
    loadServices();
  }, [])
  
  // Check for package type filter changes whenever URL parameters change
  useEffect(() => {
    checkPackageTypePreselection();
  }, [searchParams])

  // Set up services element ref after DOM is ready
  useLayoutEffect(() => {
    servicesElementRef.current = document.getElementById("services")
  }, [])
  
  // Scroll to services section when sharing a service
  const scrollToServices = () => {
    const element = servicesElementRef.current || document.getElementById("services")
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY
      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }

  useEffect(() => {
    if (services.length === 0) return

    const shareParam = searchParams.get("share")
    if (!shareParam) return

    try {
      const decodedId = atob(shareParam)
      console.log("[SHARING] Decodierte Service-ID:", decodedId)

      const matchingService = services.find((service) => service.id === decodedId)

      if (matchingService) {
        const animationDelay = 300
        // Always scroll to services section when sharing a service
        scrollToServices()
        
        // Open the dialog
        requestAnimationFrame(() => {
          // Open the dialog after scrolling
          setTimeout(() => {
            setOpenDialogServiceId(matchingService.id)
          }, animationDelay)
        })
      }
    } catch (err) {
      console.error("[SHARING] Fehler beim Decodieren:", err)
    }
  }, [services, searchParams])

  // lift state up for search bar => returning all categories
  useEffect(() => {
    const uniqueCategories = Array.from(
      new Set(services.map((s) => s.category).filter(Boolean))
    )
    onCategoriesChange?.(uniqueCategories)
  }, [services, onCategoriesChange])

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleItemsCount(ITEMS_PER_PAGE)
  }, [searchQuery, filters, selectedCategory, selectedTechnologyCategory, selectedProcessCategory, isStarterPackage])
  /**
   * @method checkPackageTypePreselection
   * @description Checks if URL parameter 'packageType' is set to 'starter-package' and sets the state accordingly.
   * This is used to preselect the Starter Package filter when the page loads.
   * Also handles hash fragments like #services for proper scrolling.
   */
  const checkPackageTypePreselection = (): void => {
    if (typeof window !== 'undefined') {
      // Always check the URL parameters to ensure we correctly set the filter state
      const packageType = searchParams.get('packageType');
      
      // Explicitly set the starter package filter based on URL parameter
      if (packageType === 'starter-package') {
        setIsStarterPackage(true);
      } else if (packageType === 'all') {
        // If explicitly set to 'all', make sure we turn off the starter package filter
        setIsStarterPackage(false);
      }

      // Handle hash fragment or packageType parameter scrolling
      const shouldScrollToServices = packageType === 'starter-package' || 
                                    packageType === 'all' ||
                                    window.location.hash === '#services';

      if (shouldScrollToServices) {
        // Use requestAnimationFrame for better timing than setTimeout
        requestAnimationFrame(() => {
          scrollToServices();
        });
      }
    }
  };

  const normalizedQuery = searchQuery.trim().toLowerCase()
  // Canonicalize strings for robust matching across separators and diacritics
  const canonicalize = (s: string): string =>
    (s || "")
      .toLowerCase()
      .normalize('NFKD')
      // remove all non-letters/digits (unicode aware), e.g., '/', spaces
      .replace(/[^\p{L}\p{N}]+/gu, '')
      .trim()
 
  // Ensure search matches visible text by stripping HTML from rich descriptions
  const stripHtml = (html: string): string => {
    if (!html) return ""
    // Fallback for SSR: remove tags with regex
    if (typeof window === "undefined") {
      return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    }
    const div = document.createElement("div")
    div.innerHTML = html
    return (div.textContent || div.innerText || "").replace(/\s+/g, " ").trim()
  }

  const filteredServices = services.filter((service) => {
    // console.log("Filter: ", filters);

    if (filters.length > 0 && !filters.includes(service.category)) {
      return false
    }

    // Prüfe Hauptkategorie
    if (selectedCategory && service.category !== selectedCategory) {
      return false
    }

    // Prüfe Technologie-Kategorie
    if (selectedTechnologyCategory && service.technologyCategory !== selectedTechnologyCategory) {
      return false
    }

    // Prüfe Prozess-Kategorie
    if (selectedProcessCategory && service.processCategory !== selectedProcessCategory) {
      return false
    }

    // Prüfe StarterPackage
    if (isStarterPackage && !service.isStarterPackage) {
      return false
    }
    // User is searching for something special
    if (normalizedQuery) {
      const titleRaw = service.title || ""
      const descRaw = stripHtml(service.description || "")

      const title = titleRaw.toLowerCase()
      const descriptionText = descRaw.toLowerCase()

      const queryCanon = canonicalize(normalizedQuery)
      const titleCanon = canonicalize(titleRaw)
      const descCanon = canonicalize(descRaw)

      const matchesSearch =
        title.includes(normalizedQuery) ||
        descriptionText.includes(normalizedQuery) ||
        (queryCanon.length > 0 && (titleCanon.includes(queryCanon) || descCanon.includes(queryCanon)))

      if (!matchesSearch) {
        return false
      }
    }
    return true
  })


  // Extrahiere alle eindeutigen Kategorien
  const categories = Array.from(new Set(services.map((service) => service.category)))

  // Extrahiere alle eindeutigen Technologie-Kategorien
  const technologyCategories = Array.from(
    new Set(services.map((service) => service.technologyCategory).filter(Boolean)),
  )

  // Extrahiere alle eindeutigen Prozess-Kategorien
  const processCategories = Array.from(new Set(services.map((service) => service.processCategory).filter(Boolean)))

  // Verwende die Standarddaten, wenn keine Daten geladen werden konnten
  const displayServices = (services && services.length > 0 ? services : defaultServices)

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Technologie</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>

          <h3 className="text-lg font-semibold mb-2">Prozess</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>

          <h3 className="text-lg font-semibold mb-2">Pakettyp</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="overflow-hidden rounded-lg border bg-white shadow-sm">
              {/* Image skeleton */}
              <div className="relative h-48 bg-gray-200 animate-pulse"></div>
              
              {/* Content skeleton */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-7 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse ml-auto"></div>
                </div>
              </div>
              
              {/* Footer skeleton */}
              <div className="px-6 pb-6 flex justify-between">
                <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-gray-600">Lade Services...</p>
        </div>
      </div>
    )
  }

  const toggleServiceSelection = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId))
    } else {
      setSelectedServices([...selectedServices, serviceId])
    }
  }
  const getServiceShareUrl = (serviceId: string): string => {
    const baseUrl = window.location.origin
    const encodedId = btoa(serviceId)
    return `${baseUrl}/home?share=${encodedId}#services`
  }

  const shareService = async (service: { id: string }) => {
    const shareUrl = getServiceShareUrl(service.id)

    try {
      await navigator.clipboard.writeText(shareUrl)

      toast({
        title: "Angebot geteilt",
        description: `Der Link zum Angebot "${service.id}" wurde in die Zwischenablage kopiert.`,
      })
    } catch (error) {
      console.error("[SHARE] Fehler beim Kopieren des Links:", error)

      toast({
        title: "Kopieren fehlgeschlagen",
        description: "Der Link konnte leider nicht in die Zwischenablage kopiert werden. Bitte manuell kopieren.",
        variant: "destructive",
      })
    }
  }

  const shareServiceViaEmail = (service: { id: string; title: string }): void => {
    const shareUrl = getServiceShareUrl(service.id)
    const subject = encodeURIComponent(service.title)
    const body = encodeURIComponent(shareUrl)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const removeShareParam = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("share");

    const newPath = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
    router.replace(newPath, { scroll: false });
  };

  const scheduleConsultation = (service: any) => {
    if (!date) {
      toast({
        title: "Bitte wählen Sie ein Datum",
        description: "Wählen Sie ein Datum für Ihre Beratung aus.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Beratungstermin geplant",
      description: `Ihr Beratungstermin für "${service.title}" am ${format(date, "dd.MM.yyyy")} wurde angefragt.`,
    })
  }

  const totalPrice = selectedServices.reduce((sum, id) => {
    const service = displayServices.find((s) => s.id === id)
    return sum + (service?.price || 0)
  }, 0)

  // Füge Empfehlungen basierend auf ausgewählten Services hinzu
  const getRecommendations = () => {
    if (selectedServices.length === 0) return []

    // Finde Services, die oft mit den ausgewählten Services zusammen gebucht werden
    const recommendedIds = displayServices
      .filter((service) => !selectedServices.includes(service.id))
      .filter((service) => {
        // Prüfe, ob dieser Service von einem ausgewählten Service abhängt
        return selectedServices.some((selectedId) => {
          const selectedService = displayServices.find((s) => s.id === selectedId)
          return selectedService?.dependencies?.includes(service.id)
        })
      })
      .slice(0, 3)
      .map((service) => service.id)

    return recommendedIds
  }

  const recommendedServices = getRecommendations()

  const handleSendRequest = () => {
    if (selectedServices.length === 0) {
      toast({
        title: "Keine Services ausgewählt",
        description: "Bitte wählen Sie mindestens einen Service aus.",
        variant: "destructive",
      })
      return
    }
    setIsSelectedServicesDialogOpen(true)
    setShowProcessView(false)
  }

  // Funktion zum Zurücksetzen aller Filter
  const resetFilters = () => {
    setSelectedCategory(null)
    setSelectedTechnologyCategory(null)
    setSelectedProcessCategory(null)
    setIsStarterPackage(false)
    
    // Update URL to reflect filter reset
    const params = new URLSearchParams(searchParams.toString());
    params.delete('packageType');
    const newPath = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
    router.replace(newPath, { scroll: false });
  }

  return (
    <div>
      <MinimalContactDialog
        isOpen={isContactDialogOpen}
        onClose={() => setIsContactDialogOpen(false)}
        title={contactDialogTitle}
        context={contactContext}
        emailType={contactEmailType}
      />
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">{error}</div>}

      <div className="mb-6">
        {/* <h3 className="text-lg font-semibold mb-2">Kategorien</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className="mb-2"
          >
            Alle
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="mb-2"
            >
              {category}
            </Button>
          ))}
        </div> */}

        {/* Filter sections in a flex row layout */}
        <div className="flex flex-col md:flex-row md:space-x-8">
          {/* Technology Filter */}
          <div className="mb-4 md:mb-0 md:flex-1">
            <h3 className="text-lg font-semibold mb-2">Technologie</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedTechnologyCategory === null ? "default" : "outline"}
                onClick={() => setSelectedTechnologyCategory(null)}
                className="mb-2"
              >
                Alle
              </Button>
              {["SAP", "Microsoft", "Open Source"].map((category) => (
                <Button
                  key={category}
                  variant={selectedTechnologyCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedTechnologyCategory(category)}
                  className="mb-2"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Process Filter */}
          <div className="mb-4 md:mb-0 md:flex-1">
            <h3 className="text-lg font-semibold mb-2">Prozess</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedProcessCategory === null ? "default" : "outline"}
                onClick={() => setSelectedProcessCategory(null)}
                className="mb-2"
              >
                Alle
              </Button>
              {["Operate", "Innovate", "Ideate"].map((category) => (
                <Button
                  key={category}
                  variant={selectedProcessCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedProcessCategory(category)}
                  className="mb-2"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Package Type Filter */}
          <div className="md:flex-1">
            <h3 id="packageType" className="text-lg font-semibold mb-2">Pakettyp</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={!isStarterPackage ? "default" : "outline"}
                onClick={() => {
                  setIsStarterPackage(false)
                  // Update URL to reflect the filter change
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('packageType', 'all');
                  const newPath = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
                  router.replace(newPath, { scroll: false });
                }}
                className="mb-2"
              >
                Alle
              </Button>
              <Button
                variant={isStarterPackage ? "default" : "outline"}
                onClick={() => {
                  setIsStarterPackage(true)
                  // Update URL to reflect the filter change
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('packageType', 'starter-package');
                  const newPath = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
                  router.replace(newPath, { scroll: false });
                }}
                className="mb-2"
              >
                Starter Packages
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          {(selectedCategory !== null ||
            selectedTechnologyCategory !== null ||
            selectedProcessCategory !== null ||
            isStarterPackage) && (
              <Button variant="outline" onClick={resetFilters} className="mt-4">
                Alle Filter zurücksetzen
              </Button>
            )}
        </div>
      </div>

      {selectedServices.length > 0 && (
        <div className="sticky top-0 z-10 bg-white shadow-md p-4 mb-6 rounded-lg flex flex-col md:flex-row justify-between items-center">
          <div>
            <span className="font-medium">{selectedServices.length} Angebote ausgewählt</span>
            <span className="mx-2">|</span>
            <span className="font-bold">Gesamtpreis: {formatCurrency(totalPrice, config.currency)}</span>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <Button variant="outline" onClick={() => setSelectedServices([])}>
              Zurücksetzen
            </Button>
            <Button onClick={() => setShowProcessView(true)} className="bg-green-600 hover:bg-green-700">
              Prozessansicht
            </Button>
          </div>
        </div>
      )}

      {selectedServices.length > 0 && recommendedServices.length === 0 && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <div className="text-center py-4 text-gray-500">
            <Star className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium">Keine Empfehlungen verfügbar</p>
            <p className="text-xs">Basierend auf Ihrer Auswahl gibt es derzeit keine passenden Ergänzungen.</p>
          </div>
        </div>
      )}

      {recommendedServices.length > 0 && (
        <div className="mb-8 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold mb-3">Empfohlene Ergänzungen:</h3>
          <div className="flex flex-wrap gap-2">
            {recommendedServices.map((id) => {
              const service = displayServices.find((s) => s.id === id)
              return (
                <Badge
                  key={id}
                  variant="outline"
                  className="cursor-pointer hover:bg-green-100 py-1.5 px-3"
                  onClick={() => toggleServiceSelection(id)}
                >
                  {service?.title} (+{formatCurrency(Number(service?.price || 0), config.currency)})
                </Badge>
              )
            })}
          </div>
        </div>
      )}

      {filteredServices.length === 0 ? (
        <div className="text-center py-8 text-gray-500 col-span-full">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Keine Angebote gefunden</p>
          <p className="text-sm">Für die ausgewählten Filter wurden keine Angebote gefunden. Bitte passen Sie Ihre Suchkriterien an.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.slice(0, visibleItemsCount).map((service) => (
          <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
            <div className="relative h-48">
              <Image
                src={service.image || "/placeholder.svg"}
                alt={service.title}
                fill
                className="object-cover"
                onError={(e) => {
                  // Fallback für Bilder, die nicht geladen werden können
                  console.error(`Fehler beim Laden des Bildes für ${service.title}:`, e)
                  e.currentTarget.src = "/placeholder.svg?key=service"
                }}
              />
              {service.featured && <Badge className="absolute top-2 right-2 bg-gray-200">Empfohlen</Badge>}
              {selectedServices.includes(service.id) && (
                <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                  <Check size={16} />
                </div>
              )}
              <div className="absolute top-2 left-2 flex gap-1">
                {service.rating ? (
                  <div className="bg-white bg-opacity-90 text-yellow-500 px-2 py-1 rounded-full text-sm font-medium flex items-center">
                    <Star />
                  </div>
                ) : ''}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-20 opacity-70"></div>
            </div>
            <CardContent className="p-6 flex-grow flex flex-col">
              {/* Header section */}
              <div className="flex justify-between items-start mb-3">
                <Badge variant="outline">{service.category}</Badge>
                <span className="font-bold text-lg">{formatCurrency(Number(service.price || 0), config.currency)}</span>
              </div>
              
              {/* Title section - flexible height but limited to 2 lines */}
              <div className="mb-3">
                <CardTitle className="text-xl line-clamp-2 leading-7">{service.title}</CardTitle>
              </div>
              
              {/* Description section - flexible height but limited to 3 lines */}
              <div className="mb-4 flex-1">
                <CardDescription className="line-clamp-3 text-sm leading-6">{parseQuillHTML(service.description)}</CardDescription>
              </div>
              
              {/* Bottom section - always at bottom */}
              <div className="flex flex-col gap-3 mt-auto">
                <div className="flex flex-wrap gap-2 min-h-[32px] items-start">
                  {service.technologyCategory && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {service.technologyCategory}
                    </Badge>
                  )}
                  {service.processCategory && (
                    <Badge
                      variant="secondary"
                      className={`${service.processCategory === "Ideate"
                        ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                        : service.processCategory === "Innovate"
                          ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                          : service.processCategory === "Operate"
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                    >
                      {service.processCategory}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-500 h-5">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{service.duration}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-0 flex justify-between mt-auto">
              <Dialog
                open={openDialogServiceId === service.id}
                onOpenChange={(open) => {
                  if (open) {
                    setOpenDialogServiceId(service.id);
                  } else {
                    setOpenDialogServiceId(null);
                    removeShareParam();
                  }
                }}
              >
                {/* <DialogTrigger asChild>
                  <Button variant="outline">Details</Button>
                </DialogTrigger> */}
                <Button variant="outline" onClick={() => setOpenDialogServiceId(service.id)}>Details</Button>

                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>{service.title}</DialogTitle>
                    <DialogDescription>Festpreis: {formatCurrency(Number(service.price || 0), config.currency)}</DialogDescription>
                  </DialogHeader>

                  <Tabs defaultValue="details">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="included">Leistungsumfang</TabsTrigger>
                      <TabsTrigger value="process">Ablauf</TabsTrigger>
                      {/* <TabsTrigger value="reviews">Bewertungen</TabsTrigger>
                      <TabsTrigger value="booking">Beratung buchen</TabsTrigger> */}
                    </TabsList>

                    <TabsContent value="details" className="space-y-4">
                      <div className="relative h-60 w-full rounded-lg overflow-hidden">
                        <Image
                          src={service.image || "/placeholder.svg"}
                          alt={service.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            // Fallback für Bilder, die nicht geladen werden können
                            console.error(`Fehler beim Laden des Bildes für ${service.title}:`, e)
                            e.currentTarget.src = "/placeholder.svg?key=details"
                          }}
                        />
                      </div>
                      {service.description && service.description.trim() && (
                        <div>
                          <h3 className="font-medium text-lg mb-2">Beschreibung</h3>
                          <p>{parseQuillHTML(service.description)}</p>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-4">
                        {service.technologies && service.technologies.length > 0 && (
                          <div>
                            <h3 className="font-medium text-lg mb-2">Technologien</h3>
                            <div className="flex flex-wrap gap-2">
                              {service.technologies.map((tech: string) => (
                                <Badge key={tech} variant="secondary">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-lg mb-2">Kategorien</h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{service.category}</Badge>
                            {service.technologyCategory && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                {service.technologyCategory}
                              </Badge>
                            )}
                            {service.processCategory && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {service.processCategory}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-lg mb-2">Dauer</h3>
                        <p>{service.duration}</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="included">
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg">Im Festpreis enthalten:</h3>
                        {service.included && service.included.length > 0 ? (
                          <ul className="space-y-2">
                            {service.included.map((item: string, index: number) => {
                              if (item) {
                                return (
                                  <li key={index} className="flex items-start">
                                    <Check size={18} className="text-green-500 mr-2 mt-1 shrink-0" />
                                    <span>{item}</span>
                                  </li>
                                )
                              }
                            })}
                          </ul>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Check className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium">Keine Leistungen hinterlegt</p>
                            <p className="text-sm">Für dieses Angebot sind derzeit keine detaillierten Leistungsinformationen hinterlegt.</p>
                          </div>
                        )}

                        {service.notIncluded && service.notIncluded.length > 0 && (
                          <>
                            <h3 className="font-medium text-lg mt-6">Nicht enthalten:</h3>
                            <ul className="space-y-2">
                              {service.notIncluded.map((item: string, index: number) => {
                                if (item) {
                                  return (
                                    <li key={index} className="flex items-start text-gray-600">
                                      <span className="mr-2">•</span>
                                      <span>{item}</span>
                                    </li>
                                  )
                                }
                              })}
                            </ul>
                          </>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="process">
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg">Projektablauf:</h3>
                        {service.process && service.process.length > 0 ? (
                          <ol className="relative border-l border-gray-200 ml-3 space-y-6">
                            {service.process.map((step: any, index: number) => (
                              <li key={index} className="ml-6">
                                <span className="absolute flex items-center justify-center w-6 h-6 bg-green-100 rounded-full -left-3 ring-8 ring-white">
                                  {index + 1}
                                </span>
                                <h3 className="font-semibold">{step.title}</h3>
                                <div className="text-gray-600">
                                  {parseQuillHTML(step.description)}
                                </div>
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium">Kein Ablauf hinterlegt</p>
                            <p className="text-sm">Für dieses Angebot ist derzeit kein detaillierter Projektablauf hinterlegt.</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    {/* <TabsContent value="reviews">
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="bg-green-50 p-3 rounded-lg text-center">
                            <div className="text-3xl font-bold text-green-600">{service.rating || "4.8"}</div>
                            <div className="flex text-yellow-500 justify-center">
                              <Star className="w-4 h-4 fill-yellow-500" />
                              <Star className="w-4 h-4 fill-yellow-500" />
                              <Star className="w-4 h-4 fill-yellow-500" />
                              <Star className="w-4 h-4 fill-yellow-500" />
                              <Star className="w-4 h-4 fill-yellow-500" />
                            </div>
                            <div className="text-sm text-gray-600 mt-1">12 Bewertungen</div>
                          </div>
                          <div className="flex-1">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="text-sm w-16">5 Sterne</div>
                                <div className="h-2 bg-gray-200 rounded-full flex-1">
                                  <div className="h-2 bg-yellow-500 rounded-full w-[85%]"></div>
                                </div>
                                <div className="text-sm w-8">85%</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-sm w-16">4 Sterne</div>
                                <div className="h-2 bg-gray-200 rounded-full flex-1">
                                  <div className="h-2 bg-yellow-500 rounded-full w-[10%]"></div>
                                </div>
                                <div className="text-sm w-8">10%</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-sm w-16">3 Sterne</div>
                                <div className="h-2 bg-gray-200 rounded-full flex-1">
                                  <div className="h-2 bg-yellow-500 rounded-full w-[5%]"></div>
                                </div>
                                <div className="text-sm w-8">5%</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-sm w-16">2 Sterne</div>
                                <div className="h-2 bg-gray-200 rounded-full flex-1">
                                  <div className="h-2 bg-yellow-500 rounded-full w-[0%]"></div>
                                </div>
                                <div className="text-sm w-8">0%</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-sm w-16">1 Stern</div>
                                <div className="h-2 bg-gray-200 rounded-full flex-1">
                                  <div className="h-2 bg-yellow-500 rounded-full w-[0%]"></div>
                                </div>
                                <div className="text-sm w-8">0%</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="border-b pb-4">
                            <div className="flex justify-between mb-1">
                              <div className="font-medium">Max Mustermann</div>
                              <div className="text-sm text-gray-500">vor 2 Wochen</div>
                            </div>
                            <div className="flex text-yellow-500 mb-2">
                              <Star className="w-4 h-4 fill-yellow-500" />
                              <Star className="w-4 h-4 fill-yellow-500" />
                              <Star className="w-4 h-4 fill-yellow-500" />
                              <Star className="w-4 h-4 fill-yellow-500" />
                              <Star className="w-4 h-4 fill-yellow-500" />
                            </div>
                            <p className="text-gray-700">
                              Hervorragende Beratung und Umsetzung. Das Team hat unsere Anforderungen perfekt verstanden
                              und eine maßgeschneiderte Lösung geliefert.
                            </p>
                          </div>
                          <div className="border-b pb-4">
                            <div className="flex justify-between mb-1">
                              <div className="font-medium">Anna Schmidt</div>
                              <div className="text-sm text-gray-500">vor 1 Monat</div>
                            </div>
                            <div className="flex text-yellow-500 mb-2">
                              <Star className="w-4 h-4 fill-yellow-500" />
                              <Star className="w-4 h-4 fill-yellow-500" />
                              <Star className="w-4 h-4 fill-yellow-500" />
                              <Star className="w-4 h-4 fill-yellow-500" />
                              <Star className="w-4 h-4 fill-yellow-500" />
                            </div>
                            <p className="text-gray-700">
                              Wir sind sehr zufrieden mit dem Ergebnis. Die Zusammenarbeit war professionell und die
                              Kommunikation transparent.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="booking" className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-medium text-lg mb-4">Beratungstermin vereinbaren</h3>
                        <p className="text-gray-600 mb-4">
                          Vereinbaren Sie einen kostenlosen 30-minütigen Beratungstermin mit einem unserer Experten, um
                          mehr über dieses Angebot zu erfahren.
                        </p>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Wählen Sie ein Datum</h4>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {date ? format(date, "PPP", { locale: de }) : <span>Datum auswählen</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={de} />
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Verfügbare Zeiten</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <Button variant="outline" className="justify-start">
                                <Users className="mr-2 h-4 w-4" />
                                09:00 - 09:30
                              </Button>
                              <Button variant="outline" className="justify-start">
                                <Users className="mr-2 h-4 w-4" />
                                10:00 - 10:30
                              </Button>
                              <Button variant="outline" className="justify-start">
                                <Users className="mr-2 h-4 w-4" />
                                11:00 - 11:30
                              </Button>
                              <Button variant="outline" className="justify-start">
                                <Users className="mr-2 h-4 w-4" />
                                14:00 - 14:30
                              </Button>
                            </div>
                          </div>
                        </div>

                        <Button
                          className="w-full mt-4 bg-green-600 hover:bg-green-700"
                          onClick={() => scheduleConsultation(service)}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          Beratungstermin vereinbaren
                        </Button>
                      </div>

                      <div className="border-t pt-4">
                        <h3 className="font-medium text-lg mb-2">Oder kontaktieren Sie uns direkt</h3>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" className="flex-1">
                            <Phone className="mr-2 h-4 w-4" />
                            +49 123 456789
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Mail className="mr-2 h-4 w-4" />
                            techhub@realcore.de
                          </Button>
                        </div>
                      </div>
                    </TabsContent> */}
                  </Tabs>

                  <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <Button variant="outline" className="w-full sm:w-auto" onClick={() => toggleServiceSelection(service.id)}>
                        {selectedServices.includes(service.id) ? "Abwählen" : "Auswählen"}
                      </Button>
                      {/* Mobile: icon-only button */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="sm:hidden"
                        onClick={async () => {
                          try {
                            toast({ title: "OnePager wird erstellt…", description: "Bitte einen Moment, der Download startet gleich." })
                            await generateServiceOnePagerPDF({
                              id: service.id,
                              title: service.title,
                              description: typeof service.description === 'string' ? service.description : String(service.description ?? ''),
                              price: Number(service.price || 0),
                              category: service.category,
                              technologyCategory: service.technologyCategory,
                              processCategory: service.processCategory,
                              technologies: Array.isArray(service.technologies) ? service.technologies : [],
                              image: service.image,
                              rating: typeof service.rating === 'number' ? service.rating : undefined,
                              duration: service.duration,
                              included: Array.isArray(service.included) ? service.included : [],
                              notIncluded: Array.isArray(service.notIncluded) ? service.notIncluded : [],
                              process: Array.isArray(service.process) ? service.process : [],
                            }, config.currency)
                            toast({ title: "Download gestartet", description: "Ihr OnePager wird heruntergeladen." })
                          } catch (e:any) {
                            console.error('[OnePager] Fehler bei der Generierung', e)
                            toast({ title: "Fehler bei der PDF-Erstellung", description: "Bitte versuchen Sie es erneut.", variant: "destructive" })
                          }
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {/* Desktop/tablet: text button */}
                      <Button 
                        variant="outline"
                        className="hidden sm:inline-flex w-full sm:w-auto"
                        onClick={async () => {
                          try {
                            toast({ title: "OnePager wird erstellt…", description: "Bitte einen Moment, der Download startet gleich." })
                            await generateServiceOnePagerPDF({
                              id: service.id,
                              title: service.title,
                              description: typeof service.description === 'string' ? service.description : String(service.description ?? ''),
                              price: Number(service.price || 0),
                              category: service.category,
                              technologyCategory: service.technologyCategory,
                              processCategory: service.processCategory,
                              technologies: Array.isArray(service.technologies) ? service.technologies : [],
                              image: service.image,
                              rating: typeof service.rating === 'number' ? service.rating : undefined,
                              duration: service.duration,
                              included: Array.isArray(service.included) ? service.included : [],
                              notIncluded: Array.isArray(service.notIncluded) ? service.notIncluded : [],
                              process: Array.isArray(service.process) ? service.process : [],
                            }, config.currency)
                            toast({ title: "Download gestartet", description: "Ihr OnePager wird heruntergeladen." })
                          } catch (e:any) {
                            console.error('[OnePager] Fehler bei der Generierung', e)
                            toast({ title: "Fehler bei der PDF-Erstellung", description: "Bitte versuchen Sie es erneut.", variant: "destructive" })
                          }
                        }}
                      >
                        OnePager herunterladen
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="sm:ml-0">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => shareService(service)}>Link kopieren</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => shareServiceViaEmail(service)}>Per E-Mail teilen</DropdownMenuItem>
                          <DropdownMenuItem onClick={async () => {
                            try {
                              toast({ title: "OnePager wird erstellt…", description: "Bitte einen Moment, der Download startet gleich." })
                              await generateServiceOnePagerPDF({
                                id: service.id,
                                title: service.title,
                                description: typeof service.description === 'string' ? service.description : String(service.description ?? ''),
                                price: Number(service.price || 0),
                                category: service.category,
                                technologyCategory: service.technologyCategory,
                                processCategory: service.processCategory,
                                technologies: Array.isArray(service.technologies) ? service.technologies : [],
                                image: service.image,
                                rating: typeof service.rating === 'number' ? service.rating : undefined,
                                duration: service.duration,
                                included: Array.isArray(service.included) ? service.included : [],
                                notIncluded: Array.isArray(service.notIncluded) ? service.notIncluded : [],
                                process: Array.isArray(service.process) ? service.process : [],
                              }, config.currency)
                              toast({ title: "Download gestartet", description: "Ihr OnePager wird heruntergeladen." })
                            } catch (e:any) {
                              console.error('[OnePager] Fehler bei der Generierung (Dropdown)', e)
                              toast({ title: "Fehler bei der PDF-Erstellung", description: "Bitte versuchen Sie es erneut.", variant: "destructive" })
                            }
                          }}>OnePager herunterladen</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700" onClick={() => {
                      setContactDialogTitle("Anfrage zu Angebot")
                      setContactEmailType("Service")
                      setContactContext(`Service: ${service.title}`)
                      setIsContactDialogOpen(true)
                    }}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Anfragen
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="flex gap-2">
                <Button variant={selectedServices.includes(service.id) ? "success" : "outline"} size="sm" onClick={() => toggleServiceSelection(service.id)}>
                  {selectedServices.includes(service.id) ? "Abwählen" : "Auswählen"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
        </div>
      )}

      {/* Load More Button */}
      {filteredServices.length > visibleItemsCount && (
        <div className="flex flex-col items-center mt-8 space-y-4">
          <div className="text-sm text-gray-600">
            {visibleItemsCount} von {filteredServices.length} Angeboten angezeigt
          </div>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => setVisibleItemsCount(prev => prev + ITEMS_PER_PAGE)}
            className="px-8 py-3 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-colors"
          >
            Mehr laden ({Math.min(ITEMS_PER_PAGE, filteredServices.length - visibleItemsCount)} weitere)
          </Button>
        </div>
      )}

      {/* Prozessansicht Dialog */}
      <Dialog open={showProcessView} onOpenChange={setShowProcessView}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prozessansicht</DialogTitle>
            <DialogDescription>Optimale Reihenfolge Ihrer ausgewählten Beratungsangebote</DialogDescription>
          </DialogHeader>

          <ProcessView selectedServiceIds={selectedServices} services={displayServices} />

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="font-bold text-lg">Gesamtpreis: {formatCurrency(totalPrice, config.currency)}</div>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
              <Button
                className="w-full sm:w-auto"
                variant="outline"
                onClick={() => {
                  toast({
                    title: "PDF generiert",
                    description: "Das Angebot wurde als PDF heruntergeladen.",
                  })
                }}
              >
                Als PDF speichern
              </Button>
              <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700" onClick={handleSendRequest}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Anfrage senden
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ausgewählte Services Zusammenfassung */}
      {selectedServices.length > 0 && (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Ausgewählte Beratungsangebote</h3>
          <ul className="mb-4">
            {selectedServices.map((id) => {
              const service = displayServices.find((s) => s.id === id)
              return service ? (
                <li key={id} className="flex justify-between items-center py-2 border-b border-green-100 last:border-0">
                  <span>{service.title}</span>
                  <span className="font-semibold">{formatCurrency(Number(service.price || 0), config.currency)}</span>
                </li>
              ) : null
            })}
          </ul>
          <div className="flex justify-between items-center font-semibold">
            <span>Gesamtpreis:</span>
            <span>{formatCurrency(totalPrice, config.currency)}</span>
          </div>
          <div className="mt-4 flex justify-end">
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleSendRequest}>
              Anfrage senden
            </Button>
          </div>
        </div>
      )}

      {/* Dialog für die Anfrage der ausgewählten Services */}
      <SelectedServicesDialog
        isOpen={isSelectedServicesDialogOpen}
        onClose={() => setIsSelectedServicesDialogOpen(false)}
        selectedServiceIds={selectedServices}
        services={displayServices}
        onSuccess={() => setSelectedServices([])}
      />
    </div>
  )
}
