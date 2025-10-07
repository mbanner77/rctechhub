"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Lightbulb, BookOpen, Code, Settings, Users } from "lucide-react"
import { db, type IWorkshop } from "@/lib/db"
import { defaultWorkshops } from "@/data/default-data"
import WorkshopBookingDialog from "@/components/workshop-booking-dialog" // Fixed import
import { getClientWorkshops } from "@/lib/client-data-service"
import { useSiteConfig } from "@/hooks/use-site-config"
import { formatCurrency } from "@/lib/currency"

interface DynamicWorkshopGridProps {
  workshops?: IWorkshop[] | any[];
}

const iconMap: Record<string, React.ReactNode> = {
  Calendar: <Calendar className="h-8 w-8 mb-2" />,
  Lightbulb: <Lightbulb className="h-8 w-8 mb-2" />,
  BookOpen: <BookOpen className="h-8 w-8 mb-2" />,
  Code: <Code className="h-8 w-8 mb-2" />,
  Settings: <Settings className="h-8 w-8 mb-2" />,
  Users: <Users className="h-8 w-8 mb-2" />,
}

export default function DynamicWorkshopGrid({ workshops: providedWorkshops }: DynamicWorkshopGridProps) {
  const [workshops, setWorkshops] = useState<IWorkshop[] | any[]>([])
  const [isLoading, setIsLoading] = useState(!providedWorkshops)
  const [selectedWorkshop, setSelectedWorkshop] = useState<IWorkshop | any | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { config } = useSiteConfig()

  useEffect(() => {
    // Wenn Workshops als Props übergeben wurden, verwende diese
    if (providedWorkshops) {
      setWorkshops(providedWorkshops);
      setIsLoading(false);
      return;
    }

    // Ansonsten lade die Workshops über die API
    const fetchWorkshops = async () => {
      setIsLoading(true)
      try {
        const workshopsContent = await getClientWorkshops();
        console.log(
          "[DYNAMIC-WORKSHOPS-GRID] Workshops Inhalte vom Server geladen:",
          workshopsContent.length
        );

        setWorkshops(workshopsContent);
      } catch (err) {
        console.log("[DYNAMIC-WORKSHOPS-GRID] Could not load workshops: ", err)
        // Fallback auf Standarddaten
        setWorkshops(defaultWorkshops)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkshops()
  }, [providedWorkshops])

  const handleBookWorkshop = (workshop: IWorkshop | any) => {
    setSelectedWorkshop(workshop)
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Lade Workshops...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workshops.map((workshop, index) => (
          <Card key={workshop.id || index} className="flex flex-col h-full">
            <CardHeader>
              <div className="flex items-center">
                {iconMap[workshop.icon] || <Users className="h-8 w-8 mb-2" />}
                <CardTitle className="ml-2">{workshop.title}</CardTitle>
              </div>
              <CardDescription>
                {workshop.duration} {typeof workshop.price === 'number' && workshop.price > 0 ? `| ${formatCurrency(Number(workshop.price || 0), config.currency)}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-gray-700">{workshop.description}</p>
              {workshop.benefits && workshop.benefits.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Vorteile:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {workshop.benefits.map((benefit: string, index: number) => (
                      <li key={index} className="text-gray-700">
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleBookWorkshop(workshop)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-black"
              >
                Workshop buchen
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedWorkshop && (
        <WorkshopBookingDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          workshop={selectedWorkshop}
        />
      )}
    </div>
  )
}
