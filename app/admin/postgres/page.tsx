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

interface TableInfo {
  schema: string
  name: string
}

export default function PostgresAdminPage() {
  const [status, setStatus] = useState<DbStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [sql, setSql] = useState<string>("SELECT id, (data->>'title') AS title, category, updated_at FROM services ORDER BY updated_at DESC LIMIT 50")
  const [queryResult, setQueryResult] = useState<{ columns: string[]; rows: any[] } | null>(null)
  const [queryError, setQueryError] = useState<string | null>(null)
  const [queryLoading, setQueryLoading] = useState(false)

  // Tables browser state
  const [tables, setTables] = useState<TableInfo[]>([])
  const [tablesLoading, setTablesLoading] = useState(false)
  const [tablesError, setTablesError] = useState<string | null>(null)
  const [selected, setSelected] = useState<TableInfo | null>(null)
  const [rowsLoading, setRowsLoading] = useState(false)
  const [rowsError, setRowsError] = useState<string | null>(null)
  const [rowsResult, setRowsResult] = useState<{
    columns: string[]
    rows: any[]
    limit: number
    offset: number
    total: number | null
  } | null>(null)
  const [pageLimit, setPageLimit] = useState(50)

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

  useEffect(() => {
    const loadTables = async () => {
      try {
        setTablesLoading(true)
        setTablesError(null)
        const res = await fetch("/api/admin/db/tables", { cache: "no-store" })
        const body = await res.json()
        if (!res.ok) throw new Error(body?.error || `HTTP ${res.status}`)
        setTables(body.tables || [])
      } catch (e: any) {
        setTablesError(e?.message || "Fehler beim Laden der Tabellenliste")
      } finally {
        setTablesLoading(false)
      }
    }
    loadTables()
  }, [])

  const loadRows = async (schema: string, name: string, offset = 0) => {
    try {
      setRowsLoading(true)
      setRowsError(null)
      setRowsResult(null)
      const params = new URLSearchParams({ schema, table: name, limit: String(pageLimit), offset: String(offset) })
      const res = await fetch(`/api/admin/db/table-rows?${params.toString()}`, { cache: "no-store" })
      const body = await res.json()
      if (!res.ok) throw new Error(body?.error || `HTTP ${res.status}`)
      setRowsResult(body)
    } catch (e: any) {
      setRowsError(e?.message || "Fehler beim Laden der Tabellendaten")
    } finally {
      setRowsLoading(false)
    }
  }

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
          <CardTitle>Tabellen-Browser</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1 border rounded overflow-auto max-h-[50vh]">
              {tablesLoading ? (
                <div className="p-3 text-sm">Lade Tabellen…</div>
              ) : tablesError ? (
                <div className="p-3 text-sm text-red-600">{tablesError}</div>
              ) : (
                <ul>
                  {tables.map((t) => {
                    const key = `${t.schema}.${t.name}`
                    const active = selected && selected.schema === t.schema && selected.name === t.name
                    return (
                      <li key={key}>
                        <button
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/60 ${active ? 'bg-muted' : ''}`}
                          onClick={() => {
                            setSelected(t)
                            setRowsResult(null)
                            loadRows(t.schema, t.name, 0)
                          }}
                        >
                          <span className="text-muted-foreground">{t.schema}</span>
                          <span className="mx-1">.</span>
                          <span className="font-medium">{t.name}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
            <div className="md:col-span-3 space-y-3">
              {selected ? (
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Tabelle:</span>{" "}
                    <span className="font-medium">{selected.schema}.{selected.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={() => loadRows(selected.schema, selected.name, rowsResult?.offset || 0)} disabled={rowsLoading}>
                      Aktualisieren
                    </Button>
                    <Input
                      className="w-24 h-8"
                      type="number"
                      min={1}
                      max={200}
                      value={pageLimit}
                      onChange={(e) => setPageLimit(Math.max(1, Math.min(200, Number(e.target.value) || 50)))}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Bitte eine Tabelle links auswählen</div>
              )}

              {rowsError && <div className="text-red-600 text-sm">{rowsError}</div>}
              {rowsLoading && <div className="text-sm">Lade Daten…</div>}
              {rowsResult && (
                <div className="space-y-2">
                  <div className="overflow-auto border rounded">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          {rowsResult.columns.map((c) => (
                            <th key={c} className="text-left px-2 py-1 border-b bg-muted">{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rowsResult.rows.map((row, idx) => (
                          <tr key={idx} className="odd:bg-muted/30">
                            {rowsResult.columns.map((c) => (
                              <td key={c} className="px-2 py-1 align-top border-b">
                                <pre className="whitespace-pre-wrap break-words">{JSON.stringify(row[c])}</pre>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {rowsResult.total != null ? (
                        <span>
                          Zeilen {rowsResult.offset + 1}–{Math.min(rowsResult.offset + rowsResult.limit, rowsResult.total)} von {rowsResult.total}
                        </span>
                      ) : (
                        <span>
                          Zeilen {rowsResult.offset + 1}–{rowsResult.offset + rowsResult.limit}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        disabled={!selected || rowsLoading || (rowsResult.offset <= 0)}
                        onClick={() => selected && loadRows(selected.schema, selected.name, Math.max(0, (rowsResult.offset || 0) - rowsResult.limit))}
                      >
                        Zurück
                      </Button>
                      <Button
                        variant="outline"
                        disabled={!selected || rowsLoading || (rowsResult.total != null && rowsResult.offset + rowsResult.limit >= rowsResult.total)}
                        onClick={() => selected && loadRows(selected.schema, selected.name, (rowsResult.offset || 0) + rowsResult.limit)}
                      >
                        Weiter
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
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
