"use server"

import { cookies } from "next/headers"
import { ICookieStore } from "../app/api/shared/Interfaces/ICookieStore"

// Session-Dauer in Sekunden (24 Stunden)
const SESSION_DURATION = 24 * 60 * 60

export async function loginAction(password: string): Promise<{ success: boolean }> {
  console.log("Login attempt with password:", password)
  console.log("Environment:", process.env.NODE_ENV)
  console.log("Vercel Environment:", process.env.VERCEL_ENV)
  console.log("Cookie Domain:", process.env.COOKIE_DOMAIN || "not set")

  if (password === process.env.ADMIN_PASSWORD) {
    // Erstelle einen einfachen Session-Token (in einer Produktionsumgebung sollte dieser sicherer sein)
    const sessionToken = Buffer.from(Date.now().toString()).toString("base64")

    // Speichere den Token in einem Cookie
    try {
      const cookieStore: ICookieStore = await cookies()
      
      // First try to delete any existing cookie to prevent conflicts
      try {
        await cookieStore.delete("admin_session")
        console.log("Existing cookie deleted before setting new one")
      } catch (deleteErr) {
        console.log("No existing cookie to delete or error:", deleteErr)
      }
      
      // Now set the new cookie with settings that work in both dev and prod
      await cookieStore.set("admin_session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: SESSION_DURATION,
        path: "/",
        // Don't set domain for now to rule out domain issues
      })
      console.log("Cookie set with basic settings")
    } catch (cookieErr) {
      console.error("Error setting cookie:", cookieErr)
    }

    console.log("Login successful, session token set")
    // Verify cookie was set
    const checkCookieStore = await cookies()
    const checkSessionCookie = await checkCookieStore.get("admin_session")
    console.log("Cookie verification after setting:", !!checkSessionCookie)
    return { success: true }
  }

  console.log("Login failed: incorrect password")
  return { success: false }
}

export async function logoutAction(): Promise<{ success: boolean }> {
  const cookieStore: ICookieStore = await cookies()
  await cookieStore.delete("admin_session")
  return { success: true }
}

export async function checkAuthAction(): Promise<{ authenticated: boolean }> {
  const cookieStore: ICookieStore = await cookies()
  const sessionCookie = await cookieStore.get("admin_session")
  return { authenticated: !!sessionCookie }
}
