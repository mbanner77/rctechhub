import ContentManager from "@/components/admin/content-manager"
import InitDatabase from "@/components/admin/init-database"
import SeedContentButton from "@/components/admin/seed-content-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ContentManagementPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Content-Management</h1>
        <div className="flex space-x-4">
          <SeedContentButton />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Datenbank initialisieren</CardTitle>
            <CardDescription>Initialisieren Sie die Datenbank für das Content-Management-System</CardDescription>
          </CardHeader>
          <CardContent>
            <InitDatabase />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hinweise</CardTitle>
            <CardDescription>Wichtige Informationen zum Content-Management-System</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>1. Initialisieren Sie zuerst die Datenbank, um die erforderlichen Tabellen zu erstellen.</p>
            <p>2. Initialisieren Sie dann die Standardinhalte, um mit Beispielinhalten zu beginnen.</p>
            <p>3. Verwenden Sie den Content-Manager, um Inhalte zu erstellen, zu bearbeiten und zu löschen.</p>
          </CardContent>
        </Card>
      </div>

      <ContentManager />
    </div>
  )
}
