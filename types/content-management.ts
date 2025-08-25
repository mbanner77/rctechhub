// Basistyp für alle Content-Elemente
export interface ContentItem {
  id: string
  type: string
  createdAt: string
  updatedAt: string
}

// Einfaches Textelement
export interface TextContent extends ContentItem {
  type: "text"
  key: string
  value: string
  description?: string
  category: string
}

// Komplexes Textelement mit mehreren Feldern
export interface StructuredContent extends ContentItem {
  type: "structured"
  key: string
  fields: {
    [key: string]: string | number | boolean | string[] | null
  }
  category: string
}

// Sektion mit mehreren Inhalten
export interface SectionContent extends ContentItem {
  type: "section"
  key: string
  title: string
  items: (TextContent | StructuredContent)[]
  category: string
}

// Seiteninhalt
export interface PageContent extends ContentItem {
  type: "page"
  key: string
  title: string
  sections: SectionContent[]
  path: string
  isPublished: boolean
}

// Alle Content-Typen
export type Content = TextContent | StructuredContent | SectionContent | PageContent

// Content-Kategorie für die Organisation
export interface ContentCategory {
  id: string
  name: string
  description?: string
  parentId?: string
}

// Content-Suche
export interface ContentSearchParams {
  type?: string
  key?: string
  category?: string
  query?: string
  page?: number
  limit?: number
}

// Content-Management-Konfiguration
export interface ContentConfig {
  categories: ContentCategory[]
  defaultLanguage: string
  supportedLanguages: string[]
}
