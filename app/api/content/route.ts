import { NextResponse } from "next/server"

// GET-Anfrage zum Abrufen von Inhalten
export async function GET(request: Request) {
  try {
    console.log("GET /api/content - Starting request")

    // Datenbank-Verbindung entfernen, da keine Datenbank mehr verwendet wird
    console.log("Database connection test skipped")

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const key = searchParams.get("key")
    const category = searchParams.get("category")
    const query = searchParams.get("query")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    console.log("Search params:", { type, key, category, query, page, limit })

    // Abfrage aufbauen (angepasst für Blob Storage - Beispiel)
    // Hier müsste die Logik für den Zugriff auf den Blob Storage implementiert werden
    // und die Filterung der Daten anhand der Suchparameter erfolgen.
    // Da kein konkreter Blob Storage Mechanismus vorgegeben ist, wird hier ein Platzhalter verwendet.

    console.log("Query string and params are not applicable for Blob Storage")

    // Abfrage ausführen (angepasst für Blob Storage - Beispiel)
    // Hier müsste der Zugriff auf den Blob Storage erfolgen und die Daten abgerufen werden.
    // Da kein konkreter Blob Storage Mechanismus vorgegeben ist, wird hier ein Platzhalter verwendet.
    const contents = [] // Hier sollten die Daten aus dem Blob Storage geladen werden

    console.log(`Found ${contents?.length || 0} content items`)

    // Ergebnisse transformieren
    const transformedContents = contents.map((row: any) => {
      try {
        const content: any = {
          id: row.id,
          type: row.type || "unknown",
          key: row.key || "",
          category: row.category || "",
          createdAt: row.createdAt || new Date().toISOString(),
          updatedAt: row.updatedAt || new Date().toISOString(),
        }

        if (row.type === "text") {
          content.value = row.value || ""
          content.description = row.description || ""
        } else if (row.type === "structured") {
          content.fields = row.fields || {}
        }

        return content
      } catch (transformError) {
        console.error("Error transforming row:", transformError, row)
        // Rückgabe eines Platzhalters bei Transformationsfehlern
        return {
          id: row.id || "error",
          type: "error",
          key: "error-transforming-data",
          category: "error",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          error: transformError instanceof Error ? transformError.message : "Unknown transform error",
        }
      }
    })

    return NextResponse.json(transformedContents)
  } catch (error) {
    console.error("Error fetching content:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch content",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

// POST-Anfrage zum Speichern von Inhalten
export async function POST(request: Request) {
  try {
    console.log("POST /api/content - Starting request")

    // Datenbank-Verbindung entfernen, da keine Datenbank mehr verwendet wird
    console.log("Database connection test skipped")

    let content
    try {
      content = await request.json()
      console.log("Received content:", content)
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return NextResponse.json(
        {
          error: "Invalid request body",
          message: parseError instanceof Error ? parseError.message : "Could not parse request body",
        },
        { status: 400 },
      )
    }

    // Validierung
    if (!content || !content.type || !content.key) {
      return NextResponse.json({ error: "Invalid content data", message: "Type and key are required" }, { status: 400 })
    }

    const id = content.id || crypto.randomUUID()
    const now = new Date().toISOString()

    try {
      // Hier müsste die Logik für das Speichern im Blob Storage implementiert werden
      // Anstelle der SQL-Abfragen.
      // Da kein konkreter Blob Storage Mechanismus vorgegeben ist, wird hier ein Platzhalter verwendet.
      console.log("Saving content to Blob Storage (placeholder)")

      // Beispiel:
      // await blobStorage.save(id, content);
    } catch (insertError) {
      console.error("Error inserting/updating content:", insertError)
      return NextResponse.json(
        {
          error: "Failed to save content",
          message: insertError instanceof Error ? insertError.message : "Database operation failed",
        },
        { status: 500 },
      )
    }

    // Gespeicherten Inhalt zurückgeben
    try {
      // Hier müsste die Logik für das Abrufen aus dem Blob Storage implementiert werden
      // Anstelle der SQL-Abfragen.
      // Da kein konkreter Blob Storage Mechanismus vorgegeben ist, wird hier ein Platzhalter verwendet.
      console.log("Retrieving saved content from Blob Storage (placeholder)")

      // Beispiel:
      // const savedContent = await blobStorage.get(id);
      const savedContent = content // Platzhalter

      if (!savedContent) {
        return NextResponse.json({ error: "Failed to retrieve saved content" }, { status: 500 })
      }

      const result: any = {
        id: id,
        type: savedContent.type,
        key: savedContent.key,
        category: savedContent.category || "",
        createdAt: now,
        updatedAt: now,
      }

      if (savedContent.type === "text") {
        result.value = savedContent.value || ""
        result.description = savedContent.description || ""
      } else if (savedContent.type === "structured") {
        result.fields = savedContent.fields || {}
      }

      return NextResponse.json(result)
    } catch (retrieveError) {
      console.error("Error retrieving saved content:", retrieveError)

      // Fallback: Gib zumindest die Eingabedaten zurück
      return NextResponse.json({
        ...content,
        id,
        createdAt: now,
        updatedAt: now,
        _warning: "Content was saved but could not be retrieved from the database",
      })
    }
  } catch (error) {
    console.error("Error saving content:", error)
    return NextResponse.json(
      {
        error: "Failed to save content",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
