"use client"

import { useState, useEffect } from "react"
import { fetchTextsByCategory } from "@/lib/cms-client"
import type { TextContent } from "@/types/simple-cms"

// Hook zum Abrufen von Textinhalten nach Kategorie
export function useCmsTexts(category: string) {
  const [texts, setTexts] = useState<TextContent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadTexts() {
      try {
        setIsLoading(true)
        const data = await fetchTextsByCategory(category)
        setTexts(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch texts"))
      } finally {
        setIsLoading(false)
      }
    }

    loadTexts()
  }, [category])

  return { texts, isLoading, error }
}

// Hook zum Abrufen eines einzelnen Textinhalts nach Schlüssel
export function useCmsText(key: string, defaultValue = "") {
  const [text, setText] = useState<string>(defaultValue)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadText() {
      try {
        setIsLoading(true)
        const category = key.split(".")[0]
        const data = await fetchTextsByCategory(category)
        const foundText = data.find((item) => item.key === key)
        setText(foundText?.value || defaultValue)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(`Failed to fetch text for key ${key}`))
        setText(defaultValue)
      } finally {
        setIsLoading(false)
      }
    }

    loadText()
  }, [key, defaultValue])

  return { text, isLoading, error }
}
