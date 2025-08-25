import { NextResponse } from "next/server"
import { resetAllData } from "@/lib/unified-data-service"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

export async function POST() {
  try {
    const success = await resetAllData()

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Fehler beim Zurücksetzen der Daten" }, { status: 500 })
    }
  } catch (error) {
    console.error("Fehler beim Zurücksetzen der Daten:", error)
    return NextResponse.json({ error: "Fehler beim Zurücksetzen der Daten" }, { status: 500 })
  }
}
