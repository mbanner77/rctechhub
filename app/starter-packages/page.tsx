import { EnhancedFooter } from "@/components/enhanced-footer"
import StarterPackages from "@/components/starter-packages"
import { StickyHeader } from "@/components/sticky-header"

export default function StarterPackagesPage() {
  return (
    <div>
      {/* Header */}
      <div className="py-5">
        <StickyHeader />
      </div>

        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Starter Packages</h1>
          <StarterPackages />
        </div>

        <EnhancedFooter />
    </div>
  )
}
