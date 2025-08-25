import { NextRequest, NextResponse } from "next/server"
import { getMailConfig, saveMailConfig } from "@/lib/mail-config-service"
import { sendMail } from "@/app/api/mail/mail-service"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { testEmail, config } = await request.json()
    
    if (!testEmail || typeof testEmail !== "string") {
      return NextResponse.json({ 
        error: "Test-E-Mail-Adresse ist erforderlich" 
      }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json({ 
        error: "Ungültige E-Mail-Adresse" 
      }, { status: 400 })
    }

    // Use provided config or get current config
    let mailConfig = config || await getMailConfig()
    
    // If config is provided, temporarily save it for testing
    if (config) {
      await saveMailConfig(config)
      mailConfig = config
    }

    // Check if mail is enabled
    if (!mailConfig.enabled) {
      return NextResponse.json({ 
        error: "E-Mail-Funktion ist nicht aktiviert" 
      }, { status: 400 })
    }

    // Send test email
    const testContent = {
      subject: "Test Mail Configuration",
      html: `
        <h2>Test Email</h2>
        <p>This is a test email to verify the mail configuration.</p>
        <p><strong>Test Email:</strong> ${testEmail}</p>
        <p><strong>Sent from:</strong> ${mailConfig.defaultFrom}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <hr>
        <p><small>This email was sent from the realcore techhub mail configuration test.</small></p>
      `,
    }

    await sendMail(testEmail, testContent)
    
    return NextResponse.json({ 
      success: true, 
      message: `Test-E-Mail wurde erfolgreich an ${testEmail} gesendet` 
    })
  } catch (error) {
    console.error("Fehler beim Testen der Mail-Konfiguration:", error)
    return NextResponse.json({ 
      error: `Fehler beim Testen der Mail-Konfiguration: ${error instanceof Error ? error.message : "Unbekannter Fehler"}` 
    }, { status: 500 })
  }
}
