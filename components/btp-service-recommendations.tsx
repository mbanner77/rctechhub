"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import BTPServiceCard from "@/components/btp-service-card"
import { btpServices } from "@/data/btp-services"
import type { BTPService } from "@/types/btp-service"

interface BTPServiceRecommendationsProps {
  service: BTPService
  onServiceClick?: (service: BTPService) => void
}

export default function BTPServiceRecommendations({ service, onServiceClick }: BTPServiceRecommendationsProps) {
  // Return null if service is undefined
  if (!service) return null

  // Empfehlungen basierend auf Kategorie und Tags
  const getRecommendations = () => {
    // Wenn der Service verwandte Services hat, verwende diese
    if (service.relatedServices && service.relatedServices.length > 0) {
      return service.relatedServices
        .map((id) => btpServices.find((s) => s.id === id))
        .filter((s): s is BTPService => s !== undefined && s.id !== service.id)
        .slice(0, 4)
    }

    // Andernfalls empfehle Services aus derselben Kategorie
    const sameCategory = btpServices.filter((s) => s.category === service.category && s.id !== service.id)

    // Wenn nicht genug Services aus derselben Kategorie, füge andere hinzu
    if (sameCategory.length >= 4) {
      return sameCategory.slice(0, 4)
    } else {
      const otherRecommendations = btpServices
        .filter((s) => s.category !== service.category && s.id !== service.id)
        .slice(0, 4 - sameCategory.length)

      return [...sameCategory, ...otherRecommendations]
    }
  }

  const recommendations = getRecommendations()

  if (recommendations.length === 0) return null

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Empfohlene Services</h3>
          <Button variant="ghost" size="sm">
            Alle anzeigen <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.map((recommendedService) => (
            <BTPServiceCard
              key={recommendedService.id}
              service={recommendedService}
              imageUrl={`/images/btp-services/sap-${recommendedService.id.toLowerCase().replace(/_/g, "-")}.png`}
              onClick={() => (onServiceClick ? onServiceClick(recommendedService) : {})}
              showActions={false}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
