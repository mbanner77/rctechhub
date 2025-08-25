"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Download, FileText, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Radar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js"
import AssessmentDialog from "./assessment-dialog"
import DownloadDialog from "./download-dialog"
import { analytics } from "@/lib/analytics"

// Register the required chart.js components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, ChartTooltip, Legend)

// Simple Radar Chart Component
function SimpleRadarChart() {
  const data = {
    labels: [
      "Prozessautomatisierung",
      "Systemintegration",
      "Datenmanagement",
      "Innovationsfähigkeit",
      "User Experience",
      "Cloud-Nutzung",
    ],
    datasets: [
      {
        label: "Aktueller Stand",
        data: [2, 3, 2, 1, 2, 2],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgb(75, 192, 192)",
        borderWidth: 2,
        pointBackgroundColor: "rgb(75, 192, 192)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(75, 192, 192)",
      },
      {
        label: "Zielzustand",
        data: [4, 5, 4, 4, 5, 5],
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgb(54, 162, 235)",
        borderWidth: 2,
        pointBackgroundColor: "rgb(54, 162, 235)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(54, 162, 235)",
      },
      {
        label: "Branchendurchschnitt",
        data: [3, 3.5, 3, 2.5, 3, 3.5],
        backgroundColor: "rgba(255, 159, 64, 0.2)",
        borderColor: "rgb(255, 159, 64)",
        borderWidth: 2,
        pointBackgroundColor: "rgb(255, 159, 64)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(255, 159, 64)",
      },
    ],
  }

  const options = {
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
        },
      },
    },
    maintainAspectRatio: false,
  }

  return <Radar data={data} options={options} />
}

