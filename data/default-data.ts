// Importiere die Landingpage-Daten
import { defaultLandingPage } from "./landing-page-data";
import mailConfigJson from "../data-store/mail-config.json";

// Standarddaten für Services
export const defaultServices = [
  {
    id: "1",
    title: "BTP Architektur-Assessment",
    description:
      "Analyse Ihrer bestehenden SAP-Landschaft und Entwicklung einer maßgeschneiderten BTP-Architektur, die optimal auf Ihre Geschäftsanforderungen abgestimmt ist.",
    price: 4800,
    duration: "5 Tage",
    category: "Beratung",
    technologies: [
      "SAP BTP",
      "Cloud Foundry",
      "Kyma",
      "ABAP Environment",
      "SAP HANA Cloud",
      "SAP Integration Suite",
    ],
    image: "/images/btp-architecture.png",
    phase: 1,
    included: [
      "Analyse der bestehenden SAP-Landschaft",
      "Identifikation von Optimierungspotentialen",
      "Entwicklung einer BTP-Zielarchitektur",
      "Erstellung eines Migrationsplans",
      "Dokumentation der Architekturentscheidungen",
    ],
    notIncluded: [
      "Implementierung der empfohlenen Architektur",
      "Migration bestehender Anwendungen",
      "Lizenzkosten für SAP BTP-Services",
      "Schulung der Mitarbeiter",
    ],
    dependencies: [
      "Zugang zu bestehenden SAP-Systemen",
      "Dokumentation der aktuellen Systemlandschaft",
      "Teilnahme von Fachexperten an Workshops",
    ],
    process: [
      {
        title: "Vorbereitung & Analyse",
        description:
          "Analyse der bestehenden SAP-Landschaft und Sammlung von Anforderungen durch Interviews mit Stakeholdern.",
      },
      {
        title: "Architektur-Workshop",
        description:
          "Gemeinsamer Workshop zur Entwicklung einer maßgeschneiderten BTP-Architektur basierend auf den gesammelten Anforderungen.",
      },
      {
        title: "Konzeptentwicklung",
        description:
          "Detaillierte Ausarbeitung der BTP-Zielarchitektur mit Fokus auf Skalierbarkeit, Sicherheit und Kosteneffizienz.",
      },
      {
        title: "Präsentation & Feedback",
        description:
          "Präsentation der entwickelten Architektur vor Entscheidungsträgern und Einarbeitung von Feedback.",
      },
      {
        title: "Finalisierung",
        description:
          "Erstellung der finalen Dokumentation inklusive Migrationsplan und Handlungsempfehlungen.",
      },
    ],
    prerequisites:
      "Für ein optimales Ergebnis benötigen wir Zugang zu Ihrer bestehenden SAP-Systemlandschaft sowie die Teilnahme von Fachexperten aus den Bereichen IT und Fachabteilungen.",
    outcomes:
      "Nach Abschluss des Assessments erhalten Sie eine detaillierte Dokumentation Ihrer optimalen BTP-Zielarchitektur, einen konkreten Migrationsplan sowie Handlungsempfehlungen für die Umsetzung.",
    rating: 4.8,
  },
  {
    id: "2",
    title: "CAP Implementierung",
    description:
      "Entwicklung einer Cloud Application mit dem SAP Cloud Application Programming Model (CAP) für moderne, skalierbare und erweiterbare Geschäftsanwendungen.",
    price: 9800,
    duration: "15 Tage",
    category: "Entwicklung",
    technologies: ["CAP", "Node.js", "HANA Cloud", "SAP UI5", "OData", "Express.js", "MTA"],
    image: "/images/cap-implementation.png",
    phase: 2,
    included: [
      "Anforderungsanalyse und Konzeption",
      "Entwicklung des Datenmodells",
      "Implementierung der Geschäftslogik",
      "Entwicklung der Benutzeroberfläche",
      "Deployment in der SAP BTP",
      "Dokumentation und Wissenstransfer",
    ],
    notIncluded: [
      "Lizenzkosten für SAP BTP-Services",
      "Langfristige Wartung und Support",
      "Migration bestehender Daten",
      "Schulung der Endanwender",
    ],
    dependencies: [
      "SAP BTP-Konto mit entsprechenden Berechtigungen",
      "Zugang zu bestehenden Datenquellen",
      "Definierte fachliche Anforderungen",
    ],
    process: [
      {
        title: "Anforderungsanalyse",
        description:
          "Detaillierte Analyse der fachlichen und technischen Anforderungen an die zu entwickelnde Anwendung.",
      },
      {
        title: "Konzeption & Design",
        description:
          "Erstellung des Datenmodells, Definition der Geschäftsprozesse und Entwurf der Benutzeroberfläche.",
      },
      {
        title: "Entwicklung Backend",
        description:
          "Implementierung des CAP-Modells, der Entitäten, Services und der Geschäftslogik mit Node.js.",
      },
      {
        title: "Entwicklung Frontend",
        description:
          "Entwicklung der Benutzeroberfläche mit SAP UI5 oder Fiori Elements basierend auf den OData-Services.",
      },
      {
        title: "Testing & Optimierung",
        description:
          "Umfassende Tests der Anwendung, Optimierung der Performance und Behebung von Fehlern.",
      },
      {
        title: "Deployment & Dokumentation",
        description:
          "Deployment der Anwendung in der SAP BTP und Erstellung einer umfassenden Dokumentation.",
      },
    ],
    prerequisites:
      "Für die erfolgreiche Implementierung benötigen wir ein SAP BTP-Konto mit den entsprechenden Berechtigungen sowie klar definierte fachliche Anforderungen an die zu entwickelnde Anwendung.",
    outcomes:
      "Nach Abschluss des Projekts erhalten Sie eine vollständig funktionsfähige, moderne Cloud-Anwendung, die auf dem SAP Cloud Application Programming Model basiert und optimal in Ihre SAP-Landschaft integriert ist.",
    rating: 4.9,
  },
  {
    id: "3",
    title: "Integration Suite Setup",
    description:
      "Einrichtung und Konfiguration der SAP Integration Suite für nahtlose Integrationsszenarien zwischen SAP- und Nicht-SAP-Systemen in Ihrer Unternehmenslandschaft.",
    price: 6500,
    duration: "10 Tage",
    category: "Integration",
    technologies: [
      "Integration Suite",
      "CPI",
      "API Management",
      "Open Connectors",
      "Integration Advisor",
      "REST",
      "SOAP",
    ],
    image: "/images/integration-suite.png",
    phase: 2,
    included: [
      "Analyse der Integrationsanforderungen",
      "Einrichtung der Integration Suite",
      "Konfiguration der benötigten Integrationsszenarien",
      "Entwicklung von bis zu 3 Integrationsflows",
      "Dokumentation und Wissenstransfer",
    ],
    notIncluded: [
      "Lizenzkosten für SAP BTP-Services",
      "Entwicklung komplexer Mappings",
      "Anpassung von Quellsystemen",
      "Langfristige Wartung und Support",
    ],
    dependencies: [
      "SAP BTP-Konto mit Integration Suite-Berechtigungen",
      "Zugang zu den zu integrierenden Systemen",
      "Dokumentation der Schnittstellen",
    ],
    process: [
      {
        title: "Anforderungsanalyse",
        description:
          "Analyse der Integrationsanforderungen und Identifikation der zu integrierenden Systeme und Prozesse.",
      },
      {
        title: "Architekturdesign",
        description:
          "Entwicklung einer Integrationsarchitektur basierend auf den Anforderungen und Best Practices.",
      },
      {
        title: "Installation & Konfiguration",
        description:
          "Einrichtung und Konfiguration der SAP Integration Suite in Ihrer BTP-Umgebung.",
      },
      {
        title: "Entwicklung der Integrationsflows",
        description:
          "Implementierung der definierten Integrationsszenarien mit Cloud Integration (CPI).",
      },
      {
        title: "API-Management Setup",
        description:
          "Konfiguration des API-Managements für die Verwaltung und Überwachung der APIs.",
      },
      {
        title: "Testing & Optimierung",
        description: "Umfassende Tests der Integrationsszenarien und Optimierung der Performance.",
      },
    ],
    prerequisites:
      "Für die erfolgreiche Einrichtung benötigen wir ein SAP BTP-Konto mit den entsprechenden Berechtigungen für die Integration Suite sowie Zugang zu den zu integrierenden Systemen.",
    outcomes:
      "Nach Abschluss des Projekts verfügen Sie über eine vollständig konfigurierte SAP Integration Suite mit funktionierenden Integrationsszenarien, die Ihre Geschäftsprozesse optimal unterstützen.",
    rating: 4.7,
  },
  {
    id: "4",
    title: "Fiori Development",
    description:
      "Entwicklung moderner und benutzerfreundlicher SAP Fiori Anwendungen für ein optimales Benutzererlebnis auf allen Endgeräten.",
    price: 7200,
    duration: "12 Tage",
    category: "Entwicklung",
    technologies: [
      "Fiori",
      "SAPUI5",
      "OData",
      "CAP",
      "JavaScript",
      "XML",
      "Fiori Elements",
      "Fiori Launchpad",
    ],
    image: "/images/fiori-development.png",
    phase: 3,
    included: [
      "Anforderungsanalyse und UX-Design",
      "Entwicklung der Fiori-Anwendung",
      "Integration mit Backend-Systemen",
      "Deployment in der Fiori Launchpad",
      "Dokumentation und Wissenstransfer",
    ],
    notIncluded: [
      "Lizenzkosten für SAP BTP-Services",
      "Entwicklung von Backend-Services",
      "Anpassung bestehender SAP-Systeme",
      "Schulung der Endanwender",
    ],
    dependencies: [
      "SAP BTP-Konto oder S/4HANA-System",
      "Zugang zu OData-Services",
      "UX-Design-Vorgaben",
    ],
    process: [
      {
        title: "Anforderungsanalyse",
        description:
          "Analyse der fachlichen und UX-Anforderungen an die zu entwickelnde Fiori-Anwendung.",
      },
      {
        title: "UX-Design",
        description:
          "Erstellung von Wireframes und Mockups für die Benutzeroberfläche gemäß den Fiori-Design-Richtlinien.",
      },
      {
        title: "Technisches Konzept",
        description:
          "Entwicklung des technischen Konzepts und Auswahl des passenden Fiori-Entwicklungsansatzes (Freestyle oder Elements).",
      },
      {
        title: "Entwicklung",
        description:
          "Implementierung der Fiori-Anwendung mit SAPUI5 und Integration mit den Backend-Services.",
      },
      {
        title: "Testing & Optimierung",
        description:
          "Umfassende Tests der Anwendung auf verschiedenen Endgeräten und Optimierung der Performance.",
      },
      {
        title: "Deployment & Dokumentation",
        description:
          "Deployment der Anwendung in der Fiori Launchpad und Erstellung einer umfassenden Dokumentation.",
      },
    ],
    prerequisites:
      "Für die erfolgreiche Entwicklung benötigen wir Zugang zu den relevanten Backend-Systemen und OData-Services sowie klar definierte fachliche und UX-Anforderungen.",
    outcomes:
      "Nach Abschluss des Projekts erhalten Sie eine moderne, benutzerfreundliche Fiori-Anwendung, die optimal in Ihre SAP-Landschaft integriert ist und ein hervorragendes Benutzererlebnis bietet.",
    rating: 4.8,
  },
  {
    id: "5",
    title: "BTP Security Konzept",
    description:
      "Entwicklung eines umfassenden Sicherheitskonzepts für Ihre SAP BTP-Landschaft, das alle Aspekte der Sicherheit von der Authentifizierung bis zur Datenverschlüsselung abdeckt.",
    price: 5500,
    duration: "8 Tage",
    category: "Sicherheit",
    technologies: [
      "Identity Authentication",
      "Authorization",
      "Destination Service",
      "Connectivity",
      "OAuth",
      "SAML",
      "Principal Propagation",
    ],
    image: "/images/btp-security.png",
    phase: 1,
    included: [
      "Analyse der bestehenden Sicherheitsmaßnahmen",
      "Identifikation von Sicherheitslücken",
      "Entwicklung eines ganzheitlichen Sicherheitskonzepts",
      "Empfehlungen für Identity & Access Management",
      "Dokumentation und Handlungsempfehlungen",
    ],
    notIncluded: [
      "Implementierung der empfohlenen Sicherheitsmaßnahmen",
      "Penetrationstests und Sicherheitsaudits",
      "Schulung der Mitarbeiter",
      "Lizenzkosten für Sicherheitstools",
    ],
    dependencies: [
      "Zugang zu bestehenden SAP BTP-Systemen",
      "Dokumentation der aktuellen Sicherheitsmaßnahmen",
      "Informationen zu Compliance-Anforderungen",
    ],
    process: [
      {
        title: "Ist-Analyse",
        description:
          "Analyse der bestehenden Sicherheitsmaßnahmen und Identifikation von Schwachstellen in der BTP-Landschaft.",
      },
      {
        title: "Anforderungserhebung",
        description:
          "Erhebung der Sicherheitsanforderungen unter Berücksichtigung von Compliance-Vorgaben und Branchenstandards.",
      },
      {
        title: "Konzeptentwicklung",
        description:
          "Entwicklung eines ganzheitlichen Sicherheitskonzepts für die SAP BTP-Landschaft.",
      },
      {
        title: "Identity & Access Management",
        description:
          "Erarbeitung von Empfehlungen für das Identity & Access Management, einschließlich Authentifizierung und Autorisierung.",
      },
      {
        title: "Datensicherheit",
        description:
          "Konzeption von Maßnahmen zur Datensicherheit, einschließlich Verschlüsselung und Datenschutz.",
      },
      {
        title: "Dokumentation & Präsentation",
        description:
          "Erstellung einer umfassenden Dokumentation und Präsentation der Ergebnisse vor Entscheidungsträgern.",
      },
    ],
    prerequisites:
      "Für ein optimales Ergebnis benötigen wir Zugang zu Ihrer bestehenden BTP-Landschaft sowie Informationen zu Ihren Compliance-Anforderungen und aktuellen Sicherheitsmaßnahmen.",
    outcomes:
      "Nach Abschluss des Projekts erhalten Sie ein umfassendes Sicherheitskonzept für Ihre SAP BTP-Landschaft, das alle relevanten Sicherheitsaspekte abdeckt und konkrete Handlungsempfehlungen enthält.",
    rating: 4.9,
  },
  {
    id: "6",
    title: "BTP Monitoring Setup",
    description:
      "Einrichtung eines umfassenden Monitoring-Systems für Ihre SAP BTP-Anwendungen zur proaktiven Überwachung, Fehlererkennung und Optimierung der Performance.",
    price: 3800,
    duration: "6 Tage",
    category: "Operations",
    technologies: [
      "DevOps",
      "Alert Notification",
      "Dynatrace",
      "Prometheus",
      "Grafana",
      "Logging Service",
      "Application Insights",
    ],
    image: "/images/btp-monitoring.png",
    phase: 4,
    included: [
      "Analyse der Monitoring-Anforderungen",
      "Einrichtung der Monitoring-Tools",
      "Konfiguration von Dashboards und Alerts",
      "Integration mit bestehenden Systemen",
      "Dokumentation und Wissenstransfer",
    ],
    notIncluded: [
      "Lizenzkosten für Monitoring-Tools",
      "Langfristige Wartung und Support",
      "Anpassung von Anwendungen für besseres Monitoring",
      "24/7-Überwachung durch unser Team",
    ],
    dependencies: [
      "SAP BTP-Konto mit entsprechenden Berechtigungen",
      "Zugang zu den zu überwachenden Anwendungen",
      "Informationen zu kritischen KPIs",
    ],
    process: [
      {
        title: "Anforderungsanalyse",
        description:
          "Analyse der Monitoring-Anforderungen und Identifikation der zu überwachenden Systeme und KPIs.",
      },
      {
        title: "Tool-Auswahl",
        description:
          "Auswahl der geeigneten Monitoring-Tools basierend auf den Anforderungen und der bestehenden Infrastruktur.",
      },
      {
        title: "Installation & Konfiguration",
        description:
          "Einrichtung und Konfiguration der ausgewählten Monitoring-Tools in Ihrer BTP-Umgebung.",
      },
      {
        title: "Dashboard-Erstellung",
        description:
          "Entwicklung von benutzerfreundlichen Dashboards zur Visualisierung der wichtigsten Metriken.",
      },
      {
        title: "Alert-Konfiguration",
        description:
          "Einrichtung von Alerts und Benachrichtigungen für kritische Ereignisse und Schwellenwerte.",
      },
      {
        title: "Dokumentation & Schulung",
        description:
          "Erstellung einer umfassenden Dokumentation und Schulung Ihres Teams in der Nutzung der Monitoring-Tools.",
      },
    ],
    prerequisites:
      "Für die erfolgreiche Einrichtung benötigen wir Zugang zu Ihrer BTP-Umgebung und den zu überwachenden Anwendungen sowie Informationen zu den kritischen KPIs und Schwellenwerten.",
    outcomes:
      "Nach Abschluss des Projekts verfügen Sie über ein umfassendes Monitoring-System für Ihre SAP BTP-Anwendungen, das eine proaktive Überwachung ermöglicht und frühzeitig auf potenzielle Probleme hinweist.",
    rating: 4.6,
  },
];

