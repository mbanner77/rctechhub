"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Search, Filter, Star, BarChart2, X, ChevronRight } from "lucide-react"
import BTPServiceCard from "@/components/btp-service-card"
import BTPServiceDetailDialog from "@/components/btp-service-detail-dialog"
import BTPServiceComparison from "@/components/btp-service-comparison"
import BTPServiceRating from "@/components/btp-service-rating"
import BTPServiceUseCases from "@/components/btp-service-use-cases"
import BTPServiceRecommendations from "@/components/btp-service-recommendations"
import BTPIntegrationScenarios from "@/components/btp-integration-scenarios"
import BTPArchitectureTemplates from "@/components/btp-architecture-templates"
import BTPPriceCalculator from "@/components/btp-price-calculator"
import { btpServices } from "@/data/btp-services"
import { useServicePreferences } from "@/lib/user-preferences"
import type { BTPService, BTPServiceCategory } from "@/types/btp-service"

export default function BTPServiceNavigator() {
  const { preferences, toggleFavorite, isFavorite, addToRecentlyViewed, toggleComparison, isInComparison } =
    useServicePreferences()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<BTPServiceCategory[]>([])
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)
  const [showOnlyFreeTier, setShowOnlyFreeTier] = useState(false)
  const [showOnlyTrial, setShowOnlyTrial] = useState(false)
  const [selectedService, setSelectedService] = useState<BTPService | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isComparisonOpen, setIsComparisonOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("services")
  const [serviceImageUrls, setServiceImageUrls] = useState<Record<string, string>>({})

  // Kategorien aus den Services extrahieren
  const categories = Array.from(new Set(btpServices.map((service) => service.category))) as BTPServiceCategory[]

  // Lade Bilder für Services
  useEffect(() => {
    const loadServiceImages = async () => {
      const imageUrls: Record<string, string> = {}

      for (const service of btpServices) {
        try {
          // Versuche, das Bild zu laden
          const imageUrl = `/images/btp-services/sap-${service.id.toLowerCase().replace(/_/g, "-")}.png`
          imageUrls[service.id] = imageUrl
        } catch (error) {
          console.error(`Failed to load image for service ${service.id}:`, error)
        }
      }

      setServiceImageUrls(imageUrls)
    }

    loadServiceImages()
  }, [])

  const handleServiceClick = (service: BTPService) => {
    setSelectedService(service)
    setIsDetailOpen(true)
    addToRecentlyViewed(service.id)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
  }

  const toggleCategory = (category: BTPServiceCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategories([])
    setShowOnlyFavorites(false)
    setShowOnlyFreeTier(false)
    setShowOnlyTrial(false)
  }

  const filteredServices = btpServices.filter((service) => {
    // Suche
    if (
      searchTerm &&
      !service.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !service.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(service.tags && service.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    ) {
      return false
    }

    // Kategorien
    if (selectedCategories.length > 0 && !selectedCategories.includes(service.category as BTPServiceCategory)) {
      return false
    }

    // Nur Favoriten
    if (showOnlyFavorites && !isFavorite(service.id)) {
      return false
    }

    // Nur Free Tier
    if (showOnlyFreeTier && !service.freeTier) {
      return false
    }

    // Nur Trial
    if (showOnlyTrial && !service.trial) {
      return false
    }

    return true
  })

  const comparisonServices = btpServices.filter((service) =>
    preferences.comparisons.some((item) => item.serviceId === service.id && item.selected),
  )

  const recentlyViewedServices = preferences.recentlyViewed
    .map((id) => btpServices.find((service) => service.id === id))
    .filter((service): service is BTPService => service !== undefined)
    .slice(0, 5)

  const favoriteServices = btpServices.filter((service) => preferences.favorites.includes(service.id))

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="architecture">Architektur</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="pricing">Preise</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Nach Services, Features oder Tags suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  {(selectedCategories.length > 0 || showOnlyFavorites || showOnlyFreeTier || showOnlyTrial) && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedCategories.length +
                        (showOnlyFavorites ? 1 : 0) +
                        (showOnlyFreeTier ? 1 : 0) +
                        (showOnlyTrial ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[400px]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium">Filter</h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Zurücksetzen
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Kategorien</h4>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category}`}
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={() => toggleCategory(category)}
                            />
                            <label
                              htmlFor={`category-${category}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium mb-3">Weitere Filter</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="favorites"
                        checked={showOnlyFavorites}
                        onCheckedChange={(checked) => setShowOnlyFavorites(checked === true)}
                      />
                      <label
                        htmlFor="favorites"
                        className="text-sm leading-none flex items-center peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <Star className="h-3.5 w-3.5 mr-1.5 text-yellow-500" />
                        Nur Favoriten
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="free-tier"
                        checked={showOnlyFreeTier}
                        onCheckedChange={(checked) => setShowOnlyFreeTier(checked === true)}
                      />
                      <label
                        htmlFor="free-tier"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Free Tier verfügbar
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="trial"
                        checked={showOnlyTrial}
                        onCheckedChange={(checked) => setShowOnlyTrial(checked === true)}
                      />
                      <label
                        htmlFor="trial"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Trial verfügbar
                      </label>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Button
              variant={isComparisonOpen ? "default" : "outline"}
              onClick={() => setIsComparisonOpen(!isComparisonOpen)}
              className="md:w-auto"
              disabled={comparisonServices.length === 0}
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              Vergleichen
              {comparisonServices.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {comparisonServices.length}
                </Badge>
              )}
            </Button>
          </div>

          {isComparisonOpen && comparisonServices.length > 0 && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <BTPServiceComparison
                  services={comparisonServices}
                  onRemoveService={(serviceId) => toggleComparison(serviceId)}
                  serviceImageUrls={serviceImageUrls}
                />
              </CardContent>
            </Card>
          )}

          {recentlyViewedServices.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Zuletzt angesehen</h2>
                <Button variant="ghost" size="sm">
                  Alle anzeigen <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {recentlyViewedServices.map((service) => (
                  <BTPServiceCard
                    key={service.id}
                    service={service}
                    imageUrl={serviceImageUrls[service.id] || ""}
                    onClick={() => handleServiceClick(service)}
                    isFavorite={isFavorite(service.id)}
                    onToggleFavorite={toggleFavorite}
                    isInComparison={isInComparison(service.id)}
                    onToggleComparison={toggleComparison}
                  />
                ))}
              </div>
            </div>
          )}

          {favoriteServices.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Meine Favoriten</h2>
                <Button variant="ghost" size="sm">
                  Alle anzeigen <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {favoriteServices.map((service) => (
                  <BTPServiceCard
                    key={service.id}
                    service={service}
                    imageUrl={serviceImageUrls[service.id] || ""}
                    onClick={() => handleServiceClick(service)}
                    isFavorite={true}
                    onToggleFavorite={toggleFavorite}
                    isInComparison={isInComparison(service.id)}
                    onToggleComparison={toggleComparison}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">
                Alle Services
                {filteredServices.length !== btpServices.length && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({filteredServices.length} von {btpServices.length})
                  </span>
                )}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredServices.map((service) => (
                <BTPServiceCard
                  key={service.id}
                  service={service}
                  imageUrl={serviceImageUrls[service.id] || ""}
                  onClick={() => handleServiceClick(service)}
                  isFavorite={isFavorite(service.id)}
                  onToggleFavorite={toggleFavorite}
                  isInComparison={isInComparison(service.id)}
                  onToggleComparison={toggleComparison}
                />
              ))}
            </div>

            {filteredServices.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Keine Services gefunden. Bitte passen Sie Ihre Filterkriterien an.</p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Filter zurücksetzen
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="architecture" className="space-y-6">
          <BTPArchitectureTemplates />
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <BTPIntegrationScenarios />
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <BTPPriceCalculator />
        </TabsContent>
      </Tabs>

      {selectedService && (
        <BTPServiceDetailDialog
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          service={selectedService}
          imageUrl={serviceImageUrls[selectedService.id] || ""}
          isFavorite={isFavorite(selectedService.id)}
          onToggleFavorite={toggleFavorite}
          isInComparison={isInComparison(selectedService.id)}
          onToggleComparison={toggleComparison}
        />
      )}

      {selectedService && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <BTPServiceUseCases service={selectedService} />
          <BTPServiceRating service={selectedService} />
        </div>
      )}

      {selectedService && (
        <div className="mt-8">
          <BTPServiceRecommendations service={selectedService} />
        </div>
      )}
    </div>
  )
}