export default function DigitalMaturityAssessment() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isAssessmentDialogOpen, setIsAssessmentDialogOpen] = useState(false)
  const [isWhitepaperDialogOpen, setIsWhitepaperDialogOpen] = useState(false)

  const maturityLevels = [
    {
      level: 1,
      name: "Initial",
      description: "Grundlegende SAP-Systeme ohne Integration, manuelle Prozesse dominieren",
      color: "bg-red-500",
    },
    {
      level: 2,
      name: "Managed",
      description: "Standardisierte Prozesse, beginnende Systemintegration, erste Cloud-Ansätze",
      color: "bg-orange-500",
    },
    {
      level: 3,
      name: "Defined",
      description: "Integrierte Systeme, teilweise automatisierte Prozesse, hybride Cloud-Nutzung",
      color: "bg-yellow-500",
    },
    {
      level: 4,
      name: "Quantitativ Gesteuert",
      description: "Datengetriebene Entscheidungen, weitgehend automatisierte Prozesse, Cloud-First-Strategie",
      color: "bg-blue-500",
    },
    {
      level: 5,
      name: "Optimizing",
      description: "KI-gestützte Prozesse, vollständige Integration, innovative Cloud-native Lösungen",
      color: "bg-green-500",
    },
  ]

  const dimensions = [
    {
      id: "process",
      name: "Prozessautomatisierung",
      description: "Grad der Automatisierung von Geschäftsprozessen",
      scientificBase: "Business Process Maturity Model (BPMM)",
    },
    {
      id: "integration",
      name: "Systemintegration",
      description: "Nahtlose Verbindung zwischen SAP- und Nicht-SAP-Systemen",
      scientificBase: "Enterprise Integration Patterns (Hohpe/Woolf)",
    },
    {
      id: "data",
      name: "Datenmanagement",
      description: "Qualität, Verfügbarkeit und Nutzung von Daten",
      scientificBase: "DAMA-DMBOK (Data Management Body of Knowledge)",
    },
    {
      id: "innovation",
      name: "Innovationsfähigkeit",
      description: "Fähigkeit, neue Technologien zu adaptieren",
      scientificBase: "Diffusion of Innovations Theory (Rogers)",
    },
    {
      id: "user",
      name: "User Experience",
      description: "Benutzerfreundlichkeit und Akzeptanz der Systeme",
      scientificBase: "Technology Acceptance Model (TAM)",
    },
    {
      id: "cloud",
      name: "Cloud-Nutzung",
      description: "Einsatz von Cloud-Technologien und -Services",
      scientificBase: "Cloud Computing Maturity Model (Becker et al.)",
    },
  ]

  const radarData = [
    {
      dimension: "Prozessautomatisierung",
      current: 2,
      target: 4,
      industry: 3,
    },
    {
      dimension: "Systemintegration",
      current: 3,
      target: 5,
      industry: 3.5,
    },
    {
      dimension: "Datenmanagement",
      current: 2,
      target: 4,
      industry: 3,
    },
    {
      dimension: "Innovationsfähigkeit",
      current: 1,
      target: 4,
      industry: 2.5,
    },
    {
      dimension: "User Experience",
      current: 2,
      target: 5,
      industry: 3,
    },
    {
      dimension: "Cloud-Nutzung",
      current: 2,
      target: 5,
      industry: 3.5,
    },
  ]

  const scientificModels = [
    {
      name: "SAP Digital Transformation Framework",
      description:
        "Ein von SAP entwickeltes Framework zur Bewertung und Planung der digitalen Transformation mit Fokus auf SAP-Technologien.",
      source: "SAP SE, 2020",
      image: "/images/sap-dtf.png",
    },
    {
      name: "MIT Digital Maturity Model",
      description:
        "Ein wissenschaftliches Modell des MIT zur Bewertung der digitalen Reife von Unternehmen in verschiedenen Dimensionen.",
      source: "MIT Sloan Center for Information Systems Research, 2019",
      image: "/images/mit-dmm.png",
    },
    {
      name: "Industry 4.0 Maturity Model",
      description:
        "Ein Reifegradmodell zur Bewertung der Industrie 4.0-Fähigkeiten mit Fokus auf Fertigungsprozesse und deren Digitalisierung.",
      source: "Acatech - Deutsche Akademie der Technikwissenschaften, 2020",
      image: "/images/industry40-model.png",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 break-words hyphens-auto">Digitaler Reifegrad Ihrer SAP-Landschaft</h3>
            <p className="text-gray-700 mb-6 text-sm sm:text-base break-words whitespace-normal">
              Unsere wissenschaftlich fundierte Standortbestimmung hilft Ihnen, den aktuellen Digitalisierungsgrad Ihrer
              SAP-Landschaft zu ermitteln und einen klaren Weg zur digitalen Exzellenz zu definieren. Basierend auf
              etablierten Frameworks und Modellen analysieren wir Ihre SAP-Systeme in sechs Schlüsseldimensionen.
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-6">
              {dimensions.map((dimension) => (
                <TooltipProvider key={dimension.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="bg-gray-100 text-gray-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center">
                        {dimension.name}
                        <HelpCircle className="ml-1 h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-medium">{dimension.name}</p>
                      <p className="text-sm text-gray-500">{dimension.description}</p>
                      <p className="text-xs text-gray-400 mt-1">Basierend auf: {dimension.scientificBase}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
              analytics.assessmentStart('digital-maturity')
              setIsAssessmentDialogOpen(true)
            }}>
              Kostenlose Standortbestimmung starten
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="md:w-1/2">
            <div className="relative h-64 md:h-80 w-full max-w-[420px] mx-auto rounded-lg overflow-hidden">
              {/* Limit width for a more natural look */}
              <Image
                src="/images/DigitalerReifegradDerSAPLandschaft.png"
                alt="Digitaler Reifegrad Assessment"
                fill
                className="object-fill"
              />
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2 flex justify-center">
          <TabsList className="flex w-full px-2">
  <TabsTrigger
    value="overview"
    className="flex-1 px-2 py-2 text-[10px] sm:text-sm md:text-base text-center leading-tight"
  >
    Reifegradmodell
  </TabsTrigger>
  <TabsTrigger
    value="assessment"
    className="flex-1 px-2 py-2 text-[10px] sm:text-sm md:text-base text-center leading-tight"
  >
    Standortbestimmung
  </TabsTrigger>
  <TabsTrigger
    value="scientific"
    className="flex-1 px-2 py-2 text-[10px] sm:text-sm md:text-base text-center leading-tight"
  >
    Wissenschaft. Grundlagen
  </TabsTrigger>
</TabsList>



        </div>

        <TabsContent value="overview" className="mt-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Das 5-Stufen Reifegradmodell</h3>
            <p className="mb-6 break-words whitespace-normal">
              Unser Reifegradmodell basiert auf dem Capability Maturity Model Integration (CMMI) und wurde speziell für
              SAP-Landschaften adaptiert. Es umfasst fünf Reifegradstufen, die den Fortschritt auf dem Weg zur digitalen
              Exzellenz beschreiben.
            </p>

            <div className="space-y-4">
              {maturityLevels.map((level) => (
                <div key={level.level} className="border rounded-lg p-4">
                  <div className="flex flex-wrap items-center mb-2">
                    <div
                      className={`w-8 h-8 rounded-full ${level.color} flex items-center justify-center text-white font-bold mr-3 flex-shrink-0`}
                    >
                      {level.level}
                    </div>
                    <h4 className="text-lg font-semibold break-words hyphens-auto">{level.name}</h4>
                  </div>
                  <p className="text-gray-700 break-words hyphens-auto text-sm sm:text-base">{level.description}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assessment" className="mt-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Ihre Standortbestimmung</h3>
            <p className="mb-6 break-words whitespace-normal">
              Das Radar-Diagramm zeigt Ihren aktuellen Digitalisierungsgrad in den sechs Schlüsseldimensionen im
              Vergleich zu Ihrem Zielzustand und dem Branchendurchschnitt.
            </p>

            <div className="h-[400px] w-full">
              <SimpleRadarChart />
            </div>

            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-4 rounded-md">
                <h4 className="font-semibold mb-4">Ihre Stärken</h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm sm:text-base break-words hyphens-auto">Gute Basis bei der Systemintegration</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm sm:text-base break-words hyphens-auto">Solides Datenmanagement mit zentraler SAP-Datenhaltung</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm sm:text-base break-words hyphens-auto">Erste Cloud-Initiativen wurden bereits umgesetzt</span>
                  </li>
                </ul>
              </div>
              <div className="bg-red-50 p-4 rounded-md">
                <h4 className="font-semibold mb-4">Handlungsfelder</h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm sm:text-base break-words hyphens-auto">Innovationsfähigkeit deutlich unter Branchendurchschnitt</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm sm:text-base break-words hyphens-auto">Prozessautomatisierung ausbaufähig</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm sm:text-base break-words hyphens-auto">User Experience entspricht nicht modernen Standards</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsAssessmentDialogOpen(true)}>
                Detaillierte Analyse anfordern
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scientific" className="mt-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Wissenschaftliche Grundlagen</h3>
            <p className="mb-6 break-words whitespace-normal">
              Unsere Methodik zur Standortbestimmung basiert auf etablierten wissenschaftlichen Modellen und Frameworks,
              die speziell für die Bewertung der digitalen Reife von Unternehmen entwickelt wurden.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {scientificModels.map((model) => (
                <Card key={model.name} className="overflow-hidden">
                  <div className="relative h-40">
                    <Image src={model.image || "/placeholder.svg"} alt={model.name} fill className="object-cover" />
                  </div>
                  <CardHeader>
                    <CardTitle className="break-words hyphens-auto">{model.name}</CardTitle>
                    <CardDescription className="break-words">{model.source}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 break-words hyphens-auto">{model.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setIsWhitepaperDialogOpen(true)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Mehr erfahren
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="mt-8">
              <h4 className="font-semibold mb-4">Weitere wissenschaftliche Quellen</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <ArrowRight className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span>
                    <span className="font-medium">Digital Transformation Assessment (Westerman et al., 2012)</span> -
                    MIT Center for Digital Business und Capgemini Consulting
                  </span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span>
                    <span className="font-medium">Digital Capability Framework (Kane et al., 2017)</span> - MIT Sloan
                    Management Review und Deloitte
                  </span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span>
                    <span className="font-medium">SAP Value Management Framework (SAP, 2021)</span> - SAP SE
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-6 text-center">
              <Button variant="outline" className="mr-2" onClick={() => setIsWhitepaperDialogOpen(true)}>
                <Download className="mr-2 h-4 w-4" />
                Whitepaper herunterladen
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <AssessmentDialog isOpen={isAssessmentDialogOpen} onClose={() => setIsAssessmentDialogOpen(false)} />

      <DownloadDialog
        isOpen={isWhitepaperDialogOpen}
        onClose={() => setIsWhitepaperDialogOpen(false)}
        resourceTitle="Digitale Reife in SAP-Landschaften"
        resourceType="whitepaper"
      />
    </div>
  )
}
