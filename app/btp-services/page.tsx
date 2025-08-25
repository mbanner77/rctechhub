"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { btpServices } from "@/data/btp-services"
import type { BTPService } from "@/types/btp-service"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ExternalLink, Info, BarChart2 } from "lucide-react"
import Image from "next/image"
import { generateBTPServiceImageUrl } from "@/data/btp-services"
import BTPServiceDetailDialog from "@/components/btp-service-detail-dialog"
import { analytics } from "@/lib/analytics"

export default function BTPServicePage() {
  const [services, setServices] = useState<BTPService[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<BTPService | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [comparisonList, setComparisonList] = useState<string[]>([])

  useEffect(() => {
    // Use the local data directly
    setServices(btpServices)
    setIsLoading(false)

    // Load favorites and comparison list from localStorage if available
    try {
      const savedFavorites = localStorage.getItem("btpFavorites")
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites))
      }

      const savedComparison = localStorage.getItem("btpComparison")
      if (savedComparison) {
        setComparisonList(JSON.parse(savedComparison))
      }
    } catch (error) {
      console.error("Error loading saved preferences:", error)
    }
  }, [])

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value
    setSearchTerm(searchValue)
    if (searchValue.length > 2) {
      analytics.search(searchValue, { page: 'btp-services' })
    }
  }

  const handleCategoryFilter = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const category = event.target.value
    setCategoryFilter(category)
    analytics.search('category-filter', { category, page: 'btp-services' })
  }

  const openServiceDetail = (service: BTPService) => {
    analytics.serviceClick(service.name, `btp-detail-${service.category}`)
    setSelectedService(service)
    setIsDetailOpen(true)
  }

  const closeServiceDetail = () => {
    setIsDetailOpen(false)
  }

  const toggleFavorite = (serviceId: string) => {
    const newFavorites = favorites.includes(serviceId)
      ? favorites.filter((id) => id !== serviceId)
      : [...favorites, serviceId]

    setFavorites(newFavorites)
    try {
      localStorage.setItem("btpFavorites", JSON.stringify(newFavorites))
    } catch (error) {
      console.error("Error saving favorites:", error)
    }
  }

  const toggleComparison = (serviceId: string) => {
    const newComparisonList = comparisonList.includes(serviceId)
      ? comparisonList.filter((id) => id !== serviceId)
      : [...comparisonList, serviceId]

    setComparisonList(newComparisonList)
    try {
      localStorage.setItem("btpComparison", JSON.stringify(newComparisonList))
    } catch (error) {
      console.error("Error saving comparison list:", error)
    }
  }

  const filteredServices = services.filter((service) => {
    const searchMatch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.tags && service.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())))

    const categoryMatch = categoryFilter === "" || service.category === categoryFilter
    return searchMatch && categoryMatch
  })

  // Get unique categories from the services
  const categories = [...new Set(services.map((service) => service.category))].sort()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">SAP BTP Services</h1>

      <div className="flex flex-col md:flex-row mb-6 gap-4">
        <div className="w-full md:w-2/3">
          <input
            type="text"
            placeholder="Nach Services, Features oder Tags suchen..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="w-full md:w-1/3">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={categoryFilter}
            onChange={handleCategoryFilter}
          >
            <option value="">Alle Kategorien</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Keine Services gefunden, die den Filterkriterien entsprechen.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const isFavorite = favorites.includes(service.id)
            const isInComparison = comparisonList.includes(service.id)

            return (
              <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-4 flex items-center">
                  <div className="w-12 h-12 relative mr-3 flex-shrink-0">
                    <Image
                      src={generateBTPServiceImageUrl(service.id, service) || "/placeholder.svg"}
                      alt={service.name}
                      width={48}
                      height={48}
                      className="object-contain"
                      onError={(e) => {
                        // Fallback to a placeholder if the image fails to load
                        const target = e.target as HTMLImageElement
                        target.src = `/placeholder.svg?height=48&width=48&query=${service.name}`
                      }}
                    />
                  </div>
                  <div className="flex-grow">
                    <h2 className="text-lg font-semibold">{service.name}</h2>
                    <Badge variant="outline" className="mt-1">
                      {service.category}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(service.id)
                      }}
                      title={isFavorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
                    >
                      <Star className={`h-4 w-4 ${isFavorite ? "fill-yellow-500 text-yellow-500" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleComparison(service.id)
                      }}
                      title={isInComparison ? "Aus Vergleich entfernen" : "Zum Vergleich hinzufügen"}
                    >
                      <BarChart2 className={`h-4 w-4 ${isInComparison ? "text-blue-500" : ""}`} />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">{service.description}</p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {service.tags &&
                      service.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    {service.tags && service.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{service.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm">
                    {service.trial && (
                      <Badge variant="outline" className="bg-blue-50">
                        Trial
                      </Badge>
                    )}
                    {service.freeTier && (
                      <Badge variant="outline" className="bg-green-50">
                        Free Tier
                      </Badge>
                    )}
                    {service.implementationTime && (
                      <Badge variant="outline" className="bg-gray-50">
                        {service.implementationTime}
                      </Badge>
                    )}
                  </div>

                  <div className="flex justify-between mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sm flex items-center text-blue-600 hover:text-blue-800 p-0"
                      onClick={() => openServiceDetail(service)}
                    >
                      <Info size={16} className="mr-1" />
                      Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sm flex items-center text-blue-600 hover:text-blue-800 p-0"
                      asChild
                    >
                      <a href={service.documentation} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={16} className="mr-1" />
                        Docs
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {selectedService && (
        <BTPServiceDetailDialog
          isOpen={isDetailOpen}
          onClose={closeServiceDetail}
          service={selectedService}
          imageUrl={generateBTPServiceImageUrl(selectedService.id, selectedService)}
          isFavorite={favorites.includes(selectedService.id)}
          onToggleFavorite={toggleFavorite}
          isInComparison={comparisonList.includes(selectedService.id)}
          onToggleComparison={toggleComparison}
        />
      )}
    </div>
  )
}
