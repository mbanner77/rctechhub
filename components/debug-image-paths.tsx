"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { normalizeImagePath } from "@/lib/image-utils"

interface DebugImagePathsProps {
  paths: string[]
}

export function DebugImagePaths({ paths }: DebugImagePathsProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [normalizedPaths, setNormalizedPaths] = useState<string[]>([])
  const [imageStatus, setImageStatus] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return
    }

    const normalized = paths.map((path) => normalizeImagePath(path))
    setNormalizedPaths(normalized)

    // Überprüfe, ob die Bilder existieren
    const checkImages = async () => {
      const status: Record<string, boolean> = {}
      for (const path of normalized) {
        try {
          const response = await fetch(path, { method: "HEAD" })
          status[path] = response.ok
        } catch (error) {
          status[path] = false
        }
      }
      setImageStatus(status)
    }

    checkImages()
  }, [paths])

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2 bg-yellow-100 hover:bg-yellow-200 border-yellow-300"
      >
        {isVisible ? "Debug ausblenden" : "Bild-Debug anzeigen"}
      </Button>

      {isVisible && (
        <Card className="w-96 max-h-96 overflow-auto">
          <CardHeader>
            <CardTitle className="text-sm">Bild-Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-xs space-y-2">
              {normalizedPaths.map((path, index) => (
                <li key={index} className="flex flex-col">
                  <span className={`font-mono ${imageStatus[path] ? "text-green-600" : "text-red-600"} break-all`}>
                    {path}
                  </span>
                  <span className="text-gray-500">Original: {paths[index]}</span>
                  <span className="text-gray-500">Status: {imageStatus[path] ? "✅ OK" : "❌ Fehler"}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
