"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Check, Download, ExternalLink, Code, FileText, Server, Zap } from "lucide-react"
import Image from "next/image"
import ImplementationExamples from "./implementation-examples"
import { btpServices } from "@/data/btp-services"

interface BTPArchitectureTemplateDetailProps {
  template: {
    id: string
    name: string
    description: string
    category: string
    services: string[]
    useCases: string[]
    benefits: string[]
    diagram: string
    implementationSteps?: {
      phase: string
      tasks: string[]
    }[]
    resources?: {
      type: string
      items: {
        name: string
        url: string
      }[]
    }[]
    technicalDetails?: {
      complexity: string
      implementationTime: string
      requiredSkills: string[]
    }
  }
  onBack: () => void
  onSelectService: (serviceId: string) => void
}

export default function BTPArchitectureTemplateDetail({
  template,
  onBack,
  onSelectService,
}: BTPArchitectureTemplateDetailProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Standardwerte für fehlende Eigenschaften
  const implementationSteps = template.implementationSteps || [
    {
      phase: "Vorbereitung",
      tasks: ["SAP BTP-Konto einrichten", "Erforderliche Services abonnieren", "Entwicklungsumgebung einrichten"],
    },
    {
      phase: "Entwicklung",
      tasks: [
        "Datenmodell definieren",
        "Services implementieren",
        "Benutzeroberfläche entwickeln",
        "Geschäftslogik implementieren",
      ],
    },
    {
      phase: "Integration",
      tasks: [
        "Verbindungen zu SAP-Systemen konfigurieren",
        "API-Endpunkte definieren",
        "Authentifizierung und Autorisierung einrichten",
      ],
    },
    {
      phase: "Deployment",
      tasks: ["Build erstellen", "Anwendung deployen", "Berechtigungen konfigurieren", "Monitoring einrichten"],
    },
  ]

  const resources = template.resources || [
    {
      type: "Dokumentation",
      items: [
        {
          name: "Architekturübersicht",
          url: "#",
        },
        {
          name: "Implementierungsleitfaden",
          url: "#",
        },
        {
          name: "Best Practices",
          url: "#",
        },
      ],
    },
    {
      type: "Code-Beispiele",
      items: [
        {
          name: "GitHub Repository",
          url: "#",
        },
        {
          name: "Beispielprojekt",
          url: "#",
        },
        {
          name: "Integration-Beispiele",
          url: "#",
        },
      ],
    },
  ]

  const technicalDetails = template.technicalDetails || {
    complexity: "Mittel",
    implementationTime: "2-4 Wochen",
    requiredSkills: ["JavaScript/TypeScript", "SAP BTP-Grundlagen", "REST APIs"],
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Zurück zu allen Vorlagen
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3">
          <h2 className="text-2xl font-bold mb-2">{template.name}</h2>
          <p className="text-gray-600 mb-4">{template.description}</p>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="overview">Übersicht</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="implementation">Implementierung</TabsTrigger>
              <TabsTrigger value="examples">Beispiele</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="relative h-64 w-full bg-gray-100 rounded-md overflow-hidden">
                <Image
                  src={template.diagram || `/placeholder.svg?height=400&width=800&query=architecture diagram`}
                  alt={`${template.name} Architekturdiagramm`}
                  fill
                  className="object-contain"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Anwendungsfälle</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {template.useCases.map((useCase, index) => (
                    <div key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{useCase}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Vorteile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {template.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-4">
                <Button variant="outline" asChild>
                  <a href="#" className="flex items-center gap-1">
                    <ExternalLink className="h-4 w-4" />
                    Dokumentation
                  </a>
                </Button>
                <Button asChild>
                  <a href="#" className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    Vorlage herunterladen
                  </a>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {template.services.map((serviceId) => {
                  const serviceData = btpServices.find((s) => s.id === serviceId)
                  return (
                    <Card key={serviceId} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                            {serviceData?.icon ? (
                              <Image
                                src={serviceData.icon || "/placeholder.svg"}
                                alt={serviceData.name}
                                width={24}
                                height={24}
                                className="object-contain"
                              />
                            ) : (
                              <Server className="h-6 w-6 text-gray-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{serviceData?.name || serviceId}</h4>
                            <p className="text-xs text-gray-600 line-clamp-1">
                              {serviceData?.description || "Klicken Sie, um Details zu diesem Service anzuzeigen"}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => onSelectService(serviceId)}
                        >
                          Service-Details
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="implementation" className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Implementierungsschritte</h3>
                  <div className="space-y-4">
                    {implementationSteps.map((step, stepIndex) => (
                      <div key={stepIndex} className="bg-gray-50 p-4 rounded-md">
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-blue-700 text-sm font-medium">{stepIndex + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-medium">{step.phase}</h4>
                            <ul className="mt-2 space-y-1">
                              {step.tasks.map((task, taskIndex) => (
                                <li key={taskIndex} className="text-sm text-gray-600 flex items-start">
                                  <Zap className="h-3 w-3 text-blue-600 mr-2 flex-shrink-0 mt-1" />
                                  {task}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Ressourcen</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resources.map((resourceGroup, groupIndex) => (
                      <Card key={groupIndex}>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            {resourceGroup.type === "Dokumentation" ? (
                              <FileText className="h-5 w-5 mr-2 text-blue-600" />
                            ) : (
                              <Code className="h-5 w-5 mr-2 text-purple-600" />
                            )}
                            {resourceGroup.type}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {resourceGroup.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-start">
                                <ExternalLink
                                  className={`h-5 w-5 mr-2 flex-shrink-0 mt-0.5 ${
                                    resourceGroup.type === "Dokumentation" ? "text-blue-600" : "text-purple-600"
                                  }`}
                                />
                                <a href={item.url} className="text-blue-600 hover:underline">
                                  {item.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="examples" className="space-y-6">
              <ImplementationExamples templateId={template.id} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="w-full md:w-1/3">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Technische Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Kategorie</span>
                    <p className="font-medium">{template.category}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Komplexität</span>
                    <p className="font-medium">{technicalDetails.complexity}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Implementierungszeit</span>
                    <p className="font-medium">{technicalDetails.implementationTime}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Erforderliche Services</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.services.map((service) => (
                        <Badge key={service} variant="outline">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Erforderliche Kenntnisse</h3>
                <div className="space-y-2">
                  {technicalDetails.requiredSkills.map((skill, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Support</h3>
                <Button className="w-full">Beratung anfragen</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
