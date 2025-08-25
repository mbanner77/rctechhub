"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { btpServices } from "@/data/btp-services"
import type { IntegrationScenario } from "@/types/btp-service"
import { ArrowRight, ExternalLink, CheckCircle, Info, Server } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Vollständige Integrationsszenarien-Daten
const integrationScenarios: IntegrationScenario[] = [
  {
    id: "sap-s4hana-to-non-sap",
    name: "SAP S/4HANA mit Nicht-SAP-Systemen integrieren",
    description:
      "Ein Integrationsszenario für die nahtlose Verbindung von SAP S/4HANA mit Nicht-SAP-Systemen über die SAP Integration Suite.",
    primaryService: "sap-integration-suite",
    connectedServices: ["sap-destination-service", "sap-credential-store", "sap-cloud-identity-services"],
    diagram: "/images/integration-s4hana-non-sap.png",
    benefits: [
      "Nahtlose Datenintegration zwischen SAP und Nicht-SAP-Systemen",
      "Reduzierte Integrationskosten und -komplexität",
      "Verbesserte Datenqualität und -konsistenz",
      "Erhöhte Agilität und Flexibilität",
      "Vereinfachte Wartung und Überwachung",
    ],
    implementationSteps: [
      "SAP Integration Suite einrichten",
      "Verbindungen zu SAP S/4HANA und Nicht-SAP-Systemen konfigurieren",
      "Integrationsprozesse modellieren und implementieren",
      "Datenabbildungen und -transformationen definieren",
      "Tests und Bereitstellung durchführen",
    ],
    useCases: [
      "Integration von SAP S/4HANA mit Salesforce CRM",
      "Anbindung von SAP S/4HANA an Microsoft Azure Services",
      "Integration von SAP S/4HANA mit E-Commerce-Plattformen",
      "Verbindung von SAP S/4HANA mit IoT-Plattformen",
    ],
    challenges: [
      "Unterschiedliche Datenmodelle und -formate",
      "Sicherheitsanforderungen und Authentifizierung",
      "Leistung und Skalierbarkeit",
      "Fehlerbehandlung und Wiederherstellung",
    ],
    bestPractices: [
      "Verwenden Sie vordefinierte Integrationsvorlagen für häufige Szenarien",
      "Implementieren Sie eine robuste Fehlerbehandlung und Protokollierung",
      "Nutzen Sie die Mapping-Funktionen für komplexe Datentransformationen",
      "Verwenden Sie den API Management-Dienst für die Verwaltung externer APIs",
      "Implementieren Sie ein Monitoring für alle Integrationsflüsse",
    ],
  },
  {
    id: "event-driven-architecture",
    name: "Ereignisgesteuerte Architektur mit SAP BTP",
    description:
      "Ein Integrationsszenario für die Implementierung einer ereignisgesteuerten Architektur mit SAP BTP-Services.",
    primaryService: "sap-integration-suite",
    connectedServices: [
      "sap-workflow-management",
      "sap-build-process-automation",
      "sap-cloud-application-programming-model",
    ],
    diagram: "/images/integration-event-driven.png",
    benefits: [
      "Verbesserte Skalierbarkeit und Leistung",
      "Erhöhte Flexibilität und Agilität",
      "Reduzierte Kopplung zwischen Systemen",
      "Verbesserte Fehlertoleranz",
      "Echtzeit-Verarbeitung von Geschäftsereignissen",
    ],
    implementationSteps: [
      "Event Mesh in SAP Integration Suite einrichten",
      "Ereignisproduzenten und -konsumenten identifizieren",
      "Ereignisschemas und -kanäle definieren",
      "Ereignisverarbeitung implementieren",
      "Tests und Bereitstellung durchführen",
    ],
    useCases: [
      "Echtzeit-Bestandsmanagement",
      "Automatisierte Geschäftsprozesse",
      "IoT-Datenverarbeitung",
      "Microservices-Kommunikation",
    ],
    challenges: [
      "Ereigniskonsistenz und -reihenfolge",
      "Idempotente Ereignisverarbeitung",
      "Überwachung und Fehlerbehebung",
      "Skalierung bei hohem Ereignisvolumen",
    ],
    bestPractices: [
      "Definieren Sie klare Ereignisschemas und -verträge",
      "Implementieren Sie idempotente Ereignisverarbeitung",
      "Verwenden Sie Ereignisversionen für Abwärtskompatibilität",
      "Implementieren Sie ein umfassendes Monitoring",
      "Planen Sie für Fehlerszenarien und Wiederherstellung",
    ],
  },
  {
    id: "api-management",
    name: "API-Management und -Monetarisierung",
    description:
      "Ein Integrationsszenario für die Verwaltung, Sicherung und Monetarisierung von APIs mit SAP Integration Suite.",
    primaryService: "sap-integration-suite",
    connectedServices: ["sap-cloud-identity-services", "sap-destination-service", "sap-credential-store"],
    diagram: "/images/integration-api-management.png",
    benefits: [
      "Zentrale Verwaltung und Überwachung von APIs",
      "Verbesserte API-Sicherheit und -Governance",
      "Neue Einnahmequellen durch API-Monetarisierung",
      "Vereinfachte Entwicklererfahrung",
      "Skalierbare API-Infrastruktur",
    ],
    implementationSteps: [
      "API Management in SAP Integration Suite einrichten",
      "APIs definieren und dokumentieren",
      "Sicherheitsrichtlinien implementieren",
      "API-Portale für Entwickler und Partner einrichten",
      "Nutzungs- und Abrechnungsmodelle konfigurieren",
    ],
    useCases: [
      "Öffnung von SAP-Daten für Partner und Kunden",
      "Entwicklung von mobilen und Web-Anwendungen",
      "B2B-Integration mit Partnern",
      "Aufbau eines API-Ökosystems",
    ],
    challenges: [
      "API-Sicherheit und -Governance",
      "Leistung und Skalierbarkeit",
      "Versionierung und Abwärtskompatibilität",
      "Entwicklereinbindung und -adoption",
    ],
    bestPractices: [
      "Implementieren Sie eine API-First-Strategie",
      "Verwenden Sie standardisierte API-Designrichtlinien",
      "Implementieren Sie mehrschichtige Sicherheit",
      "Bieten Sie umfassende API-Dokumentation und Beispiele",
      "Überwachen Sie API-Nutzung und -Leistung",
    ],
  },
  {
    id: "s4hana-to-salesforce",
    name: "SAP S/4HANA zu Salesforce Integration",
    description: "Bidirektionale Integration zwischen SAP S/4HANA und Salesforce für Kunden- und Vertriebsdaten.",
    primaryService: "sap-integration-suite",
    connectedServices: ["sap-cloud-connector", "sap-destination-service", "sap-credential-store"],
    diagram: "/images/integration-s4hana-salesforce.png",
    benefits: [
      "360-Grad-Kundensicht durch integrierte Daten",
      "Optimierte Vertriebsprozesse",
      "Reduzierte manuelle Dateneingabe",
      "Verbesserte Datenqualität und -konsistenz",
      "Echtzeit-Synchronisation von Geschäftsdaten",
    ],
    implementationSteps: [
      "SAP Integration Suite und Cloud Connector einrichten",
      "Salesforce-Verbindung konfigurieren",
      "Datenmodelle und -abbildungen definieren",
      "Bidirektionale Synchronisationsflüsse implementieren",
      "Tests und Bereitstellung durchführen",
    ],
    useCases: [
      "Kundendatensynchronisation",
      "Vertriebsauftrags-Integration",
      "Preislistensynchronisation",
      "Produktkatalog-Integration",
    ],
    challenges: [
      "Unterschiedliche Datenmodelle",
      "Duplikaterkennung und -behandlung",
      "Konfliktlösung bei bidirektionaler Synchronisation",
      "Leistungsoptimierung bei großen Datenmengen",
    ],
    bestPractices: [
      "Verwenden Sie die vorkonfigurierten Salesforce-Adapter",
      "Implementieren Sie inkrementelle Synchronisation für große Datensätze",
      "Definieren Sie klare Regeln für die Konfliktlösung",
      "Implementieren Sie umfassende Protokollierung und Überwachung",
      "Verwenden Sie Staging-Tabellen für komplexe Transformationen",
    ],
  },
  {
    id: "successfactors-to-s4hana",
    name: "SAP SuccessFactors zu SAP S/4HANA Integration",
    description: "Integration von Mitarbeiterdaten zwischen SAP SuccessFactors und SAP S/4HANA.",
    primaryService: "sap-integration-suite",
    connectedServices: ["sap-cloud-connector", "sap-destination-service", "sap-credential-store"],
    diagram: "/images/integration-successfactors-s4hana.png",
    benefits: [
      "Nahtlose Mitarbeiterdatensynchronisation",
      "Optimierte HR-Prozesse",
      "Reduzierte manuelle Dateneingabe",
      "Verbesserte Datenqualität und -konsistenz",
      "Automatisierte Onboarding- und Offboarding-Prozesse",
    ],
    implementationSteps: [
      "SAP Integration Suite einrichten",
      "SuccessFactors- und S/4HANA-Verbindungen konfigurieren",
      "Mitarbeiterdatenmodelle und -abbildungen definieren",
      "Synchronisationsflüsse implementieren",
      "Tests und Bereitstellung durchführen",
    ],
    useCases: [
      "Mitarbeiterstammdatensynchronisation",
      "Organisationsstruktursynchronisation",
      "Zeiterfassungsintegration",
      "Gehaltsabrechnungsintegration",
    ],
    challenges: [
      "Komplexe Organisationsstrukturen",
      "Datenschutz und -sicherheit",
      "Historische Daten und Änderungsverfolgung",
      "Integration mit lokalen HR-Systemen",
    ],
    bestPractices: [
      "Verwenden Sie die vorkonfigurierten SuccessFactors-Adapter",
      "Implementieren Sie strenge Datenschutzmaßnahmen",
      "Definieren Sie klare Datenverantwortlichkeiten",
      "Implementieren Sie Validierungsregeln für Datenkonsistenz",
      "Verwenden Sie Delta-Mechanismen für effiziente Synchronisation",
    ],
  },
  {
    id: "s4hana-to-ariba",
    name: "SAP S/4HANA zu SAP Ariba Integration",
    description: "Integration von Beschaffungsprozessen zwischen SAP S/4HANA und SAP Ariba.",
    primaryService: "sap-integration-suite",
    connectedServices: ["sap-cloud-connector", "sap-destination-service", "sap-credential-store"],
    diagram: "/images/integration-s4hana-ariba.png",
    benefits: [
      "End-to-End-Beschaffungsprozesse",
      "Verbesserte Lieferantenbeziehungen",
      "Erhöhte Transparenz und Compliance",
      "Optimierte Bestandsverwaltung",
      "Reduzierte Beschaffungskosten",
    ],
    implementationSteps: [
      "SAP Integration Suite einrichten",
      "Ariba- und S/4HANA-Verbindungen konfigurieren",
      "Beschaffungsdatenmodelle und -abbildungen definieren",
      "Synchronisationsflüsse implementieren",
      "Tests und Bereitstellung durchführen",
    ],
    useCases: [
      "Lieferantenstammdatensynchronisation",
      "Bestellprozessintegration",
      "Rechnungsabgleich und -verarbeitung",
      "Vertragsmanagement-Integration",
    ],
    challenges: [
      "Komplexe Genehmigungsworkflows",
      "Integration mit bestehenden Beschaffungsprozessen",
      "Lieferantenonboarding und -management",
      "Kontenabstimmung und Finanzintegration",
    ],
    bestPractices: [
      "Verwenden Sie die vorkonfigurierten Ariba-Adapter",
      "Implementieren Sie klare Prozessabläufe und Verantwortlichkeiten",
      "Definieren Sie Regeln für Ausnahmebehandlung",
      "Implementieren Sie umfassende Berichterstattung und Analysen",
      "Verwenden Sie standardisierte Kataloge und Klassifizierungen",
    ],
  },
  {
    id: "s4hana-to-azure",
    name: "SAP S/4HANA zu Microsoft Azure Integration",
    description: "Integration von SAP S/4HANA mit Microsoft Azure-Diensten für erweiterte Analysen und KI.",
    primaryService: "sap-integration-suite",
    connectedServices: ["sap-cloud-connector", "sap-destination-service", "sap-credential-store"],
    diagram: "/images/integration-s4hana-azure.png",
    benefits: [
      "Erweiterte Analysen und Einblicke",
      "KI-gestützte Geschäftsprozesse",
      "Skalierbare Cloud-Infrastruktur",
      "Hybride Systemlandschaft",
      "Innovative Anwendungsentwicklung",
    ],
    implementationSteps: [
      "SAP Integration Suite und Cloud Connector einrichten",
      "Azure-Dienste konfigurieren",
      "Datenmodelle und -abbildungen definieren",
      "Integrations- und Analyseflüsse implementieren",
      "Tests und Bereitstellung durchführen",
    ],
    useCases: [
      "Erweiterte Geschäftsanalysen",
      "Vorhersagemodelle für Geschäftsprozesse",
      "IoT-Datenintegration und -analyse",
      "Hybride Anwendungsentwicklung",
    ],
    challenges: [
      "Datenlatenz und -synchronisation",
      "Sicherheit und Compliance",
      "Komplexe Datenmodelle und -transformationen",
      "Skill-Anforderungen für beide Plattformen",
    ],
    bestPractices: [
      "Verwenden Sie OData-Services für SAP-Datenextraktion",
      "Implementieren Sie inkrementelle Datenladeprozesse",
      "Nutzen Sie Azure Data Factory für Datenintegration",
      "Implementieren Sie umfassende Sicherheitsmaßnahmen",
      "Verwenden Sie gemeinsame Authentifizierungsmechanismen",
    ],
  },
]

