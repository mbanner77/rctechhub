import ResetDataButton from "@/components/admin/reset-data-button"

export default function ResetDataPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Daten zurücksetzen</h1>
      <div className="max-w-md mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Warnung</h2>
          <p className="mb-6 text-red-600">
            Diese Aktion setzt alle Daten auf die Standardwerte zurück. Dieser Vorgang kann nicht rückgängig gemacht
            werden.
          </p>
          <ResetDataButton />
        </div>
      </div>
    </div>
  )
}
