import type { Content, PageContent, ContentSearchParams } from "@/types/content-management"

// Content-Item abrufen
export async function getContent(id: string): Promise<Content | null> {
  try {
    const response = await fetch(`/api/content?id=${id}`)

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch content: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching content:", error)
    return null
  }
}

// Content-Item nach Schlüssel abrufen
export async function getContentByKey(key: string, type: string): Promise<Content | null> {
  try {
    const response = await fetch(`/api/content?key=${encodeURIComponent(key)}&type=${encodeURIComponent(type)}`)

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch content: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching content by key:", error)
    return null
  }
}

// Content-Items nach Kategorie abrufen
export async function getContentByCategory(category: string): Promise<Content[]> {
  try {
    const response = await fetch(`/api/content?category=${encodeURIComponent(category)}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching content by category:", error)
    return []
  }
}

// Content-Item speichern
export async function saveContent(content: Content): Promise<Content | null> {
  try {
    const response = await fetch("/api/content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(content),
    })

    if (!response.ok) {
      throw new Error(`Failed to save content: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error saving content:", error)
    return null
  }
}

// Content-Item löschen
export async function deleteContent(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/content?id=${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`Failed to delete content: ${response.statusText}`)
    }

    const result = await response.json()
    return result.success
  } catch (error) {
    console.error("Error deleting content:", error)
    return false
  }
}

// Seiteninhalte abrufen
export async function getPages(includeUnpublished = false): Promise<PageContent[]> {
  try {
    const response = await fetch(`/api/content/pages?includeUnpublished=${includeUnpublished}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch pages: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching pages:", error)
    return []
  }
}

// Seiteninhalt nach Pfad abrufen
export async function getPageByPath(path: string, includeUnpublished = false): Promise<PageContent | null> {
  try {
    const response = await fetch(
      `/api/content/pages?path=${encodeURIComponent(path)}&includeUnpublished=${includeUnpublished}`,
    )

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch page: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching page by path:", error)
    return null
  }
}

// Seiteninhalt speichern
export async function savePage(page: PageContent): Promise<PageContent | null> {
  try {
    const response = await fetch("/api/content/pages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(page),
    })

    if (!response.ok) {
      throw new Error(`Failed to save page: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error saving page:", error)
    return null
  }
}

// Content-Items suchen
export async function searchContent(params: ContentSearchParams): Promise<Content[]> {
  try {
    const queryParams = new URLSearchParams()

    if (params.type) queryParams.set("type", params.type)
    if (params.key) queryParams.set("key", params.key)
    if (params.category) queryParams.set("category", params.category)
    if (params.query) queryParams.set("query", params.query)
    if (params.page) queryParams.set("page", params.page.toString())
    if (params.limit) queryParams.set("limit", params.limit.toString())

    const response = await fetch(`/api/content?${queryParams.toString()}`)

    if (!response.ok) {
      throw new Error(`Failed to search content: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error searching content:", error)
    return []
  }
}
