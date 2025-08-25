import type { Metadata } from "next"
import { EnhancedTemplateGallery } from "@/components/enhanced-template-gallery"

export const metadata: Metadata = {
  title: "Templates | RealCore BTP Portal",
  description: "Entdecken Sie unsere Sammlung von SAP BTP Templates für verschiedene Anwendungsfälle",
}

export default function TemplatesPage() {
  return (
    <div className="container py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">SAP BTP Templates</h1>
        <p className="text-muted-foreground text-lg">
          Beschleunigen Sie Ihre Entwicklung mit unseren vorgefertigten Templates für SAP BTP
        </p>
      </div>

      <EnhancedTemplateGallery />
    </div>
  )
}
