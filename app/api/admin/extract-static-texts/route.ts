import { NextResponse } from "next/server"
// import { neon } from "@neondatabase/serverless" // Removed Neon import
import { v4 as uuidv4 } from "uuid"

// Verbindung zur Datenbank herstellen
// const sql = neon(process.env.DATABASE_URL!) // Removed Neon SQL initialization

// In-memory storage for demonstration purposes.  Replace with actual blob storage.
const contentStore: { [key: string]: any } = {}

// Funktion zum Erstellen der Tabelle, falls sie nicht existiert
async function ensureContentTable() {
  try {
    // No table creation needed for blob storage
    console.log("Content table checked/created successfully (simulated)")
    return true
  } catch (error) {
    console.error("Error creating content table:", error)
    return false
  }
}

// Funktion zum Speichern eines Textinhalts
async function saveTextContent(key: string, value: string, category: string, description = "") {
  try {
    const id = uuidv4()
    const now = new Date().toISOString()

    // Prüfen, ob der Inhalt bereits existiert
    // const existingContent = await sql`
    //   SELECT id FROM content WHERE type = 'text' AND key = ${key}
    // `
    const existingContentKey = `text:${key}`
    const existingContent = contentStore[existingContentKey]

    if (existingContent) {
      // Inhalt aktualisieren
      // await sql`
      //   UPDATE content
      //   SET value = ${value}, description = ${description}, category = ${category}, updated_at = ${now}
      //   WHERE id = ${existingContent[0].id}
      // `
      contentStore[existingContentKey] = {
        id: existingContent.id,
        type: "text",
        key: key,
        value: value,
        description: description,
        category: category,
        updated_at: now,
        created_at: existingContent.created_at,
      }
      return existingContent.id
    } else {
      // Neuen Inhalt erstellen
      // await sql`
      //   INSERT INTO content (id, type, key, value, description, category, created_at, updated_at)
      //   VALUES (${id}, 'text', ${key}, ${value}, ${description}, ${category}, ${now}, ${now})
      // `
      contentStore[existingContentKey] = {
        id: id,
        type: "text",
        key: key,
        value: value,
        description: description,
        category: category,
        created_at: now,
        updated_at: now,
      }
      return id
    }
  } catch (error) {
    console.error(`Error saving text content for key ${key}:`, error)
    throw error
  }
}

