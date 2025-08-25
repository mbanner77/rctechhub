import { NextResponse } from "next/server"
import { initCmsTable, seedDefaultTexts } from "@/lib/simple-cms-service"

export async function POST() {
  try {
    // Tabelle erstellen
    const tableCreated = await initCmsTable()
    if (!tableCreated) {
      return NextResponse.json({ error: "Failed to create CMS table" }, { status: 500 })
    }

    // Beispielinhalte erstellen
    const seeded = await seedDefaultTexts()
    if (!seeded) {
      return NextResponse.json({ error: "Failed to seed default texts" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "CMS initialized successfully with default texts",
    })
  } catch (error) {
    console.error("Error initializing CMS:", error)
    return NextResponse.json(
      {
        error: "Failed to initialize CMS",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
