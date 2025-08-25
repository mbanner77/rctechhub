import type { TextContent, TextSearchParams } from "@/types/simple-cms"

// Alle Textinhalte abrufen
export async function fetchAllTexts(): Promise<TextContent[]> {
  try {
    const response = await fetch("/api/cms/texts", {
      cache: "no-store",
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch texts: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching texts:", error)
    return []
  }
}

// Textinhalte nach Kategorie abrufen
export async function fetchTextsByCategory(category: string): Promise<TextContent[]> {
  try {
    const response = await fetch(`/api/cms/texts?category=${encodeURIComponent(category)}`, {
      cache: "no-store",
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch texts for category ${category}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error fetching texts for category ${category}:`, error)
    return []
  }
}

// Textinhalte suchen
export async function searchTexts(params: TextSearchParams): Promise<TextContent[]> {
  try {
    const searchParams = new URLSearchParams()
    if (params.query) searchParams.append("query", params.query)
    if (params.category) searchParams.append("category", params.category)
    if (params.key) searchParams.append("key", params.key)

    const response = await fetch(`/api/cms/texts?${searchParams.toString()}`, {
      cache: "no-store",
    })
    if (!response.ok) {
      throw new Error(`Failed to search texts: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error searching texts:", error)
    return []
  }
}

// Textinhalt speichern
export async function saveText(text: TextContent): Promise<TextContent> {
  try {
    const response = await fetch("/api/cms/texts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(text),
    })

    if (!response.ok) {
      throw new Error(`Failed to save text: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error saving text:", error)
    throw error
  }
}

// Textinhalt löschen
export async function deleteText(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/cms/texts/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`Failed to delete text: ${response.statusText}`)
    }

    const result = await response.json()
    return result.success
  } catch (error) {
    console.error(`Error deleting text with id ${id}:`, error)
    return false
  }
}

// CMS initialisieren
export async function initializeCms(): Promise<boolean> {
  try {
    const response = await fetch("/api/cms/init", {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error(`Failed to initialize CMS: ${response.statusText}`)
    }

    const result = await response.json()
    return result.success
  } catch (error) {
    console.error("Error initializing CMS:", error)
    return false
  }
}
