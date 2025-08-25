import { type NextRequest, NextResponse } from "next/server"
import { put, list } from "@/lib/blob-storage"
import { cookies } from "next/headers"
import { decrypt } from "@/lib/crypto"
import { ICookieStore } from "../../shared/Interfaces/ICookieStore"
import { isAuthenticated as authUtilsIsAuthenticated, unauthorizedResponse } from "../../shared/auth-utils"

// Standarddaten für Resources
const defaultResources = [
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
]

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

// Use the shared auth-utils isAuthenticated function
function isAuthenticated(request: NextRequest): boolean {
  return authUtilsIsAuthenticated(request);
}

// Funktion zum Laden der Resources
async function getResources() {
  try {
    const blobPath = `realcore-data/resources/data.json`
    const blob = await blobExists(blobPath)

    if (blob) {
      return await getBlobContent(blob.url)
    }

    // Wenn keine Daten gefunden wurden, speichere die Standarddaten
    await saveResources(defaultResources)
    return defaultResources
  } catch (error) {
    console.error("Fehler beim Laden der Resources aus Blob Storage:", error)
    return defaultResources
  }
}

// Funktion zum Speichern der Resources
async function saveResources(resources: any[]) {
  try {
    // Erstelle zuerst ein Backup der aktuellen Daten
    const blobPath = `realcore-data/resources/data.json`
    const blob = await blobExists(blobPath)

    if (blob) {
      const data = await getBlobContent(blob.url)
      const timestamp = Date.now()
      const backupPath = `realcore-data/resources/backup-${timestamp}.json`

      await put(backupPath, JSON.stringify(data), {
        contentType: "application/json",
        access: "public",
      })
    }

    // Speichere die neuen Daten
    await put(blobPath, JSON.stringify(resources), {
      contentType: "application/json",
      access: "public",
    })

    return true
  } catch (error) {
    console.error("Fehler beim Speichern der Resources in Blob Storage:", error)
    return false
  }
}

export async function GET() {
  try {
    const resources = await getResources()
    return NextResponse.json(resources)
  } catch (error) {
    console.error("Fehler beim Laden der Resources:", error)
    return NextResponse.json({ error: "Fehler beim Laden der Resources" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    if (!isAuthenticated(request)) {
      return unauthorizedResponse()
    }

    // Hole die Daten aus dem Request
    const resources = await request.json()

    // Speichere die Resources
    const result = await saveResources(resources)

    if (result) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Fehler beim Speichern der Resources" }, { status: 500 })
    }
  } catch (error) {
    console.error("Fehler beim Speichern der Resources:", error)
    return NextResponse.json({ error: "Fehler beim Speichern der Resources" }, { status: 500 })
  }
}
