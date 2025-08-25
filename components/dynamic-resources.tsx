"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Info } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

// Ressourcen mit realen Bildern
const resources = [
  {
    id: "whitepaper-btp",
    title: "SAP BTP: Der Weg zur intelligenten Unternehmung",
    description:
      "Strategische Überlegungen zur SAP BTP Implementierung und Transformation zu einem intelligenten Unternehmen.",
    imageUrl: "/images/tech-expertise-hero.png", // Reales Bild
    downloadUrl: "/resources/btp-whitepaper.pdf",
    type: "Whitepaper",
    detailedDescription:
      "Dieses umfassende Whitepaper bietet strategische Einblicke in die Implementierung der SAP Business Technology Platform und zeigt auf, wie Unternehmen den Weg zur intelligenten Unternehmung gestalten können. Es behandelt die wichtigsten Aspekte der digitalen Transformation und gibt konkrete Handlungsempfehlungen.",
    pages: 42,
    publishDate: "2023-09-15",
    authors: ["Dr. Michael Schmidt", "Sarah Johnson"],
    topics: ["BTP Strategie", "Cloud Transformation", "Intelligente Unternehmung"],
  },
  {
    id: "guide-integration",
    title: "Integration Suite Best Practices",
    description: "Umfassender Leitfaden für die optimale Nutzung der SAP Integration Suite in verschiedenen Szenarien.",
    imageUrl: "/images/integration-suite.png", // Reales Bild
    downloadUrl: "/resources/integration-guide.pdf",
    type: "Guide",
    detailedDescription:
      "Dieser umfassende Leitfaden bietet detaillierte Best Practices für die Implementierung und Nutzung der SAP Integration Suite. Er behandelt verschiedene Integrationsszenarien, Architekturmuster und gibt Empfehlungen für die optimale Konfiguration und das Monitoring.",
    pages: 78,
    publishDate: "2023-08-05",
    authors: ["Thomas Weber", "Lisa Chen"],
    topics: ["Integration Suite", "API Management", "Cloud Integration"],
  },
  {
    id: "template-cap",
    title: "CAP Projektvorlage",
    description: "Vorkonfigurierte Projektvorlage für CAP Anwendungen mit Best Practices und Beispielcode.",
    imageUrl: "/images/cap-implementation.png", // Reales Bild
    downloadUrl: "/resources/cap-template.zip",
    type: "Template",
    detailedDescription:
      "Diese vorkonfigurierte Projektvorlage für CAP-Anwendungen enthält alle notwendigen Komponenten und Best Practices für einen schnellen Start. Sie umfasst Beispielcode, Testfälle und Dokumentation für die Entwicklung moderner Cloud-Anwendungen mit dem SAP Cloud Application Programming Model.",
    version: "2.1.0",
    lastUpdated: "2023-10-20",
    compatibility: ["Node.js 16+", "SAP CAP 6+"],
    topics: ["CAP", "Node.js", "HANA Cloud"],
  },
  {
    id: "template-fiori",
    title: "Fiori Elements Template",
    description: "Vorkonfigurierte Fiori Elements App mit List-to-Detail Pattern und Annotationen.",
    imageUrl: "/images/fiori-development.png", // Reales Bild
    downloadUrl: "/resources/fiori-template.zip",
    type: "Template",
    detailedDescription:
      "Dieses Template bietet eine vorkonfigurierte Fiori Elements Anwendung mit List-to-Detail Pattern und umfangreichen Annotationen. Es ermöglicht einen schnellen Start in die Entwicklung von Fiori-Anwendungen und folgt den aktuellen Best Practices von SAP.",
    version: "3.0.1",
    lastUpdated: "2023-11-10",
    compatibility: ["SAPUI5 1.96+", "SAP Fiori Elements"],
    topics: ["Fiori", "UI5", "OData"],
  },
  {
    id: "checklist-security",
    title: "BTP Security Checklist",
    description: "Umfassende Checkliste für die Absicherung Ihrer SAP BTP-Landschaft gemäß Best Practices.",
    imageUrl: "/images/security-guidelines.png", // Reales Bild
    downloadUrl: "/resources/security-checklist.pdf",
    type: "Checklist",
    detailedDescription:
      "Diese umfassende Checkliste bietet einen strukturierten Überblick über alle wichtigen Sicherheitsaspekte, die bei der Implementierung und dem Betrieb von Anwendungen auf der SAP Business Technology Platform zu beachten sind. Sie umfasst Empfehlungen zu Authentifizierung, Autorisierung, Datenschutz und Compliance.",
    pages: 24,
    publishDate: "2023-07-18",
    authors: ["Andreas Müller", "Jennifer Smith"],
    topics: ["Security", "Compliance", "Identity Management"],
  },
  {
    id: "whitepaper-architecture",
    title: "BTP Architektur-Referenz",
    description: "Umfassende Referenzarchitektur für SAP BTP-basierte Lösungen mit Best Practices und Mustern.",
    imageUrl: "/images/btp-architecture.png", // Reales Bild
    downloadUrl: "/resources/architecture-whitepaper.pdf",
    type: "Whitepaper",
    detailedDescription:
      "Dieses Whitepaper bietet eine umfassende Referenzarchitektur für SAP BTP-basierte Lösungen. Es behandelt verschiedene Architekturmuster, Integrationsszenarien und gibt Empfehlungen für die optimale Nutzung der SAP Business Technology Platform in verschiedenen Anwendungsfällen.",
    pages: 56,
    publishDate: "2023-06-22",
    authors: ["Dr. Robert Müller", "Christine Weber"],
    topics: ["Architektur", "BTP", "Cloud-native"],
  },
  {
    id: "whitepaper-assessment",
    title: "Digital Maturity Assessment",
    description: "Methodik zur Bewertung der digitalen Reife von Unternehmen und Handlungsempfehlungen.",
    imageUrl: "/images/digital-maturity-assessment.png", // Reales Bild
    downloadUrl: "/resources/digital-maturity-assessment.pdf",
    type: "Whitepaper",
    detailedDescription:
      "Dieses Whitepaper stellt eine umfassende Methodik zur Bewertung der digitalen Reife von Unternehmen vor. Es bietet einen strukturierten Ansatz zur Analyse des aktuellen Digitalisierungsgrades und gibt konkrete Handlungsempfehlungen für die digitale Transformation.",
    pages: 38,
    publishDate: "2023-05-10",
    authors: ["Prof. Dr. Anna Schmidt", "Michael Johnson"],
    topics: ["Digitale Transformation", "Reifegradmodell", "Change Management"],
  },
  {
    id: "toolkit-devops",
    title: "BTP DevOps Toolkit",
    description: "Sammlung von Tools und Skripten für die Implementierung von DevOps-Prozessen in der SAP BTP.",
    imageUrl: "/images/btp-monitoring.png", // Reales Bild
    downloadUrl: "/resources/devops-toolkit.zip",
    type: "Toolkit",
    detailedDescription:
      "Dieses Toolkit enthält eine umfassende Sammlung von Tools, Skripten und Konfigurationsvorlagen für die Implementierung von DevOps-Prozessen in der SAP BTP. Es unterstützt die Einrichtung von CI/CD-Pipelines, automatisiertes Testing und Monitoring für SAP BTP-Anwendungen.",
    version: "1.5.0",
    lastUpdated: "2023-09-30",
    compatibility: ["Jenkins", "GitHub Actions", "Azure DevOps"],
    topics: ["DevOps", "CI/CD", "Automatisierung"],
  },
]

