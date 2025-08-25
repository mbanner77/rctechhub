"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getContentByKey } from "@/lib/content-service"
import type { TextContent, StructuredContent } from "@/types/content-management"

interface DynamicContentProps {
  contentKey: string
  type?: "text" | "structured"
  defaultValue?: string | React.ReactNode
  className?: string
  as?: React.ElementType
  field?: string // Nur für strukturierte Inhalte
}

export function DynamicContent({
  contentKey,
  type = "text",
  defaultValue = "",
  className = "",
  as: Component = "div",
  field,
}: DynamicContentProps) {
  const [content, setContent] = useState<string | React.ReactNode>(defaultValue)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchContent() {
      try {
        const data = await getContentByKey(contentKey, type)

        if (data) {
          if (type === "text") {
            const textContent = data as TextContent
            setContent(textContent.value)
          } else if (type === "structured" && field) {
            const structuredContent = data as StructuredContent
            const fieldValue = structuredContent.fields[field]
            setContent(fieldValue ? String(fieldValue) : defaultValue)
          } else {
            setContent(defaultValue)
          }
        } else {
          setContent(defaultValue)
        }
      } catch (error) {
        console.error("Error fetching content:", error)
        setContent(defaultValue)
      } finally {
        setIsLoading(false)
      }
    }

    fetchContent()
  }, [contentKey, type, field, defaultValue])

  return <Component className={className}>{isLoading ? defaultValue : content}</Component>
}
