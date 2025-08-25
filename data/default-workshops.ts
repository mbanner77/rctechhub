import { Workshop } from "@/types/workshop";

// Standard-Workshops
export const defaultWorkshops: Workshop[] = [
  {
    id: "workshop-1",
    title: "S/4HANA Readiness Assessment",
    description: "Umfassende Analyse Ihrer aktuellen SAP-Landschaft und Bewertung der Bereitschaft für eine S/4HANA-Migration.",
    duration: "2-3 Tage",
    audience: "IT-Leitung, Prozessverantwortliche",
    price: 4500,
    icon: "Briefcase",
    benefits: [
      "Transparenz über den aktuellen Zustand Ihrer SAP-Landschaft",
      "Identifikation von Risiken und Hürden für die Migration",
      "Konkrete Handlungsempfehlungen für Ihr S/4HANA-Projekt"
    ],
    unitId: "digital-core"
  },
  {
    id: "workshop-2",
    title: "Digital Core Strategie-Workshop",
    description: "Entwicklung einer maßgeschneiderten Strategie für die digitale Transformation Ihres Unternehmenskerns.",
    duration: "1 Tag",
    audience: "C-Level, IT-Strategie",
    price: 2800,
    icon: "Lightbulb",
    benefits: [
      "Abstimmung der IT-Strategie mit den Geschäftszielen",
      "Priorisierung von Transformationsinitiativen", 
      "Definition eines klaren Fahrplans für die digitale Zukunft"
    ],
    unitId: "digital-core"
  },
  {
    id: "workshop-3",
    title: "Prozessoptimierung mit S/4HANA",
    description: "Identifikation und Neugestaltung von Geschäftsprozessen unter Ausnutzung der S/4HANA-Funktionalitäten.",
    duration: "3-5 Tage",
    audience: "Fachbereichsleiter, Prozessmanager",
    price: 7500,
    icon: "Code",
    benefits: [
      "Effizienzsteigerung durch optimierte Prozesse",
      "Nutzen der vollen Leistungsfähigkeit von S/4HANA",
      "Reduzierte Komplexität und höhere Benutzerakzeptanz"
    ],
    unitId: "digital-core"
  },
  {
    id: "workshop-4",
    title: "BTP Readiness Assessment",
    description: "Bewertung Ihrer technischen und organisatorischen Bereitschaft für den Einsatz der SAP Business Technology Platform.",
    duration: "2-3 Tage",
    audience: "IT-Leitung, Architekten",
    price: 4800,
    icon: "Briefcase",
    benefits: [
      "Analyse der technischen und organisatorischen Voraussetzungen",
      "Identifikation von Skill-Gaps und Trainingsbedarfen",
      "Entwicklung einer individuellen Cloud-Transition-Roadmap"
    ],
    unitId: "cloud-foundation"
  },
  {
    id: "workshop-5",
    title: "Cloud Strategie-Workshop",
    description: "Entwicklung einer umfassenden Cloud-Strategie für die effektive Nutzung der SAP BTP in Ihrem Unternehmen.",
    duration: "1 Tag",
    audience: "C-Level, IT-Strategie",
    price: 2800,
    icon: "Lightbulb",
    benefits: [
      "Abstimmung der Cloud-Strategie mit den Unternehmenszielen",
      "Definition von Cloud-Governance und Betriebsmodellen",
      "Identifikation von Quick-Wins für schnelle Erfolge"
    ],
    unitId: "cloud-foundation"
  }
];
