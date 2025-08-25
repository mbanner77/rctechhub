import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { put, list } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { ICookieStore } from "../../shared/Interfaces/ICookieStore"
import { isAuthenticated, unauthorizedResponse } from "../../shared/auth-utils"

// Hilfsfunktion zum Abrufen eines Blobs
async function getBlobContent(url: string): Promise<any> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching blob:", error)
    throw error
  }
}

// Hilfsfunktion zum Überprüfen, ob ein Blob existiert
async function blobExists(key: string): Promise<{ url: string } | null> {
  try {
    const { blobs } = await list({ prefix: key })
    const exactMatch = blobs.find((blob) => blob.pathname === key)
    return exactMatch || null
  } catch (error) {
    console.error("Error checking if blob exists:", error)
    return null
  }
}

// Standarddaten direkt in der API-Route definieren
const defaultData = {
  services: [
    {
      id: "1",
      title: "BTP Architektur",
      description: "Entwicklung einer maßgeschneiderten BTP-Architektur für Ihre spezifischen Anforderungen.",
      image: "/images/btp-architecture.png",
      category: "Beratung",
      tags: ["Architektur", "BTP", "Cloud"],
      duration: "4-6 Wochen",
      deliverables: ["Architektur-Blueprint", "Implementierungsplan", "Best Practices Guide"],
      price: "Auf Anfrage",
    },
    {
      id: "2",
      title: "CAP Implementierung",
      description: "Entwicklung von Cloud-nativen Anwendungen mit dem SAP Cloud Application Programming Model.",
      image: "/images/cap-implementation.png",
      category: "Entwicklung",
      tags: ["CAP", "Node.js", "HANA"],
      duration: "6-12 Wochen",
      deliverables: ["Anwendungscode", "Dokumentation", "Schulung"],
      price: "Auf Anfrage",
    },
  ],
  workshops: [
    {
      id: "1",
      title: "BTP Grundlagen Workshop",
      description: "Einstieg in die SAP Business Technology Platform mit praktischen Übungen.",
      duration: "2 Tage",
      format: "Vor Ort / Remote",
      audience: "Entwickler, Architekten",
      prerequisites: "Grundkenntnisse in SAP",
      agenda: ["Einführung in die BTP", "Kernkomponenten und Services", "Hands-on Labs", "Best Practices"],
    },
    {
      id: "2",
      title: "CAP Entwicklung Masterclass",
      description: "Fortgeschrittene Techniken für die Entwicklung mit dem Cloud Application Programming Model.",
      duration: "3 Tage",
      format: "Remote",
      audience: "Erfahrene Entwickler",
      prerequisites: "JavaScript/Node.js Kenntnisse",
      agenda: [
        "CAP Modellierung",
        "Service-Implementierung",
        "Sicherheit und Authentifizierung",
        "Deployment und Operations",
      ],
    },
  ],
  bestPractices: [
    {
      id: "1",
      title: "BTP Architektur Best Practices",
      description: "Bewährte Methoden für die Gestaltung einer robusten BTP-Architektur.",
      category: "Architektur",
      image: "/images/best-practice-btp-architecture.png",
      content:
        "# BTP Architektur Best Practices\n\n## Einführung\n\nEine gut durchdachte BTP-Architektur ist entscheidend für den Erfolg Ihrer Cloud-Projekte.\n\n## Schlüsselprinzipien\n\n1. **Servicetrennung**: Trennen Sie Anwendungen in logische Services\n2. **Skalierbarkeit**: Entwerfen Sie für horizontale Skalierung\n3. **Sicherheit**: Implementieren Sie ein umfassendes Sicherheitskonzept\n\n## Referenzarchitektur\n\n[Diagramm einer Referenzarchitektur]\n\n## Empfohlene Praktiken\n\n- Verwenden Sie Multi-Environment-Strategien\n- Implementieren Sie CI/CD-Pipelines\n- Etablieren Sie Monitoring und Observability",
    },
    {
      id: "2",
      title: "Integration Best Practices",
      description: "Optimale Strategien für die Integration von SAP- und Nicht-SAP-Systemen.",
      category: "Integration",
      image: "/images/best-practice-integration.png",
      content:
        "# Integration Best Practices\n\n## Einführung\n\nEffektive Integrationsstrategien sind entscheidend für eine nahtlose Systemlandschaft.\n\n## Integrationsansätze\n\n1. **API-First**: Entwickeln Sie APIs als Produkte\n2. **Event-Driven**: Nutzen Sie Event-basierte Kommunikation für lose Kopplung\n3. **Hybrid-Integration**: Kombinieren Sie Cloud- und On-Premise-Integrationen\n\n## Technologieauswahl\n\n- SAP Integration Suite für umfassende Integrationsszenarien\n- SAP Event Mesh für Event-Driven-Architekturen\n- API Management für API-Governance\n\n## Best Practices\n\n- Implementieren Sie standardisierte Fehlerbehandlung\n- Etablieren Sie Monitoring und Alerting\n- Dokumentieren Sie Integrationsflüsse",
    },
  ],
  resources: [
    {
      id: "1",
      title: "BTP Architektur Whitepaper",
      description: "Umfassendes Whitepaper zu BTP-Architekturprinzipien und Best Practices.",
      type: "Whitepaper",
      image: "/images/resource-whitepaper.png",
      downloadUrl: "#",
      tags: ["Architektur", "BTP", "Best Practices"],
    },
    {
      id: "2",
      title: "CAP Entwicklungsguide",
      description: "Detaillierter Guide für die Entwicklung mit dem Cloud Application Programming Model.",
      type: "Guide",
      image: "/images/resource-guide.png",
      downloadUrl: "#",
      tags: ["CAP", "Entwicklung", "Tutorial"],
    },
  ],
  mailConfig: {
    host: "smtp.example.com",
    port: 587,
    secure: true,
    auth: {
      user: "user@example.com",
      pass: "",
    },
    defaultFrom: "info@example.com",
  },
  landingPage: {
    hero: {
      title: "Ihre Reise in die Cloud beginnt hier",
      subtitle: "Wir begleiten Sie auf dem Weg zu innovativen SAP-Lösungen in der Cloud",
      ctaText: "Mehr erfahren",
      ctaUrl: "/services",
      imageUrl: "/images/hero-illustration.png",
    },
    features: [
      {
        title: "BTP Expertise",
        description: "Umfassende Erfahrung mit der SAP Business Technology Platform",
        icon: "Cloud",
      },
      {
        title: "End-to-End Lösungen",
        description: "Von der Strategie bis zur Implementierung und darüber hinaus",
        icon: "LayoutGrid",
      },
      {
        title: "Agile Methodik",
        description: "Schnelle Ergebnisse durch agile Entwicklungsmethoden",
        icon: "Repeat",
      },
    ],
    testimonials: [
      {
        quote: "Die Expertise und der pragmatische Ansatz haben uns überzeugt.",
        author: "Max Mustermann",
        company: "Beispiel GmbH",
      },
      {
        quote: "Ein verlässlicher Partner für unsere Cloud-Transformation.",
        author: "Erika Musterfrau",
        company: "Muster AG",
      },
    ],
    stats: [
      {
        value: "50+",
        label: "Erfolgreiche Projekte",
      },
      {
        value: "30+",
        label: "Zertifizierte Experten",
      },
      {
        value: "100%",
        label: "Kundenzufriedenheit",
      },
    ],
  },
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    if (!isAuthenticated(request)) {
      return unauthorizedResponse()
    }

    // Definiere die Datentypen
    const dataTypes = ["services", "workshops", "best-practices", "resources", "mail-config", "landing-page"]
    const timestamp = Date.now()

    // Erstelle Backups für alle Datentypen
    for (const dataType of dataTypes) {
      const blobPath = `realcore-data/${dataType}/data.json`
      const blob = await blobExists(blobPath)

      if (blob) {
        const data = await getBlobContent(blob.url)
        await put(`realcore-data/${dataType}/backup-${timestamp}.json`, JSON.stringify(data), {
          contentType: "application/json",
          access: "public",
        })
      }
    }

    // Setze alle Daten auf Standardwerte zurück
    await put(`realcore-data/services/data.json`, JSON.stringify(defaultData.services), {
      contentType: "application/json",
      access: "public",
    })

    await put(`realcore-data/workshops/data.json`, JSON.stringify(defaultData.workshops), {
      contentType: "application/json",
      access: "public",
    })

    await put(`realcore-data/best-practices/data.json`, JSON.stringify(defaultData.bestPractices), {
      contentType: "application/json",
      access: "public",
    })

    await put(`realcore-data/resources/data.json`, JSON.stringify(defaultData.resources), {
      contentType: "application/json",
      access: "public",
    })

    await put(`realcore-data/mail-config/data.json`, JSON.stringify(defaultData.mailConfig), {
      contentType: "application/json",
      access: "public",
    })

    await put(`realcore-data/landing-page/data.json`, JSON.stringify(defaultData.landingPage), {
      contentType: "application/json",
      access: "public",
    })

    // Revalidiere alle Pfade
    revalidatePath("/")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Fehler beim Zurücksetzen der Daten:", error)
    return NextResponse.json({ error: "Fehler beim Zurücksetzen der Daten" }, { status: 500 })
  }
}
