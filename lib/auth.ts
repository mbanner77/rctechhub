"use server"

import { cookies } from "next/headers"
import { encrypt } from "./crypto"
import { ICookieStore } from "../app/api/shared/Interfaces/ICookieStore"

// Session-Dauer in Sekunden (24 Stunden)
const SESSION_DURATION = 24 * 60 * 60

export async function login(password: string): Promise<boolean> {
  if (password === process.env.ADMIN_PASSWORD) {
    // Erstelle einen Session-Token
    const sessionData = {
      authenticated: true,
      exp: Math.floor(Date.now() / 1000) + SESSION_DURATION,
    }

    // Verschlüssele den Token
    const encryptedSession = await encrypt(JSON.stringify(sessionData))

    // Speichere den Token in einem Cookie
    const cookieStore = await cookies()
    await cookieStore.set("admin_session", encryptedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION,
      path: "/",
    })

    return true
  }

  return false
}

export async function logout(): Promise<void> {
  const cookieStore: ICookieStore = await cookies()
  await cookieStore.delete("admin_session")
}

async function checkAuthAction(): Promise<{ authenticated: boolean }> {
  const cookieStore: ICookieStore = await cookies()
  const sessionCookieResult = await cookieStore.get("admin_session")
  const sessionCookie = sessionCookieResult?.value

  if (!sessionCookie) {
    return { authenticated: false }
  }

  try {
    // Entschlüssele den Session-Token
    const decryptedSession = await decrypt(sessionCookie)
    const sessionData = JSON.parse(decryptedSession)

    // Überprüfe, ob die Session gültig ist
    if (sessionData.authenticated && sessionData.exp > Math.floor(Date.now() / 1000)) {
      return { authenticated: true }
    } else {
      return { authenticated: false }
    }
  } catch (error) {
    console.error("Session decryption error:", error)
    return { authenticated: false }
  }
}

import { decrypt } from "./crypto"

export async function checkAuth(): Promise<boolean> {
  try {
    const result = await checkAuthAction()
    return result.authenticated
  } catch (error) {
    console.error("Auth check error:", error)
    return false
  }
}
