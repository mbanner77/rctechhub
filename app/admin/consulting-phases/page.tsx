import ConsultingPhasesManager from "@/components/admin/consulting-phases-manager"

export default function ConsultingPhasesAdminPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Beratungsbaukasten pflegen</h1>
      <ConsultingPhasesManager />
    </div>
  )
}
