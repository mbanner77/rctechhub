import { CaseStudiesEditor } from "@/components/admin/case-studies-editor"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CaseStudiesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Case Studies verwalten</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Case Studies</CardTitle>
            <CardDescription>Hier können Sie Case Studies für die Pathfinder Units verwalten</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Case Studies werden in den Pathfinder Units angezeigt und demonstrieren erfolgreiche Implementierungen und Kundenprojekte.</p>
            <p>Jede Case Study sollte einer Branche zugeordnet sein und kann mit einem Bild und einem PDF-Download versehen werden.</p>
          </CardContent>
        </Card>
      </div>

      <CaseStudiesEditor />
    </div>
  )
}
