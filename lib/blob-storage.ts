import { put, list, del } from "@vercel/blob"
import { revalidatePath } from "next/cache"

// Definiere die möglichen Datentypen für den Blob-Speicher
export type BlobDataType = "services" | "workshops" | "best-practices" | "resources" | "mail-config" | "landing-page"

/**
 * Ruft den Inhalt eines Blobs ab
 */
export async function getBlobContent(url: string): Promise<any> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching blob content:", error)
    throw error
  }
}

/**
 * Speichert eine Datei im Blob-Storage
 */
export async function uploadFile(
  file: File | Blob | ArrayBuffer | Buffer,
  filename: string,
  options?: {
    access?: "public" | "private"
    addRandomSuffix?: boolean
    contentType?: string
    multipart?: boolean
    revalidatePaths?: string[]
  },
) {
  try {
    // Standardoptionen
    const {
      access = "public",
      addRandomSuffix = true,
      contentType,
      multipart = false,
      revalidatePaths = [],
    } = options || {}

    // Füge einen Zeitstempel zum Dateinamen hinzu, um Caching-Probleme zu vermeiden
    const timestamp = Date.now()
    const filenameParts = filename.split(".")
    const extension = filenameParts.pop()
    const nameWithTimestamp = addRandomSuffix ? `${filenameParts.join(".")}_${timestamp}.${extension}` : filename

    // Speichere die Datei im Blob-Storage
    const blob = await put(nameWithTimestamp, file, {
      access,
      contentType,
      multipart,
    })

    console.log(`File uploaded to ${blob.url}`)

    // Revalidiere die angegebenen Pfade
    if (revalidatePaths.length > 0) {
      revalidatePaths.forEach((path) => {
        revalidatePath(path)
        console.log(`Revalidated path: ${path}`)
      })
    }

    return blob
  } catch (error) {
    console.error("Error uploading file to Blob storage:", error)
    throw error
  }
}

/**
 * Listet alle Dateien im Blob-Storage auf
 */
export async function listFiles(prefix?: string) {
  try {
    const { blobs } = await list({ prefix })
    return blobs
  } catch (error) {
    console.error("Error listing files from Blob storage:", error)
    throw error
  }
}

/**
 * Löscht eine Datei aus dem Blob-Storage
 */
export async function deleteFile(url: string, options?: { revalidatePaths?: string[] }) {
  try {
    const { revalidatePaths = [] } = options || {}
    await del(url)
    console.log(`File deleted: ${url}`)

    // Revalidiere die angegebenen Pfade
    if (revalidatePaths.length > 0) {
      revalidatePaths.forEach((path) => {
        revalidatePath(path)
        console.log(`Revalidated path: ${path}`)
      })
    }

    return true
  } catch (error) {
    console.error("Error deleting file from Blob storage:", error)
    throw error
  }
}

/**
 * Überprüft, ob ein Blob existiert
 */
export async function blobExists(key: string): Promise<{ url: string } | null> {
  try {
    const { blobs } = await list({ prefix: key })
    const exactMatch = blobs.find((blob) => blob.pathname === key)
    return exactMatch || null
  } catch (error) {
    console.error("Error checking if blob exists:", error)
    return null
  }
}
