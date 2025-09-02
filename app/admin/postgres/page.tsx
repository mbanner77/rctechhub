"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

interface DbStatus {
  version: string
  servicesCount: number
  servicesLastUpdated?: string | null
}

export default function PostgresAdminPage() {
  const [status, setStatus] = useState<DbStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [sql, setSql] = useState<string>("SELECT id, (data->>'title') AS title, category, updated_at FROM services ORDER BY updated_at DESC LIMIT 50")
  const [queryResult, setQueryResult] = useState<{ columns: string[]; rows: any[] } | null>(null)
  const [queryError, setQueryError] = useState<string | null>(null)
  const [queryLoading, setQueryLoading] = useState(false)

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/admin/db/status", { cache: "no-store" })
        if (!res.ok) throw new Error(`Status HTTP ${res.status}`)
        const data = await res.json()
        setStatus(data)
      } catch (e: any) {
        setError(e?.message || "Fehler beim Laden des DB-Status")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const runQuery = async () => {
    try {
      setQueryLoading(true)
      setQueryError(null)
      setQueryResult(null)
      const res = await fetch("/api/admin/db/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body?.error || `Query HTTP ${res.status}`)
      setQueryResult(body)
    } catch (e: any) {
      setQueryError(e?.message || "Fehler beim Ausführen der Abfrage")
    } finally {
      setQueryLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">PostgreSQL Verwaltung</h1>

      <Card>
        <CardHeader>
          <CardTitle>Datenbank-Status</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Lade...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : status ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Postgres Version</div>
                <div className="font-medium">{status.version}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Services (Anzahl)</div>
                <div className="font-medium">{status.servicesCount}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Services zuletzt aktualisiert</div>
                <div className="font-medium">{status.servicesLastUpdated || "-"}</div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Read-Only SQL-Abfrage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Nur SELECT-Statements sind erlaubt. Ergebnis auf 200 Zeilen begrenzt.
          </div>
          <Textarea value={sql} onChange={(e) => setSql(e.target.value)} rows={6} />
          <div className="flex gap-2">
            <Button onClick={runQuery} disabled={queryLoading}>Ausführen</Button>
          </div>
          {queryError && <div className="text-red-600">{queryError}</div>}
          {queryResult && (
            <div className="overflow-auto border rounded">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {queryResult.columns.map((c) => (
                      <th key={c} className="text-left px-2 py-1 border-b bg-muted">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queryResult.rows.map((row, idx) => (
                    <tr key={idx} className="odd:bg-muted/30">
                      {queryResult.columns.map((c) => (
                        <td key={c} className="px-2 py-1 align-top border-b">
                          <pre className="whitespace-pre-wrap break-words">{JSON.stringify(row[c])}</pre>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
