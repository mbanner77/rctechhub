import { put, list, del } from "@vercel/blob"
import type { Content, PageContent, ContentSearchParams } from "@/types/content-management"

const CONTENT_ITEMS_PREFIX = "content-items/"
const PAGE_CONTENTS_PREFIX = "page-contents/"

// Hilfsfunktion zum Abrufen eines Blobs
async function getBlobContent(url: string): Promise<any> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching blob:", error)
    throw error
  }
}

// Hilfsfunktion zum Überprüfen, ob ein Blob existiert
async function blobExists(key: string): Promise<{ url: string } | null> {
  try {
    const { blobs } = await list({ prefix: key })
    const exactMatch = blobs.find((blob) => blob.pathname === key)
    return exactMatch || null
  } catch (error) {
    console.error("Error checking if blob exists:", error)
    return null
  }
}

// Content-Item speichern
export async function saveContentItem(content: Content): Promise<Content> {
  const now = new Date().toISOString()

  if (!content.id) {
    content.id = crypto.randomUUID()
    content.createdAt = now
  }

  content.updatedAt = now

  if (content.type === "page") {
    const pageContent = content as PageContent
    const key = `${PAGE_CONTENTS_PREFIX}${pageContent.id}.json`

    // Speichere ein Backup, falls die Datei bereits existiert
    try {
      const existingBlob = await blobExists(key)
      if (existingBlob) {
        const backupKey = `${PAGE_CONTENTS_PREFIX}backups/${pageContent.id}_${Date.now()}.json`
        const existingContent = await getBlobContent(existingBlob.url)
        await put(backupKey, JSON.stringify(existingContent), { access: "public" })
      }
    } catch (error) {
      console.warn("No existing page content to backup:", error)
    }

    // Speichere die neue Version
    await put(key, JSON.stringify(pageContent), { access: "public" })

    // Speichere auch einen Eintrag nach Pfad für schnelleren Zugriff
    const pathKey = `${PAGE_CONTENTS_PREFIX}paths/${encodeURIComponent(pageContent.path)}.json`
    await put(pathKey, JSON.stringify({ id: pageContent.id }), { access: "public" })
  } else {
    const key = `${CONTENT_ITEMS_PREFIX}${content.id}.json`

    // Speichere ein Backup, falls die Datei bereits existiert
    try {
      const existingBlob = await blobExists(key)
      if (existingBlob) {
        const backupKey = `${CONTENT_ITEMS_PREFIX}backups/${content.id}_${Date.now()}.json`
        const existingContent = await getBlobContent(existingBlob.url)
        await put(backupKey, JSON.stringify(existingContent), { access: "public" })
      }
    } catch (error) {
      console.warn("No existing content item to backup:", error)
    }

    // Speichere die neue Version
    await put(key, JSON.stringify(content), { access: "public" })

    // Speichere auch einen Eintrag nach Schlüssel für schnelleren Zugriff
    const keyKey = `${CONTENT_ITEMS_PREFIX}keys/${content.type}/${encodeURIComponent((content as any).key)}.json`
    await put(keyKey, JSON.stringify({ id: content.id }), { access: "public" })
  }

  return content
}

// Content-Item abrufen
export async function getContentItem(id: string): Promise<Content | null> {
  try {
    // Zuerst in content_items suchen
    const contentItemKey = `${CONTENT_ITEMS_PREFIX}${id}.json`
    const contentItemBlob = await blobExists(contentItemKey)

    if (contentItemBlob) {
      const content = (await getBlobContent(contentItemBlob.url)) as Content
      return content
    }

    // Dann in page_contents suchen
    const pageContentKey = `${PAGE_CONTENTS_PREFIX}${id}.json`
    const pageContentBlob = await blobExists(pageContentKey)

    if (pageContentBlob) {
      const pageContent = (await getBlobContent(pageContentBlob.url)) as PageContent
      return pageContent
    }

    return null
  } catch (error) {
    console.error("Error fetching content item:", error)
    return null
  }
}

