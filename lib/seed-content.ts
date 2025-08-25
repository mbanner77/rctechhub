import type { Content, TextContent, StructuredContent, SectionContent, PageContent } from "@/types/content-management"
import { saveContentItem } from "@/lib/content-db"

// Standardinhalte für die Anwendung
const defaultContents: Content[] = [
  // Textinhalte
  {
    id: "",
    type: "text",
    key: "example-page-title",
    value: "Beispielseite mit dynamischen Inhalten",
    description: "Titel der Beispielseite",
    category: "example",
    createdAt: "",
    updatedAt: "",
  } as TextContent,

  {
    id: "",
    type: "text",
    key: "example-page-intro",
    value:
      "Diese Seite demonstriert, wie dynamische Inhalte in der Anwendung verwendet werden können. Alle Texte und Strukturen können über das Content-Management-System bearbeitet werden.",
    description: "Einführungstext der Beispielseite",
    category: "example",
    createdAt: "",
    updatedAt: "",
  } as TextContent,

  {
    id: "",
    type: "text",
    key: "example-cta-title",
    value: "Bereit, Ihre Inhalte dynamisch zu gestalten?",
    description: "Titel des Call-to-Action-Bereichs",
    category: "example",
    createdAt: "",
    updatedAt: "",
  } as TextContent,

  {
    id: "",
    type: "text",
    key: "example-cta-description",
    value:
      "Mit unserem Content-Management-System können Sie alle Texte und Strukturen Ihrer Anwendung einfach und flexibel bearbeiten.",
    description: "Beschreibung des Call-to-Action-Bereichs",
    category: "example",
    createdAt: "",
    updatedAt: "",
  } as TextContent,

  {
    id: "",
    type: "text",
    key: "example-cta-button",
    value: "Jetzt starten",
    description: "Text des Call-to-Action-Buttons",
    category: "example",
    createdAt: "",
    updatedAt: "",
  } as TextContent,

  // Strukturierte Inhalte
  {
    id: "",
    type: "structured",
    key: "example-feature-1",
    fields: {
      title: "Dynamische Texte",
      description: "Bearbeiten Sie alle Texte Ihrer Anwendung über ein einfaches Content-Management-System.",
      icon: "FileText",
    },
    category: "example",
    createdAt: "",
    updatedAt: "",
  } as StructuredContent,

  {
    id: "",
    type: "structured",
    key: "example-feature-2",
    fields: {
      title: "Strukturierte Inhalte",
      description: "Verwalten Sie komplexe Inhaltsstrukturen mit mehreren Feldern und Beziehungen.",
      icon: "Layers",
    },
    category: "example",
    createdAt: "",
    updatedAt: "",
  } as StructuredContent,

  {
    id: "",
    type: "structured",
    key: "example-feature-3",
    fields: {
      title: "Seitenbasierte Inhalte",
      description: "Erstellen und verwalten Sie vollständige Seiten mit mehreren Sektionen und Inhalten.",
      icon: "Layout",
    },
    category: "example",
    createdAt: "",
    updatedAt: "",
  } as StructuredContent,

  // Beispielseite
  {
    id: "",
    type: "page",
    key: "example-page",
    title: "Beispielseite",
    path: "/example",
    sections: [
      {
        id: "",
        type: "section",
        key: "example-hero",
        title: "Hero-Bereich",
        items: [
          {
            id: "",
            type: "text",
            key: "example-page-title",
            value: "Beispielseite mit dynamischen Inhalten",
            description: "Titel der Beispielseite",
            category: "example",
            createdAt: "",
            updatedAt: "",
          } as TextContent,
          {
            id: "",
            type: "text",
            key: "example-page-intro",
            value:
              "Diese Seite demonstriert, wie dynamische Inhalte in der Anwendung verwendet werden können. Alle Texte und Strukturen können über das Content-Management-System bearbeitet werden.",
            description: "Einführungstext der Beispielseite",
            category: "example",
            createdAt: "",
            updatedAt: "",
          } as TextContent,
        ],
        category: "example",
        createdAt: "",
        updatedAt: "",
      } as SectionContent,
      {
        id: "",
        type: "section",
        key: "example-features",
        title: "Features",
        items: [
          {
            id: "",
            type: "structured",
            key: "example-feature-1",
            fields: {
              title: "Dynamische Texte",
              description: "Bearbeiten Sie alle Texte Ihrer Anwendung über ein einfaches Content-Management-System.",
              icon: "FileText",
            },
            category: "example",
            createdAt: "",
            updatedAt: "",
          } as StructuredContent,
          {
            id: "",
            type: "structured",
            key: "example-feature-2",
            fields: {
              title: "Strukturierte Inhalte",
              description: "Verwalten Sie komplexe Inhaltsstrukturen mit mehreren Feldern und Beziehungen.",
              icon: "Layers",
            },
            category: "example",
            createdAt: "",
            updatedAt: "",
          } as StructuredContent,
          {
            id: "",
            type: "structured",
            key: "example-feature-3",
            fields: {
              title: "Seitenbasierte Inhalte",
              description: "Erstellen und verwalten Sie vollständige Seiten mit mehreren Sektionen und Inhalten.",
              icon: "Layout",
            },
            category: "example",
            createdAt: "",
            updatedAt: "",
          } as StructuredContent,
        ],
        category: "example",
        createdAt: "",
        updatedAt: "",
      } as SectionContent,
      {
        id: "",
        type: "section",
        key: "example-cta",
        title: "Call to Action",
        items: [
          {
            id: "",
            type: "text",
            key: "example-cta-title",
            value: "Bereit, Ihre Inhalte dynamisch zu gestalten?",
            description: "Titel des Call-to-Action-Bereichs",
            category: "example",
            createdAt: "",
            updatedAt: "",
          } as TextContent,
          {
            id: "",
            type: "text",
            key: "example-cta-description",
            value:
              "Mit unserem Content-Management-System können Sie alle Texte und Strukturen Ihrer Anwendung einfach und flexibel bearbeiten.",
            description: "Beschreibung des Call-to-Action-Bereichs",
            category: "example",
            createdAt: "",
            updatedAt: "",
          } as TextContent,
          {
            id: "",
            type: "text",
            key: "example-cta-button",
            value: "Jetzt starten",
            description: "Text des Call-to-Action-Buttons",
            category: "example",
            createdAt: "",
            updatedAt: "",
          } as TextContent,
        ],
        category: "example",
        createdAt: "",
        updatedAt: "",
      } as SectionContent,
    ],
    isPublished: true,
    createdAt: "",
    updatedAt: "",
  } as PageContent,
]

// Funktion zum Initialisieren der Standardinhalte
export async function seedDefaultContent() {
  for (const content of defaultContents) {
    await saveContentItem(content)
  }
}
