import type { Content, PageContent, ContentSearchParams } from "@/types/content-management"
import { getPool } from "@/lib/pg"

const CONTENT_ITEMS_PREFIX = "content-items/"
const PAGE_CONTENTS_PREFIX = "page-contents/"

// Helpers for KV
async function kvGetJson(key: string): Promise<any | null> {
  const pool = getPool()
  const res = await pool.query(
    `SELECT value FROM kv_store WHERE key = $1 AND COALESCE(is_binary, FALSE) = FALSE`,
    [key],
  )
  return res.rowCount ? res.rows[0].value : null
}

async function kvUpsertJson(key: string, value: any, contentType = "application/json") {
  const pool = getPool()
  await pool.query(
    `INSERT INTO kv_store(key, value, content_type, is_binary)
     VALUES ($1, $2::jsonb, $3, FALSE)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, content_type = EXCLUDED.content_type, is_binary = FALSE, updated_at = NOW()`,
    [key, JSON.stringify(value), contentType],
  )
}

async function kvDelete(key: string) {
  const pool = getPool()
  await pool.query(`DELETE FROM kv_store WHERE key = $1`, [key])
}

async function kvListPrefix(prefix: string): Promise<{ key: string; value: any }[]> {
  const pool = getPool()
  const res = await pool.query(
    `SELECT key, value FROM kv_store WHERE key LIKE $1 AND COALESCE(is_binary, FALSE) = FALSE`,
    [prefix.replace(/%/g, '\\%') + '%'],
  )
  return res.rows.map((r: any) => ({ key: r.key, value: r.value }))
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

    // Backup previous if exists
    const existing = await kvGetJson(key)
    if (existing) {
      const backupKey = `${PAGE_CONTENTS_PREFIX}backups/${pageContent.id}_${Date.now()}.json`
      await kvUpsertJson(backupKey, existing)
    }
    // Save
    await kvUpsertJson(key, pageContent)
    // Index by path
    const pathKey = `${PAGE_CONTENTS_PREFIX}paths/${encodeURIComponent(pageContent.path)}.json`
    await kvUpsertJson(pathKey, { id: pageContent.id })
  } else {
    const key = `${CONTENT_ITEMS_PREFIX}${content.id}.json`

    const existing = await kvGetJson(key)
    if (existing) {
      const backupKey = `${CONTENT_ITEMS_PREFIX}backups/${content.id}_${Date.now()}.json`
      await kvUpsertJson(backupKey, existing)
    }
    await kvUpsertJson(key, content)
    const keyKey = `${CONTENT_ITEMS_PREFIX}keys/${content.type}/${encodeURIComponent((content as any).key)}.json`
    await kvUpsertJson(keyKey, { id: content.id })
  }

  return content
}

// Content-Item abrufen
export async function getContentItem(id: string): Promise<Content | null> {
  try {
    // content_items
    const contentItemKey = `${CONTENT_ITEMS_PREFIX}${id}.json`
    const contentItem = (await kvGetJson(contentItemKey)) as Content | null
    if (contentItem) return contentItem

    // page_contents
    const pageContentKey = `${PAGE_CONTENTS_PREFIX}${id}.json`
    const pageContent = (await kvGetJson(pageContentKey)) as PageContent | null
    if (pageContent) return pageContent

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
      // scan pages
      const entries = await kvListPrefix(PAGE_CONTENTS_PREFIX)
      for (const e of entries) {
        if (!e.key.includes("/backups/") && !e.key.includes("/paths/")) {
          const content = e.value as PageContent
          if ((content as any)?.key === key) return content
        }
      }
    } else {
      // Versuche, den Eintrag über den Index zu finden
      const keyKey = `${CONTENT_ITEMS_PREFIX}keys/${type}/${encodeURIComponent(key)}.json`
      const mapping = await kvGetJson(keyKey)
      if (mapping?.id) return await getContentItem(mapping.id)
      // Fallback: scan
      const entries = await kvListPrefix(CONTENT_ITEMS_PREFIX)
      for (const e of entries) {
        if (!e.key.includes("/backups/") && !e.key.includes("/keys/")) {
          const content = e.value as Content
          if (content.type === type && (content as any).key === key) return content
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
    const entries = await kvListPrefix(CONTENT_ITEMS_PREFIX)
    const contents: Content[] = []
    for (const e of entries) {
      if (!e.key.includes("/backups/") && !e.key.includes("/keys/")) {
        const content = e.value as Content
        if ((content as any).category === category) contents.push(content)
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
    const entries = await kvListPrefix(PAGE_CONTENTS_PREFIX)
    const pages: PageContent[] = []
    for (const e of entries) {
      if (!e.key.includes("/backups/") && !e.key.includes("/paths/")) {
        const page = e.value as PageContent
        if (includeUnpublished || (page as any)?.isPublished) pages.push(page)
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
    // via index
    const pathKey = `${PAGE_CONTENTS_PREFIX}paths/${encodeURIComponent(path)}.json`
    const mapping = await kvGetJson(pathKey)
    if (mapping?.id) return (await getContentItem(mapping.id)) as PageContent
    // fallback scan
    const entries = await kvListPrefix(PAGE_CONTENTS_PREFIX)
    for (const e of entries) {
      if (!e.key.includes("/backups/") && !e.key.includes("/paths/")) {
        const page = e.value as PageContent
        if ((page as any)?.path === path) return page
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
    // Try content item
    const contentItemKey = `${CONTENT_ITEMS_PREFIX}${id}.json`
    const contentItem = await kvGetJson(contentItemKey)
    if (contentItem) {
      const backupKey = `${CONTENT_ITEMS_PREFIX}backups/${id}_${Date.now()}.json`
      await kvUpsertJson(backupKey, contentItem)
      await kvDelete(contentItemKey)
      const content = contentItem as Content
      if ((content as any)?.type && (content as any).key) {
        const keyKey = `${CONTENT_ITEMS_PREFIX}keys/${(content as any).type}/${encodeURIComponent((content as any).key)}.json`
        try { await kvDelete(keyKey) } catch {}
      }
      return true
    }

    // Try page
    const pageContentKey = `${PAGE_CONTENTS_PREFIX}${id}.json`
    const pageContent = await kvGetJson(pageContentKey)
    if (pageContent) {
      const backupKey = `${PAGE_CONTENTS_PREFIX}backups/${id}_${Date.now()}.json`
      await kvUpsertJson(backupKey, pageContent)
      await kvDelete(pageContentKey)
      const page = pageContent as PageContent
      if ((page as any)?.path) {
        const pathKey = `${PAGE_CONTENTS_PREFIX}paths/${encodeURIComponent((page as any).path)}.json`
        try { await kvDelete(pathKey) } catch {}
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
      const entries = await kvListPrefix(CONTENT_ITEMS_PREFIX)
      for (const e of entries) {
        if (!e.key.includes("/backups/") && !e.key.includes("/keys/")) {
          allContents.push(e.value as Content)
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
