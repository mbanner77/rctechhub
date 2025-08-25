"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import ActionDialog from "./action-dialog"
import { Download, ExternalLink, FileText, Share2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

interface LearnMoreDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  category: string
  onDownload?: () => void
}

export function LearnMoreDialog({ isOpen, onClose, title, category, onDownload }: LearnMoreDialogProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")

  // Beispielinhalt basierend auf der Kategorie
  const getContent = () => {
    switch (category) {
      case "architecture":
        return {
          overview:
            "Unsere BTP Architektur Best Practices bieten einen umfassenden Leitfaden für die Gestaltung skalierbarer, wartbarer und sicherer SAP BTP-Lösungen. Basierend auf jahrelanger Erfahrung und erfolgreichen Kundenprojekten haben wir bewährte Architekturmuster und Designprinzipien zusammengestellt.",
          benefits: [
            "Reduzierte Komplexität durch modulare Architektur",
            "Verbesserte Skalierbarkeit und Performance",
            "Höhere Wartbarkeit und einfachere Updates",
            "Optimierte Kostenstruktur durch effiziente Ressourcennutzung",
            "Nahtlose Integration mit bestehenden SAP- und Nicht-SAP-Systemen",
          ],
          cases: [
            {
              title: "Globaler Automobilhersteller",
              description:
                "Implementierung einer skalierbaren BTP-Architektur für die Integration von über 50 Systemen und die Unterstützung von mehr als 10.000 Benutzern weltweit.",
              results: "30% schnellere Entwicklungszyklen, 40% reduzierte Betriebskosten",
            },
            {
              title: "Mittelständischer Maschinenbauer",
              description:
                "Entwicklung einer modularen BTP-Architektur für die schrittweise Migration von On-Premise-Systemen in die Cloud.",
              results: "Reduzierung der Ausfallzeiten um 60%, Steigerung der Systemverfügbarkeit auf 99,9%",
            },
          ],
          image: "/images/architecture-template.png",
        }
      case "security":
        return {
          overview:
            "Unsere Best Practices für Sicherheit in der SAP BTP bieten einen umfassenden Ansatz zum Schutz Ihrer Daten und Anwendungen. Von der Identitäts- und Zugriffsverwaltung bis hin zur Verschlüsselung und Compliance decken wir alle Aspekte der BTP-Sicherheit ab.",
          benefits: [
            "Umfassender Schutz sensibler Geschäftsdaten",
            "Einhaltung von Compliance-Anforderungen (DSGVO, ISO 27001, etc.)",
            "Nahtlose Integration mit bestehenden Sicherheitssystemen",
            "Kontinuierliche Überwachung und Bedrohungserkennung",
            "Sichere Benutzerauthentifizierung und -autorisierung",
          ],
          cases: [
            {
              title: "Finanzdienstleister",
              description:
                "Implementierung eines mehrstufigen Sicherheitskonzepts für hochsensible Finanzdaten in der BTP.",
              results: "Erfolgreiche Zertifizierung nach ISO 27001, keine Sicherheitsvorfälle seit Implementierung",
            },
            {
              title: "Pharmazeutisches Unternehmen",
              description:
                "Entwicklung eines Sicherheitskonzepts für die Verarbeitung von Patientendaten in der BTP unter Einhaltung strenger regulatorischer Anforderungen.",
              results: "100% Compliance mit DSGVO und branchenspezifischen Vorschriften",
            },
          ],
          image: "/images/security-template.png",
        }
      case "cost":
        return {
          overview:
            "Unsere Best Practices zur Kostenoptimierung in der BTP helfen Ihnen, Ihre Cloud-Ausgaben zu kontrollieren und den ROI Ihrer SAP BTP-Investitionen zu maximieren. Durch eine Kombination aus technischen Maßnahmen, Governance-Prozessen und Nutzungsoptimierung erreichen Sie eine kosteneffiziente BTP-Landschaft.",
          benefits: [
            "Reduzierung der BTP-Gesamtbetriebskosten um bis zu 30%",
            "Transparente Kostenzuordnung und -kontrolle",
            "Optimierte Ressourcennutzung und automatische Skalierung",
            "Vermeidung von unnötigen Lizenz- und Infrastrukturkosten",
            "Langfristige Kostenstabilität durch strategische Planung",
          ],
          cases: [
            {
              title: "Handelsunternehmen",
              description: "Optimierung der BTP-Ressourcennutzung und Implementierung eines Kostenüberwachungssystems.",
              results: "Reduzierung der monatlichen BTP-Kosten um 25%, verbesserte Kostentransparenz",
            },
            {
              title: "Logistikunternehmen",
              description:
                "Konsolidierung von BTP-Services und Implementierung einer automatischen Skalierungsstrategie.",
              results: "Einsparungen von über 100.000 € pro Jahr bei gleichzeitiger Leistungsverbesserung",
            },
          ],
          image: "/images/cost-optimization.png",
        }
      case "integration":
        return {
          overview:
            "Unsere Integration Best Practices bieten einen strukturierten Ansatz für die nahtlose Verbindung von SAP- und Nicht-SAP-Systemen mit der BTP. Von API-Management über Event-Mesh bis hin zu hybriden Integrationsszenarien decken wir alle Aspekte moderner Integrationsarchitekturen ab.",
          benefits: [
            "Nahtlose End-to-End-Prozesse über Systemgrenzen hinweg",
            "Reduzierte Komplexität durch standardisierte Integrationsmuster",
            "Verbesserte Datenqualität und -konsistenz",
            "Höhere Agilität durch lose gekoppelte Systeme",
            "Echtzeit-Datenaustausch und ereignisgesteuerte Architekturen",
          ],
          cases: [
            {
              title: "Internationaler Konsumgüterhersteller",
              description:
                "Implementierung einer API-first Integrationsstrategie zur Verbindung von SAP S/4HANA mit über 30 Drittsystemen.",
              results: "70% schnellere Integration neuer Systeme, 50% reduzierter Wartungsaufwand",
            },
            {
              title: "Energieversorger",
              description:
                "Entwicklung einer ereignisgesteuerten Architektur mit SAP Event Mesh für Echtzeit-Datenverarbeitung.",
              results: "Reduzierung der Datenlatenz von Stunden auf Sekunden, Ermöglichung neuer digitaler Services",
            },
          ],
          image: "/images/integration-template.png",
        }
      default:
        return {
          overview: "Detaillierte Informationen zu diesem Thema.",
          benefits: ["Vorteil 1", "Vorteil 2", "Vorteil 3"],
          cases: [
            {
              title: "Fallstudie 1",
              description: "Beschreibung der Fallstudie 1",
              results: "Ergebnisse der Fallstudie 1",
            },
          ],
          image: "/placeholder.svg",
        }
    }
  }

  const content = getContent()

  const handleShare = () => {
    // In einer echten Anwendung würde hier die Share-API verwendet werden
    toast({
      title: "Link kopiert",
      description: `Der Link zu "${title}" wurde in die Zwischenablage kopiert.`,
    })
  }

  return (
    <ActionDialog isOpen={isOpen} onClose={onClose} title={title} description="">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Überblick</TabsTrigger>
          <TabsTrigger value="benefits">Vorteile</TabsTrigger>
          <TabsTrigger value="cases">Fallstudien</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-4">
          <div className="relative h-48 w-full rounded-lg overflow-hidden mb-4">
            <Image src={content.image || "/placeholder.svg"} alt={title} fill className="object-cover" />
          </div>
          <p className="text-gray-700">{content.overview}</p>
          <div className="flex justify-between pt-4">
            <Button variant="outline" className="flex items-center" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Teilen
            </Button>
            {onDownload && (
              <Button className="bg-green-600 hover:bg-green-700" onClick={onDownload}>
                <Download className="mr-2 h-4 w-4" />
                Whitepaper herunterladen
              </Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="benefits" className="mt-6">
          <h3 className="font-medium text-lg mb-4">Hauptvorteile</h3>
          <ul className="space-y-3">
            {content.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-green-600 font-medium">{index + 1}</span>
                </div>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="cases" className="mt-6">
          <h3 className="font-medium text-lg mb-4">Erfolgsgeschichten</h3>
          <div className="space-y-6">
            {content.cases.map((caseStudy, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">{caseStudy.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{caseStudy.description}</p>
                <div className="bg-green-50 p-2 rounded text-sm">
                  <span className="font-medium">Ergebnisse:</span> {caseStudy.results}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline" className="flex items-center mx-auto">
              <FileText className="mr-2 h-4 w-4" />
              Alle Fallstudien anzeigen
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 pt-4 border-t">
        <h4 className="font-medium mb-2">Weiterführende Ressourcen</h4>
        <div className="space-y-2">
          <div className="flex items-center">
            <ExternalLink className="h-4 w-4 text-green-600 mr-2" />
            <a href="#" className="text-green-600 hover:underline">
              Webinar: {title} in der Praxis
            </a>
          </div>
          <div className="flex items-center">
            <ExternalLink className="h-4 w-4 text-green-600 mr-2" />
            <a href="#" className="text-green-600 hover:underline">
              Blog: Neueste Entwicklungen zu {title}
            </a>
          </div>
        </div>
      </div>
    </ActionDialog>
  )
}

export default LearnMoreDialog
