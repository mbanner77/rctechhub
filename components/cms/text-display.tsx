"use client"

import { useState, useEffect } from "react"
import { fetchTextsByCategory } from "@/lib/cms-client"
import { Skeleton } from "@/components/ui/skeleton"
import type { JSX } from "react"

interface TextDisplayProps {
  textKey: string
  defaultValue?: string
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export default function TextDisplay({
  textKey,
  defaultValue = "",
  className = "",
  as: Component = "span",
}: TextDisplayProps) {
  const [text, setText] = useState(defaultValue)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadText() {
      try {
        setIsLoading(true)
        const category = textKey.split(".")[0]
        const data = await fetchTextsByCategory(category)
        const foundText = data.find((item) => item.key === textKey)
        setText(foundText?.value || defaultValue)
      } catch (error) {
        console.error(`Error loading text for key ${textKey}:`, error)
        setText(defaultValue)
      } finally {
        setIsLoading(false)
      }
    }

    loadText()
  }, [textKey, defaultValue])

  if (isLoading) {
    return <Skeleton className={`h-4 w-24 ${className}`} />
  }

  return <Component className={className}>{text}</Component>
}
