"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getContentByKey } from "@/lib/content-service"
import type { StructuredContent as StructuredContentType } from "@/types/content-management"

interface StructuredContentProps {
  contentKey: string
  defaultValue?: Record<string, any>
  render: (data: Record<string, any>) => React.ReactNode
}

export function StructuredContent({ contentKey, defaultValue = {}, render }: StructuredContentProps) {
  const [data, setData] = useState<Record<string, any>>(defaultValue)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchContent() {
      try {
        const content = await getContentByKey(contentKey, "structured")

        if (content && content.type === "structured") {
          const structuredContent = content as StructuredContentType
          setData(structuredContent.fields)
        } else {
          setData(defaultValue)
        }
      } catch (error) {
        console.error("Error fetching structured content:", error)
        setData(defaultValue)
      } finally {
        setIsLoading(false)
      }
    }

    fetchContent()
  }, [contentKey, defaultValue])

  return <>{isLoading ? render(defaultValue) : render(data)}</>
}
