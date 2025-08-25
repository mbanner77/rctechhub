import ServiceEditor from "@/components/admin/service-editor"

export default function ServicesAdminPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Dienste verwalten</h1>
      <ServiceEditor />
    </div>
  )
}
