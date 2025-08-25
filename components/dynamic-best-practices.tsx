"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Eye, Download } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"

// Simplified best practices data
const bestPractices = [
  {
    id: "btp-architecture",
    title: "BTP Architektur",
    shortDescription: "Best Practices für die Architektur von SAP BTP Anwendungen",
    imageUrl: "/images/best-practice-btp-architecture.png",
    longDescription:
      "Die SAP Business Technology Platform (BTP) bietet eine flexible und skalierbare Grundlage für moderne Unternehmensanwendungen.",
    benefits: [
      "Reduzierte Entwicklungszeit durch bewährte Architekturmuster",
      "Verbesserte Skalierbarkeit und Performance",
      "Erhöhte Wartbarkeit und einfachere Erweiterbarkeit",
    ],
    implementationTime: "2-4 Wochen",
    implementationSteps: [
      {
        title: "Anforderungsanalyse",
        description: "Identifizieren Sie funktionale und nicht-funktionale Anforderungen.",
      },
      {
        title: "Architektur-Workshop",
        description: "Führen Sie einen Workshop durch, um die geeignete Architektur zu definieren.",
      },
    ],
  },
  {
    id: "integration",
    title: "Integration",
    shortDescription: "Best Practices für die Integration von SAP und Nicht-SAP Systemen",
    imageUrl: "/images/best-practice-integration.png",
    longDescription:
      "Die Integration verschiedener Systeme ist eine der größten Herausforderungen in der Unternehmens-IT.",
    benefits: [
      "Nahtlose Integration zwischen SAP- und Nicht-SAP-Systemen",
      "Reduzierte Komplexität durch standardisierte Integrationsmuster",
    ],
    implementationTime: "3-6 Wochen",
    implementationSteps: [
      { title: "Integrationsanforderungen", description: "Identifizieren Sie die zu integrierenden Systeme." },
      { title: "Integrationsmuster-Auswahl", description: "Wählen Sie geeignete Integrationsmuster." },
    ],
  },
  {
    id: "fiori-ux",
    title: "Fiori UX",
    shortDescription: "Best Practices für die Entwicklung von Fiori Anwendungen",
    imageUrl: "/images/best-practice-fiori-ux.png",
    longDescription: "SAP Fiori bietet ein modernes und konsistentes Benutzererlebnis für SAP-Anwendungen.",
    benefits: [
      "Verbesserte Benutzerakzeptanz durch konsistentes Design",
      "Erhöhte Produktivität durch optimierte Benutzerführung",
    ],
    implementationTime: "2-4 Wochen",
    implementationSteps: [
      { title: "Anforderungsanalyse", description: "Identifizieren Sie die Benutzeranforderungen." },
      { title: "UX-Design", description: "Erstellen Sie Wireframes und Mockups." },
    ],
  },
  {
    id: "cap-development",
    title: "CAP Development",
    shortDescription: "Best Practices für die Entwicklung mit dem SAP Cloud Application Programming Model",
    imageUrl: "/images/best-practice-cap-development.png",
    longDescription:
      "Das SAP Cloud Application Programming Model (CAP) ist ein Framework für die Entwicklung von Unternehmensanwendungen.",
    benefits: ["Beschleunigte Entwicklung durch standardisierte Muster", "Verbesserte Codequalität und Wartbarkeit"],
    implementationTime: "2-3 Wochen",
    implementationSteps: [
      { title: "Projektsetup", description: "Richten Sie ein CAP-Projekt ein." },
      { title: "Datenmodellierung", description: "Definieren Sie das Datenmodell." },
    ],
  },
]

export default function DynamicBestPractices() {
  const { toast } = useToast()
  const [selectedBestPractice, setSelectedBestPractice] = useState<any | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("description")

  const handleViewDetails = (bestPractice: any) => {
    setSelectedBestPractice(bestPractice)
    setDetailDialogOpen(true)
  }

  const handleDownload = (bestPractice: any) => {
    toast({
      title: "Download gestartet",
      description: `${bestPractice.title} wird heruntergeladen...`,
    })
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bestPractices.map((bestPractice) => (
          <Card
            key={bestPractice.id}
            className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={bestPractice.imageUrl || "/placeholder.svg?height=200&width=400&query=best practice"}
                alt={bestPractice.title}
                className="object-cover transition-transform duration-300 hover:scale-105"
                fill
              />
            </div>
            <CardHeader>
              <CardTitle>{bestPractice.title}</CardTitle>
              <CardDescription>{bestPractice.shortDescription}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-gray-600 line-clamp-3">{bestPractice.longDescription}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => handleViewDetails(bestPractice)} className="gap-1">
                <Eye className="h-4 w-4" />
                Details
              </Button>
              <Button onClick={() => handleDownload(bestPractice)} className="gap-1">
                <Download className="h-4 w-4" />
                Herunterladen
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedBestPractice && (
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{selectedBestPractice.title}</DialogTitle>
              <DialogDescription className="text-lg">{selectedBestPractice.shortDescription}</DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="overflow-x-auto pb-2 mb-6">
                  <TabsList className="w-fit flex">
                    <TabsTrigger value="description" className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap">Beschreibung</TabsTrigger>
                    <TabsTrigger value="benefits" className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap">Vorteile</TabsTrigger>
                    <TabsTrigger value="implementation" className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap">Implementierung</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="description" className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                      <div className="relative w-full h-48 rounded-lg overflow-hidden">
                        <Image
                          src={
                            selectedBestPractice.imageUrl || "/placeholder.svg?height=200&width=300&query=best practice"
                          }
                          alt={selectedBestPractice.title}
                          className="object-cover"
                          fill
                        />
                      </div>
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2">Zeitaufwand</h4>
                        <p>{selectedBestPractice.implementationTime}</p>
                      </div>
                    </div>
                    <div className="md:w-2/3">
                      <h3 className="text-xl font-semibold mb-4">Übersicht</h3>
                      <p className="text-gray-700">{selectedBestPractice.longDescription}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="benefits" className="space-y-4">
                  <h3 className="text-xl font-semibold mb-4">Vorteile</h3>
                  <ul className="space-y-3">
                    {selectedBestPractice.benefits.map((benefit: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0">✓</div>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>

                <TabsContent value="implementation" className="space-y-4">
                  <h3 className="text-xl font-semibold mb-4">Implementierungsschritte</h3>
                  <ol className="space-y-4">
                    {selectedBestPractice.implementationSteps.map((step: any, idx: number) => (
                      <li key={idx} className="border-b pb-4 last:border-0">
                        <div className="flex items-start gap-3">
                          <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="font-medium">{step.title}</h4>
                            <p className="text-muted-foreground mt-1">{step.description}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                Schließen
              </Button>
              <Button className="gap-2" onClick={() => handleDownload(selectedBestPractice)}>
                <Download className="h-4 w-4" />
                Best Practice herunterladen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
