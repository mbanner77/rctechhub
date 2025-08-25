"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginAction } from "@/lib/auth-actions"

export default function LoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await loginAction(password)

      if (result.success) {
        // Add a very significant delay to ensure cookie is properly set
        // and any automatic redirects are completed
        setError("Login erfolgreich, weiterleitung...")
        
        setTimeout(() => {
          // Use form submission for navigation which is more reliable than JavaScript navigation
          const form = document.createElement('form');
          form.method = 'GET';
          form.action = '/admin';
          document.body.appendChild(form);
          form.submit();
        }, 2000)
      } else {
        setError("Ungültiges Passwort")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Ein Fehler ist aufgetreten")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">RealCore Admin-Bereich</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Admin-Passwort</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort eingeben"
              required
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
            {isLoading ? "Wird angemeldet..." : "Anmelden"}
          </Button>
        </form>
      </div>
    </div>
  )
}
