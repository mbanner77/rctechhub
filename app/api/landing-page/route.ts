import { type NextRequest, NextResponse } from "next/server"
import FileManager from "../shared/file-manager";
import { revalidatePath } from "next/cache";
import { isAuthenticated, unauthorizedResponse } from "../shared/auth-utils";

const FileManagerInstance = FileManager.getInstance();
const BLOB_PATH = `realcore-data/landing-page/data.json`;
// Stellen Sie sicher, dass die Route dynamisch ist und kein Caching verwendet
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    console.log("[API] GET /api/landing-page aufgerufen")

    // Füge einen Cache-Buster-Parameter zur Anfrage hinzu
    const cacheBuster = new Date().getTime()
    console.log(`[API] Cache-Buster: ${cacheBuster}`)

    const landingPage = await FileManagerInstance.getFile(BLOB_PATH);
    if (!landingPage) {
      console.log("[API] Landing Page nicht gefunden")
      return NextResponse.json({ error: "Landing Page nicht gefunden" }, { status: 404 })
    }
    console.log("[API] Landing Page geladen, sende Antwort")

    // Setze strenge Cache-Control-Header
    return NextResponse.json(landingPage, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Surrogate-Control": "no-store",
        Pragma: "no-cache",
        Expires: "0",
        "X-Cache-Buster": cacheBuster.toString(),
      },
    })
  } catch (error) {
    console.error("[API] Fehler beim Laden der Landing Page:", error)
    return NextResponse.json({ error: "Fehler beim Laden der Landing Page" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[API] POST /api/landing-page aufgerufen")
    
    if (!isAuthenticated(request)) {
      return unauthorizedResponse();
    }

    const landingPage = await request.json()
    console.log("[API] Landing Page-Daten empfangen, speichere...")

    const success = await FileManagerInstance.uploadFile(landingPage, BLOB_PATH);

    revalidatePath("/admin/landing-page");
    if (success) {
      console.log("[API] Landing Page erfolgreich gespeichert")
      return NextResponse.json(
        {
          success: true,
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
            "Surrogate-Control": "no-store",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
      )
    } else {
      console.error("[API] Fehler beim Speichern der Landing Page")
      return NextResponse.json({ error: "Fehler beim Speichern der Landing Page" }, { status: 500 })
    }
  } catch (error) {
    console.error("[API] Fehler beim Speichern der Landing Page:", error)
    return NextResponse.json({ error: "Fehler beim Speichern der Landing Page" }, { status: 500 })
  }
}
