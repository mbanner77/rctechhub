"use client"

import type React from "react"

import { useContentByKey } from "@/hooks/use-content"
import type { TextContent, StructuredContent } from "@/types/content-management"

interface ContentDisplayProps {
  contentKey: string
  type?: "text" | "structured"
  defaultValue?: string | React.ReactNode
  className?: string
  as?: React.ElementType
}

export function ContentDisplay({
  contentKey,
  type = "text",
  defaultValue = "",
  className = "",
  as: Component = "div",
}: ContentDisplayProps) {
  const { content, isLoading, error } = useContentByKey(contentKey, type)

  if (isLoading) {
    return <Component className={className}>{defaultValue}</Component>
  }

  if (error || !content) {
    return <Component className={className}>{defaultValue}</Component>
  }

  if (content.type === "text") {
    const textContent = content as TextContent
    return <Component className={className}>{textContent.value}</Component>
  }

  if (content.type === "structured") {
    const structuredContent = content as StructuredContent
    // Für strukturierte Inhalte geben wir einfach den ersten Feldwert zurück
    // In einer realen Anwendung würde man hier mehr Logik implementieren
    const firstValue = Object.values(structuredContent.fields)[0]
    return <Component className={className}>{String(firstValue)}</Component>
  }

  return <Component className={className}>{defaultValue}</Component>
}
