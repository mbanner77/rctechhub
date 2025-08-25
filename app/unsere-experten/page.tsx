import type { Metadata } from "next"
import { PathfinderOverview } from "@/components/pathfinder-overview"
import ExpertsOverview from "@/components/experts-overview"

export const metadata: Metadata = {
  title: "Unsere Experten | Realcore BTP Portal",
  description: "Entdecken Sie unsere Experten für Ihre digitale Transformation mit SAP BTP",
}

export default function UnsereExpertenPage() {
  return (
    <div className="space-y-16">
      <ExpertsOverview />
    </div>
  )
}
