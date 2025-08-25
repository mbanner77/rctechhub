"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Users, Code, Package, Truck, BarChart3, Lightbulb } from "lucide-react"
import { analytics } from "@/lib/analytics"

export default function InnovationFactory() {
  const [activeTab, setActiveTab] = useState("design")

  const handleTabChange = (tabId: string) => {
    analytics.serviceClick('innovation-factory-tab', tabId)
    setActiveTab(tabId)
  }

  const phases = [
    {
      id: "design",
      title: "Design",
      subtitle: "Was braucht der Nutzer wirklich?",
      icon: <Users className="h-6 w-6 text-green-600" />,
      description:
        "Human-centered Design ist bei uns nicht nur ein Buzzword. Unsere Projekte starten im UX Design mit der Frage: Was braucht der Nutzer wirklich? Dazu im Einsatz: Design Thinking, Design Scoping und UX Research. Hier greifen wir auch auf unsere Erfahrung aus einer Vielzahl von erfolgreichen Kundenprojekten zurück. Unser Ziel ist es, schnell zu verprobaren Prototypen der wirklich wichtigen Lösungen zu kommen. Und zwar bevor in die erste Zeile Code investiert wird.",
      tags: ["User Experience", "Use Cases", "Prototypes"],
      image: "/images/design-phase.png",
    },
    {
      id: "engineering",
      title: "Engineering",
      subtitle: "Wir bauen keine Luftschlösser",
      icon: <Code className="h-6 w-6 text-green-600" />,
      description:
        "Bevor die Prototypen aus dem Design umgesetzt werden, steht ein Machbarkeits-Check an. Wie kann die Lösung umgesetzt werden? Wir suchen nach dem optimalen Weg für den Kunden. Dazu schauen sich unsere erfahrenen SAP Solution Architects die IT-Landschaft der Kunden ganz genau an, empfehlen bereits bestehende Komponenten und geben auch die richtigen Impulse, um die Lösung noch besser zu machen. Mit dem richtigen Plan geht es dann in die Umsetzung.",
      tags: ["Enterprise Architecture", "Blueprints", "Solution Planning"],
      image: "/images/engineering-phase.png",
    },
    {
      id: "production",
      title: "Production",
      subtitle: "Hier entstehen Lösungen",
      icon: <Lightbulb className="h-6 w-6 text-green-600" />,
      description:
        "Nach dem Go der SAP Solution Architects geht das Projekt in die Entwicklung. Von Backend & Frontends über Workflows bis hin zu KI – bei uns arbeiten genau die richtigen Expertinnen und Experten zusammen in einem optimierten Projektsetup, je nachdem um welche Art der Lösung es sich handelt. So gehen wir die Herausforderung mit unserem interdisziplinären Teams agil und schnell an. Die fertige Lösung wird dann auf Herz und Nieren geprüft und auch von den End-Nutzern getestet.",
      tags: ["Optimierte Lösungsansätze", "Interdisziplinäre Teams"],
      image: "/images/production-phase.png",
    },
    {
      id: "parts",
      title: "Parts",
      subtitle: "nichts verschwenden, wiederverwenden",
      icon: <Package className="h-6 w-6 text-green-600" />,
      description:
        "Von Design über Engineering bis hin zur Produktion müssen wir nicht alles neu erfinden. Denn als Teil des starken SAP Ecosystems greifen wir auf viele bereits verprobte Komponenten, Tools und Best Practices zu. Und auch Teilprodukte unserer bisherigen Projekte werden erneut eingesetzt, um schneller zur passenden Lösung zu kommen.",
      tags: ["Libraries", "Business Content", "Add-ons"],
      image: "/images/parts-phase.png",
    },
    {
      id: "shipment",
      title: "Shipment",
      subtitle: "die Lösung geht auf die Reise",
      icon: <Truck className="h-6 w-6 text-green-600" />,
      description:
        "Die fertige Lösung übergeben wir an den Kunden und deployen sie im Live-System. Aber damit ist unser Job noch nicht getan. Wir helfen unseren Kunden dabei, die ersten Schritte mit der neuen Lösung zu gehen. Denn vor allem in den ersten Tagen sorgen ein allzeit offenes Ohr, ein optimal aufgesetztes Change Management und intensive User Trainings für eine hohe Akzeptanz der Endanwender für die Lösung. Und natürlich stellen wir auch sicher, dass die Lösung erfolgreich betrieben werden kann.",
      tags: ["Hyper Care", "Schulung", "Change Management"],
      image: "/images/shipment-phase.png",
    },
    {
      id: "monitoring",
      title: "Monitoring",
      subtitle: "alles im Blick",
      icon: <BarChart3 className="h-6 w-6 text-green-600" />,
      description:
        "Die Innovation Factory ist keine Blackbox, sondern eine gläserne Fabrik. Dadurch erhalten Sie nicht nur jederzeit einen Überblick zu Ihren Projekten und Programmen, sondern auch die Möglichkeit Anpassungen direkt im laufenden Prozess vorzunehmen. Dazu greifen Sie jederzeit auf das Know How unserer Expertinnen und Experten zurück, egal um welches Thema es geht. So steuern wir gemeinsam immer in die richtige Richtung.",
      tags: ["Overview", "Staffing", "Project Planning"],
      image: "/images/monitoring-phase.png",
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex overflow-x-auto">
        {phases.map((phase, index) => (
          <div
            key={phase.id}
            className={`flex-shrink-0 p-4 cursor-pointer border-b-2 ${
              activeTab === phase.id ? "border-green-500" : "border-transparent"
            }`}
            onClick={() => handleTabChange(phase.id)}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                <span className="font-bold text-green-600">{index + 1}</span>
              </div>
              <span className="font-medium">{phase.title}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6">
        {phases.map((phase) => (
          <div key={phase.id} className={activeTab === phase.id ? "block" : "hidden"}>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    {phase.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{phase.title}</h3>
                    <p className="text-gray-600">{phase.subtitle}</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-6">{phase.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {phase.tags.map((tag) => (
                    <span key={tag} className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="md:w-1/2">
                <div className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden">
                  <Image src={phase.image || "/placeholder.svg"} alt={phase.title} fill className="object-cover" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
