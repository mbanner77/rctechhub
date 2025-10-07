"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ArrowRight, Check, Info, Star, BookOpen, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardTitle, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { defaultServices } from "@/data/default-data"
import { db } from "@/lib/db"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { mockSchulungen } from "@/app/api/shared/mock-data/schulungen"
import parse from 'html-react-parser'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { analytics } from "@/lib/analytics"
import ProcessView from "@/components/process-view"
import { useToast } from "@/hooks/use-toast"
import { parseQuillHTML } from "@/lib/html-parser"
import MinimalContactDialog from "@/components/minimal-contact-dialog"
import { generateServiceOnePagerPDF } from "@/lib/onepager"
import { useSiteConfig } from "@/hooks/use-site-config"
import { formatCurrency } from "@/lib/currency"

export default function StarterPackages() {
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("all")
  const [showProcessView, setShowProcessView] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<string>("")
  const { toast } = useToast()
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  const [contactContext, setContactContext] = useState<string | undefined>(undefined)
  const [contactDialogTitle, setContactDialogTitle] = useState<string | undefined>(undefined)
  const [contactEmailType, setContactEmailType] = useState<string | undefined>(undefined)
  const { config } = useSiteConfig()

  // Pagination state for each category
  const ITEMS_PER_PAGE = 6
  const [visibleItemsCount, setVisibleItemsCount] = useState({
    ideate: ITEMS_PER_PAGE,
    innovate: ITEMS_PER_PAGE,
    operate: ITEMS_PER_PAGE,
    other: ITEMS_PER_PAGE,
    all: ITEMS_PER_PAGE
  })

  // Handle tab selection and deselection
  const handleTabChange = (value: string) => {
    // If the same tab is clicked again, reset to "all" (deselection)
    if (value === activeTab) {
      setActiveTab("all")
      // Track deselection event
      analytics.search('starterpackage-filter-deselect', { category: value })
    } else {
      setActiveTab(value)
      // Track selection event
      if (value !== "all") {
        analytics.search('starterpackage-filter-select', { category: value })
      }
    }
  }

  // Helper function to get tab classes based on selection state
  const getTabClasses = (category: string) => {
    const baseClasses = "text-xs sm:text-sm py-1.5 px-2 sm:px-3 whitespace-nowrap flex items-center gap-1 relative"
    
    if (category === "all") {
      return `${baseClasses} ${activeTab === "all" ? "font-semibold" : ""}`
    }
    
    // Color mapping for categories
    const colorMap = {
      "ideate": "text-purple-600 hover:text-purple-700",
      "innovate": "text-blue-600 hover:text-blue-700",
      "operate": "text-green-600 hover:text-green-700"
    }
    
    const isActive = activeTab === category
    const categoryColor = colorMap[category as keyof typeof colorMap] || ""
    
    return `${baseClasses} ${categoryColor} ${isActive ? "font-semibold bg-opacity-10 bg-gray-100" : ""}`
  }

  useEffect(() => {
    const loadServices = async () => {
      try {
        console.log("[STARTER-PACKAGES] Loading services from database...")
        setIsLoading(true)

        // Load directly from IndexedDB
        const dbServices = await db.services.toArray()

        if (dbServices && dbServices.length > 0) {
          console.log("[STARTER-PACKAGES] Services loaded from database:", dbServices.length)
          setServices(dbServices)
          setError(null)
        } else {
          console.log("[STARTER-PACKAGES] No services found in database, using default data")
          setServices(defaultServices)
        }
      } catch (err) {
        console.error("[STARTER-PACKAGES] Error loading services:", err)
        setServices(defaultServices)
        setError("Error loading services. Default data is being used.")
      } finally {
        setIsLoading(false)
      }
    }

    loadServices()
  }, [])

  // Filter only StarterPackages
  const starterPackages = services.filter((service) => service.isStarterPackage)

  // Group by process category
  const ideatePackages = starterPackages.filter((service) => service.processCategory === "Ideate")
  const innovatePackages = starterPackages.filter((service) => service.processCategory === "Innovate")
  const operatePackages = starterPackages.filter((service) => service.processCategory === "Operate")
  const otherPackages = starterPackages.filter(
    (service) =>
      !service.processCategory ||
      (service.processCategory !== "Ideate" &&
        service.processCategory !== "Innovate" &&
        service.processCategory !== "Operate"),
  )

  // Reset pagination when tab changes
  useEffect(() => {
    setVisibleItemsCount(prev => ({
      ...prev,
      [activeTab]: ITEMS_PER_PAGE
    }))
  }, [activeTab])

  // Function to load more items for a specific category
  const loadMoreItems = (category: string) => {
    setVisibleItemsCount(prev => ({
      ...prev,
      [category]: prev[category as keyof typeof prev] + ITEMS_PER_PAGE
    }))
  }

  // Function to get visible items for a category
  const getVisibleItems = (items: any[], category: string) => {
    const count = visibleItemsCount[category as keyof typeof visibleItemsCount]
    return items.slice(0, count)
  }

  // Function to check if more items can be loaded
  const canLoadMore = (items: any[], category: string) => {
    const count = visibleItemsCount[category as keyof typeof visibleItemsCount]
    return items.length > count
  }

  // For the "all" tab, combine all packages and paginate
  const getAllPackagesForPagination = () => {
    const allPackages = [
      ...ideatePackages.map(pkg => ({ ...pkg, categoryType: 'ideate' })),
      ...innovatePackages.map(pkg => ({ ...pkg, categoryType: 'innovate' })),
      ...operatePackages.map(pkg => ({ ...pkg, categoryType: 'operate' })),
      ...otherPackages.map(pkg => ({ ...pkg, categoryType: 'other' }))
    ]
    return allPackages
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Header skeleton */}
        <div className="bg-gray-200 rounded-lg p-8 animate-pulse">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="h-8 w-3/4 bg-gray-300 rounded"></div>
            <div className="h-5 w-full bg-gray-300 rounded"></div>
            <div className="h-5 w-5/6 bg-gray-300 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-300 p-4 rounded-lg">
                  <div className="h-6 w-3/4 bg-gray-400 rounded mb-2"></div>
                  <div className="h-4 w-full bg-gray-400 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="flex flex-col mb-4 gap-3">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mx-auto"></div>
          <div className="flex justify-center">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="overflow-hidden rounded-lg border bg-white shadow-sm border-t-4 border-t-gray-300">
              {/* Image skeleton */}
              <div className="relative h-48 bg-gray-200 animate-pulse"></div>
              
              {/* Content skeleton */}
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  <div className="h-5 w-12 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              
              {/* Footer skeleton */}
              <div className="p-4 sm:p-6 pt-0 flex gap-2 justify-between">
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">Lade Starter Packages...</p>
        </div>
      </div>
    )
  }

  if (starterPackages.length === 0) {
    return null; // Don't display anything when no Starter Packages are available
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-700 to-green-900 text-white rounded-lg p-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Starter Packages: Ihr risikofreier Einstieg in neue Technologien</h2>
          <p className="text-lg opacity-90 mb-6">
            Unsere Starter Packages bieten Ihnen einen schnellen und risikofreien Einstieg in neue Technologien und
            Herausforderungen - zu Festpreisen, mit garantierten Ergebnissen und wertvollem Wissenstransfer.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Festpreis-Garantie</h3>
              <p className="text-sm opacity-90">Kalkulierbare Kosten ohne versteckte Überraschungen</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Schnelle Erfolge</h3>
              <p className="text-sm opacity-90">Fokus auf Quick Wins für sofortige Mehrwerte</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Wissenstransfer</h3>
              <p className="text-sm opacity-90">Umfassender Know-how-Transfer an Ihr Team</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex flex-col mb-4 gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-center">Verfügbare Starter Packages</h2>
          <div className="flex justify-center overflow-x-auto pb-2">
            <TabsList className="flex-wrap h-auto mx-auto w-fit">
              <TabsTrigger value="all" className={getTabClasses("all")}>
                <span>Alle</span>
                {activeTab === "all" && <Check className="h-3.5 w-3.5 text-green-500" aria-label="Selected" />}
              </TabsTrigger>
              <TabsTrigger value="ideate" className={getTabClasses("ideate")}>
                <span>Ideate</span>
                {activeTab === "ideate" && <X className="h-3.5 w-3.5 ml-1 bg-purple-100 p-0.5 rounded-full" aria-label="Deselect" />}
              </TabsTrigger>
              <TabsTrigger value="innovate" className={getTabClasses("innovate")}>
                <span>Innovate</span>
                {activeTab === "innovate" && <X className="h-3.5 w-3.5 ml-1 bg-blue-100 p-0.5 rounded-full" aria-label="Deselect" />}
              </TabsTrigger>
              <TabsTrigger value="operate" className={getTabClasses("operate")}>
                <span>Operate</span>
                {activeTab === "operate" && <X className="h-3.5 w-3.5 ml-1 bg-green-100 p-0.5 rounded-full" aria-label="Deselect" />}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="all" className="space-y-8">
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Alle Starter Packages</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
                      <Info className="h-4 w-4 text-gray-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Klicken Sie auf eine Kategorie zum Filtern. Klicken Sie erneut auf dieselbe Kategorie zum Zurücksetzen.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-gray-700">
              Hier sehen Sie alle verfügbaren Starter Packages. Nutzen Sie die Filter-Tabs, um die Auswahl nach Kategorie einzuschränken oder zurückzusetzen.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getVisibleItems(getAllPackagesForPagination(), 'all').map((service) => renderPackageCard(service))}
          </div>
          
          {canLoadMore(getAllPackagesForPagination(), 'all') && (
            <div className="flex flex-col items-center mt-8 space-y-4">
              <div className="text-sm text-gray-600">
                {visibleItemsCount.all} von {getAllPackagesForPagination().length} Starter Packages angezeigt
              </div>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => loadMoreItems('all')}
                className="px-8 py-3 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-colors"
              >
                Mehr laden ({Math.min(ITEMS_PER_PAGE, getAllPackagesForPagination().length - visibleItemsCount.all)} weitere)
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ideate">
          <div className="mb-6 p-4 bg-purple-50 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">Ideate: Konzeption & Planung</h3>
            <p className="text-gray-700">
              Unsere Ideate-Pakete unterstützen Sie bei der strategischen Planung und Konzeption Ihrer digitalen
              Initiativen. Von der ersten Idee bis zum detaillierten Konzept - wir helfen Ihnen, die richtigen Weichen
              zu stellen.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideatePackages.length > 0 ? (
              getVisibleItems(ideatePackages, 'ideate').map(renderPackageCard)
            ) : (
              <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">Keine Ideate-Pakete verfügbar</p>
              </div>
            )}
          </div>
          
          {canLoadMore(ideatePackages, 'ideate') && (
            <div className="flex flex-col items-center mt-8 space-y-4">
              <div className="text-sm text-gray-600">
                {visibleItemsCount.ideate} von {ideatePackages.length} Ideate-Paketen angezeigt
              </div>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => loadMoreItems('ideate')}
                className="px-8 py-3 border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-colors"
              >
                Mehr laden ({Math.min(ITEMS_PER_PAGE, ideatePackages.length - visibleItemsCount.ideate)} weitere)
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="innovate">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Innovate: Entwicklung & Umsetzung</h3>
            <p className="text-gray-700">
              Mit unseren Innovate-Paketen setzen wir Ihre Konzepte in die Praxis um. Wir entwickeln maßgeschneiderte
              Lösungen, integrieren Technologien und sorgen für eine reibungslose Implementierung.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {innovatePackages.length > 0 ? (
              getVisibleItems(innovatePackages, 'innovate').map(renderPackageCard)
            ) : (
              <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">Keine Innovate-Pakete verfügbar</p>
              </div>
            )}
          </div>
          
          {canLoadMore(innovatePackages, 'innovate') && (
            <div className="flex flex-col items-center mt-8 space-y-4">
              <div className="text-sm text-gray-600">
                {visibleItemsCount.innovate} von {innovatePackages.length} Innovate-Paketen angezeigt
              </div>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => loadMoreItems('innovate')}
                className="px-8 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
              >
                Mehr laden ({Math.min(ITEMS_PER_PAGE, innovatePackages.length - visibleItemsCount.innovate)} weitere)
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="operate">
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Operate: Betrieb & Optimierung</h3>
            <p className="text-gray-700">
              Unsere Operate-Pakete sorgen für einen reibungslosen Betrieb und kontinuierliche Optimierung Ihrer
              Lösungen. Wir überwachen, warten und verbessern Ihre Systeme, damit Sie sich auf Ihr Kerngeschäft
              konzentrieren können.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {operatePackages.length > 0 ? (
              getVisibleItems(operatePackages, 'operate').map(renderPackageCard)
            ) : (
              <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">Keine Operate-Pakete verfügbar</p>
              </div>
            )}
          </div>
          
          {canLoadMore(operatePackages, 'operate') && (
            <div className="flex flex-col items-center mt-8 space-y-4">
              <div className="text-sm text-gray-600">
                {visibleItemsCount.operate} von {operatePackages.length} Operate-Paketen angezeigt
              </div>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => loadMoreItems('operate')}
                className="px-8 py-3 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-colors"
              >
                Mehr laden ({Math.min(ITEMS_PER_PAGE, operatePackages.length - visibleItemsCount.operate)} weitere)
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Knowledge Hub - Schulungen Sektion */}
      <section className="mt-8">
        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Knowledge Hub - Schulungen</h2>
          <p className="text-lg mb-8">
            Erweitern Sie Ihr Wissen mit unseren spezialisierten Schulungen. Unsere Experten vermitteln 
            Ihnen praxisnahes Wissen zu den neuesten Technologien und Best Practices.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockSchulungen.map((schulung) => (
              <Card key={schulung.id} className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-center">
                    <BookOpen className="h-6 w-6 text-primary mr-2" />
                    <CardTitle>{schulung.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Kategorie:</span>
                      <Badge variant="outline">{schulung.category}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Dauer:</span>
                      <span className="text-sm">{schulung.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Preis:</span>
                      <span className="text-sm font-bold">
                        {typeof schulung.price === 'number' && schulung.price > 0 ? formatCurrency(Number(schulung.price || 0), config.currency) : "Kostenlos"}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Details anzeigen
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700 flex-1"
                    onClick={() => {
                      setContactDialogTitle("Anfrage zur Schulung")
                      setContactEmailType("Schulung")
                      setContactContext(`Schulung: ${schulung.title}`)
                      setIsContactDialogOpen(true)
                    }}
                  >
                    Anfragen
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-center mt-6">
            <Button className="bg-green-600 hover:bg-green-700">
              Alle Schulungen anzeigen
            </Button>
          </div>
        </div>
      </section>
      
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Wie funktionieren unsere Starter Packages?</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="bg-green-100 text-green-800 w-8 h-8 rounded-full flex items-center justify-center mb-3">
              1
            </div>
            <h4 className="font-semibold mb-2">Auswahl</h4>
            <p className="text-sm text-gray-600">Wählen Sie das passende StarterPackage für Ihre Anforderungen aus</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="bg-green-100 text-green-800 w-8 h-8 rounded-full flex items-center justify-center mb-3">
              2
            </div>
            <h4 className="font-semibold mb-2">Kickoff</h4>
            <p className="text-sm text-gray-600">Gemeinsamer Kickoff-Workshop zur Abstimmung der Details</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="bg-green-100 text-green-800 w-8 h-8 rounded-full flex items-center justify-center mb-3">
              3
            </div>
            <h4 className="font-semibold mb-2">Umsetzung</h4>
            <p className="text-sm text-gray-600">Schnelle und effiziente Umsetzung durch unsere Experten</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="bg-green-100 text-green-800 w-8 h-8 rounded-full flex items-center justify-center mb-3">
              4
            </div>
            <h4 className="font-semibold mb-2">Wissenstransfer</h4>
            <p className="text-sm text-gray-600">Umfassender Know-how-Transfer und Dokumentation</p>
          </div>
        </div>
      </div>



      {/* Process View Dialog */}
      <Dialog open={showProcessView} onOpenChange={setShowProcessView}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prozessansicht</DialogTitle>
            <DialogDescription>Optimale Reihenfolge Ihrer ausgewählten Beratungsangebote</DialogDescription>
          </DialogHeader>

          {/* Pass the selected package ID as an array to the ProcessView component */}
          <ProcessView 
            selectedServiceIds={selectedPackage ? [selectedPackage] : []} 
            services={services} 
          />

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="font-bold text-lg">
              Gesamtpreis: {formatCurrency(Number((selectedPackage && services.find(s => s.id === selectedPackage)?.price) || 0), config.currency)}
            </div>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
              <Button 
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                onClick={() => {
                  console.log("Sending request for package:", selectedPackage);
                  // Close dialog after sending
                  setShowProcessView(false);
                }}
              >
                Anfrage senden
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Global minimal contact dialog */}
      <MinimalContactDialog
        isOpen={isContactDialogOpen}
        onClose={() => setIsContactDialogOpen(false)}
        title={contactDialogTitle}
        context={contactContext}
        emailType={contactEmailType}
      />
    </div>
  )

  function renderPackageCard(service: any) {
    return (
      <Card
        key={service.id}
        className={`overflow-hidden hover:shadow-lg transition-shadow border-t-4 ${
          service.processCategory === "Ideate"
            ? "border-t-purple-500"
            : service.processCategory === "Innovate"
              ? "border-t-blue-500"
              : service.processCategory === "Operate"
                ? "border-t-green-500"
                : "border-t-gray-500"
        }`}
      >
        <div className="relative h-48">
          <Image
            src={service.image || "/placeholder.svg"}
            alt={service.title}
            fill
            className="object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?key=service"
            }}
          />
          <div className="absolute top-2 left-2 flex gap-1">
            {service.rating && (
              <div className="bg-white bg-opacity-90 text-yellow-500 px-2 py-1 rounded-full text-sm font-medium flex items-center">
                <Star className="w-4 h-4 fill-yellow-500 mr-1" />
                {service.rating}
              </div>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-20 opacity-70"></div>
        </div>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
            <Badge variant="outline" className="text-xs whitespace-normal break-words">{service.category}</Badge>
            <span className="font-bold text-lg whitespace-nowrap">{formatCurrency(Number(service.price || 0), config.currency)}</span>
          </div>
          <CardTitle className="text-lg sm:text-xl mb-2 break-words">{service.title}</CardTitle>
          <CardDescription className="line-clamp-3 text-sm">{parseQuillHTML(service.description)}</CardDescription>
          <div className="flex flex-wrap gap-1 sm:gap-2 mt-4">
            {service.technologyCategory && (
              <Badge
                variant="secondary"
                className={`text-xs whitespace-normal break-words ${
                  service.technologyCategory === "SAP"
                    ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                    : service.technologyCategory === "Microsoft"
                      ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                      : service.technologyCategory === "Open Source"
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {service.technologyCategory}
              </Badge>
            )}
            {service.processCategory && (
              <Badge
                variant="secondary"
                className={`text-xs whitespace-normal break-words ${
                  service.processCategory === "Ideate"
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
        </CardContent>
        <CardFooter className="p-4 sm:p-6 pt-0 flex flex-wrap gap-2 justify-between">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="text-xs sm:text-sm"
                size="sm"
                onClick={() => analytics.dialogOpen('service-details', service.id)}
              >
                Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw]">
              <DialogHeader>
                <DialogTitle className="break-words text-xl sm:text-2xl">{service.title}</DialogTitle>
                <DialogDescription>Festpreis: {formatCurrency(Number(service.price || 0), config.currency)}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 overflow-y-auto">
                <div className="relative h-60 w-full rounded-lg overflow-hidden">
                  <Image
                    src={service.image || "/placeholder.svg"}
                    alt={service.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?key=details"
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Beschreibung</h3>
                  <p>{service.description}</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="min-w-[150px] flex-1">
                    <h3 className="font-medium text-lg mb-2">Technologien</h3>
                    <div className="flex flex-wrap gap-2">
                      {service.technologies.map((tech: string) => (
                        <Badge key={tech} variant="secondary" className="text-xs whitespace-normal break-words">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="min-w-[150px] flex-1">
                    <h3 className="font-medium text-lg mb-2">Kategorien</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs whitespace-normal break-words">{service.category}</Badge>
                      {service.technologyCategory && (
                        <Badge
                          variant="secondary"
                          className={`${
                            service.technologyCategory === "SAP"
                              ? "bg-blue-100 text-blue-800"
                              : service.technologyCategory === "Microsoft"
                                ? "bg-purple-100 text-purple-800"
                                : service.technologyCategory === "Open Source"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {service.technologyCategory}
                        </Badge>
                      )}
                      {service.processCategory && (
                        <Badge
                          variant="secondary"
                          className={`${
                            service.processCategory === "Ideate"
                              ? "bg-purple-100 text-purple-800"
                              : service.processCategory === "Innovate"
                                ? "bg-blue-100 text-blue-800"
                                : service.processCategory === "Operate"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
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

                <div>
                  <h3 className="font-medium text-lg">Im Festpreis enthalten:</h3>
                  <ul className="space-y-2 mt-2">
                    {service.included.map((item: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <Check size={18} className="text-green-500 mr-2 mt-1 shrink-0 flex-shrink-0" />
                        <span className="break-words text-sm sm:text-base">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {service.notIncluded && service.notIncluded.length > 0 && (
                  <div>
                    <h3 className="font-medium text-lg">Nicht enthalten:</h3>
                    <ul className="space-y-2 mt-2">
                      {service.notIncluded.map((item: string, index: number) => (
                        <li key={index} className="flex items-start text-gray-600">
                          <span className="mr-2 flex-shrink-0">•</span>
                          <span className="break-words text-sm sm:text-base">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="font-medium text-lg mb-2">Projektablauf:</h3>
                  <ol className="relative border-l border-gray-200 ml-3 space-y-6 mt-4">
                    {service.process.map((step: any, index: number) => (
                      <li key={index} className="ml-6">
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-green-100 rounded-full -left-3 ring-8 ring-white">
                          {index + 1}
                        </span>
                        <h3 className="font-semibold break-words">{step.title}</h3>
                        <div className="text-gray-600 break-words">
                          {parse(step.description)}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          onClick={() => {
                            generateServiceOnePagerPDF({
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
                            })
                          }}
                        >
                          OnePager herunterladen
                        </Button>
                        <Button 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            // Set the selected package and open the process view dialog
                            setSelectedPackage(service.id);
                            setShowProcessView(true);
                            // Close the details dialog
                            analytics.dialogOpen('process-view', service.id);
                          }}
                        >
                          StarterPackage anfragen
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Anfrage für dieses StarterPackage senden</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="default" 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => {
              setContactDialogTitle("Anfrage zum StarterPackage")
              setContactEmailType("StarterPackage")
              setContactContext(`StarterPackage: ${service.title}`)
              setIsContactDialogOpen(true)
            }}
          >
            Anfragen
          </Button>
        </CardFooter>
      </Card>
    )
  }
}
