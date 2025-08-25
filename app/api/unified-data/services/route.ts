import { type NextRequest, NextResponse } from "next/server"
import { getServices, saveServices } from "@/lib/unified-data-service"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

export async function GET() {
  try {
    const services = await getServices()
    return NextResponse.json(services, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Surrogate-Control": "no-store",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Fehler beim Laden der Services:", error)
    return NextResponse.json({ error: "Fehler beim Laden der Services" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const services = await request.json()
    const success = await saveServices(services)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Fehler beim Speichern der Services" }, { status: 500 })
    }
  } catch (error) {
    console.error("Fehler beim Speichern der Services:", error)
    return NextResponse.json({ error: "Fehler beim Speichern der Services" }, { status: 500 })
  }
}