export default function DynamicResources() {
  const { toast } = useToast()
  const [selectedResource, setSelectedResource] = useState<any | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  const handleViewDetails = (resource: any) => {
    setSelectedResource(resource)
    setDetailDialogOpen(true)
  }

  const handleDownload = (resource: any) => {
    toast({
      title: "Download gestartet",
      description: `${resource.title} wird heruntergeladen...`,
    })
  }

  // Gruppiere Ressourcen nach Typ
  const groupedResources = resources.reduce(
    (acc, resource) => {
      const type = resource.type
      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push(resource)
      return acc
    },
    {} as Record<string, typeof resources>,
  )

  // Sortiere die Typen, damit Whitepapers zuerst angezeigt werden
  const sortedTypes = Object.keys(groupedResources).sort((a, b) => {
    if (a === "Whitepaper") return -1
    if (b === "Whitepaper") return 1
    return a.localeCompare(b)
  })

  return (
    <div className="space-y-10">
      {sortedTypes.map((type) => (
        <div key={type} className="space-y-4">
          <h2 className="text-2xl font-bold">{type}s</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedResources[type].map((resource) => (
              <Card key={resource.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={resource.imageUrl || `/placeholder.svg?height=200&width=400&query=${resource.type}`}
                    alt={resource.title}
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    fill
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{resource.title}</h3>
                  </div>
                  <Badge className="mb-2">{resource.type}</Badge>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{resource.description}</p>
                  <div className="flex justify-between">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center"
                      onClick={() => handleViewDetails(resource)}
                    >
                      <Info className="mr-1 h-4 w-4" /> Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center"
                      onClick={() => handleDownload(resource)}
                    >
                      <Download className="mr-1 h-4 w-4" /> Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Resource Detail Dialog */}
      {selectedResource && (
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{selectedResource.title}</DialogTitle>
              <Badge className="mt-2 w-fit">{selectedResource.type}</Badge>
            </DialogHeader>

            <div className="mt-6 space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <Image
                      src={
                        selectedResource.imageUrl ||
                        `/placeholder.svg?height=200&width=300&query=${selectedResource.type || "/placeholder.svg"}`
                      }
                      alt={selectedResource.title}
                      className="object-cover"
                      fill
                    />
                  </div>
                </div>
                <div className="md:w-2/3">
                  <h3 className="text-lg font-semibold mb-2">Beschreibung</h3>
                  <p className="text-gray-700">{selectedResource.detailedDescription}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedResource.pages && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-1">Seitenanzahl</h4>
                    <p>{selectedResource.pages} Seiten</p>
                  </div>
                )}

                {selectedResource.publishDate && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-1">Veröffentlicht am</h4>
                    <p>{selectedResource.publishDate}</p>
                  </div>
                )}

                {selectedResource.version && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-1">Version</h4>
                    <p>{selectedResource.version}</p>
                  </div>
                )}

                {selectedResource.lastUpdated && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-1">Letztes Update</h4>
                    <p>{selectedResource.lastUpdated}</p>
                  </div>
                )}
              </div>

              {selectedResource.authors && selectedResource.authors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Autoren</h3>
                  <ul className="list-disc list-inside">
                    {selectedResource.authors.map((author: string, index: number) => (
                      <li key={index}>{author}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedResource.topics && selectedResource.topics.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Themen</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedResource.topics.map((topic: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4">
                <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                  Schließen
                </Button>
                <Button onClick={() => handleDownload(selectedResource)}>
                  <Download className="mr-2 h-4 w-4" />
                  Herunterladen
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
