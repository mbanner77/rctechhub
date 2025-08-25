import type { ArchitectureTemplate } from "@/types/btp-service"

export const architectureTemplates: ArchitectureTemplate[] = [
  {
    id: "hybrid-integration",
    name: "Hybride Integrationsarchitektur",
    description: "Verbinden Sie On-Premise-Systeme nahtlos mit Cloud-Anwendungen für eine optimale Datenintegration.",
    category: "Integration",
    services: ["sap-integration-suite", "sap-cloud-connector", "sap-event-mesh"],
    useCases: [
      "Integration von SAP ERP mit Cloud-Anwendungen",
      "Echtzeit-Datensynchronisation",
      "API-basierte Integration",
      "Event-gesteuerte Architektur",
    ],
    benefits: [
      "Nahtlose Integration zwischen On-Premise und Cloud",
      "Reduzierte Komplexität durch standardisierte Schnittstellen",
      "Verbesserte Datenkonsistenz",
      "Erhöhte Agilität durch lose Kopplung",
    ],
    diagram: "/sap-integration-suite-architecture.png",
    implementationSteps: [
      {
        phase: "Vorbereitung",
        tasks: [
          "SAP BTP-Konto einrichten",
          "Integration Suite abonnieren",
          "Cloud Connector installieren und konfigurieren",
          "Sicherheitseinstellungen konfigurieren",
        ],
      },
      {
        phase: "Entwicklung",
        tasks: [
          "Integrationsszenarien definieren",
          "Integration Flows erstellen",
          "API-Proxies entwickeln",
          "Event-Mesh-Konfiguration",
        ],
      },
      {
        phase: "Tests",
        tasks: [
          "Verbindungstests durchführen",
          "End-to-End-Tests der Integrationsszenarien",
          "Leistungstests",
          "Fehlerbehandlung testen",
        ],
      },
      {
        phase: "Deployment",
        tasks: [
          "Integration Flows deployen",
          "API-Proxies veröffentlichen",
          "Monitoring einrichten",
          "Dokumentation erstellen",
        ],
      },
    ],
    resources: [
      {
        type: "Dokumentation",
        items: [
          {
            name: "Integration Suite-Dokumentation",
            url: "https://help.sap.com/docs/INTEGRATION_SUITE",
          },
          {
            name: "Cloud Connector-Dokumentation",
            url: "https://help.sap.com/docs/CP_CONNECTIVITY/cca91383641e40ffbe03bdc78f00f681/e6c7616abb5710148cfcf3e75d96d596.html",
          },
          {
            name: "Event Mesh-Dokumentation",
            url: "https://help.sap.com/docs/SAP_EM",
          },
        ],
      },
      {
        type: "Code-Beispiele",
        items: [
          {
            name: "Integration Flow-Beispiele",
            url: "https://github.com/SAP-samples/cloud-integration-samples",
          },
          {
            name: "API Management-Beispiele",
            url: "https://github.com/SAP-samples/cloud-api-management-samples",
          },
          {
            name: "Event Mesh-Beispiele",
            url: "https://github.com/SAP-samples/cloud-messaging-samples",
          },
        ],
      },
    ],
    technicalDetails: {
      complexity: "Mittel",
      implementationTime: "4-6 Wochen",
      requiredSkills: ["Integration-Kenntnisse", "API-Design", "Event-basierte Architektur", "SAP-Systeme"],
    },
  },
  {
    id: "data-driven-apps",
    name: "Datengetriebene Anwendungen",
    description: "Erstellen Sie leistungsstarke datengetriebene Anwendungen mit SAP BTP-Datendiensten.",
    category: "Data & Analytics",
    services: ["sap-hana-cloud", "sap-datasphere", "sap-analytics-cloud"],
    useCases: ["Echtzeit-Datenanalyse", "Predictive Analytics", "Datenvisualisierung", "Business Intelligence"],
    benefits: [
      "Hochleistungsdatenverarbeitung",
      "Integrierte Analysefunktionen",
      "Skalierbarkeit für große Datenmengen",
      "Einfache Integration mit SAP-Systemen",
    ],
    diagram: "/ai-ml-analytics-architecture.png",
    implementationSteps: [
      {
        phase: "Vorbereitung",
        tasks: [
          "SAP BTP-Konto einrichten",
          "HANA Cloud und Datasphere abonnieren",
          "Datenquellen identifizieren",
          "Datenmodell entwerfen",
        ],
      },
      {
        phase: "Datenmodellierung",
        tasks: [
          "Datenmodell in HANA Cloud implementieren",
          "Datenintegrationspipelines erstellen",
          "Datenqualitätsprüfungen implementieren",
          "Semantische Schicht definieren",
        ],
      },
      {
        phase: "Anwendungsentwicklung",
        tasks: [
          "Anwendungsarchitektur definieren",
          "Backend-Services implementieren",
          "Frontend-Anwendung entwickeln",
          "Analytische Funktionen integrieren",
        ],
      },
      {
        phase: "Deployment",
        tasks: [
          "Datenmodell und Anwendung deployen",
          "Berechtigungen konfigurieren",
          "Monitoring einrichten",
          "Leistungsoptimierung durchführen",
        ],
      },
    ],
    resources: [
      {
        type: "Dokumentation",
        items: [
          {
            name: "HANA Cloud-Dokumentation",
            url: "https://help.sap.com/docs/HANA_CLOUD",
          },
          {
            name: "Datasphere-Dokumentation",
            url: "https://help.sap.com/docs/SAP_DATASPHERE",
          },
          {
            name: "Analytics Cloud-Dokumentation",
            url: "https://help.sap.com/docs/SAP_ANALYTICS_CLOUD",
          },
        ],
      },
      {
        type: "Code-Beispiele",
        items: [
          {
            name: "HANA Cloud-Beispiele",
            url: "https://github.com/SAP-samples/hana-cloud-samples",
          },
          {
            name: "Datasphere-Beispiele",
            url: "https://github.com/SAP-samples/datasphere-samples",
          },
          {
            name: "Analytics Cloud-Beispiele",
            url: "https://github.com/SAP-samples/analytics-cloud-samples",
          },
        ],
      },
    ],
    technicalDetails: {
      complexity: "Hoch",
      implementationTime: "8-12 Wochen",
      requiredSkills: ["SQL", "Datenmodellierung", "Analytik", "Frontend-Entwicklung"],
    },
  },
  {
    id: "intelligent-process-automation",
    name: "Intelligente Prozessautomatisierung",
    description: "Automatisieren Sie Geschäftsprozesse mit KI-gestützten Workflows und Entscheidungsfindung.",
    category: "Intelligent Technologies",
    services: ["sap-build-process-automation", "sap-workflow-management", "sap-business-rules", "sap-ai-core"],
    useCases: [
      "Automatisierung von Genehmigungsprozessen",
      "Intelligente Dokumentenverarbeitung",
      "Regelbasierte Entscheidungsfindung",
      "End-to-End-Prozessautomatisierung",
    ],
    benefits: [
      "Reduzierte manuelle Eingriffe",
      "Beschleunigte Prozessabwicklung",
      "Verbesserte Entscheidungsqualität",
      "Erhöhte Prozesseffizienz",
    ],
    diagram: "/process-automation-architecture.png",
    implementationSteps: [
      {
        phase: "Vorbereitung",
        tasks: [
          "SAP BTP-Konto einrichten",
          "Process Automation und Workflow Management abonnieren",
          "Geschäftsprozesse analysieren",
          "Automatisierungspotenzial identifizieren",
        ],
      },
      {
        phase: "Prozessdesign",
        tasks: [
          "Prozessmodelle erstellen",
          "Geschäftsregeln definieren",
          "Entscheidungstabellen entwickeln",
          "Benutzeraufgaben definieren",
        ],
      },
      {
        phase: "Entwicklung",
        tasks: [
          "Workflows implementieren",
          "Formulare erstellen",
          "Integrationen zu Backend-Systemen entwickeln",
          "KI-Modelle für Dokumentenverarbeitung trainieren",
        ],
      },
      {
        phase: "Deployment",
        tasks: [
          "Workflows und Regeln deployen",
          "Berechtigungen konfigurieren",
          "Monitoring einrichten",
          "Benutzer schulen",
        ],
      },
    ],
    resources: [
      {
        type: "Dokumentation",
        items: [
          {
            name: "Process Automation-Dokumentation",
            url: "https://help.sap.com/docs/PROCESS_AUTOMATION",
          },
          {
            name: "Workflow Management-Dokumentation",
            url: "https://help.sap.com/docs/WORKFLOW_MANAGEMENT",
          },
          {
            name: "Business Rules-Dokumentation",
            url: "https://help.sap.com/docs/BUSINESS_RULES",
          },
        ],
      },
      {
        type: "Code-Beispiele",
        items: [
          {
            name: "Process Automation-Beispiele",
            url: "https://github.com/SAP-samples/process-automation-samples",
          },
          {
            name: "Workflow Management-Beispiele",
            url: "https://github.com/SAP-samples/cloud-workflow-samples",
          },
          {
            name: "Business Rules-Beispiele",
            url: "https://github.com/SAP-samples/cloud-businessrules-samples",
          },
        ],
      },
    ],
    technicalDetails: {
      complexity: "Mittel",
      implementationTime: "6-10 Wochen",
      requiredSkills: ["Prozessmodellierung", "Geschäftsregeln", "Formulardesign", "Integration"],
    },
  },
  {
    id: "mobile-first",
    name: "Mobile-First Anwendungen",
    description: "Entwickeln Sie mobile Anwendungen mit Offline-Funktionalität und nahtloser Backend-Integration.",
    category: "Mobile",
    services: ["sap-mobile-services", "sap-cloud-application-programming-model", "sap-hana-cloud"],
    useCases: [
      "Außendienstanwendungen",
      "Lager- und Logistikanwendungen",
      "Genehmigungsprozesse unterwegs",
      "Kundenservice-Anwendungen",
    ],
    benefits: [
      "Offline-Funktionalität",
      "Konsistente Benutzererfahrung",
      "Sichere Datensynchronisation",
      "Nahtlose Integration mit SAP-Backend",
    ],
    diagram: "/mobile-offline-architecture.png",
    implementationSteps: [
      {
        phase: "Vorbereitung",
        tasks: [
          "SAP BTP-Konto einrichten",
          "Mobile Services abonnieren",
          "Anwendungsfälle definieren",
          "Offline-Anforderungen analysieren",
        ],
      },
      {
        phase: "Backend-Entwicklung",
        tasks: [
          "CAP-Projekt erstellen",
          "Datenmodell definieren",
          "OData-Services implementieren",
          "Geschäftslogik entwickeln",
        ],
      },
      {
        phase: "Mobile-Entwicklung",
        tasks: [
          "Mobile Development Kit-Projekt erstellen",
          "UI-Komponenten entwickeln",
          "Offline-Synchronisation implementieren",
          "Authentifizierung integrieren",
        ],
      },
      {
        phase: "Deployment",
        tasks: [
          "Backend-Services deployen",
          "Mobile App in App Stores veröffentlichen",
          "Monitoring einrichten",
          "Benutzer schulen",
        ],
      },
    ],
    resources: [
      {
        type: "Dokumentation",
        items: [
          {
            name: "Mobile Services-Dokumentation",
            url: "https://help.sap.com/docs/SAP_MOBILE_SERVICES",
          },
          {
            name: "CAP-Dokumentation",
            url: "https://cap.cloud.sap/docs/",
          },
          {
            name: "Mobile Development Kit-Dokumentation",
            url: "https://help.sap.com/docs/SAP_MOBILE_SERVICES/977416d43cd74bdc958289038749100e/a8e4c66e4a7e4d7e9ee2647d9ba8d893.html",
          },
        ],
      },
      {
        type: "Code-Beispiele",
        items: [
          {
            name: "Mobile Development Kit-Beispiele",
            url: "https://github.com/SAP-samples/cloud-mdk-samples",
          },
          {
            name: "CAP-Beispiele",
            url: "https://github.com/SAP-samples/cloud-cap-samples",
          },
          {
            name: "Mobile Services-Beispiele",
            url: "https://github.com/SAP-samples/cloud-mobile-samples",
          },
        ],
      },
    ],
    technicalDetails: {
      complexity: "Mittel",
      implementationTime: "6-8 Wochen",
      requiredSkills: ["JavaScript/TypeScript", "Mobile Development", "OData", "CAP"],
    },
  },
  {
    id: "multi-experience",
    name: "Multi-Experience Plattform",
    description: "Erstellen Sie konsistente Benutzererfahrungen über verschiedene Kanäle und Geräte hinweg.",
    category: "User Experience",
    services: ["sap-build-work-zone", "sap-mobile-services", "sap-launchpad-service", "sap-fiori-tools"],
    useCases: [
      "Einheitliche Benutzeroberfläche",
      "Omnichannel-Erfahrung",
      "Personalisierte Benutzeroberflächen",
      "Self-Service-Portale",
    ],
    benefits: [
      "Konsistente Benutzererfahrung",
      "Reduzierte Entwicklungszeit",
      "Verbesserte Benutzerakzeptanz",
      "Erhöhte Produktivität",
    ],
    diagram: "/multi-experience-architecture.png",
    implementationSteps: [
      {
        phase: "Vorbereitung",
        tasks: [
          "SAP BTP-Konto einrichten",
          "Build Work Zone und Launchpad Service abonnieren",
          "Benutzeranforderungen analysieren",
          "UX-Strategie definieren",
        ],
      },
      {
        phase: "Design",
        tasks: [
          "Benutzerinterfaces entwerfen",
          "Navigationskonzept entwickeln",
          "Designsystem erstellen",
          "Prototypen entwickeln",
        ],
      },
      {
        phase: "Entwicklung",
        tasks: [
          "Fiori-Anwendungen entwickeln",
          "Mobile-Anwendungen erstellen",
          "Launchpad konfigurieren",
          "Integrationen implementieren",
        ],
      },
      {
        phase: "Deployment",
        tasks: ["Anwendungen deployen", "Work Zone konfigurieren", "Berechtigungen einrichten", "Benutzer schulen"],
      },
    ],
    resources: [
      {
        type: "Dokumentation",
        items: [
          {
            name: "Build Work Zone-Dokumentation",
            url: "https://help.sap.com/docs/build-work-zone-standard-edition",
          },
          {
            name: "Launchpad Service-Dokumentation",
            url: "https://help.sap.com/docs/Launchpad_Service",
          },
          {
            name: "Fiori-Dokumentation",
            url: "https://experience.sap.com/fiori-design-web/",
          },
        ],
      },
      {
        type: "Code-Beispiele",
        items: [
          {
            name: "Fiori-Beispiele",
            url: "https://github.com/SAP-samples/fiori-elements-samples",
          },
          {
            name: "Work Zone-Beispiele",
            url: "https://github.com/SAP-samples/workzone-samples",
          },
          {
            name: "Launchpad-Beispiele",
            url: "https://github.com/SAP-samples/launchpad-service-samples",
          },
        ],
      },
    ],
    technicalDetails: {
      complexity: "Mittel",
      implementationTime: "8-12 Wochen",
      requiredSkills: ["UI5/Fiori", "HTML/CSS", "JavaScript", "UX-Design"],
    },
  },
  {
    id: "secure-devops",
    name: "Sichere DevOps-Plattform",
    description: "Implementieren Sie sichere DevOps-Praktiken für die kontinuierliche Bereitstellung von Anwendungen.",
    category: "DevOps",
    services: [
      "sap-continuous-integration-delivery",
      "sap-cloud-transport-management",
      "sap-cloud-identity-services",
      "sap-cloud-logging",
    ],
    useCases: [
      "Kontinuierliche Integration und Bereitstellung",
      "Automatisierte Tests",
      "Sicherheitsüberprüfungen",
      "Compliance-Überwachung",
    ],
    benefits: [
      "Beschleunigte Markteinführung",
      "Verbesserte Codequalität",
      "Erhöhte Sicherheit",
      "Reduzierte Fehler in der Produktion",
    ],
    diagram: "/devops-cicd-architecture.png",
    implementationSteps: [
      {
        phase: "Vorbereitung",
        tasks: [
          "SAP BTP-Konto einrichten",
          "CI/CD und Transport Management abonnieren",
          "DevOps-Strategie definieren",
          "Toolchain auswählen",
        ],
      },
      {
        phase: "Einrichtung",
        tasks: [
          "CI/CD-Pipelines konfigurieren",
          "Quellcodeverwaltung einrichten",
          "Automatisierte Tests implementieren",
          "Sicherheitsscans integrieren",
        ],
      },
      {
        phase: "Implementierung",
        tasks: [
          "Deployment-Prozesse automatisieren",
          "Transport-Routen konfigurieren",
          "Monitoring und Logging einrichten",
          "Feedback-Schleifen implementieren",
        ],
      },
      {
        phase: "Optimierung",
        tasks: [
          "Metriken erfassen und analysieren",
          "Prozesse optimieren",
          "Sicherheitsmaßnahmen verbessern",
          "Teams schulen",
        ],
      },
    ],
    resources: [
      {
        type: "Dokumentation",
        items: [
          {
            name: "CI/CD-Dokumentation",
            url: "https://help.sap.com/docs/CONTINUOUS_DELIVERY",
          },
          {
            name: "Transport Management-Dokumentation",
            url: "https://help.sap.com/docs/TRANSPORT_MANAGEMENT_SERVICE",
          },
          {
            name: "Cloud Identity Services-Dokumentation",
            url: "https://help.sap.com/docs/IDENTITY_AUTHENTICATION",
          },
        ],
      },
      {
        type: "Code-Beispiele",
        items: [
          {
            name: "CI/CD-Beispiele",
            url: "https://github.com/SAP-samples/cloud-cicd-samples",
          },
          {
            name: "Transport Management-Beispiele",
            url: "https://github.com/SAP-samples/cloud-transport-management-samples",
          },
          {
            name: "Security-Beispiele",
            url: "https://github.com/SAP-samples/cloud-security-samples",
          },
        ],
      },
    ],
    technicalDetails: {
      complexity: "Hoch",
      implementationTime: "8-12 Wochen",
      requiredSkills: ["DevOps", "CI/CD", "Automatisierung", "Sicherheit"],
    },
  },
  {
    id: "cap-fiori-hana",
    name: "CAP + Fiori + HANA Cloud",
    description:
      "Eine vollständige Geschäftsanwendung mit dem SAP Cloud Application Programming Model, SAP Fiori Elements und SAP HANA Cloud",
    category: "Application Development",
    services: [
      "sap-cloud-application-programming-model",
      "sap-business-application-studio",
      "sap-hana-cloud",
      "sap-destination-service",
      "sap-cloud-identity-services",
    ],
    useCases: [
      "Entwicklung von Geschäftsanwendungen",
      "Erweiterung von SAP-Lösungen",
      "Datenintensive Anwendungen",
      "Self-Service-Anwendungen",
      "Workflow-basierte Anwendungen",
    ],
    benefits: [
      "Schnelle Entwicklung durch deklarative Ansätze",
      "Konsistente Benutzeroberfläche mit SAP Fiori",
      "Hochleistungsdatenverarbeitung mit HANA Cloud",
      "Einfache Integration mit SAP-Systemen",
      "Skalierbarkeit und Flexibilität",
    ],
    diagram: "/cap-fiori-hana-architecture.png",
    implementationSteps: [
      {
        phase: "Vorbereitung",
        tasks: ["SAP BTP-Konto einrichten", "Erforderliche Services abonnieren", "Entwicklungsumgebung einrichten"],
      },
      {
        phase: "Entwicklung",
        tasks: [
          "Datenmodell definieren",
          "Services implementieren",
          "Fiori-Anwendung erstellen",
          "Geschäftslogik implementieren",
        ],
      },
      {
        phase: "Integration",
        tasks: [
          "Verbindungen zu SAP-Systemen konfigurieren",
          "Authentifizierung und Autorisierung einrichten",
          "API-Management konfigurieren",
        ],
      },
      {
        phase: "Deployment",
        tasks: ["Build erstellen", "Anwendung deployen", "Berechtigungen konfigurieren", "Monitoring einrichten"],
      },
    ],
    resources: [
      {
        type: "Dokumentation",
        items: [
          {
            name: "CAP-Dokumentation",
            url: "https://cap.cloud.sap/docs/",
          },
          {
            name: "Fiori-Dokumentation",
            url: "https://experience.sap.com/fiori-design-web/",
          },
          {
            name: "HANA Cloud-Dokumentation",
            url: "https://help.sap.com/docs/HANA_CLOUD",
          },
        ],
      },
      {
        type: "Code-Beispiele",
        items: [
          {
            name: "CAP-Beispielprojekt",
            url: "https://github.com/SAP-samples/cloud-cap-samples",
          },
          {
            name: "Fiori-Beispielanwendung",
            url: "https://github.com/SAP-samples/fiori-elements-samples",
          },
          {
            name: "HANA Cloud-Beispiele",
            url: "https://github.com/SAP-samples/hana-cloud-samples",
          },
        ],
      },
    ],
    technicalDetails: {
      complexity: "Mittel",
      implementationTime: "4-8 Wochen",
      requiredSkills: ["JavaScript/TypeScript", "CAP", "Fiori/UI5", "SQL"],
    },
  },
  {
    id: "integration-suite",
    name: "Integration Suite",
    description:
      "Eine umfassende Integrationsarchitektur mit SAP Integration Suite für die nahtlose Verbindung von SAP- und Nicht-SAP-Systemen",
    category: "Integration",
    services: [
      "sap-integration-suite",
      "sap-api-management",
      "sap-destination-service",
      "sap-connectivity-service",
      "sap-cloud-identity-services",
    ],
    useCases: [
      "End-to-End-Prozessintegration",
      "API-Ökosystem-Aufbau",
      "B2B-Integration",
      "Hybride Integrationsszenarien",
      "Ereignisgesteuerte Architekturen",
    ],
    benefits: [
      "Nahtlose Integration von Cloud- und On-Premise-Systemen",
      "Standardisierte API-Verwaltung",
      "Reduzierte Integrationskosten",
      "Erhöhte Agilität und Flexibilität",
      "Verbesserte Sicherheit und Governance",
    ],
    diagram: "/sap-integration-suite-architecture.png",
    implementationSteps: [
      {
        phase: "Vorbereitung",
        tasks: ["SAP BTP-Konto einrichten", "Integration Suite abonnieren", "Capabilities aktivieren"],
      },
      {
        phase: "Entwicklung",
        tasks: [
          "Integration Flows erstellen",
          "API-Proxies definieren",
          "Sicherheitsrichtlinien konfigurieren",
          "Verbindungen zu Quell- und Zielsystemen herstellen",
        ],
      },
      {
        phase: "Tests",
        tasks: [
          "Verbindungstests durchführen",
          "End-to-End-Tests der Integrationsszenarien",
          "Leistungstests",
          "Fehlerbehandlung testen",
        ],
      },
      {
        phase: "Deployment",
        tasks: ["Integration Flows deployen", "API-Proxies deployen", "Monitoring einrichten"],
      },
    ],
    resources: [
      {
        type: "Dokumentation",
        items: [
          {
            name: "Integration Suite-Dokumentation",
            url: "https://help.sap.com/docs/INTEGRATION_SUITE",
          },
          {
            name: "API Management-Dokumentation",
            url: "https://help.sap.com/docs/SAP_CLOUD_PLATFORM_API_MANAGEMENT",
          },
          {
            name: "Connectivity-Dokumentation",
            url: "https://help.sap.com/docs/CP_CONNECTIVITY",
          },
        ],
      },
      {
        type: "Code-Beispiele",
        items: [
          {
            name: "Integration Flow-Beispiele",
            url: "https://github.com/SAP-samples/cloud-integration-samples",
          },
          {
            name: "API Management-Beispiele",
            url: "https://github.com/SAP-samples/cloud-api-management-samples",
          },
          {
            name: "Connectivity-Beispiele",
            url: "https://github.com/SAP-samples/cloud-connectivity-samples",
          },
        ],
      },
    ],
    technicalDetails: {
      complexity: "Mittel",
      implementationTime: "6-10 Wochen",
      requiredSkills: ["Integration-Kenntnisse", "API-Design", "Sicherheit", "SAP-Systeme"],
    },
  },
]
