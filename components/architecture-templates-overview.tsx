"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Code, ArrowLeft, Building, Cpu, FileText, ChevronRight } from "lucide-react"
import Image from "next/image"
import { analytics } from "@/lib/analytics"

// Beispiel-Architekturvorlagen
const architectureTemplates = [
  {
    id: "cap-fiori-hana",
    name: "CAP + Fiori + HANA Cloud",
    description:
      "Eine vollständige Architektur für die Entwicklung von Geschäftsanwendungen mit dem SAP Cloud Application Programming Model, SAP Fiori und SAP HANA Cloud.",
    category: "Application Development",
    services: ["cap", "bas", "hana-cloud", "destination", "xsuaa"],
    diagram: "/cap-fiori-hana-architecture.png",
  },
  {
    id: "integration-suite",
    name: "Integration Suite Architektur",
    description:
      "Eine umfassende Integrationsarchitektur für die Verbindung von SAP- und Nicht-SAP-Systemen mit der SAP Integration Suite.",
    category: "Integration",
    services: ["integration-suite", "destination", "xsuaa", "api-management"],
    diagram: "/sap-integration-suite-architecture.png",
  },
  {
    id: "multi-tenant-saas",
    name: "Multi-Tenant SaaS-Anwendung",
    description:
      "Eine Architektur für die Entwicklung von mandantenfähigen SaaS-Anwendungen auf der SAP Business Technology Platform.",
    category: "Application Development",
    services: ["cap", "bas", "hana-cloud", "destination", "xsuaa", "saas-registry"],
    diagram: "/multi-tenant-saas-architecture.png",
  },
  {
    id: "mobile-offline",
    name: "Mobile Offline-Anwendung",
    description:
      "Eine Architektur für die Entwicklung von mobilen Anwendungen mit Offline-Funktionalität auf der SAP Business Technology Platform.",
    category: "Mobile",
    services: ["mobile-services", "cap", "bas", "hana-cloud", "destination", "xsuaa"],
    diagram: "/mobile-offline-architecture.png",
  },
  {
    id: "ai-ml-analytics",
    name: "KI/ML & Analytics",
    description:
      "Eine Architektur für die Implementierung von KI/ML-Lösungen und fortschrittlichen Analysen auf der SAP Business Technology Platform.",
    category: "Data & Analytics",
    services: ["ai-core", "datasphere", "hana-cloud", "cap", "bas", "destination", "xsuaa"],
    diagram: "/ai-ml-analytics-architecture.png",
  },
  {
    id: "devops-cicd",
    name: "DevOps & CI/CD",
    description:
      "Eine Architektur für die Implementierung von DevOps-Praktiken und CI/CD-Pipelines für SAP BTP-Anwendungen.",
    category: "DevOps",
    services: ["cicd", "bas", "cap", "destination", "xsuaa"],
    diagram: "/devops-cicd-architecture.png",
  },
]

interface ArchitectureTemplatesOverviewProps {
  onSelectTemplate: (templateId: string) => void
}

export default function ArchitectureTemplatesOverview({ onSelectTemplate }: ArchitectureTemplatesOverviewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const getIconForCategory = (category: string) => {
    switch (category) {
      case "Application Development":
        return <Code className="h-4 w-4 text-purple-600" />
      case "Integration":
        return <ArrowLeft className="h-4 w-4 text-green-600" />
      case "Mobile":
        return <FileText className="h-4 w-4 text-orange-600" />
      case "Data & Analytics":
        return <Building className="h-4 w-4 text-blue-600" />
      case "DevOps":
        return <Cpu className="h-4 w-4 text-indigo-600" />
      default:
        return <Building className="h-4 w-4 text-gray-600" />
    }
  }

  const filteredTemplates = architectureTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">SAP BTP Architekturvorlagen</h2>
          <p className="text-gray-600">
            Vordefinierte Architekturvorlagen für verschiedene Anwendungsfälle auf der SAP Business Technology Platform
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Suchen..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList>
              <TabsTrigger value="all">Alle</TabsTrigger>
              <TabsTrigger value="Application Development">Anwendung</TabsTrigger>
              <TabsTrigger value="Integration">Integration</TabsTrigger>
              <TabsTrigger value="Data & Analytics">Daten</TabsTrigger>
              <TabsTrigger value="DevOps">DevOps</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              analytics.templateView(template.id, template.category)
              onSelectTemplate(template.id)
            }}
          >
            <div className="relative h-40 bg-gray-100">
              <Image
                src={
                  template.diagram ||
                  `/placeholder.svg?height=200&width=400&query=${template.name} architecture diagram`
                }
                alt={template.name}
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  {getIconForCategory(template.category)}
                  <span>{template.category}</span>
                </Badge>
              </div>
              <h3 className="text-lg font-bold mb-2">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>
              <div className="flex flex-wrap gap-1 mb-4">
                {template.services.slice(0, 3).map((service) => (
                  <Badge key={service} variant="secondary" className="text-xs">
                    {service}
                  </Badge>
                ))}
                {template.services.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{template.services.length - 3}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" className="w-full flex justify-between items-center">
                Details anzeigen
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
