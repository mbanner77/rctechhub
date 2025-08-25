"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import { Schulung } from "@/types/schulung"

interface SchulungenDisplayProps {
  maxItems?: number; // Maximal anzuzeigende Elemente, bevor "Alle anzeigen" Button erscheint
  unitId?: string; // Optional: Filter schulungen by unitId
}

export default function SchulungenDisplay({ maxItems = 4, unitId }: SchulungenDisplayProps) {
  const [schulungen, setSchulungen] = useState<Schulung[]>([])
  const [showAll, setShowAll] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      
      try {
        // Load trainings from the API, filtered by unitId if provided
        const url = unitId 
          ? `/api/schulungen/by-unit?unitId=${unitId}`
          : '/api/schulungen';
          
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setSchulungen(Array.isArray(data) ? data : []);
        }
        
        // Schulungskatalog-Funktionalität entfernt
      } catch (error) {
        console.error("Error loading trainings:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [unitId])
  
  const displayedSchulungen = showAll ? schulungen : schulungen.slice(0, maxItems)
  const hasMore = schulungen.length > maxItems
  
  // Schulungskatalog-Download-Funktion entfernt

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  
  if (schulungen.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Keine Schulungen verfügbar</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Schulungskatalog-Download-Button entfernt */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {displayedSchulungen.map((schulung) => (
          <Card key={schulung.id} className="h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center">
                <BookOpen className="h-6 w-6 text-primary mr-2" />
                <CardTitle>{schulung.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Kategorie:</span>
                  <span className="text-sm">{schulung.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Dauer:</span>
                  <span className="text-sm">{schulung.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Preis:</span>
                  <span className="text-sm">
                    {schulung.price > 0 ? `${schulung.price} €` : "Kostenlos"}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Details anzeigen
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {hasMore && !showAll && (
        <div className="flex justify-center mt-6">
          <Button onClick={() => setShowAll(true)}>
            Alle Schulungen anzeigen
          </Button>
        </div>
      )}
    </div>
  )
}
