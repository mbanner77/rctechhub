import InitCmsButton from "@/components/admin/init-cms-button"

export default function CmsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">CMS-Verwaltung</h1>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">CMS initialisieren</h2>
          <p className="mb-4 text-gray-600">
            Initialisieren Sie das CMS mit Standardtexten. Dies erstellt die erforderlichen Tabellen und fügt
            Beispielinhalte hinzu.
          </p>
          <InitCmsButton />
        </div>
      </div>
    </div>
  )
}
