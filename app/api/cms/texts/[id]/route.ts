import { type NextRequest, NextResponse } from "next/server"
import { loadTexts, saveTexts, deleteText } from "@/lib/simple-cms-service"

// GET: Einzelnen Text abrufen
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const texts = loadTexts()
    const text = texts.find((t) => t.id === id)

    if (!text) {
      return NextResponse.json({ error: `Text with ID ${id} not found` }, { status: 404 })
    }

    return NextResponse.json(text)
  } catch (error) {
    console.error(`Error in GET /api/cms/texts/${params.id}:`, error)
    return NextResponse.json(
      { error: "Failed to fetch text", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// PUT: Text aktualisieren
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const updatedText = await request.json()

    // Validierung
    if (!updatedText.key || !updatedText.value || !updatedText.category) {
      return NextResponse.json({ error: "Invalid text data. Key, value, and category are required." }, { status: 400 })
    }

    // Sicherstellen, dass die ID übereinstimmt
    if (updatedText.id !== id) {
      return NextResponse.json({ error: "ID in URL does not match ID in request body" }, { status: 400 })
    }

    // Texte laden
    const texts = loadTexts()
    const index = texts.findIndex((t) => t.id === id)

    if (index === -1) {
      return NextResponse.json({ error: `Text with ID ${id} not found` }, { status: 404 })
    }

    // Text aktualisieren
    const now = new Date().toISOString()
    texts[index] = {
      ...updatedText,
      lastUpdated: now,
    }

    // Texte speichern
    const success = saveTexts(texts)

    if (!success) {
      return NextResponse.json({ error: "Failed to save updated text" }, { status: 500 })
    }

    return NextResponse.json(texts[index])
  } catch (error) {
    console.error(`Error in PUT /api/cms/texts/${params.id}:`, error)
    return NextResponse.json(
      { error: "Failed to update text", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// DELETE: Text löschen
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const success = deleteText(id)

    if (!success) {
      return NextResponse.json({ error: `Text with ID ${id} not found or could not be deleted` }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error in DELETE /api/cms/texts/${params.id}:`, error)
    return NextResponse.json(
      { error: "Failed to delete text", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
