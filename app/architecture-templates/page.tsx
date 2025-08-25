"use client"

import { useState } from "react"
import ArchitectureTemplatesOverview from "@/components/architecture-templates-overview"
import BTPArchitectureTemplateDetail from "@/components/btp-architecture-template-detail"
import BTPServiceDetailDialog from "@/components/btp-service-detail-dialog"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { btpServices } from "@/data/btp-services"

// Beispiel-Architekturvorlagen
const architectureTemplates = [
  {
    id: "cap-fiori-hana",
    name: "CAP + Fiori + HANA Cloud",
    description:
      "Eine vollständige Architektur für die Entwicklung von Geschäftsanwendungen mit dem SAP Cloud Application Programming Model, SAP Fiori und SAP HANA Cloud.",
    category: "Application Development",
    services: ["cap", "bas", "hana-cloud", "destination", "xsuaa"],
    useCases: [
      "Entwicklung von Geschäftsanwendungen",
      "Erweiterung von SAP-Systemen",
      "Implementierung von kundenspezifischen Prozessen",
      "Entwicklung von Self-Service-Portalen",
    ],
    benefits: [
      "Schnelle Entwicklung durch vordefinierte Modelle und Best Practices",
      "Nahtlose Integration mit SAP-Systemen",
      "Skalierbare und performante Datenbankschicht",
      "Moderne und responsive Benutzeroberfläche",
      "Einfache Wartung und Erweiterbarkeit",
    ],
    diagram: "/cap-fiori-hana-architecture.png",
  },
  {
    id: "integration-suite",
    name: "Integration Suite Architektur",
    description:
      "Eine umfassende Integrationsarchitektur für die Verbindung von SAP- und Nicht-SAP-Systemen mit der SAP Integration Suite.",
    category: "Integration",
    services: ["integration-suite", "destination", "xsuaa", "api-management"],
    useCases: [
      "Integration von SAP- und Nicht-SAP-Systemen",
      "API-Management und -Governance",
      "Implementierung von B2B-Szenarien",
      "Entwicklung von Hybrid-Integrationsszenarien",
    ],
    benefits: [
      "Zentrale Verwaltung aller Integrationsszenarien",
      "Vordefinierte Integrationsvorlagen für gängige Szenarien",
      "Umfassende Überwachungs- und Analysefunktionen",
      "Skalierbare und sichere Integrationsplattform",
      "Reduzierte Integrationskosten und -komplexität",
    ],
    diagram: "/sap-integration-suite-architecture.png",
  },
  {
    id: "multi-tenant-saas",
    name: "Multi-Tenant SaaS-Anwendung",
    description:
      "Eine Architektur für die Entwicklung von mandantenfähigen SaaS-Anwendungen auf der SAP Business Technology Platform.",
    category: "Application Development",
    services: ["cap", "bas", "hana-cloud", "destination", "xsuaa", "saas-registry"],
    useCases: [
      "Entwicklung von SaaS-Anwendungen",
      "Bereitstellung von Lösungen für mehrere Kunden",
      "Implementierung von White-Label-Lösungen",
      "Entwicklung von Branchenlösungen",
    ],
    benefits: [
      "Effiziente Ressourcennutzung durch Mandantenfähigkeit",
      "Zentrale Verwaltung und Bereitstellung für alle Mandanten",
      "Individuelle Anpassungen pro Mandant möglich",
      "Skalierbare und kosteneffiziente Architektur",
      "Einfache Onboarding- und Offboarding-Prozesse",
    ],
    diagram: "/multi-tenant-saas-architecture.png",
  },
  {
    id: "mobile-offline",
    name: "Mobile Offline-Anwendung",
    description:
      "Eine Architektur für die Entwicklung von mobilen Anwendungen mit Offline-Funktionalität auf der SAP Business Technology Platform.",
    category: "Mobile",
    services: ["mobile-services", "cap", "bas", "hana-cloud", "destination", "xsuaa"],
    useCases: [
      "Entwicklung von mobilen Anwendungen für Außendienstmitarbeiter",
      "Implementierung von Lösungen für Bereiche mit eingeschränkter Konnektivität",
      "Entwicklung von mobilen Datenerfassungsanwendungen",
      "Mobile Workflows und Genehmigungsprozesse",
    ],
    benefits: [
      "Nahtlose Offline-Funktionalität für unterbrechungsfreies Arbeiten",
      "Automatische Synchronisation bei Wiederherstellung der Verbindung",
      "Konsistente Benutzererfahrung online und offline",
      "Sichere Datenspeicherung auf mobilen Geräten",
      "Reduzierte Datenübertragungskosten",
    ],
    diagram: "/mobile-offline-architecture.png",
  },
  {
    id: "ai-ml-analytics",
    name: "KI/ML & Analytics",
    description:
      "Eine Architektur für die Implementierung von KI/ML-Lösungen und fortschrittlichen Analysen auf der SAP Business Technology Platform.",
    category: "Data & Analytics",
    services: ["ai-core", "datasphere", "hana-cloud", "cap", "bas", "destination", "xsuaa"],
    useCases: [
      "Implementierung von prädiktiven Analysen",
      "Entwicklung von KI-gestützten Anwendungen",
      "Automatisierung von Entscheidungsprozessen",
      "Implementierung von Bild- und Texterkennung",
    ],
    benefits: [
      "Integration von KI/ML-Funktionen in Geschäftsanwendungen",
      "Nutzung vordefinierter KI-Modelle und -Services",
      "Skalierbare Infrastruktur für Datenverarbeitung und -analyse",
      "Einfache Integration mit SAP- und Nicht-SAP-Datenquellen",
      "Reduzierte Entwicklungszeit für KI/ML-Lösungen",
    ],
    diagram: "/ai-ml-analytics-architecture.png",
  },
  {
    id: "devops-cicd",
    name: "DevOps & CI/CD",
    description:
      "Eine Architektur für die Implementierung von DevOps-Praktiken und CI/CD-Pipelines für SAP BTP-Anwendungen.",
    category: "DevOps",
    services: ["cicd", "bas", "cap", "destination", "xsuaa"],
    useCases: [
      "Automatisierung von Build- und Deployment-Prozessen",
      "Implementierung von Continuous Integration und Continuous Delivery",
      "Standardisierung von Entwicklungs- und Bereitstellungsprozessen",
      "Qualitätssicherung durch automatisierte Tests",
    ],
    benefits: [
      "Beschleunigte Bereitstellung neuer Funktionen",
      "Verbesserte Codequalität durch automatisierte Tests",
      "Standardisierte und reproduzierbare Bereitstellungsprozesse",
      "Erhöhte Entwicklerproduktivität",
      "Reduzierte Fehlerquote bei Deployments",
    ],
    diagram: "/devops-cicd-architecture.png",
  },
]

export default function ArchitectureTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null)

  const selectedTemplateData = selectedTemplate ? architectureTemplates.find((t) => t.id === selectedTemplate) : null

  const selectedServiceData = selectedService ? btpServices.find((s) => s.id === selectedService) : null

  return (
    <div className="container mx-auto px-4 py-8">
      {selectedTemplate ? (
        <BTPArchitectureTemplateDetail
          template={selectedTemplateData!}
          onBack={() => setSelectedTemplate(null)}
          onSelectService={(serviceId) => setSelectedService(serviceId)}
        />
      ) : (
        <ArchitectureTemplatesOverview onSelectTemplate={setSelectedTemplate} />
      )}

      <Dialog open={!!selectedService} onOpenChange={(open) => !open && setSelectedService(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedServiceData && (
            <BTPServiceDetailDialog
              service={selectedServiceData}
              onClose={() => setSelectedService(null)}
              isOpen={!!selectedService}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
