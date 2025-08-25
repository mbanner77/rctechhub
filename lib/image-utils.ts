/**
 * Normalisiert einen Bildpfad, um sicherzustellen, dass er korrekt formatiert ist
 */
export function normalizeImagePath(path: string | null | undefined): string {
  if (!path) return "/abstract-colorful-swirls.png"

  // Wenn der Pfad bereits eine URL ist, gib ihn zurück
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }

  // Stelle sicher, dass der Pfad mit einem Schrägstrich beginnt
  if (!path.startsWith("/")) {
    return `/${path}`
  }

  return path
}

/**
 * Prüft, ob ein Bild existiert
 */
export async function checkImageExists(path: string): Promise<boolean> {
  try {
    const response = await fetch(path, { method: "HEAD" })
    return response.ok
  } catch (error) {
    return false
  }
}

/**
 * Generiert ein Platzhalter-Bild mit den angegebenen Dimensionen
 */
export function generatePlaceholderImage(width: number, height: number, text: string): string {
  return `/placeholder.svg?height=${height}&width=${width}&query=${encodeURIComponent(text)}`
}
