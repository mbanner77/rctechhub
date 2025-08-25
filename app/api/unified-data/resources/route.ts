import { type NextRequest, NextResponse } from "next/server"
import { getResources, saveResources } from "@/lib/unified-data-service"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

export async function GET() {
  try {
    const resources = await getResources()
    return NextResponse.json(resources, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Surrogate-Control": "no-store",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Fehler beim Laden der Resources:", error)
    return NextResponse.json({ error: "Fehler beim Laden der Resources" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const resources = await request.json()
    const success = await saveResources(resources)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Fehler beim Speichern der Resources" }, { status: 500 })
    }
  } catch (error) {
    console.error("Fehler beim Speichern der Resources:", error)
    return NextResponse.json({ error: "Fehler beim Speichern der Resources" }, { status: 500 })
  }
}
