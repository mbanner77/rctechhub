"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, Search, Eye } from "lucide-react"
import { TemplateDetailDialog } from "./template-detail-dialog"
import { analytics } from "@/lib/analytics"

interface Template {
  id: string
  title: string
  description: string
  imageUrl: string
  category: string
  tags: string[]
  downloadUrl: string
  complexity: "Einfach" | "Mittel" | "Komplex"
  timeToImplement: string
  targetAudience: string[]
  features: string[]
  technicalDetails: {
    technologies: string[]
    prerequisites: string[]
    setupInstructions: string
  }
  codeSnippet?: string
}

// Sample data for templates
const templatesData: Template[] = [
  {
    id: "cap-basic",
    title: "CAP Basic Template",
    description:
      "Eine Basisvorlage für SAP Cloud Application Programming Model (CAP) Anwendungen mit grundlegenden CRUD-Operationen.",
    imageUrl: "/images/cap-template.png",
    category: "CAP",
    tags: ["CAP", "Node.js", "HANA", "OData", "Fiori"],
    downloadUrl: "/templates/cap-basic.zip",
    complexity: "Einfach",
    timeToImplement: "1-2 Tage",
    targetAudience: ["Entwickler", "Architekten"],
    features: [
      "Vollständige CAP-Projektstruktur",
      "Vordefinierte Entitäten und Services",
      "Integrierte Testumgebung",
      "Deployment-Konfiguration für BTP",
      "Dokumentation und Best Practices",
    ],
    technicalDetails: {
      technologies: ["Node.js", "SAP CAP", "CDS", "SQLite (Development)", "HANA (Production)"],
      prerequisites: ["Node.js 14 oder höher", "SAP Cloud Application Programming Model CLI", "SAP BTP Account"],
      setupInstructions: `1. Template herunterladen und entpacken
2. npm install ausführen
3. cds watch starten für die Entwicklung
4. Folgen Sie der README.md für weitere Schritte`,
    },
    codeSnippet: `// service.cds
using { sap.capire.bookshop as my } from '../db/schema';

service CatalogService @(path:'/catalog') {
  entity Books as projection on my.Books;
  entity Authors as projection on my.Authors;
}`,
  },
  {
    id: "fiori-elements",
    title: "Fiori Elements List Report",
    description: "Eine Fiori Elements Anwendung mit List Report und Object Page Pattern für schnelle UI-Entwicklung.",
    imageUrl: "/images/fiori-template.png",
    category: "Fiori",
    tags: ["Fiori Elements", "SAPUI5", "OData", "List Report"],
    downloadUrl: "/templates/fiori-elements.zip",
    complexity: "Mittel",
    timeToImplement: "2-3 Tage",
    targetAudience: ["UI-Entwickler", "SAPUI5-Entwickler"],
    features: [
      "List Report Template mit Filterbar",
      "Object Page mit Sektionen und Tabs",
      "Annotationen für Feldeigenschaften",
      "Integrierte Sortier- und Filterfunktionen",
      "Responsive Design für Desktop und Mobile",
    ],
    technicalDetails: {
      technologies: ["SAPUI5", "Fiori Elements", "OData V4", "Annotations"],
      prerequisites: ["SAPUI5 CLI", "OData Service (z.B. aus CAP)", "WebIDE oder Business Application Studio"],
      setupInstructions: `1. Template in Business Application Studio importieren
2. OData Service URL konfigurieren
3. Annotationen anpassen
4. Build und Deployment durchführen`,
    },
  },
  {
    id: "btp-architecture",
    title: "BTP Referenzarchitektur",
    description: "Eine Referenzarchitektur für SAP BTP-Anwendungen mit Fokus auf Skalierbarkeit und Wartbarkeit.",
    imageUrl: "/images/architecture-template.png",
    category: "Architektur",
    tags: ["BTP", "Architektur", "Cloud Foundry", "Microservices"],
    downloadUrl: "/templates/btp-architecture.zip",
    complexity: "Komplex",
    timeToImplement: "1-2 Wochen",
    targetAudience: ["Architekten", "Solution Manager", "DevOps Engineers"],
    features: [
      "Vollständige Referenzarchitektur für BTP",
      "Microservices-Struktur",
      "Security-Konzept mit XSUAA",
      "Monitoring und Logging-Setup",
      "CI/CD Pipeline Templates",
    ],
    technicalDetails: {
      technologies: ["SAP BTP", "Cloud Foundry", "XSUAA", "Destination Service", "Application Logging"],
      prerequisites: [
        "SAP BTP Account mit Cloud Foundry Subaccount",
        "Entitlements für benötigte Services",
        "CI/CD System (optional)",
      ],
      setupInstructions: `1. Architektur-Dokument studieren
2. Terraform/IaC-Scripts anpassen
3. Basis-Services provisionieren
4. CI/CD Pipeline einrichten`,
    },
  },
  {
    id: "integration-suite",
    title: "Integration Suite Szenario",
    description: "Ein vorkonfiguriertes Integrationsszenario für SAP Integration Suite mit verschiedenen Adaptern.",
    imageUrl: "/images/integration-template.png",
    category: "Integration",
    tags: ["Integration Suite", "CPI", "API Management", "iFlow"],
    downloadUrl: "/templates/integration-suite.zip",
    complexity: "Mittel",
    timeToImplement: "3-5 Tage",
    targetAudience: ["Integrationsexperten", "Entwickler"],
    features: [
      "Vorkonfigurierte iFlows für gängige Szenarien",
      "API Management Policies",
      "Error Handling und Monitoring",
      "Dokumentation der Schnittstellen",
      "Test-Szenarien",
    ],
    technicalDetails: {
      technologies: ["SAP Integration Suite", "Cloud Integration", "API Management", "Open Connectors"],
      prerequisites: ["SAP Integration Suite Subscription", "Quell- und Zielsysteme für Tests"],
      setupInstructions: `1. iFlow-Paket importieren
2. Verbindungsparameter konfigurieren
3. Mapping anpassen
4. Deployment und Test durchführen`,
    },
  },
  {
    id: "security-baseline",
    title: "BTP Security Baseline",
    description: "Eine Sicherheitsgrundlage für SAP BTP-Anwendungen mit Best Practices und Konfigurationen.",
    imageUrl: "/images/security-template.png",
    category: "Sicherheit",
    tags: ["Security", "XSUAA", "Identity Authentication", "Audit"],
    downloadUrl: "/templates/security-baseline.zip",
    complexity: "Komplex",
    timeToImplement: "1-2 Wochen",
    targetAudience: ["Security-Experten", "Architekten", "Compliance Manager"],
    features: [
      "Sicherheitsrichtlinien für BTP",
      "IAM-Konzept und Rollenmodell",
      "Audit-Logging-Konfiguration",
      "Verschlüsselungsstandards",
      "Compliance-Checklisten",
    ],
    technicalDetails: {
      technologies: ["XSUAA", "Identity Authentication Service", "Credential Store", "Audit Log Service"],
      prerequisites: [
        "SAP BTP Account",
        "Identity Authentication Service Subscription",
        "Berechtigungen für Security-Konfiguration",
      ],
      setupInstructions: `1. Security-Baseline-Dokument lesen
2. IAM-Konfiguration implementieren
3. Audit-Logging aktivieren
4. Sicherheitsscans durchführen
5. Dokumentation der Compliance`,
    },
  },
  {
    id: "devops-pipeline",
    title: "DevOps Pipeline für BTP",
    description: "Eine CI/CD-Pipeline für die kontinuierliche Integration und Bereitstellung von BTP-Anwendungen.",
    imageUrl: "/images/devops-template.png",
    category: "DevOps",
    tags: ["CI/CD", "Jenkins", "GitHub Actions", "MTA"],
    downloadUrl: "/templates/devops-pipeline.zip",
    complexity: "Mittel",
    timeToImplement: "3-5 Tage",
    targetAudience: ["DevOps Engineers", "Entwickler", "Release Manager"],
    features: [
      "CI/CD-Pipeline-Konfiguration",
      "Automatisierte Tests",
      "Quality Gates",
      "Multi-Target-Application Deployment",
      "Blue-Green Deployment-Strategie",
    ],
    technicalDetails: {
      technologies: ["Jenkins", "GitHub Actions", "MTA Build Tool", "Cloud Foundry CLI", "Newman"],
      prerequisites: ["CI/CD-System (Jenkins oder GitHub)", "SAP BTP Account", "Cloud Foundry CLI"],
      setupInstructions: `1. Pipeline-Konfiguration in Ihr Repository kopieren
2. CI/CD-Variablen konfigurieren
3. Build- und Deployment-Skripte anpassen
4. Pipeline testen und optimieren`,
    },
  },
]

