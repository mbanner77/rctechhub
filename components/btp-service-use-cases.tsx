"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Code, FileText, ExternalLink } from "lucide-react"
import type { BTPService } from "@/types/btp-service"

interface BTPServiceUseCasesProps {
  service: BTPService
}

export default function BTPServiceUseCases({ service }: BTPServiceUseCasesProps) {
  // Return null if service is undefined or if service.useCases is undefined or empty
  if (!service || !service.useCases || service.useCases.length === 0) {
    return null
  }

  const generateDetailedUseCases = () => {
    // Ensure useCases exists and has items
    if (!service.useCases || service.useCases.length === 0) {
      return <p className="text-gray-600">Keine Anwendungsbeispiele verfügbar.</p>
    }

    return (
      <div className="space-y-4">
        {service.useCases.map((useCase, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">{useCase}</h4>
                <p className="text-sm text-gray-600 mt-1">{generateUseCaseDescription(useCase)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const generateUseCaseDescription = (useCase: string) => {
    // Hier könnten in einer realen Anwendung detaillierte Beschreibungen aus einer Datenbank kommen
    return `Dieser Anwendungsfall zeigt, wie ${service.name} eingesetzt werden kann, um ${useCase.toLowerCase()}. Die Implementierung ist ${
      service.implementationTime === "Schnell"
        ? "einfach und schnell durchführbar"
        : service.implementationTime === "Mittel"
          ? "mit moderatem Aufwand umsetzbar"
          : "komplex, bietet aber umfangreiche Möglichkeiten"
    }.`
  }

  const generateCodeExample = () => {
    // Beispiel-Code basierend auf der Service-Kategorie
    switch (service.category) {
      case "Integration":
        return `// Integration mit ${service.name}
import { IntegrationService } from '@sap/integration-service';

// Initialisieren des Services
const integrationService = new IntegrationService({
  serviceUrl: process.env.SERVICE_URL,
  credentials: {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
  }
});

// Ausführen einer Integration
async function runIntegration() {
  try {
    const result = await integrationService.executeFlow({
      flowId: 'sample-integration-flow',
      payload: {
        data: 'Sample data to process'
      }
    });
    
    console.log('Integration erfolgreich:', result);
  } catch (error) {
    console.error('Fehler bei der Integration:', error);
  }
}

runIntegration();`

      case "Database":
        return `// Datenbankzugriff mit ${service.name}
import { DatabaseService } from '@sap/database-service';

// Verbindung zur Datenbank herstellen
const db = new DatabaseService({
  connectionString: process.env.DB_CONNECTION_STRING
});

// Daten abfragen
async function queryData() {
  try {
    const result = await db.execute(\`
      SELECT * 
      FROM sample_table 
      WHERE category = 'test'
      LIMIT 10
    \`);
    
    console.log('Abfrageergebnis:', result.rows);
  } catch (error) {
    console.error('Datenbankfehler:', error);
  }
}

queryData();`

      default:
        return `// Beispiel-Code für ${service.name}
import { ${service.name.replace(/\s/g, "")}Client } from '@sap/${service.id.toLowerCase()}';

// Client initialisieren
const client = new ${service.name.replace(/\s/g, "")}Client({
  baseUrl: process.env.SERVICE_URL,
  auth: {
    username: process.env.USERNAME,
    password: process.env.PASSWORD
  }
});

// Service-Methode aufrufen
async function callService() {
  try {
    const response = await client.executeOperation({
      operation: 'sample-operation',
      parameters: {
        param1: 'value1',
        param2: 'value2'
      }
    });
    
    console.log('Ergebnis:', response);
  } catch (error) {
    console.error('Fehler beim Aufruf des Services:', error);
  }
}

callService();`
    }
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <h3 className="text-lg font-semibold">Anwendungsbeispiele</h3>

        <Tabs defaultValue="usecases">
          <div className="overflow-x-auto pb-2 mb-4">
            <TabsList className="w-fit flex">
              <TabsTrigger value="usecases" className="flex items-center gap-1 text-xs sm:text-sm px-3 whitespace-nowrap">
                <CheckCircle className="h-4 w-4" />
                Anwendungsfälle
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-1 text-xs sm:text-sm px-3 whitespace-nowrap">
                <Code className="h-4 w-4" />
                Code-Beispiel
              </TabsTrigger>
              <TabsTrigger value="docs" className="flex items-center gap-1 text-xs sm:text-sm px-3 whitespace-nowrap">
              <FileText className="h-4 w-4" />
              Dokumentation
            </TabsTrigger>
          </TabsList>
          </div>

          <TabsContent value="usecases">{generateDetailedUseCases()}</TabsContent>

          <TabsContent value="code">
            <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
              <pre className="text-sm">
                <code>{generateCodeExample()}</code>
              </pre>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <a href="#" className="flex items-center gap-1">
                  <ExternalLink className="h-4 w-4" />
                  Weitere Beispiele
                </a>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="docs">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Hier finden Sie weiterführende Dokumentation und Tutorials zur Implementierung von {service.name}.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="outline" size="sm" asChild className="justify-start">
                  <a href="#" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Entwicklerhandbuch
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild className="justify-start">
                  <a href="#" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    API-Referenz
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild className="justify-start">
                  <a href="#" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Tutorials
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild className="justify-start">
                  <a href="#" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Best Practices
                  </a>
                </Button>
              </div>

              <div className="mt-4 flex justify-end">
                <Button asChild>
                  <a
                    href={service.documentation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Offizielle Dokumentation
                  </a>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
