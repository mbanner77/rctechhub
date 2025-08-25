"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import type { BTPService } from "@/types/btp-service"
import {
  CheckCircle,
  ExternalLink,
  Star,
  BarChart2,
  Info,
  Server,
  Globe,
  Shield,
  Clock,
  DollarSign,
  BookOpen,
} from "lucide-react"
import { generateServicePlaceholderImage } from "@/lib/utils"
import { btpServices } from "@/data/btp-services" // Import btpServices
import { analytics } from "@/lib/analytics"
import { parseQuillHTML } from "@/lib/html-parser"

interface BTPServiceDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  service: BTPService
  imageUrl: string
  isFavorite?: boolean
  onToggleFavorite?: (serviceId: string) => void
  isInComparison?: boolean
  onToggleComparison?: (serviceId: string) => void
}

export default function BTPServiceDetailDialog({
  isOpen,
  onClose,
  service,
  imageUrl,
  isFavorite = false,
  onToggleFavorite,
  isInComparison = false,
  onToggleComparison,
}: BTPServiceDetailDialogProps) {
  if (!service) return null

  const handleFavoriteClick = () => {
    if (onToggleFavorite) {
      analytics.serviceClick(service.name, isFavorite ? 'unfavorite' : 'favorite')
      onToggleFavorite(service.id)
    }
  }

  const handleComparisonClick = () => {
    if (onToggleComparison) {
      onToggleComparison(service.id)
    }
  }

  // Generiere ein Fallback-Bild für den Fall, dass das Hauptbild nicht geladen werden kann
  const fallbackImageUrl = generateServicePlaceholderImage(service.name, service.category)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                <Image
                  src={imageUrl || "/placeholder.svg"}
                  alt={service.name}
                  width={48}
                  height={48}
                  className="object-contain"
                  onError={(e) => {
                    // Fallback für Bilder, die nicht geladen werden können
                    e.currentTarget.src = fallbackImageUrl
                  }}
                />
              </div>
              <div>
                <DialogTitle className="text-xl">{service.name}</DialogTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">{service.category}</Badge>
                  {service.trial && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Trial
                    </Badge>
                  )}
                  {service.freeTier && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Free Tier
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {onToggleFavorite && (
                <Button
                  variant={isFavorite ? "default" : "outline"}
                  size="sm"
                  onClick={handleFavoriteClick}
                  className="flex items-center gap-1"
                >
                  <Star className={`h-4 w-4 ${isFavorite ? "fill-yellow-500 text-yellow-500" : ""}`} />
                  {isFavorite ? "Favorit" : "Favorisieren"}
                </Button>
              )}
              {onToggleComparison && (
                <Button
                  variant={isInComparison ? "default" : "outline"}
                  size="sm"
                  onClick={handleComparisonClick}
                  className="flex items-center gap-1"
                >
                  <BarChart2 className="h-4 w-4" />
                  {isInComparison ? "Verglichen" : "Vergleichen"}
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <Info className="h-4 w-4" />
              Übersicht
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="technical" className="flex items-center gap-1">
              <Server className="h-4 w-4" />
              Technisch
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Preise
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              <DialogDescription className="text-base leading-relaxed">{parseQuillHTML(service.description)}</DialogDescription>

              {/* Zusätzliche Informationen */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {service.implementationTime && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">Implementierungszeit</div>
                      <div className="text-sm text-gray-600">{service.implementationTime}</div>
                    </div>
                  </div>
                )}
                {service.costLevel && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">Kostenlevel</div>
                      <div className="text-sm text-gray-600">{service.costLevel}</div>
                    </div>
                  </div>
                )}
                {service.skillLevel && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                    <BookOpen className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">Skill-Level</div>
                      <div className="text-sm text-gray-600">{service.skillLevel}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-sm font-medium mb-2">Tags</h3>
                {service.tags && service.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-800">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Keine Tags hinterlegt</p>
                )}
              </div>

              {/* Anwendungsbeispiele */}
              <div>
                <h3 className="text-sm font-medium mb-2">Anwendungsbeispiele</h3>
                {service.useCases && service.useCases.length > 0 ? (
                  <ul className="space-y-2">
                    {service.useCases.map((useCase, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{useCase}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">Keine Anwendungsbeispiele hinterlegt</p>
                )}
              </div>

              {/* Verwandte Services */}
              <div>
                <h3 className="text-sm font-medium mb-2">Verwandte Services</h3>
                {service.relatedServices && service.relatedServices.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {service.relatedServices.map((relatedId) => {
                      const relatedService = btpServices.find((s) => s.id === relatedId)
                      return relatedService ? (
                        <Badge key={relatedId} variant="outline">
                          {relatedService.name}
                        </Badge>
                      ) : null
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Keine verwandten Services hinterlegt</p>
                )}
              </div>

              <div className="flex justify-end mt-4">
                <Button asChild variant="outline" size="sm">
                  <a
                    href={service.documentation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Offizielle Dokumentation
                  </a>
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features">
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4">Features und Funktionen</h3>
              {service.features && service.features.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-gray-800">{feature}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Keine Features hinterlegt</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="technical">
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4">Technische Details</h3>

              {/* Umgebungen */}
              <div>
                <h4 className="text-sm font-medium mb-2">Unterstützte Umgebungen</h4>
                {service.environments && service.environments.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {service.environments.map((env) => (
                      <Badge key={env} variant="outline" className="flex items-center gap-1">
                        <Server className="h-3 w-3" />
                        {env}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic mb-6">Keine Umgebungen hinterlegt</p>
                )}
              </div>

              {/* Regionen */}
              <div>
                <h4 className="text-sm font-medium mb-2">Verfügbare Regionen</h4>
                {service.regions && service.regions.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {service.regions.map((region) => (
                      <Badge key={region} variant="outline" className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {region}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic mb-6">Keine Regionen hinterlegt</p>
                )}
              </div>

              {/* Zertifizierungen */}
              <div>
                <h4 className="text-sm font-medium mb-2">Zertifizierungen</h4>
                {service.certifications && service.certifications.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {service.certifications.map((cert) => (
                      <Badge key={cert} variant="outline" className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {cert}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic mb-6">Keine Zertifizierungen hinterlegt</p>
                )}
              </div>

              {/* Technische Dokumentation */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium mb-2">Technische Ressourcen</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={service.documentation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      API-Referenz
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={service.documentation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Entwicklerhandbuch
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={service.documentation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Code-Beispiele
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={service.documentation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Tutorials
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pricing">
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4">Preismodell</h3>
              <p className="text-gray-700 mb-6">{service.pricing}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border rounded-lg p-6">
                  <h4 className="text-lg font-medium mb-2">Free Tier</h4>
                  <p className="text-gray-600 mb-4">
                    {service.freeTier
                      ? "Verfügbar mit eingeschränkten Funktionen und Limits"
                      : "Nicht verfügbar für diesen Service"}
                  </p>
                  {service.freeTier && (
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Grundlegende Funktionen</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Begrenzte Ressourcen</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Community-Support</span>
                      </li>
                    </ul>
                  )}
                </div>

                <div className="border rounded-lg p-6 border-blue-200 bg-blue-50">
                  <h4 className="text-lg font-medium mb-2">Trial</h4>
                  <p className="text-gray-600 mb-4">
                    {service.trial
                      ? "Vollständige Funktionalität für einen begrenzten Zeitraum"
                      : "Nicht verfügbar für diesen Service"}
                  </p>
                  {service.trial && (
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Voller Funktionsumfang</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Zeitlich begrenzt (typischerweise 30 Tage)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Standard-Support</span>
                      </li>
                    </ul>
                  )}
                </div>

                <div className="border rounded-lg p-6">
                  <h4 className="text-lg font-medium mb-2">Produktiv</h4>
                  <p className="text-gray-600 mb-4">Vollständige Funktionalität für Produktivumgebungen</p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Voller Funktionsumfang</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">SLA-Garantien</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Enterprise-Support</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button asChild>
                  <a
                    href="https://www.sap.com/products/technology-platform/pricing.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Preisrechner öffnen
                  </a>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
