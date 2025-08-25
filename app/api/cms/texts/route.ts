import { type NextRequest, NextResponse } from "next/server"
import { loadTexts, saveText, searchTexts } from "@/lib/simple-cms-service"
import type { TextSearchParams } from "@/types/simple-cms"

// GET: Texte abrufen oder suchen
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Suchparameter extrahieren
    const params: TextSearchParams = {}
    if (searchParams.has("query")) params.query = searchParams.get("query") as string
    if (searchParams.has("category")) params.category = searchParams.get("category") as string
    if (searchParams.has("key")) params.key = searchParams.get("key") as string

    // Wenn Suchparameter vorhanden sind, suchen wir nach Texten
    if (Object.keys(params).length > 0) {
      const results = await searchTexts(params)
      return NextResponse.json(results)
    }

    // Ansonsten geben wir alle Texte zurück
    const texts = await loadTexts()
    return NextResponse.json(texts)
  } catch (error) {
    console.error("Error in GET /api/cms/texts:", error)
    return NextResponse.json(
      { error: "Failed to fetch texts", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// POST: Text speichern oder aktualisieren
export async function POST(request: NextRequest) {
  try {
    const text = await request.json()

    // Validierung
    if (!text.key || !text.value || !text.category) {
      return NextResponse.json({ error: "Invalid text data. Key, value, and category are required." }, { status: 400 })
    }

    // Text speichern
    const savedText = await saveText(text)

    return NextResponse.json(savedText)
  } catch (error) {
    console.error("Error in POST /api/cms/texts:", error)
    return NextResponse.json(
      { error: "Failed to save text", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
