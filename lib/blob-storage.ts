import { getPool } from "@/lib/pg"

// Definiere die möglichen Datentypen (für bestehende Aufrufer)
export type BlobDataType = "services" | "workshops" | "best-practices" | "resources" | "mail-config" | "landing-page"

export type BlobListItem = { pathname: string; url: string; uploadedAt?: string; size?: number }

// Interne Helper
function toKey(name: string) {
  return name.replace(/^\/+/, "")
}

function isJsonContentType(ct?: string) {
  return !ct || ct.includes("application/json")
}

export async function getBlobContent(url: string): Promise<any> {
  // Versuche, Key aus unserer internen Files-Route zu extrahieren
  try {
    const marker = "/api/files/"
    const idx = url.indexOf(marker)
    if (idx !== -1) {
      const key = decodeURIComponent(url.substring(idx + marker.length))
      const pool = getPool()
      const res = await pool.query(
        `SELECT value, is_binary FROM kv_store WHERE key = $1`,
        [key],
      )
      if (!res.rowCount) throw new Error("Not found")
      const row = res.rows[0]
      if (row.is_binary) throw new Error("Binary content cannot be parsed as JSON")
      return row.value
    }
  } catch (e) {
    // Fallback auf fetch
  }
  const response = await fetch(url, { cache: "no-store" })
  if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`)
  return await response.json()
}

// Kompatible put-Funktion
export async function put(
  name: string,
  data: string | ArrayBuffer | Buffer | Blob,
  options?: {
    contentType?: string;
    access?: "public" | "private";
    allowOverwrite?: boolean;
    addRandomSuffix?: boolean; // ignored for compatibility
    cacheControlMaxAge?: number; // ignored for compatibility
  },
) {
  const key = toKey(name)
  const pool = getPool()
  const ct = options?.contentType || "application/json"
  const isBinary = !isJsonContentType(ct)
  // Normalize to Buffer for size & storage
  let buf: Buffer
  if (typeof data === "string") {
    buf = Buffer.from(data, "utf8")
  } else if (Buffer.isBuffer(data)) {
    buf = data
  } else if (data instanceof ArrayBuffer) {
    buf = Buffer.from(new Uint8Array(data))
  } else if (typeof Blob !== "undefined" && data instanceof Blob) {
    const ab = await data.arrayBuffer()
    buf = Buffer.from(new Uint8Array(ab))
  } else {
    buf = Buffer.from(data as any)
  }
  const value = isBinary
    ? JSON.stringify({ base64: buf.toString("base64") })
    : buf.toString("utf8")

  // Wenn JSON, sicherstellen dass valid JSON gespeichert wird
  const payload = isBinary ? value : JSON.stringify(JSON.parse(value))

  await pool.query(
    `INSERT INTO kv_store(key, value, content_type, is_binary)
     VALUES ($1, $2::jsonb, $3, $4)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, content_type = EXCLUDED.content_type, is_binary = EXCLUDED.is_binary, updated_at = NOW()`,
    [key, payload, ct, isBinary],
  )

  return { url: `/api/files/${encodeURIComponent(key)}`, pathname: key }
}

// Kompatible list-Funktion
export async function list(args?: { prefix?: string; limit?: number }): Promise<{ blobs: BlobListItem[] }> {
  const prefix = args?.prefix ? toKey(args.prefix) : ""
  const limit = args?.limit && args.limit > 0 ? Math.min(args.limit, 1000) : undefined
  const pool = getPool()
  const params: any[] = [prefix.replace(/%/g, '\\%') + '%']
  if (limit) params.push(limit)
  const res = await pool.query(
    `SELECT key, updated_at, value, is_binary FROM kv_store WHERE key LIKE $1 ORDER BY updated_at DESC, key ASC ${limit ? 'LIMIT $2' : ''}`,
    params,
  )
  const blobs: BlobListItem[] = res.rows.map((r: any) => {
    let size: number | undefined
    try {
      if (r.is_binary) {
        const obj = r.value as { base64?: string }
        const b64 = obj?.base64 || ""
        // approximate decoded size
        size = Math.floor((b64.length * 3) / 4)
      } else {
        const s = JSON.stringify(r.value)
        size = Buffer.byteLength(s, "utf8")
      }
    } catch {
      size = undefined
    }
    return {
      pathname: r.key,
      url: `/api/files/${encodeURIComponent(r.key)}`,
      uploadedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
      size,
    }
  })
  return { blobs }
}

// Kompatible del-Funktion
export async function del(nameOrKey: string): Promise<{ ok: boolean }> {
  const key = toKey(nameOrKey)
  const pool = getPool()
  await pool.query(`DELETE FROM kv_store WHERE key = $1`, [key])
  return { ok: true }
}

export async function blobExists(key: string): Promise<{ url: string } | null> {
  const pool = getPool()
  const res = await pool.query(`SELECT 1 FROM kv_store WHERE key = $1`, [toKey(key)])
  return res.rowCount ? { url: `/api/files/${encodeURIComponent(toKey(key))}` } : null
}
