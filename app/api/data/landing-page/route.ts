import { type NextRequest, NextResponse } from "next/server"
import { put, list } from "@/lib/blob-storage"
import { cookies } from "next/headers"
import { defaultLandingPage } from "@/data/landing-page-data"
import { revalidatePath } from "next/cache"
import { ICookieStore } from "../../shared/Interfaces/ICookieStore"
import { isAuthenticated as authUtilsIsAuthenticated, unauthorizedResponse } from "../../shared/auth-utils"

// Hilfsfunktion zum Abrufen der Landing Page aus dem Blob Storage
async function getLandingPage() {
  try {
    // Versuche, die Landing Page aus dem Blob Storage zu laden
    const { blobs } = await list({
      prefix: "landing-page/",
      limit: 1,
    })

    if (blobs.length > 0) {
      // Sortiere nach letzter Änderung, um die neueste Version zu erhalten
      const latestBlob = blobs
        .sort((a, b) => {
          const at = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0
          const bt = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0
          return bt - at
        })[0]

      // Lade den Inhalt des Blobs
      const response = await fetch(latestBlob.url, { cache: "no-store" })
      if (!response.ok) {
        throw new Error(`Failed to fetch blob: ${response.statusText}`)
      }

      return await response.json()
    }

    // Wenn keine Landing Page gefunden wurde, verwende die Standard-Landing-Page
    return defaultLandingPage
  } catch (error) {
    console.error("Fehler beim Laden der Landing Page:", error)
    // Bei einem Fehler verwende die Standard-Landing-Page
    return defaultLandingPage
  }
}

// Hilfsfunktion zum Speichern der Landing Page im Blob Storage
async function saveLandingPage(landingPage: any) {
  try {
    // Erstelle ein Backup der aktuellen Landing Page
    const timestamp = new Date().toISOString()
    const backupKey = `landing-page/backup-${timestamp}.json`

    // Hole die aktuelle Landing Page für das Backup
    const currentLandingPage = await getLandingPage()

    // Speichere das Backup
    await put(backupKey, JSON.stringify(currentLandingPage), {
      contentType: "application/json",
    })

    // Speichere die neue Landing Page
    const key = `landing-page/current.json`
    await put(key, JSON.stringify(landingPage), {
      contentType: "application/json",
    })

    // Revalidiere die Landing Page und alle relevanten Pfade
    revalidatePath("/landing", "page")
    revalidatePath("/", "page")
    revalidatePath("/landing", "layout")
    revalidatePath("/", "layout")

    return true
  } catch (error) {
    console.error("Fehler beim Speichern der Landing Page:", error)
    return false
  }
}

// Use the shared auth-utils isAuthenticated function
function isAuthenticated(request: NextRequest): boolean {
  return authUtilsIsAuthenticated(request);
}

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

export async function GET() {
  try {
    const landingPage = await getLandingPage()
    return NextResponse.json(landingPage, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Surrogate-Control": "no-store",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Fehler beim Laden der Landing Page:", error)
    return NextResponse.json({ error: "Fehler beim Laden der Landing Page" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    if (!isAuthenticated(request)) {
      return unauthorizedResponse()
    }

    // Hole die Daten aus dem Request
    const landingPage = await request.json()

    // Speichere die Landing Page
    const result = await saveLandingPage(landingPage)

    if (result) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Fehler beim Speichern der Landing Page" }, { status: 500 })
    }
  } catch (error) {
    console.error("Fehler beim Speichern der Landing Page:", error)
    return NextResponse.json({ error: "Fehler beim Speichern der Landing Page" }, { status: 500 })
  }
}
