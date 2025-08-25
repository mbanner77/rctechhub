"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface DynamicTextProps {
  contentKey: string
  defaultValue?: string
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export default function DynamicText({ contentKey, defaultValue = "", className = "", as = "span" }: DynamicTextProps) {
  const [text, setText] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch(`/api/content?type=text&key=${encodeURIComponent(contentKey)}`)
        if (response.ok) {
          const data = await response.json()
          if (data.length > 0) {
            setText(data[0].value)
          } else {
            setText(defaultValue)
          }
        } else {
          setText(defaultValue)
        }
      } catch (error) {
        console.error("Error fetching content:", error)
        setText(defaultValue)
      } finally {
        setIsLoading(false)
      }
    }

    fetchContent()
  }, [contentKey, defaultValue])

  const Component = as as any

  if (isLoading) {
    return <Skeleton className={`h-4 w-24 ${className}`} />
  }

  return <Component className={className}>{text}</Component>
}
