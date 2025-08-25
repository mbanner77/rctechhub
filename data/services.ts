import type { IService } from "@/types/service";

export const services: IService[] = [
  {
    id: "btp-assessment",
    title: "SAP BTP Readiness Assessment",
    description:
      "Umfassende Bewertung Ihrer aktuellen IT-Landschaft und Geschäftsanforderungen, um die Bereitschaft für die SAP Business Technology Platform zu ermitteln und einen strategischen Migrationsplan zu entwickeln.",
    price: 4900,
    category: "Beratung",
    image: "/images/btp-assessment.png",
    technologies: ["SAP BTP", "SAP Integration Suite", "SAP Extension Suite"],
    duration: "2 Wochen",
    phase: 1,
    rating: 4.9,
    included: [
      "Analyse der bestehenden IT-Landschaft",
      "Bewertung der Geschäftsanforderungen",
      "Gap-Analyse zwischen Ist- und Soll-Zustand",
      "Identifikation von Chancen und Risiken",
      "Erstellung einer Roadmap für die BTP-Einführung",
      "Präsentation der Ergebnisse und Empfehlungen",
    ],
    notIncluded: [
      "Implementierung der empfohlenen Lösungen",
      "Detaillierte technische Spezifikationen",
      "Schulungen für Endbenutzer",
    ],
    process: [
      {
        title: "Kick-off und Anforderungsanalyse",
        description: "Workshop zur Erfassung der Geschäftsanforderungen und IT-Landschaft",
      },
      {
        title: "Technische Analyse",
        description: "Bewertung der bestehenden Systeme und Identifikation von Integrationspunkten",
      },
      {
        title: "Strategieentwicklung",
        description: "Erarbeitung einer maßgeschneiderten BTP-Strategie",
      },
      {
        title: "Roadmap-Erstellung",
        description: "Entwicklung eines Umsetzungsplans mit Meilensteinen",
      },
      {
        title: "Abschlusspräsentation",
        description: "Vorstellung der Ergebnisse und Empfehlungen",
      },
    ],
  },
  {
    id: "btp-architecture",
    title: "SAP BTP Architekturdesign",
    description:
      "Entwicklung einer maßgeschneiderten SAP BTP-Architektur, die Ihre spezifischen Geschäftsanforderungen erfüllt und nahtlos in Ihre bestehende IT-Landschaft integriert werden kann.",
    price: 7500,
    category: "Architektur",
    image: "/images/btp-architecture.png",
    technologies: [
      "SAP BTP",
      "SAP HANA Cloud",
      "SAP Integration Suite",
      "SAP Extension Suite",
      "SAP Workflow Management",
    ],
    duration: "3 Wochen",
    phase: 2,
    rating: 4.8,
    dependencies: ["btp-assessment"],
    included: [
      "Detailliertes Architekturdesign für SAP BTP",
      "Auswahl der optimalen BTP-Services für Ihre Anforderungen",
      "Integration mit bestehenden SAP- und Nicht-SAP-Systemen",
      "Sicherheits- und Compliance-Konzept",
      "Skalierbarkeits- und Performance-Planung",
      "Technische Dokumentation der Architektur",
    ],
    notIncluded: [
      "Implementierung der Architektur",
      "Lizenzen für SAP BTP-Services",
      "Betrieb und Wartung der Systeme",
    ],
    process: [
      {
        title: "Anforderungsanalyse",
        description: "Detaillierte Erfassung der funktionalen und nicht-funktionalen Anforderungen",
      },
      {
        title: "Architekturentwurf",
        description: "Entwicklung der BTP-Architektur mit allen erforderlichen Komponenten",
      },
      {
        title: "Technische Spezifikation",
        description: "Erstellung detaillierter technischer Spezifikationen",
      },
      {
        title: "Review und Anpassung",
        description: "Überprüfung der Architektur mit Stakeholdern und Anpassung nach Feedback",
      },
      {
        title: "Finalisierung",
        description: "Fertigstellung der Architektur und Dokumentation",
      },
    ],
  },
  {
    id: "cap-implementation",
    title: "SAP CAP Anwendungsentwicklung",
    description:
      "Entwicklung einer maßgeschneiderten Anwendung mit dem SAP Cloud Application Programming Model (CAP), die Ihre Geschäftsprozesse optimiert und nahtlos in Ihre SAP-Landschaft integriert wird.",
    price: 12500,
    category: "Entwicklung",
    image: "/images/cap-implementation.png",
    technologies: ["SAP CAP", "Node.js", "SAP HANA Cloud", "SAP Fiori", "SAP BTP"],
    duration: "6 Wochen",
    phase: 3,
    rating: 4.7,
    dependencies: ["btp-architecture"],
    included: [
      "Anforderungsanalyse und Spezifikation",
      "Datenmodellierung und Datenbankdesign",
      "Entwicklung der Backend-Services mit SAP CAP",
      "Entwicklung der Frontend-Oberfläche mit SAP Fiori",
      "Integration mit bestehenden Systemen",
      "Umfassende Tests und Qualitätssicherung",
      "Deployment auf SAP BTP",
      "Dokumentation und Wissenstransfer",
    ],
    notIncluded: [
      "Lizenzen für SAP BTP und andere SAP-Produkte",
      "Betrieb und Wartung nach Projektabschluss",
      "Umfangreiche Datenmigration aus Altsystemen",
    ],
    process: [
      {
        title: "Anforderungsanalyse",
        description: "Detaillierte Erfassung der funktionalen und nicht-funktionalen Anforderungen",
      },
      {
        title: "Design und Spezifikation",
        description: "Erstellung des technischen Designs und der Spezifikationen",
      },
      {
        title: "Entwicklung",
        description: "Implementierung der Anwendung mit SAP CAP und Fiori",
      },
      {
        title: "Tests und Qualitätssicherung",
        description: "Durchführung von Unit-Tests, Integrationstests und Benutzertests",
      },
      {
        title: "Deployment und Go-Live",
        description: "Bereitstellung der Anwendung auf SAP BTP und Produktivsetzung",
      },
    ],
  },
  {
    id: "integration-suite",
    title: "SAP Integration Suite Implementierung",
    description:
      "Implementierung der SAP Integration Suite zur nahtlosen Verbindung Ihrer SAP- und Nicht-SAP-Systeme, um Datensilos zu beseitigen und durchgängige Geschäftsprozesse zu ermöglichen.",
    price: 9800,
    category: "Integration",
    image: "/images/integration-suite.png",
    technologies: [
      "SAP Integration Suite",
      "SAP Cloud Integration",
      "SAP API Management",
      "SAP Event Mesh",
      "SAP BTP",
    ],
    duration: "4 Wochen",
    phase: 3,
    rating: 4.8,
    dependencies: ["btp-architecture"],
    included: [
      "Analyse der Integrationsanforderungen",
      "Design der Integrationsarchitektur",
      "Implementierung von Integrationsszenarien",
      "Konfiguration von API Management",
      "Einrichtung von Event Mesh für ereignisgesteuerte Architekturen",
      "Tests und Qualitätssicherung",
      "Dokumentation und Wissenstransfer",
    ],
    notIncluded: [
      "Lizenzen für SAP Integration Suite",
      "Anpassungen an Quell- und Zielsystemen",
      "Betrieb und Wartung nach Projektabschluss",
    ],
    process: [
      {
        title: "Anforderungsanalyse",
        description: "Erfassung der Integrationsanforderungen und -szenarien",
      },
      {
        title: "Architekturdesign",
        description: "Entwicklung der Integrationsarchitektur",
      },
      {
        title: "Implementierung",
        description: "Umsetzung der Integrationsszenarien mit SAP Integration Suite",
      },
      {
        title: "Tests",
        description: "Durchführung von Integrationstests und End-to-End-Tests",
      },
      {
        title: "Deployment und Dokumentation",
        description: "Produktivsetzung und Erstellung der technischen Dokumentation",
      },
    ],
  },
  {
    id: "fiori-development",
    title: "SAP Fiori App-Entwicklung",
    description:
      "Entwicklung maßgeschneiderter SAP Fiori-Anwendungen mit modernem, benutzerfreundlichem Design, die Ihre Geschäftsprozesse optimieren und die Benutzererfahrung verbessern.",
    price: 8500,
    category: "Entwicklung",
    image: "/images/fiori-development.png",
    technologies: ["SAP Fiori", "SAPUI5", "OData", "SAP Gateway", "SAP BTP"],
    duration: "5 Wochen",
    phase: 3,
    rating: 4.9,
    included: [
      "Anforderungsanalyse und UX-Design",
      "Prototyping und Design-Thinking-Workshops",
      "Entwicklung von Fiori-Apps nach SAP-Standards",
      "Integration mit Backend-Systemen",
      "Umfassende Tests und Qualitätssicherung",
      "Deployment auf SAP BTP oder On-Premise",
      "Dokumentation und Wissenstransfer",
    ],
    notIncluded: [
      "Lizenzen für SAP-Produkte",
      "Umfangreiche Anpassungen an Backend-Systemen",
      "Betrieb und Wartung nach Projektabschluss",
    ],
    process: [
      {
        title: "Anforderungsanalyse und UX-Design",
        description: "Erfassung der Anforderungen und Erstellung von Wireframes",
      },
      {
        title: "Prototyping",
        description: "Entwicklung eines interaktiven Prototyps und Nutzerfeedback",
      },
      {
        title: "Entwicklung",
        description: "Implementierung der Fiori-Apps mit SAPUI5",
      },
      {
        title: "Tests",
        description: "Durchführung von Unit-Tests, Integrationstests und Benutzertests",
      },
      {
        title: "Deployment",
        description: "Bereitstellung der Apps auf der Zielplattform",
      },
    ],
  },
  {
    id: "btp-security",
    title: "SAP BTP Sicherheitskonzept",
    description:
      "Entwicklung und Implementierung eines umfassenden Sicherheitskonzepts für Ihre SAP BTP-Landschaft, um Ihre Daten und Anwendungen vor unbefugtem Zugriff zu schützen.",
    price: 6500,
    category: "Sicherheit",
    image: "/images/btp-security.png",
    technologies: [
      "SAP BTP Security",
      "Identity Authentication Service",
      "OAuth",
      "SAML",
      "Role-Based Access Control",
    ],
    duration: "3 Wochen",
    phase: 2,
    rating: 4.6,
    dependencies: ["btp-assessment"],
    included: [
      "Sicherheitsanalyse und Risikobewertung",
      "Entwicklung eines Sicherheitskonzepts",
      "Konfiguration von Identity Authentication Service",
      "Einrichtung von Single Sign-On (SSO)",
      "Implementierung von Rollen- und Berechtigungskonzepten",
      "Sicherheitsaudits und Penetrationstests",
      "Dokumentation und Schulung",
    ],
    notIncluded: [
      "Lizenzen für SAP-Sicherheitsprodukte",
      "Behebung von Sicherheitslücken in Nicht-SAP-Systemen",
      "Kontinuierliches Sicherheitsmonitoring",
    ],
    process: [
      {
        title: "Sicherheitsanalyse",
        description: "Bewertung der aktuellen Sicherheitslage und Identifikation von Risiken",
      },
      {
        title: "Konzeptentwicklung",
        description: "Erstellung eines maßgeschneiderten Sicherheitskonzepts",
      },
      {
        title: "Implementierung",
        description: "Umsetzung der Sicherheitsmaßnahmen",
      },
      {
        title: "Tests und Audits",
        description: "Durchführung von Sicherheitstests und Audits",
      },
      {
        title: "Dokumentation und Schulung",
        description: "Erstellung der Sicherheitsdokumentation und Schulung der Mitarbeiter",
      },
    ],
  },
  {
    id: "btp-monitoring",
    title: "SAP BTP Monitoring & Operations",
    description:
      "Einrichtung eines umfassenden Monitoring- und Betriebskonzepts für Ihre SAP BTP-Landschaft, um optimale Performance, Verfügbarkeit und Kosteneffizienz zu gewährleisten.",
    price: 5800,
    category: "Operations",
    image: "/images/btp-monitoring.png",
    technologies: ["SAP Cloud ALM", "SAP BTP Cockpit", "Dynatrace", "Prometheus", "Grafana"],
    duration: "2 Wochen",
    phase: 4,
    rating: 4.7,
    dependencies: ["cap-implementation", "integration-suite", "fiori-development"],
    included: [
      "Analyse der Monitoring-Anforderungen",
      "Einrichtung von Monitoring-Tools",
      "Konfiguration von Alarmen und Benachrichtigungen",
      "Erstellung von Dashboards für Performance-Metriken",
      "Optimierung der Ressourcennutzung und Kosten",
      "Dokumentation und Wissenstransfer",
    ],
    notIncluded: [
      "Lizenzen für Monitoring-Tools",
      "24/7-Betrieb und Support",
      "Monitoring von Nicht-BTP-Systemen",
    ],
    process: [
      {
        title: "Anforderungsanalyse",
        description: "Erfassung der Monitoring- und Betriebsanforderungen",
      },
      {
        title: "Tool-Auswahl und -Konfiguration",
        description: "Auswahl und Einrichtung der geeigneten Monitoring-Tools",
      },
      {
        title: "Dashboard-Erstellung",
        description: "Entwicklung von benutzerfreundlichen Monitoring-Dashboards",
      },
      {
        title: "Alarmkonfiguration",
        description: "Einrichtung von Alarmen und Eskalationsprozessen",
      },
      {
        title: "Dokumentation und Schulung",
        description: "Erstellung der Betriebsdokumentation und Schulung der Administratoren",
      },
    ],
  },
  {
    id: "btp-deployment",
    title: "SAP BTP Deployment & Go-Live",
    description:
      "Professionelle Unterstützung bei der Bereitstellung Ihrer Anwendungen auf der SAP Business Technology Platform und beim reibungslosen Übergang in den Produktivbetrieb.",
    price: 7200,
    category: "Deployment",
    image: "/images/btp-deployment.png",
    technologies: ["SAP BTP", "CI/CD", "DevOps", "SAP Cloud Transport Management", "SAP Cloud ALM"],
    duration: "3 Wochen",
    phase: 5,
    rating: 4.8,
    dependencies: [
      "btp-monitoring",
      "cap-implementation",
      "integration-suite",
      "fiori-development",
    ],
    included: [
      "Entwicklung einer Deployment-Strategie",
      "Einrichtung von CI/CD-Pipelines",
      "Konfiguration von Cloud Transport Management",
      "Durchführung von Performance- und Lasttests",
      "Go-Live-Planung und -Durchführung",
      "Hypercare-Support nach Go-Live",
      "Dokumentation und Wissenstransfer",
    ],
    notIncluded: [
      "Lizenzen für SAP-Produkte",
      "Langfristiger Support und Wartung",
      "Umfangreiche Anpassungen an bestehenden Systemen",
    ],
    process: [
      {
        title: "Deployment-Planung",
        description: "Entwicklung einer maßgeschneiderten Deployment-Strategie",
      },
      {
        title: "CI/CD-Einrichtung",
        description: "Implementierung von CI/CD-Pipelines für automatisierte Deployments",
      },
      {
        title: "Tests",
        description: "Durchführung von Performance-, Last- und Akzeptanztests",
      },
      {
        title: "Go-Live",
        description: "Koordination und Durchführung des Go-Lives",
      },
      {
        title: "Hypercare",
        description: "Unterstützung nach dem Go-Live zur Sicherstellung eines stabilen Betriebs",
      },
    ],
  },
  {
    id: "btp-training",
    title: "SAP BTP Schulung & Enablement",
    description:
      "Maßgeschneiderte Schulungen und Workshops zu SAP BTP-Technologien, um Ihr Team zu befähigen, die Plattform effektiv zu nutzen und weiterzuentwickeln.",
    price: 4200,
    category: "Schulung",
    image: "/images/btp-training.png",
    technologies: ["SAP BTP", "SAP CAP", "SAP Fiori", "SAP Integration Suite", "SAP HANA Cloud"],
    duration: "1 Woche",
    phase: 4,
    rating: 4.9,
    included: [
      "Bedarfsanalyse und Erstellung eines Schulungsplans",
      "Durchführung von maßgeschneiderten Workshops",
      "Hands-on-Übungen mit realen Szenarien",
      "Bereitstellung von Schulungsunterlagen",
      "Zertifizierungsvorbereitung (optional)",
      "Follow-up-Sessions und Coaching",
    ],
    notIncluded: [
      "Offizielle SAP-Zertifizierungen",
      "Hardware für Schulungsteilnehmer",
      "Reise- und Unterbringungskosten",
    ],
    process: [
      {
        title: "Bedarfsanalyse",
        description: "Ermittlung des Schulungsbedarfs und der Zielgruppen",
      },
      {
        title: "Schulungsplanung",
        description: "Entwicklung eines maßgeschneiderten Schulungsplans",
      },
      {
        title: "Durchführung",
        description: "Durchführung der Schulungen und Workshops",
      },
      {
        title: "Evaluation",
        description: "Bewertung des Schulungserfolgs und Sammlung von Feedback",
      },
      {
        title: "Follow-up",
        description: "Durchführung von Follow-up-Sessions und individuellem Coaching",
      },
    ],
  },
];
