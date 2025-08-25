import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { put, list } from "@vercel/blob"
import { checkAuthAction } from "@/lib/auth-actions"

// Definiere die Datentypen
type BlobDataType = "services" | "workshops" | "best-practices" | "resources" | "landing-page" | "mail-config"

export async function GET(request: NextRequest) {
  try {
    // Überprüfe die Authentifizierung
    const authResult = await checkAuthAction()
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    // Hole den Datentyp aus der URL
    const { searchParams } = new URL(request.url)
    const dataType = searchParams.get("dataType") as BlobDataType | null

    if (!dataType) {
      return NextResponse.json({ error: "Datentyp fehlt" }, { status: 400 })
    }

    // Überprüfe, ob der Datentyp gültig ist
    const validDataTypes: BlobDataType[] = [
      "services",
      "workshops",
      "best-practices",
      "resources",
      "landing-page",
      "mail-config",
    ]
    if (!validDataTypes.includes(dataType)) {
      return NextResponse.json({ error: "Ungültiger Datentyp" }, { status: 400 })
    }

    // Liste alle Blobs im Pfad auf
    const prefix = `realcore-data/${dataType}/backup-`
    const { blobs } = await list({ prefix })

    // Extrahiere relevante Informationen
    const backups = blobs.map((blob) => {
      // Extrahiere Zeitstempel aus dem Dateinamen (backup-{timestamp})
      const nameParts = blob.pathname.split("/").pop()?.split(".")[0].split("-") || []
      const timestamp = Number.parseInt(nameParts[nameParts.length - 1]) || 0

      return {
        url: blob.url,
        name: blob.pathname.split("/").pop() || "",
        timestamp,
      }
    })

    // Sortiere nach Zeitstempel (neueste zuerst)
    backups.sort((a, b) => b.timestamp - a.timestamp)

    return NextResponse.json({ backups })
  } catch (error) {
    console.error("Fehler beim Auflisten der Backups:", error)
    return NextResponse.json({ error: "Fehler beim Auflisten der Backups" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Überprüfe die Authentifizierung
    const authResult = await checkAuthAction()
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    // Hole die Daten aus dem Request
    const data = await request.json()
    const { backupUrl, dataType } = data

    if (!backupUrl || !dataType) {
      return NextResponse.json({ error: "Backup-URL oder Datentyp fehlt" }, { status: 400 })
    }

    // Überprüfe, ob der Datentyp gültig ist
    const validDataTypes: BlobDataType[] = [
      "services",
      "workshops",
      "best-practices",
      "resources",
      "landing-page",
      "mail-config",
    ]
    if (!validDataTypes.includes(dataType)) {
      return NextResponse.json({ error: "Ungültiger Datentyp" }, { status: 400 })
    }

    // Hole die Daten vom Backup
    const response = await fetch(backupUrl)
    if (!response.ok) {
      return NextResponse.json({ error: "Backup nicht gefunden" }, { status: 404 })
    }

    const backupData = await response.json()

    // Speichere die Daten als aktuelle Version
    const blobPath = `realcore-data/${dataType}/data.json`
    await put(blobPath, JSON.stringify(backupData), {
      contentType: "application/json",
      access: "public",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Fehler beim Wiederherstellen des Backups:", error)
    return NextResponse.json({ error: "Fehler beim Wiederherstellen des Backups" }, { status: 500 })
  }
}
