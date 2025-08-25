"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getPageByPath } from "@/lib/content-service"
import type { PageContent } from "@/types/content-management"

interface DynamicPageProps {
  path: string
  fallback?: React.ReactNode
  renderPage: (page: PageContent) => React.ReactNode
}

export function DynamicPage({ path, fallback, renderPage }: DynamicPageProps) {
  const [page, setPage] = useState<PageContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchPage() {
      try {
        const data = await getPageByPath(path)
        setPage(data)
      } catch (error) {
        console.error("Error fetching page:", error)
        setPage(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPage()
  }, [path])

  if (isLoading) {
    return <div>Lade Inhalte...</div>
  }

  if (!page) {
    return fallback ? <>{fallback}</> : <div>Seite nicht gefunden</div>
  }

  return <>{renderPage(page)}</>
}
