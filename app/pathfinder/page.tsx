import type { Metadata } from "next"
import { PathfinderOverview } from "@/components/pathfinder-overview"
import { EnhancedFooter } from "@/components/enhanced-footer"
import ExpertsOverview from "@/components/experts-overview"

export const metadata: Metadata = {
  title: "Pathfinder Units | Realcore BTP Portal",
  description: "Entdecken Sie unsere Pathfinder Units für Ihre digitale Transformation mit SAP BTP",
}

export default function PathfinderPage() {
  return (
    <div className="space-y-16">
      <PathfinderOverview />
      <ExpertsOverview />
      <EnhancedFooter />
    </div>
  )
}