export function EnhancedTemplateGallery() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [complexityFilter, setComplexityFilter] = useState<string>("all")
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>(templatesData)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  // Apply filters when search term or filters change
  useEffect(() => {
    let result = templatesData

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      result = result.filter(
        (template) =>
          template.title.toLowerCase().includes(lowerSearchTerm) ||
          template.description.toLowerCase().includes(lowerSearchTerm) ||
          template.tags.some((tag) => tag.toLowerCase().includes(lowerSearchTerm)),
      )
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((template) => template.category === categoryFilter)
    }

    // Apply complexity filter
    if (complexityFilter !== "all") {
      result = result.filter((template) => template.complexity === complexityFilter)
    }

    setFilteredTemplates(result)
  }, [searchTerm, categoryFilter, complexityFilter])

  const handleViewDetails = (template: Template) => {
    analytics.templateView(template.id, template.category)
    setSelectedTemplate(template)
    setDetailDialogOpen(true)
  }

  const handleDownload = (template: Template) => {
    analytics.templateDownload(template.title)
    // In a real implementation, this would trigger the actual download
    window.open(template.downloadUrl, '_blank')
  }

  const categories = ["all", ...Array.from(new Set(templatesData.map((t) => t.category)))]
  const complexities = ["all", ...Array.from(new Set(templatesData.map((t) => t.complexity)))]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Nach Templates suchen..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value
              setSearchTerm(value)
              if (value.length > 2) {
                analytics.search(value, { page: 'template-gallery' })
              }
            }}
          />
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Kategorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "Alle Kategorien" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={complexityFilter} onValueChange={setComplexityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Komplexität" />
            </SelectTrigger>
            <SelectContent>
              {complexities.map((complexity) => (
                <SelectItem key={complexity} value={complexity}>
                  {complexity === "all" ? "Alle Komplexitäten" : complexity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">Keine Templates gefunden</h3>
          <p className="text-muted-foreground mt-2">Versuchen Sie andere Suchbegriffe oder Filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="flex flex-col h-full">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  <Badge variant="outline">{template.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="aspect-video mb-4 overflow-hidden rounded-md">
                  <img
                    src={template.imageUrl || "/placeholder.svg?height=200&width=400&query=template"}
                    alt={template.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">{template.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {template.tags.slice(0, 3).map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => handleViewDetails(template)}>
                  <Eye className="h-4 w-4" />
                  Details
                </Button>
                <Button size="sm" className="gap-1" onClick={() => handleDownload(template)}>
                  <Download className="h-4 w-4" />
                  Herunterladen
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {selectedTemplate && (
        <TemplateDetailDialog template={selectedTemplate} open={detailDialogOpen} onOpenChange={setDetailDialogOpen} />
      )}
    </div>
  )
}
