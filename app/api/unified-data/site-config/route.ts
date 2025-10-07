import { type NextRequest, NextResponse } from "next/server"
import { getSiteConfig, saveSiteConfig } from "@/lib/site-config-service"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

export async function GET() {
  try {
    const cfg = await getSiteConfig()
    return NextResponse.json(cfg, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Surrogate-Control": "no-store",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Fehler beim Laden der Site Config:", error)
    return NextResponse.json({ error: "Fehler beim Laden der Site Config" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const success = await saveSiteConfig({ currency: body?.currency === "CHF" ? "CHF" : "EUR" })
    if (success) {
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: "Fehler beim Speichern der Site Config" }, { status: 500 })
  } catch (error) {
    console.error("Fehler beim Speichern der Site Config:", error)
    return NextResponse.json({ error: "Fehler beim Speichern der Site Config" }, { status: 500 })
  }
}
