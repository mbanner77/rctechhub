import { type NextRequest, NextResponse } from "next/server"
import { getMailConfig, saveMailConfig } from "@/lib/mail-config-service"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

export async function GET() {
  try {
    const mailConfig = await getMailConfig()
    return NextResponse.json(mailConfig, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Surrogate-Control": "no-store",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Fehler beim Laden der Mail-Konfiguration:", error)
    return NextResponse.json({ error: "Fehler beim Laden der Mail-Konfiguration" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const mailConfig = await request.json()
    const success = await saveMailConfig(mailConfig)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Fehler beim Speichern der Mail-Konfiguration" }, { status: 500 })
    }
  } catch (error) {
    console.error("Fehler beim Speichern der Mail-Konfiguration:", error)
    return NextResponse.json({ error: "Fehler beim Speichern der Mail-Konfiguration" }, { status: 500 })
  }
}
