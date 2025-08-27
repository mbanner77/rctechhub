"use client"

import SchulungenManager from "@/components/admin/schulungen-manager"

export default function AdminSchulungenPage() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">Schulungen verwalten</h1>
      <p className="text-sm text-gray-600 mb-6">
        Erfassen und pflegen Sie Schulungen. Änderungen werden in der Datenbank gespeichert und auf den Pathfinder-Seiten dynamisch geladen.
      </p>
      <SchulungenManager />
    </div>
  )
}
