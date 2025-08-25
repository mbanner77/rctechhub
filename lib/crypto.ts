"use server"

import { randomBytes, createCipheriv, createDecipheriv } from "crypto"

// In einer echten Anwendung sollte dieser Schlüssel sicher gespeichert werden
// z.B. in einer Umgebungsvariable
const ENCRYPTION_KEY = "realcore-admin-encryption-key-32char"
const ALGORITHM = "aes-256-cbc"

export async function encrypt(text: string): Promise<string> {
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv)

  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")

  return `${iv.toString("hex")}:${encrypted}`
}

export async function decrypt(text: string): Promise<string> {
  const [ivHex, encryptedText] = text.split(":")
  const iv = Buffer.from(ivHex, "hex")
  const decipher = createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv)

  let decrypted = decipher.update(encryptedText, "hex", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}
