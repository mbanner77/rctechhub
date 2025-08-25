import { NextResponse } from "next/server"
import { cookies, headers } from "next/headers"
import { ICookieStore } from "../../shared/Interfaces/ICookieStore"
import { redirect } from 'next/navigation'

export async function POST() {
  const cookieStore: ICookieStore = await cookies()
  cookieStore.delete("admin_session")
  return NextResponse.json({ success: true })
}

// DISABLED GET method to prevent accidental logouts
// We'll only use POST for explicit logout actions
export async function GET(request: Request) {
  console.log("WARNING: Logout GET route called, URL:", request.url)
  console.log("GET method for logout has been disabled")
  
  // Don't delete cookie, just log the attempt
  // const cookieStore: ICookieStore = await cookies()
  // await cookieStore.delete("admin_session")
  
  // Use the current request URL to determine the base URL for redirection
  const baseUrl = new URL(request.url).origin
  
  // Don't redirect to login, just go back to admin to prevent logout loops
  return NextResponse.redirect(new URL('/admin', baseUrl))
}
