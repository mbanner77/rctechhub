"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { pathfinderUnits } from "@/app/pathfinder/pathfinder-units"
import { cn } from "@/lib/utils"
import { analytics } from "@/lib/analytics"

interface PathfinderUnitNavigationProps {
  currentUnitId: string
  className?: string
}

export function PathfinderUnitNavigation({ currentUnitId, className }: PathfinderUnitNavigationProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const index = pathfinderUnits.findIndex((unit) => unit.id === currentUnitId)
    if (index !== -1) {
      setCurrentIndex(index)
    }
  }, [currentUnitId])

  const navigateTo = (unitId: string) => {
    const targetUnit = pathfinderUnits.find(unit => unit.id === unitId);
    analytics.serviceClick(targetUnit?.title || unitId, 'pathfinder-navigation');
    router.push(`/pathfinder/${unitId}`)
  }

  const navigatePrev = () => {
    const prevIndex = (currentIndex - 1 + pathfinderUnits.length) % pathfinderUnits.length
    const prevUnit = pathfinderUnits[prevIndex];
    analytics.serviceClick(prevUnit.title, 'pathfinder-navigation-prev');
    navigateTo(pathfinderUnits[prevIndex].id)
  }

  const navigateNext = () => {
    const nextIndex = (currentIndex + 1) % pathfinderUnits.length
    const nextUnit = pathfinderUnits[nextIndex];
    analytics.serviceClick(nextUnit.title, 'pathfinder-navigation-next');
    navigateTo(pathfinderUnits[nextIndex].id)
  }

  const currentUnit = pathfinderUnits[currentIndex]
  const prevUnit = pathfinderUnits[(currentIndex - 1 + pathfinderUnits.length) % pathfinderUnits.length]
  const nextUnit = pathfinderUnits[(currentIndex + 1) % pathfinderUnits.length]

  return (
    <div className={cn("flex items-center justify-between w-full", className)}>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={navigatePrev} className="flex items-center gap-1 text-sm">
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{prevUnit.title}</span>
        </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Menu className="h-4 w-4" />
            <span>Alle Pathfinder Units</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-[280px]">
          {pathfinderUnits.map((unit) => (
            <DropdownMenuItem
              key={unit.id}
              onClick={() => navigateTo(unit.id)}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                unit.id === currentUnitId && "bg-muted font-medium",
              )}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: unit.color || "#888" }} />
              {unit.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={navigateNext} className="flex items-center gap-1 text-sm">
          <span className="hidden sm:inline">{nextUnit.title}</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