// Beispiel-Bilder für Integrationsszenarien
const scenarioImages = {
  "sap-s4hana-to-non-sap": "/sap-s4hana-non-sap-integration.png",
  "event-driven-architecture": "/placeholder.svg?key=iegzh",
  "api-management": "/api-management-concept.png",
  "s4hana-to-salesforce": "/sap-s4hana-to-salesforce.png",
  "successfactors-to-s4hana": "/successfactors-s4hana-flow.png",
  "s4hana-to-ariba": "/placeholder.svg?height=400&width=600&query=S/4HANA to Ariba",
  "s4hana-to-azure": "/placeholder.svg?height=400&width=600&query=S/4HANA to Azure",
}

// Beispiel-Code für Integrationsszenarien
const scenarioCodeExamples = {
  "sap-s4hana-to-non-sap": `// SAP Cloud Integration - Groovy Script für S/4HANA zu Salesforce Mapping
import com.sap.gateway.ip.core.customdev.util.Message

def Message processData(Message message) {
    def body = message.getBody(String)
    def jsonSlurper = new groovy.json.JsonSlurper()
    def s4data = jsonSlurper.parseText(body)
    
    // Mapping von S/4HANA zu Salesforce Datenmodell
    def salesforceData = [
        Name: s4data.BusinessPartner.BusinessPartnerName,
        AccountNumber: s4data.BusinessPartner.BusinessPartnerID,
        Phone: s4data.BusinessPartner.PhoneNumber,
        BillingStreet: s4data.BusinessPartner.AddressData.StreetName,
        BillingCity: s4data.BusinessPartner.AddressData.CityName,
        BillingPostalCode: s4data.BusinessPartner.AddressData.PostalCode,
        BillingCountry: s4data.BusinessPartner.AddressData.CountryName
    ]
    
    // Konvertiere zu JSON für Salesforce API
    def jsonBuilder = new groovy.json.JsonBuilder(salesforceData)
    message.setBody(jsonBuilder.toString())
    
    return message
}`,
  "event-driven-architecture": `// SAP Event Mesh - Node.js Beispiel für Event Producer
const { MessagingService } = require('@sap/xb-msg');

async function sendEvent(eventData) {
  // Konfiguration für Event Mesh
  const options = {
    serviceCredentials: {
      // Credentials aus Service Binding
      uri: process.env.EVENT_MESH_URI,
      uaa: {
        clientid: process.env.EVENT_MESH_CLIENT_ID,
        clientsecret: process.env.EVENT_MESH_CLIENT_SECRET,
        url: process.env.EVENT_MESH_UAA_URL
      }
    }
  };

  // Event Mesh Client erstellen
  const messagingService = new MessagingService(options);
  
  try {
    // Verbindung herstellen
    await messagingService.connect();
    
    // Topic für das Event
    const topic = 'sap/s4hana/orderCreated';
    
    // Event senden
    await messagingService.publishMessage(topic, JSON.stringify(eventData), {
      contentType: 'application/json',
      correlationId: eventData.orderId
    });
    
    console.log(\`Event für Bestellung \${eventData.orderId} erfolgreich gesendet\`);
  } catch (error) {
    console.error('Fehler beim Senden des Events:', error);
    throw error;
  } finally {
    // Verbindung schließen
    await messagingService.disconnect();
  }
}`,
  "api-management": `// SAP API Management - Policy für API-Sicherheit und Ratenbegrenzung
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<RateLimit async="false" continueOnError="false" enabled="true" name="RateLimit">
    <DisplayName>Rate Limit Policy</DisplayName>
    <Properties/>
    <AllowConnections>5</AllowConnections>
    <Interval>1</Interval>
    <TimeUnit>minute</TimeUnit>
    <Identifier ref="request.header.app_id" />
    <MessageWeight ref="request.header.weight" default="1" />
    <Distributed>true</Distributed>
    <SynchronousMode>false</SynchronousMode>
</RateLimit>

// JavaScript für API-Transformation
var customer = context.getVariable("response.content");
var customerObj = JSON.parse(customer);

// Entferne sensible Daten
delete customerObj.creditCardNumber;
delete customerObj.socialSecurityNumber;

// Füge API-Version hinzu
customerObj.apiVersion = "v1";

context.setVariable("response.content", JSON.stringify(customerObj));`,
  "s4hana-to-salesforce": `// SAP Cloud Integration - Integration Flow für S/4HANA zu Salesforce
// OData-Abfrage für S/4HANA Business Partner
GET /sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner?$filter=Customer eq 'X'&$expand=to_BusinessPartnerAddress

// Salesforce REST API - Kunden erstellen/aktualisieren
POST /services/data/v54.0/sobjects/Account
Content-Type: application/json

{
  "Name": "{{BusinessPartnerFullName}}",
  "AccountNumber": "{{BusinessPartnerID}}",
  "Phone": "{{PhoneNumber}}",
  "BillingStreet": "{{StreetName}}",
  "BillingCity": "{{CityName}}",
  "BillingPostalCode": "{{PostalCode}}",
  "BillingCountry": "{{CountryName}}",
  "CustomerSince": "{{CreationDate}}",
  "ExternalId__c": "{{BusinessPartnerID}}"
}`,
  "successfactors-to-s4hana": `// SAP Cloud Integration - Integration Flow für SuccessFactors zu S/4HANA
// SuccessFactors OData API - Mitarbeiterdaten abrufen
GET /odata/v2/User?$select=userId,username,firstName,lastName,email,department,division,jobTitle

// S/4HANA Business Partner API - Mitarbeiter erstellen/aktualisieren
POST /sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner
Content-Type: application/json

{
  "BusinessPartnerCategory": "1", // Person
  "FirstName": "{{firstName}}",
  "LastName": "{{lastName}}",
  "BusinessPartnerType": "2", // Employee
  "EmployeeID": "{{userId}}",
  "EmailAddress": "{{email}}",
  "OrganizationDepartment": "{{department}}",
  "OrganizationDivision": "{{division}}",
  "JobTitle": "{{jobTitle}}"
}`,
  "s4hana-to-ariba": `// SAP Cloud Integration - Integration Flow für S/4HANA zu Ariba
// S/4HANA OData API - Lieferanten abrufen
GET /sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner?$filter=Supplier eq 'X'&$expand=to_BusinessPartnerAddress

// Ariba API - Lieferanten erstellen/aktualisieren
POST /api/supplier-management/v1/suppliers
Content-Type: application/json

{
  "supplierName": "{{BusinessPartnerFullName}}",
  "supplierID": "{{BusinessPartnerID}}",
  "duns": "{{DUNSNumber}}",
  "taxID": "{{TaxNumber}}",
  "address": {
    "street": "{{StreetName}}",
    "city": "{{CityName}}",
    "postalCode": "{{PostalCode}}",
    "country": "{{CountryName}}"
  },
  "contact": {
    "firstName": "{{ContactFirstName}}",
    "lastName": "{{ContactLastName}}",
    "email": "{{ContactEmail}}",
    "phone": "{{ContactPhone}}"
  }
}`,
  "s4hana-to-azure": `// Azure Data Factory - Pipeline für S/4HANA zu Azure Synapse
{
  "name": "S4HANA_to_Azure_Synapse",
  "properties": {
    "activities": [
      {
        "name": "Copy S/4HANA Sales Data",
        "type": "Copy",
        "inputs": [
          {
            "referenceName": "S4HANA_OData_SalesOrders",
            "type": "DatasetReference"
          }
        ],
        "outputs": [
          {
            "referenceName": "AzureSynapse_SalesOrders",
            "type": "DatasetReference"
          }
        ],
        "typeProperties": {
          "source": {
            "type": "ODataSource",
            "query": "$filter=CreationDate gt datetime'2023-01-01T00:00:00'"
          },
          "sink": {
            "type": "SqlDWSink",
            "preCopyScript": "TRUNCATE TABLE SalesOrders_Staging",
            "writeBehavior": "Insert",
            "sqlWriterUseTableLock": false
          }
        }
      },
      {
        "name": "Transform Sales Data",
        "type": "DataFlow",
        "dependsOn": [
          {
            "activity": "Copy S/4HANA Sales Data",
            "dependencyConditions": [ "Succeeded" ]
          }
        ],
        "typeProperties": {
          "dataflow": {
            "referenceName": "TransformSalesData",
            "type": "DataFlowReference"
          }
        }
      }
    ]
  }
}`,
}

