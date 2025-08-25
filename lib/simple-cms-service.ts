import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import type { TextContent, TextSearchParams } from "@/types/simple-cms"

// Pfad zur JSON-Datei, in der die Texte gespeichert werden
const DATA_DIR = path.join(process.cwd(), "data")
const CMS_FILE = path.join(DATA_DIR, "cms-texts.json")

// Standardtexte für das CMS
const defaultTexts: TextContent[] = [
  {
    id: "welcome-title",
    key: "landing.hero.title",
    value: "Willkommen bei RealCore BTP Portal",
    description: "Titel für den Hero-Bereich der Startseite",
    category: "landing",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "welcome-subtitle",
    key: "landing.hero.subtitle",
    value: "Ihr Partner für SAP Business Technology Platform",
    description: "Untertitel für den Hero-Bereich der Startseite",
    category: "landing",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "about-title",
    key: "landing.about.title",
    value: "Über uns",
    description: "Titel für den Über-uns-Bereich",
    category: "landing",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "about-description",
    key: "landing.about.description",
    value: "RealCore ist Ihr zuverlässiger Partner für die Implementierung und Optimierung von SAP BTP-Lösungen.",
    description: "Beschreibung für den Über-uns-Bereich",
    category: "landing",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "btp-services-title",
    key: "btp.services.title",
    value: "BTP Services",
    description: "Titel für die BTP-Services-Seite",
    category: "btp",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "btp-services-description",
    key: "btp.services.description",
    value: "Entdecken Sie die vielfältigen Möglichkeiten der SAP Business Technology Platform.",
    description: "Beschreibung für die BTP-Services-Seite",
    category: "btp",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "pathfinder-title",
    key: "pathfinder.title",
    value: "Pathfinder Units",
    description: "Titel für die Pathfinder-Units-Seite",
    category: "pathfinder",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "pathfinder-description",
    key: "pathfinder.description",
    value: "Unsere spezialisierten Teams führen Sie durch die digitale Transformation.",
    description: "Beschreibung für die Pathfinder-Units-Seite",
    category: "pathfinder",
    lastUpdated: new Date().toISOString(),
  },
]

// Funktion zum Erstellen des Datenverzeichnisses, falls es nicht existiert
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// Funktion zum Erstellen der CMS-Datei, falls sie nicht existiert
export function initCmsTable(): boolean {
  try {
    ensureDataDir()

    if (!fs.existsSync(CMS_FILE)) {
      fs.writeFileSync(CMS_FILE, JSON.stringify([]))
    }

    return true
  } catch (error) {
    console.error("Fehler beim Initialisieren der CMS-Tabelle:", error)
    return false
  }
}

// Funktion zum Laden der Texte
export function loadTexts(): TextContent[] {
  try {
    ensureDataDir()

    if (!fs.existsSync(CMS_FILE)) {
      return []
    }

    const data = fs.readFileSync(CMS_FILE, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Fehler beim Laden der Texte:", error)
    return []
  }
}

// Funktion zum Speichern der Texte
export function saveTexts(texts: TextContent[]): boolean {
  try {
    ensureDataDir()
    fs.writeFileSync(CMS_FILE, JSON.stringify(texts, null, 2))
    return true
  } catch (error) {
    console.error("Fehler beim Speichern der Texte:", error)
    return false
  }
}

// Funktion zum Speichern eines einzelnen Texts
export function saveText(text: TextContent): TextContent {
  const texts = loadTexts()
  const now = new Date().toISOString()

  // Wenn keine ID vorhanden ist, generiere eine
  if (!text.id) {
    text.id = uuidv4()
  }

  // Setze das lastUpdated-Feld
  text.lastUpdated = now

  // Suche nach einem vorhandenen Text mit der gleichen ID
  const index = texts.findIndex((t) => t.id === text.id)

  if (index !== -1) {
    // Aktualisiere den vorhandenen Text
    texts[index] = text
  } else {
    // Füge einen neuen Text hinzu
    texts.push(text)
  }

  // Speichere die Texte
  saveTexts(texts)

  return text
}

// Funktion zum Löschen eines Texts
export function deleteText(id: string): boolean {
  const texts = loadTexts()
  const index = texts.findIndex((t) => t.id === id)

  if (index === -1) {
    return false
  }

  texts.splice(index, 1)
  return saveTexts(texts)
}

// Funktion zum Suchen von Texten
export function searchTexts(params: TextSearchParams): TextContent[] {
  const texts = loadTexts()
  let results = [...texts]

  if (params.query) {
    const query = params.query.toLowerCase()
    results = results.filter(
      (text) =>
        text.key.toLowerCase().includes(query) ||
        text.value.toLowerCase().includes(query) ||
        (text.description && text.description.toLowerCase().includes(query)),
    )
  }

  if (params.category) {
    results = results.filter((text) => text.category === params.category)
  }

  if (params.key) {
    results = results.filter((text) => text.key === params.key)
  }

  return results
}

// Funktion zum Einfügen der Standardtexte
export function seedDefaultTexts(): boolean {
  try {
    ensureDataDir()

    // Lade vorhandene Texte
    const existingTexts = loadTexts()

    // Füge nur Standardtexte hinzu, die noch nicht existieren
    const textsToAdd = defaultTexts.filter(
      (defaultText) => !existingTexts.some((existingText) => existingText.key === defaultText.key),
    )

    if (textsToAdd.length === 0) {
      return true // Keine neuen Texte hinzuzufügen
    }

    // Kombiniere vorhandene und neue Texte
    const allTexts = [...existingTexts, ...textsToAdd]

    // Speichere alle Texte
    return saveTexts(allTexts)
  } catch (error) {
    console.error("Fehler beim Einfügen der Standardtexte:", error)
    return false
  }
}
