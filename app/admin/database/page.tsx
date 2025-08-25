import DatabaseStatus from "@/components/admin/database-status"

export default function DatabaseStatusPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Datenbank-Status</h1>
      <DatabaseStatus />
    </div>
  )
}
