import { NextRequest, NextResponse } from "next/server"
import { getMailConfig } from "@/lib/mail-config-service"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const cfg = await getMailConfig()

    const subject = `FlexLicense Anfrage – ${body?.contact?.company || "Unbekannt"}`
    const to = cfg.defaultTarget || "techhub@realcore.de"

    const discountHtml = Array.isArray(body?.discountTiers)
      ? body.discountTiers
          .map((t: any) => `ab Jahr ${t?.fromYear}: ${t?.percent}%`)
          .join(" · ")
      : "3% ab Jahr 3 · 5% ab Jahr 5 · 10% ab Jahr 10"

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
      <p><b>Betrieb:</b> ${body?.hosting ? "Ja" : "Nein"}</p>
      <p><b>Preisindex p.a.:</b> ${body?.priceIndexPct ?? 2}%</p>
      <p><b>Rabatte:</b> ${discountHtml}</p>
      <hr/>
      <p><b>Monatlich:</b> ${Number(body?.results?.monthly||0).toLocaleString("de-DE")} €</p>
      <p><b>Gesamt:</b> ${Number(body?.results?.total||0).toLocaleString("de-DE")} €</p>
      <p><b>NPV @10%:</b> ${Number(body?.results?.npv||0).toLocaleString("de-DE")} €</p>
      ${body?.contact?.message ? `<hr/><p><b>Nachricht:</b><br/>${body.contact.message}</p>` : ""}
    `

    // Build a base URL from request headers for internal fetches
    const proto = req.headers.get("x-forwarded-proto") || "http"
    const host = req.headers.get("host") || "localhost:3000"
    const baseUrl = `${proto}://${host}`

    // Send team mail
    const teamRes = await fetch(new URL("/api/send-email", baseUrl), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, html, testEmail: to }),
    })
    if (!teamRes.ok) {
      const msg = await teamRes.text().catch(()=>"")
      throw new Error(`Team-Mail fehlgeschlagen: ${teamRes.status} ${msg}`)
    }

    // Send customer confirmation if available
    if (body?.contact?.email) {
      const custRes = await fetch(new URL("/api/send-email", baseUrl), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: "Ihre FlexLicense Anfrage", html: `<p>Vielen Dank für Ihre Anfrage. Wir melden uns zeitnah.</p>${html}`, testEmail: body.contact.email }),
      })
      if (!custRes.ok) {
        const msg = await custRes.text().catch(()=>"")
        throw new Error(`Bestätigungs-Mail fehlgeschlagen: ${custRes.status} ${msg}`)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("/api/flexlicense/request error", e)
    return NextResponse.json({ ok: false, error: e?.message || "unknown" }, { status: 500 })
  }
}