// Statische Texte aus der Anwendung extrahieren
async function extractStaticTexts() {
  console.log("Starting extraction of static texts")

  // Hier würden wir normalerweise die Texte aus den Dateien extrahieren
  // Für dieses Beispiel definieren wir einige Beispieltexte

  const staticTexts = [
    // Allgemeine Texte
    { key: "app.title", value: "Realcore BTP Portal", category: "general", description: "Titel der Anwendung" },
    {
      key: "app.description",
      value: "Ihr Portal für SAP BTP Services und Lösungen",
      category: "general",
      description: "Beschreibung der Anwendung",
    },

    // Navigation
    { key: "nav.home", value: "Startseite", category: "navigation", description: "Navigationspunkt Startseite" },
    { key: "nav.services", value: "Services", category: "navigation", description: "Navigationspunkt Services" },
    { key: "nav.templates", value: "Templates", category: "navigation", description: "Navigationspunkt Templates" },
    { key: "nav.pathfinder", value: "Pathfinder", category: "navigation", description: "Navigationspunkt Pathfinder" },
    { key: "nav.contact", value: "Kontakt", category: "navigation", description: "Navigationspunkt Kontakt" },

    // Buttons
    { key: "button.submit", value: "Absenden", category: "buttons", description: "Text für Absenden-Button" },
    { key: "button.cancel", value: "Abbrechen", category: "buttons", description: "Text für Abbrechen-Button" },
    { key: "button.save", value: "Speichern", category: "buttons", description: "Text für Speichern-Button" },
    { key: "button.delete", value: "Löschen", category: "buttons", description: "Text für Löschen-Button" },
    { key: "button.edit", value: "Bearbeiten", category: "buttons", description: "Text für Bearbeiten-Button" },
    { key: "button.details", value: "Details", category: "buttons", description: "Text für Details-Button" },
    { key: "button.contact", value: "Kontakt aufnehmen", category: "buttons", description: "Text für Kontakt-Button" },

    // Landing Page
    {
      key: "landing.hero.title",
      value: "Digitale Transformation mit SAP BTP",
      category: "landing",
      description: "Titel des Hero-Bereichs",
    },
    {
      key: "landing.hero.subtitle",
      value: "Beschleunigen Sie Ihre digitale Reise mit unseren maßgeschneiderten Lösungen",
      category: "landing",
      description: "Untertitel des Hero-Bereichs",
    },
    {
      key: "landing.features.title",
      value: "Unsere Services",
      category: "landing",
      description: "Titel des Features-Bereichs",
    },
    {
      key: "landing.features.subtitle",
      value: "Entdecken Sie unsere umfassenden Dienstleistungen",
      category: "landing",
      description: "Untertitel des Features-Bereichs",
    },

    // Services
    { key: "services.title", value: "BTP Services", category: "services", description: "Titel der Services-Seite" },
    {
      key: "services.description",
      value: "Entdecken Sie unsere umfassenden SAP BTP Services",
      category: "services",
      description: "Beschreibung der Services-Seite",
    },

    // Templates
    { key: "templates.title", value: "BTP Templates", category: "templates", description: "Titel der Templates-Seite" },
    {
      key: "templates.description",
      value: "Vorgefertigte Lösungen für Ihre BTP-Projekte",
      category: "templates",
      description: "Beschreibung der Templates-Seite",
    },

    // Pathfinder
    {
      key: "pathfinder.title",
      value: "Pathfinder Units",
      category: "pathfinder",
      description: "Titel der Pathfinder-Seite",
    },
    {
      key: "pathfinder.description",
      value: "Spezialisierte Teams für Ihre digitale Transformation",
      category: "pathfinder",
      description: "Beschreibung der Pathfinder-Seite",
    },

    // Formulare
    { key: "form.name", value: "Name", category: "forms", description: "Bezeichnung für Namensfeld" },
    { key: "form.email", value: "E-Mail", category: "forms", description: "Bezeichnung für E-Mail-Feld" },
    { key: "form.phone", value: "Telefon", category: "forms", description: "Bezeichnung für Telefonfeld" },
    { key: "form.message", value: "Nachricht", category: "forms", description: "Bezeichnung für Nachrichtenfeld" },
    { key: "form.company", value: "Unternehmen", category: "forms", description: "Bezeichnung für Unternehmensfeld" },

    // Fehlermeldungen
    {
      key: "error.required",
      value: "Dieses Feld ist erforderlich",
      category: "errors",
      description: "Fehlermeldung für erforderliche Felder",
    },
    {
      key: "error.invalid_email",
      value: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
      category: "errors",
      description: "Fehlermeldung für ungültige E-Mail",
    },
    {
      key: "error.server",
      value: "Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
      category: "errors",
      description: "Fehlermeldung für Serverfehler",
    },

    // Erfolgsmeldungen
    {
      key: "success.form_submitted",
      value: "Vielen Dank! Ihre Anfrage wurde erfolgreich übermittelt.",
      category: "success",
      description: "Erfolgsmeldung für Formularübermittlung",
    },
    {
      key: "success.saved",
      value: "Die Änderungen wurden erfolgreich gespeichert.",
      category: "success",
      description: "Erfolgsmeldung für Speichern",
    },

    // Footer
    {
      key: "footer.copyright",
      value: "© 2023 Realcore. Alle Rechte vorbehalten.",
      category: "footer",
      description: "Copyright-Hinweis im Footer",
    },
    { key: "footer.privacy", value: "Datenschutz", category: "footer", description: "Link zum Datenschutz im Footer" },
    { key: "footer.terms", value: "AGB", category: "footer", description: "Link zu den AGB im Footer" },
    { key: "footer.imprint", value: "Impressum", category: "footer", description: "Link zum Impressum im Footer" },
  ]

  console.log(`Preparing to save ${staticTexts.length} static texts`)

  // Texte in die Datenbank speichern
  const savedIds = []
  for (const text of staticTexts) {
    try {
      const id = await saveTextContent(text.key, text.value, text.category, text.description)
      savedIds.push(id)
    } catch (error) {
      console.error(`Failed to save text with key ${text.key}:`, error)
    }
  }

  console.log(`Successfully saved ${savedIds.length} of ${staticTexts.length} static texts`)
  return savedIds.length
}

export async function POST() {
  try {
    console.log("POST /api/admin/extract-static-texts - Starting request")

    // Sicherstellen, dass die Tabelle existiert
    const tableCreated = await ensureContentTable()
    if (!tableCreated) {
      return NextResponse.json({ error: "Failed to ensure content table exists" }, { status: 500 })
    }

    // Statische Texte extrahieren und speichern
    const count = await extractStaticTexts()

    return NextResponse.json({ success: true, count })
  } catch (error) {
    console.error("Error extracting static texts:", error)
    return NextResponse.json(
      { error: "Failed to extract static texts", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
