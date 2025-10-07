"use client"
import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { parseQuillHTML } from "@/lib/html-parser"
import type { IService } from "@/types/service"
import { useSiteConfig } from "@/hooks/use-site-config"
import { formatCurrency } from "@/lib/currency"

interface ProcessViewProps {
  selectedServiceIds: string[]
  services: IService[]
}

export default function ProcessView({ selectedServiceIds, services }: ProcessViewProps) {
  const { config } = useSiteConfig()
  // Filter selected services
  const selectedServices = services.filter((service) => selectedServiceIds.includes(service.id))

  // Sort services in logical order based on dependencies and process flow
  const sortedServices = [...selectedServices].sort((a, b) => {
    // Sort by phase first
    if (a.phase !== b.phase) {
      return a.phase - b.phase
    }

    // If same phase, check for dependencies
    if (a.dependencies?.includes(b.id)) {
      return 1 // a depends on b, so b comes first
    }
    if (b.dependencies?.includes(a.id)) {
      return -1 // b depends on a, so a comes first
    }

    // If no dependencies, sort by price (smaller projects first)
    return a.price - b.price
  })

  // Group services by phase
  const servicesByPhase: { [key: number]: IService[] } = {}
  sortedServices.forEach((service) => {
    if (!servicesByPhase[service.phase]) {
      servicesByPhase[service.phase] = []
    }
    servicesByPhase[service.phase].push(service)
  })

  // Get all phases in order
  const phases = Object.keys(servicesByPhase)
    .map(Number)
    .sort((a, b) => a - b)

  // Phase names
  const phaseNames: { [key: number]: string } = {
    1: "Analyse & Planung",
    2: "Design & Architektur",
    3: "Implementierung",
    4: "Test & Optimierung",
    5: "Deployment & Go-Live",
  }

  // Gruppiere Services nach Prozess-Kategorie
  const servicesByProcessCategory: { [key: string]: IService[] } = {}

  // Füge eine "Uncategorized" Kategorie für Services ohne Prozess-Kategorie hinzu
  servicesByProcessCategory["Uncategorized"] = []

  sortedServices.forEach((service) => {
    if (service.processCategory) {
      if (!servicesByProcessCategory[service.processCategory]) {
        servicesByProcessCategory[service.processCategory] = []
      }
      servicesByProcessCategory[service.processCategory].push(service)
    } else {
      servicesByProcessCategory["Uncategorized"].push(service)
    }
  })

  // Entferne die "Uncategorized" Kategorie, wenn sie leer ist
  if (servicesByProcessCategory["Uncategorized"].length === 0) {
    delete servicesByProcessCategory["Uncategorized"]
  }

  // Prozess-Kategorie-Reihenfolge
  const processCategoryOrder = ["Ideate", "Innovate", "Operate"]

  // Sortiere die Prozess-Kategorien
  const processCategories = Object.keys(servicesByProcessCategory).sort((a, b) => {
    if (a === "Uncategorized") return 1
    if (b === "Uncategorized") return -1
    return processCategoryOrder.indexOf(a) - processCategoryOrder.indexOf(b)
  })

  return (
    <div className="space-y-8">
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Prozess-Kategorien erklärt</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-purple-600 mr-2"></div>
            <span>
              <strong>Ideate:</strong> Konzeption, Planung und Strategieentwicklung
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-600 mr-2"></div>
            <span>
              <strong>Innovate:</strong> Entwicklung, Umsetzung und Integration
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
            <span>
              <strong>Operate:</strong> Betrieb, Wartung und Optimierung
            </span>
          </div>
        </div>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Nach Prozess-Kategorie</h3>
        <div className="space-y-6">
          {processCategories.map((category, categoryIndex) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-2">
                <div
                  className={`px-4 py-2 rounded-full font-semibold text-white ${
                    category === "Ideate"
                      ? "bg-purple-600"
                      : category === "Innovate"
                        ? "bg-blue-600"
                        : category === "Operate"
                          ? "bg-green-600"
                          : "bg-gray-600"
                  }`}
                >
                  {category === "Uncategorized" ? "Sonstige" : category}
                  <span className="ml-2 text-xs opacity-80">
                    {category === "Ideate"
                      ? "Konzeption & Planung"
                      : category === "Innovate"
                        ? "Entwicklung & Umsetzung"
                        : category === "Operate"
                          ? "Betrieb & Optimierung"
                          : ""}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {servicesByProcessCategory[category].map((service, serviceIndex) => (
                  <Card
                    key={service.id}
                    className={`border-l-4 ${
                      service.technologyCategory === "SAP"
                        ? "border-l-blue-500"
                        : service.technologyCategory === "Microsoft"
                          ? "border-l-purple-500"
                          : service.technologyCategory === "Open Source"
                            ? "border-l-green-500"
                            : "border-l-gray-500"
                    }`}
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{service.title}</CardTitle>
                        <Badge variant="outline">{formatCurrency(Number(service.price || 0), config.currency)}</Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {parseQuillHTML(service.description)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex flex-wrap gap-2 mt-2">
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
                        <Badge variant="outline">{service.category}</Badge>
                        {service.technologies.slice(0, 3).map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {service.technologies.length > 3 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="secondary" className="text-xs cursor-help">
                                  +{service.technologies.length - 3} weitere
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="space-y-1">
                                  {service.technologies.slice(3).map((tech) => (
                                    <div key={tech}>{tech}</div>
                                  ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {categoryIndex < processCategories.length - 1 && (
                <div className="flex justify-center my-4">
                  <ArrowRight className="text-gray-400" size={24} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Nach Projektphase</h3>
        {phases.map((phase, phaseIndex) => (
          <div key={phase} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 text-blue-800 font-semibold px-3 py-1 rounded-full">Phase {phase}</div>
              <h3 className="text-lg font-medium">{phaseNames[phase] || `Phase ${phase}`}</h3>
            </div>

            <div className="space-y-4">
              {servicesByPhase[phase].map((service, serviceIndex) => (
                <Card
                  key={service.id}
                  className={`border-l-4 ${
                    service.technologyCategory === "SAP"
                      ? "border-l-blue-500"
                      : service.technologyCategory === "Microsoft"
                        ? "border-l-purple-500"
                        : service.technologyCategory === "Open Source"
                          ? "border-l-green-500"
                          : "border-l-gray-500"
                  }`}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                      <Badge variant="outline">{formatCurrency(Number(service.price || 0), config.currency)}</Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {parseQuillHTML(service.description)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex flex-wrap gap-2 mt-2">
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
                      {service.technologies.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {service.technologies.length > 3 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="secondary" className="text-xs cursor-help">
                                +{service.technologies.length - 3} weitere
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                {service.technologies.slice(3).map((tech) => (
                                  <div key={tech}>{tech}</div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {phaseIndex < phases.length - 1 && (
              <div className="flex justify-center my-4">
                <ArrowRight className="text-gray-400" size={24} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
