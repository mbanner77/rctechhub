import { NextRequest, NextResponse } from "next/server"
import { getMailConfig } from "@/lib/mail-config-service"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const cfg = await getMailConfig()

    const subject = `FlexLicense Anfrage – ${body?.contact?.company || "Unbekannt"}`
    const to = cfg.defaultTarget || "techhub@realcore.de"

    const html = `
      <h2>FlexLicense Anfrage</h2>
      <p><b>Name:</b> ${body?.contact?.name || "-"}</p>
      <p><b>Firma:</b> ${body?.contact?.company || "-"}</p>
      <p><b>E-Mail:</b> ${body?.contact?.email || "-"}</p>
      <p><b>Telefon:</b> ${body?.contact?.phone || "-"}</p>
      <hr/>
      <p><b>Projektvolumen:</b> ${body?.projectVolume?.toLocaleString("de-DE")} €</p>
      <p><b>Laufzeit:</b> ${body?.termYears} Jahre</p>
      <p><b>SLA:</b> ${body?.sla}</p>
      <p><b>Hosting:</b> ${body?.hosting ? "Ja" : "Nein"}</p>
      <p><b>Preisindex p.a.:</b> ${body?.priceIndexPct}%</p>
      <p><b>Rabatt:</b> ${body?.discountPct}% ab Jahr ${body?.discountStartYear}</p>
      <hr/>
      <p><b>Monatlich:</b> ${Number(body?.results?.monthly||0).toLocaleString("de-DE")} €</p>
      <p><b>Gesamt:</b> ${Number(body?.results?.total||0).toLocaleString("de-DE")} €</p>
      <p><b>NPV @10%:</b> ${Number(body?.results?.npv||0).toLocaleString("de-DE")} €</p>
      ${body?.contact?.message ? `<hr/><p><b>Nachricht:</b><br/>${body.contact.message}</p>` : ""}
    `

    // Use existing mail API (best-effort)
    try {
      await fetch(new URL("/api/send-email", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, html, testEmail: to }),
      })
    } catch (e) {
      console.warn("/api/flexlicense/request: team email failed", e)
    }

    try {
      if (body?.contact?.email) {
        await fetch(new URL("/api/send-email", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject: "Ihre FlexLicense Anfrage", html: `<p>Vielen Dank für Ihre Anfrage. Wir melden uns zeitnah.</p>${html}` , testEmail: body.contact.email }),
        })
      }
    } catch (e) {
      console.warn("/api/flexlicense/request: confirmation email failed", e)
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("/api/flexlicense/request error", e)
    return NextResponse.json({ ok: false, error: e?.message || "unknown" }, { status: 500 })
  }
}