// Standarddaten für Workshops
export const defaultWorkshops = [
  {
    id: "1",
    title: "Discovery Workshop",
    description:
      "Gemeinsame Analyse Ihrer Anforderungen und Identifikation von Optimierungspotentialen für Ihre SAP-Landschaft.",
    duration: "1 Tag",
    price: 2500,
    icon: "Users",
  },
  {
    id: "2",
    title: "Solution Design Workshop",
    description:
      "Entwicklung einer maßgeschneiderten BTP-Lösung mit Architekturdesign und Technologieauswahl.",
    duration: "2 Tage",
    price: 4800,
    icon: "Lightbulb",
  },
  {
    id: "3",
    title: "Roadmap Workshop",
    description:
      "Erstellung einer strategischen Roadmap für Ihre BTP-Implementierung mit Meilensteinen und Ressourcenplanung.",
    duration: "1 Tag",
    price: 2800,
    icon: "Calendar",
  },
];

// Standarddaten für Knowledge Hub Content
export const defaultKnowledgeHubContent = [
  {
    id: "1",
    type: "template",
    title: "SAP CAP Starter Template",
    subtitle:
      "Ein vollständiges Starter-Projekt für SAP CAP mit Authentifizierung und Basismodellen.",
    description:
      "Ein vollständiges Starter-Projekt für SAP CAP mit Authentifizierung und Basismodellen.",
    image: "/images/cap-template.png",
    category: "development",
    downloads: 21, // Initial download count - will be updated by the download counter
    featured: false,
    tags: ["SAP CAP", "Node.js", "HANA"],
    downloadUrl: "/downloads/cap-starter-template.zip", // Path to the downloadable file
    externalUrl: "",
  },
  {
    id: "2",
    type: "template",
    title: "Fiori Elements Template",
    subtitle: "Vorkonfigurierte Fiori Elements App mit List-to-Detail Pattern und Annotationen.",
    description: "Vorkonfigurierte Fiori Elements App mit List-to-Detail Pattern und Annotationen.",
    image: "/images/fiori-template.png",
    category: "development",
    downloads: 15,
    featured: false,
    tags: ["Fiori", "OData", "UI5"],
    downloadUrl: "",
    externalUrl: "",
  },
  {
    id: "3",
    type: "template",
    title: "BTP Architektur-Blueprint",
    subtitle: "Referenzarchitektur für eine moderne SAP BTP-Landschaft mit Best Practices.",
    description: "Referenzarchitektur für eine moderne SAP BTP-Landschaft mit Best Practices.",
    image: "/images/architecture-template.png",
    category: "architecture",
    downloads: 13,
    featured: false,
    tags: ["Architektur", "BTP", "Best Practice"],
    downloadUrl: "",
    externalUrl: "",
  },
  {
    id: "4",
    type: "template",
    title: "Integration Suite Setup",
    subtitle: "Vorkonfigurierte Integration Suite mit typischen Integrationsszenarien.",
    description: "Vorkonfigurierte Integration Suite mit typischen Integrationsszenarien.",
    image: "/images/integration-template.png",
    category: "integration",
    downloads: 11,
    featured: false,
    tags: ["Integration", "API", "Event Mesh"],
    downloadUrl: "",
    externalUrl: "",
  },
  {
    id: "5",
    type: "best-practice",
    title: "BTP Kostenoptimierung",
    subtitle: "Strategien zur Optimierung der BTP-Kosten und effizienten Ressourcennutzung.",
    description: "Strategien zur Optimierung der BTP-Kosten und effizienten Ressourcennutzung.",
    image: "/images/cost-optimization.png",
    category: "management",
    downloads: 12,
    featured: false,
    tags: ["Kosten", "Optimierung", "Cloud"],
    downloadUrl: "",
    externalUrl: "",
  },
  {
    id: "6",
    type: "best-practice",
    title: "Multi-Tenant Architektur",
    subtitle: "Best Practices für die Entwicklung mandantenfähiger BTP-Anwendungen.",
    description: "Best Practices für die Entwicklung mandantenfähiger BTP-Anwendungen.",
    image: "/images/multi-tenant.png",
    category: "architecture",
    downloads: 20,
    featured: false,
    tags: ["Multi-Tenant", "SaaS", "Architektur"],
    downloadUrl: "",
    externalUrl: "",
  },
  {
    id: "7",
    type: "best-practice",
    title: "BTP Security Guidelines",
    subtitle: "Umfassende Sicherheitsrichtlinien für SAP BTP-Anwendungen.",
    description: "Umfassende Sicherheitsrichtlinien für SAP BTP-Anwendungen.",
    image: "/images/security-guidelines.png",
    category: "security",
    downloads: 26,
    featured: false,
    tags: ["Sicherheit", "Compliance", "Governance"],
    downloadUrl: "",
    externalUrl: "",
  },
];

