"use client"

import type React from "react"

import { usePageByPath } from "@/hooks/use-content"
import type {
  PageContent as PageContentType,
  SectionContent,
  TextContent,
  StructuredContent,
} from "@/types/content-management"

interface PageContentProps {
  path: string
  includeUnpublished?: boolean
  fallback?: React.ReactNode
}

export function PageContent({ path, includeUnpublished = false, fallback }: PageContentProps) {
  const { page, isLoading, error } = usePageByPath(path, includeUnpublished)

  if (isLoading) {
    return <div>Lade Inhalte...</div>
  }

  if (error || !page) {
    return fallback ? <>{fallback}</> : <div>Inhalt nicht gefunden</div>
  }

  return <PageContentRenderer page={page} />
}

interface PageContentRendererProps {
  page: PageContentType
}

function PageContentRenderer({ page }: PageContentRendererProps) {
  return (
    <div>
      <h1>{page.title}</h1>
      {page.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </div>
  )
}

interface SectionRendererProps {
  section: SectionContent
}

function SectionRenderer({ section }: SectionRendererProps) {
  return (
    <section>
      <h2>{section.title}</h2>
      <div>
        {section.items.map((item) => {
          if (item.type === "text") {
            return <TextRenderer key={item.id} content={item as TextContent} />
          } else if (item.type === "structured") {
            return <StructuredRenderer key={item.id} content={item as StructuredContent} />
          }
          return null
        })}
      </div>
    </section>
  )
}

interface TextRendererProps {
  content: TextContent
}

function TextRenderer({ content }: TextRendererProps) {
  return <div>{content.value}</div>
}

interface StructuredRendererProps {
  content: StructuredContent
}

function StructuredRenderer({ content }: StructuredRendererProps) {
  return (
    <div>
      {Object.entries(content.fields).map(([key, value]) => (
        <div key={key}>
          <strong>{key}:</strong> {String(value)}
        </div>
      ))}
    </div>
  )
}