// Content-Item nach Schlüssel abrufen
export async function getContentByKey(key: string, type: string): Promise<Content | null> {
  try {
    if (type === "page") {
      // Suche nach Seite mit diesem Schlüssel
      const { blobs } = await list({ prefix: PAGE_CONTENTS_PREFIX })

      for (const blob of blobs) {
        if (!blob.pathname.includes("/backups/") && !blob.pathname.includes("/paths/")) {
          try {
            const content = (await getBlobContent(blob.url)) as PageContent
            if (content.key === key) {
              return content
            }
          } catch (error) {
            console.warn("Error parsing page content:", error)
          }
        }
      }
    } else {
      // Versuche, den Eintrag über den Index zu finden
      const keyKey = `${CONTENT_ITEMS_PREFIX}keys/${type}/${encodeURIComponent(key)}.json`
      const keyBlob = await blobExists(keyKey)

      if (keyBlob) {
        const { id } = await getBlobContent(keyBlob.url)
        return await getContentItem(id)
      }

      // Fallback: Durchsuche alle Inhalte
      const { blobs } = await list({ prefix: CONTENT_ITEMS_PREFIX })

      for (const blob of blobs) {
        if (!blob.pathname.includes("/backups/") && !blob.pathname.includes("/keys/")) {
          try {
            const content = (await getBlobContent(blob.url)) as Content
            if (content.type === type && (content as any).key === key) {
              return content
            }
          } catch (error) {
            console.warn("Error parsing content item:", error)
          }
        }
      }
    }

    return null
  } catch (error) {
    console.error("Error fetching content by key:", error)
    return null
  }
}

// Content-Items nach Kategorie abrufen
export async function getContentByCategory(category: string): Promise<Content[]> {
  try {
    const { blobs } = await list({ prefix: CONTENT_ITEMS_PREFIX })
    const contents: Content[] = []

    for (const blob of blobs) {
      if (!blob.pathname.includes("/backups/") && !blob.pathname.includes("/keys/")) {
        try {
          const content = (await getBlobContent(blob.url)) as Content
          if ((content as any).category === category) {
            contents.push(content)
          }
        } catch (error) {
          console.warn("Error parsing content item:", error)
        }
      }
    }

    return contents
  } catch (error) {
    console.error("Error fetching content by category:", error)
    return []
  }
}

// Alle Seiteninhalte abrufen
export async function getAllPages(includeUnpublished = false): Promise<PageContent[]> {
  try {
    const { blobs } = await list({ prefix: PAGE_CONTENTS_PREFIX })
    const pages: PageContent[] = []

    for (const blob of blobs) {
      if (!blob.pathname.includes("/backups/") && !blob.pathname.includes("/paths/")) {
        try {
          const page = (await getBlobContent(blob.url)) as PageContent
          if (includeUnpublished || page.isPublished) {
            pages.push(page)
          }
        } catch (error) {
          console.warn("Error parsing page content:", error)
        }
      }
    }

    return pages
  } catch (error) {
    console.error("Error fetching all pages:", error)
    return []
  }
}

// Seiteninhalt nach Pfad abrufen
export async function getPageByPath(path: string): Promise<PageContent | null> {
  try {
    // Versuche, den Eintrag über den Index zu finden
    const pathKey = `${PAGE_CONTENTS_PREFIX}paths/${encodeURIComponent(path)}.json`
    const pathBlob = await blobExists(pathKey)

    if (pathBlob) {
      const { id } = await getBlobContent(pathBlob.url)
      const page = (await getContentItem(id)) as PageContent
      return page
    }

    // Fallback: Durchsuche alle Seiten
    const { blobs } = await list({ prefix: PAGE_CONTENTS_PREFIX })

    for (const blob of blobs) {
      if (!blob.pathname.includes("/backups/") && !blob.pathname.includes("/paths/")) {
        try {
          const page = (await getBlobContent(blob.url)) as PageContent
          if (page.path === path) {
            return page
          }
        } catch (error) {
          console.warn("Error parsing page content:", error)
        }
      }
    }

    return null
  } catch (error) {
    console.error("Error fetching page by path:", error)
    return null
  }
}

