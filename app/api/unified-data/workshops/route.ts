import { type NextRequest, NextResponse } from "next/server"
import { getWorkshops, saveWorkshops } from "@/lib/unified-data-service"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

export async function GET() {
  try {
    const workshops = await getWorkshops()
    return NextResponse.json(workshops, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Surrogate-Control": "no-store",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Fehler beim Laden der Workshops:", error)
    return NextResponse.json({ error: "Fehler beim Laden der Workshops" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const workshops = await request.json()
    const success = await saveWorkshops(workshops)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Fehler beim Speichern der Workshops" }, { status: 500 })
    }
  } catch (error) {
    console.error("Fehler beim Speichern der Workshops:", error)
    return NextResponse.json({ error: "Fehler beim Speichern der Workshops" }, { status: 500 })
  }
}
