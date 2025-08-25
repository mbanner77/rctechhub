import { TagManager } from "@/components/admin/tag-manager"
import InitTagsButton from "@/components/admin/init-tags-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TagsManagementPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Technologie-Tags verwalten</h1>
        <div>
          <InitTagsButton />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Tag-Verwaltung</CardTitle>
            <CardDescription>
              Hier können Sie alle Technologie-Tags zentral verwalten. Änderungen an Tags werden automatisch in allen referenzierenden Entitäten aktualisiert.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Um zu beginnen, können Sie vorhandene Tags aus Services und Knowledge Hub-Inhalten extrahieren, 
              indem Sie auf "Tags initialisieren" klicken. Sie können auch manuell neue Tags erstellen oder vorhandene bearbeiten.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <TagManager />
      </div>
    </div>
  )
}
