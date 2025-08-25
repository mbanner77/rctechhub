// Basistyp für alle Textinhalte
export interface TextContent {
  id: string
  key: string
  value: string
  description?: string
  category: string
  lastUpdated: string
}

// Gruppierung von Textinhalten nach Kategorien
export interface TextCategory {
  id: string
  name: string
  description?: string
  items: TextContent[]
}

// Gesamte CMS-Datenstruktur
export interface CmsData {
  texts: TextContent[]
  lastUpdated: string
}

// Suchparameter für Texte
export interface TextSearchParams {
  query?: string
  category?: string
  key?: string
}