interface BTPIntegrationScenariosProps {
  onSelectService: (serviceId: string) => void
}

export default function BTPIntegrationScenarios({ onSelectService }: BTPIntegrationScenariosProps) {
  const [selectedScenario, setSelectedScenario] = useState<IntegrationScenario | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const handleScenarioClick = (scenario: IntegrationScenario) => {
    setSelectedScenario(scenario)
    setIsDialogOpen(true)
    setActiveTab("overview")
  }

  const getServiceByID = (id: string) => {
    return btpServices.find((service) => service.id === id)
  }

  const handleServiceClick = (serviceId: string) => {
    if (onSelectService) {
      setIsDialogOpen(false)
      onSelectService(serviceId)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Integrationsszenarien</h2>
        <p className="text-gray-600">
          Entdecken Sie vorgefertigte Integrationsszenarien für verschiedene Anwendungsfälle mit SAP BTP Services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrationScenarios.map((scenario) => (
          <Card key={scenario.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-2">{scenario.name}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{scenario.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {scenario.connectedServices.slice(0, 3).map((serviceId) => {
                  const service = getServiceByID(serviceId)
                  return service ? (
                    <Badge key={serviceId} variant="outline">
                      {service.name}
                    </Badge>
                  ) : null
                })}
                {scenario.connectedServices.length > 3 && (
                  <Badge variant="outline">+{scenario.connectedServices.length - 3}</Badge>
                )}
              </div>
              <Button
                variant="default"
                className="w-full flex justify-between items-center"
                onClick={() => handleScenarioClick(scenario)}
              >
                Details anzeigen
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailansicht Dialog */}
      {selectedScenario && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedScenario.name}</DialogTitle>
              <DialogDescription className="text-base">{selectedScenario.description}</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="overview" className="flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  Übersicht
                </TabsTrigger>
                <TabsTrigger value="services" className="flex items-center gap-1">
                  <Server className="h-4 w-4" />
                  Services
                </TabsTrigger>
                <TabsTrigger value="implementation" className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Implementierung
                </TabsTrigger>
                <TabsTrigger value="code" className="flex items-center gap-1">
                  <ExternalLink className="h-4 w-4" />
                  Code-Beispiel
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="space-y-6">
                  {/* Diagramm */}
                  <div className="relative h-64 md:h-80 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={scenarioImages[selectedScenario.id] || "/placeholder.svg"}
                      alt={selectedScenario.name}
                      fill
                      className="object-contain"
                    />
                  </div>

                  {/* Vorteile */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Vorteile</h3>
                    <ul className="space-y-2">
                      {selectedScenario.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Anwendungsfälle */}
                  {selectedScenario.useCases && (
                    <div>
                      <h3 className="text-lg font-medium mb-3">Anwendungsfälle</h3>
                      <ul className="space-y-2">
                        {selectedScenario.useCases.map((useCase, index) => (
                          <li key={index} className="flex items-start">
                            <div className="h-2 w-2 rounded-full bg-blue-600 mt-2 mr-3 flex-shrink-0" />
                            <span>{useCase}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Herausforderungen */}
                  {selectedScenario.challenges && (
                    <div>
                      <h3 className="text-lg font-medium mb-3">Herausforderungen</h3>
                      <ul className="space-y-2">
                        {selectedScenario.challenges.map((challenge, index) => (
                          <li key={index} className="flex items-start">
                            <div className="h-2 w-2 rounded-full bg-amber-600 mt-2 mr-3 flex-shrink-0" />
                            <span>{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="services">
                <div className="space-y-6">
                  {/* Primärer Service */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Primärer Service</h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      {(() => {
                        const primaryService = getServiceByID(selectedScenario.primaryService)
                        return primaryService ? (
                          <div className="flex items-start">
                            <div className="relative w-12 h-12 bg-white rounded-md flex items-center justify-center overflow-hidden mr-4 flex-shrink-0">
                              <Image
                                src={`/images/btp-services/${primaryService.id}.png`}
                                alt={primaryService.name}
                                width={32}
                                height={32}
                                className="object-contain"
                              />
                            </div>
                            <div>
                              <h4 className="font-medium">{primaryService.name}</h4>
                              <p className="text-sm text-gray-600 line-clamp-2">{primaryService.description}</p>
                              <Button
                                variant="link"
                                className="p-0 h-auto text-blue-600"
                                onClick={() => handleServiceClick(primaryService.id)}
                              >
                                Service-Details anzeigen
                              </Button>
                            </div>
                          </div>
                        ) : null
                      })()}
                    </div>
                  </div>

                  {/* Verbundene Services */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Verbundene Services</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedScenario.connectedServices.map((serviceId) => {
                        const service = getServiceByID(serviceId)
                        return service ? (
                          <div key={serviceId} className="border p-4 rounded-lg hover:bg-gray-50">
                            <div className="flex items-start">
                              <div className="relative w-10 h-10 bg-white rounded-md flex items-center justify-center overflow-hidden mr-3 flex-shrink-0">
                                <Image
                                  src={`/images/btp-services/${service.id}.png`}
                                  alt={service.name}
                                  width={24}
                                  height={24}
                                  className="object-contain"
                                />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm">{service.name}</h4>
                                <p className="text-xs text-gray-600 line-clamp-2">{service.description}</p>
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-xs text-blue-600"
                                  onClick={() => handleServiceClick(service.id)}
                                >
                                  Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>

                  {/* Architekturdiagramm */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Architekturdiagramm</h3>
                    <div className="relative h-64 md:h-80 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={scenarioImages[selectedScenario.id] || "/placeholder.svg"}
                        alt={selectedScenario.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="implementation">
                <div className="space-y-6">
                  {/* Implementierungsschritte */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Implementierungsschritte</h3>
                    <ol className="relative border-l border-gray-200 ml-3 space-y-6">
                      {selectedScenario.implementationSteps.map((step, index) => (
                        <li key={index} className="ml-6">
                          <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white">
                            {index + 1}
                          </span>
                          <h4 className="font-medium">{step}</h4>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Best Practices */}
                  {selectedScenario.bestPractices && (
                    <div>
                      <h3 className="text-lg font-medium mb-3">Best Practices</h3>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <ul className="space-y-2">
                          {selectedScenario.bestPractices.map((practice, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                              <span>{practice}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Ressourcen */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Ressourcen</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button variant="outline" size="sm" asChild>
                        <a href="#" className="flex items-center gap-1">
                          <ExternalLink className="h-4 w-4" />
                          Offizielle Dokumentation
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href="#" className="flex items-center gap-1">
                          <ExternalLink className="h-4 w-4" />
                          Implementierungsleitfaden
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href="#" className="flex items-center gap-1">
                          <ExternalLink className="h-4 w-4" />
                          Video-Tutorial
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href="#" className="flex items-center gap-1">
                          <ExternalLink className="h-4 w-4" />
                          Community-Forum
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="code">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium mb-3">Code-Beispiel</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                    <pre className="text-sm">
                      <code>{scenarioCodeExamples[selectedScenario.id] || "// Code-Beispiel nicht verfügbar"}</code>
                    </pre>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <ExternalLink className="h-4 w-4" />
                      Code kopieren
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
