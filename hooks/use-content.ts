"use client"

import { useState, useEffect } from "react"
import type { Content, PageContent } from "@/types/content-management"
import { getContent, getContentByKey, getContentByCategory, getPageByPath } from "@/lib/content-service"

// Hook für Content-Item nach ID
export function useContent(id: string) {
  const [content, setContent] = useState<Content | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchContent() {
      setIsLoading(true)
      try {
        const data = await getContent(id)
        setContent(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch content"))
        setContent(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchContent()
  }, [id])

  return { content, isLoading, error }
}

// Hook für Content-Item nach Schlüssel und Typ
export function useContentByKey(key: string, type: string) {
  const [content, setContent] = useState<Content | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchContent() {
      setIsLoading(true)
      try {
        const data = await getContentByKey(key, type)
        setContent(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch content"))
        setContent(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchContent()
  }, [key, type])

  return { content, isLoading, error }
}

// Hook für Content-Items nach Kategorie
export function useContentByCategory(category: string) {
  const [contents, setContents] = useState<Content[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchContents() {
      setIsLoading(true)
      try {
        const data = await getContentByCategory(category)
        setContents(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch contents"))
        setContents([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchContents()
  }, [category])

  return { contents, isLoading, error }
}

// Hook für Seiteninhalt nach Pfad
export function usePageByPath(path: string, includeUnpublished = false) {
  const [page, setPage] = useState<PageContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchPage() {
      setIsLoading(true)
      try {
        const data = await getPageByPath(path, includeUnpublished)
        setPage(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch page"))
        setPage(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPage()
  }, [path, includeUnpublished])

  return { page, isLoading, error }
}