// Standarddaten für Ressourcen
export const defaultResources = [
  {
    id: "1",
    title: "SAP BTP: Der Weg zur intelligenten Unternehmung",
    type: "whitepaper",
    category: "Whitepaper",
  },
  {
    id: "2",
    title: "Integration von SAP S/4HANA mit der BTP",
    type: "whitepaper",
    category: "Whitepaper",
  },
  {
    id: "3",
    title: "Cloud-native Entwicklung mit SAP CAP",
    type: "whitepaper",
    category: "Whitepaper",
  },
  {
    id: "4",
    title: "BTP Architektur-Templates",
    type: "template",
    category: "Toolkits",
  },
  {
    id: "5",
    title: "SAP CAP Starter-Kit",
    type: "template",
    category: "Toolkits",
  },
  {
    id: "6",
    title: "Fiori Design-Vorlagen",
    type: "template",
    category: "Toolkits",
  },
];

// Exportiere die Landingpage-Daten zusammen mit den anderen Standarddaten
export { defaultLandingPage };

// Exportiere alle Standarddaten als ein Objekt
export const defaultData = {
  services: defaultServices,
  workshops: defaultWorkshops,
  knowledgeHubContent: defaultKnowledgeHubContent,
  resources: defaultResources,
  landingPage: defaultLandingPage,
  mailConfig: mailConfigJson,
};
