"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function UnitcardsImportButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/unit-cards/import", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Import fehlgeschlagen");
      }
      setMessage(`Import erfolgreich: ${data.count} Units synchronisiert.`);
    } catch (e: any) {
      setError(e?.message || "Import fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button onClick={handleImport} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
        {loading ? "Import läuft..." : "Pathfinder Units importieren/syncen"}
      </Button>
      {message && <span className="text-green-700 text-sm">{message}</span>}
      {error && <span className="text-red-700 text-sm">{error}</span>}
    </div>
  );
}