// Content-Item löschen
export async function deleteContentItem(id: string): Promise<boolean> {
  try {
    // Versuche, das Content-Item zu löschen
    const contentItemKey = `${CONTENT_ITEMS_PREFIX}${id}.json`
    const contentItemBlob = await blobExists(contentItemKey)

    if (contentItemBlob) {
      // Erstelle ein Backup
      const backupKey = `${CONTENT_ITEMS_PREFIX}backups/${id}_${Date.now()}.json`
      const existingContent = await getBlobContent(contentItemBlob.url)
      await put(backupKey, JSON.stringify(existingContent), { access: "public" })

      // Lösche das Original
      await del(contentItemKey)

      // Lösche auch den Schlüssel-Index, falls vorhanden
      const content = existingContent as Content
      if (content.type && (content as any).key) {
        const keyKey = `${CONTENT_ITEMS_PREFIX}keys/${content.type}/${encodeURIComponent((content as any).key)}.json`
        try {
          await del(keyKey)
        } catch (error) {
          console.warn("Error deleting key index:", error)
        }
      }

      return true
    }

    // Versuche, die Seite zu löschen
    const pageContentKey = `${PAGE_CONTENTS_PREFIX}${id}.json`
    const pageContentBlob = await blobExists(pageContentKey)

    if (pageContentBlob) {
      // Erstelle ein Backup
      const backupKey = `${PAGE_CONTENTS_PREFIX}backups/${id}_${Date.now()}.json`
      const existingContent = await getBlobContent(pageContentBlob.url)
      await put(backupKey, JSON.stringify(existingContent), { access: "public" })

      // Lösche das Original
      await del(pageContentKey)

      // Lösche auch den Pfad-Index, falls vorhanden
      const page = existingContent as PageContent
      if (page.path) {
        const pathKey = `${PAGE_CONTENTS_PREFIX}paths/${encodeURIComponent(page.path)}.json`
        try {
          await del(pathKey)
        } catch (error) {
          console.warn("Error deleting path index:", error)
        }
      }

      return true
    }

    return false
  } catch (error) {
    console.error("Error deleting content item:", error)
    return false
  }
}

// Content-Items suchen
export async function searchContent(params: ContentSearchParams): Promise<Content[]> {
  try {
    const { type, key, category, query, page = 1, limit = 20 } = params
    const offset = (page - 1) * limit

    let allContents: Content[] = []

    if (type === "page") {
      const pages = await getAllPages(true)
      allContents = pages
    } else {
      const { blobs } = await list({ prefix: CONTENT_ITEMS_PREFIX })

      for (const blob of blobs) {
        if (!blob.pathname.includes("/backups/") && !blob.pathname.includes("/keys/")) {
          try {
            const content = (await getBlobContent(blob.url)) as Content
            allContents.push(content)
          } catch (error) {
            console.warn("Error parsing content item:", error)
          }
        }
      }
    }

    // Filtere die Inhalte
    let filteredContents = allContents

    if (type) {
      filteredContents = filteredContents.filter((content) => content.type === type)
    }

    if (key) {
      filteredContents = filteredContents.filter(
        (content) => (content as any).key && (content as any).key.toLowerCase().includes(key.toLowerCase()),
      )
    }

    if (category) {
      filteredContents = filteredContents.filter(
        (content) =>
          (content as any).category && (content as any).category.toLowerCase().includes(category.toLowerCase()),
      )
    }

    if (query) {
      filteredContents = filteredContents.filter((content) =>
        JSON.stringify(content).toLowerCase().includes(query.toLowerCase()),
      )
    }

    // Sortiere nach updatedAt (neueste zuerst)
    filteredContents.sort((a, b) => {
      const dateA = new Date(a.updatedAt || 0).getTime()
      const dateB = new Date(b.updatedAt || 0).getTime()
      return dateB - dateA
    })

    // Paginiere die Ergebnisse
    return filteredContents.slice(offset, offset + limit)
  } catch (error) {
    console.error("Error searching content:", error)
    return []
  }
}
