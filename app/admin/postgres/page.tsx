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

interface ColumnMeta {
  name: string
  type: string
  nullable: boolean
  position: number
  isPrimaryKey?: boolean
}

import type React from 'react'

export default function PostgresAdminPage() {
  const [status, setStatus] = useState<DbStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [sql, setSql] = useState<string>("SELECT id, (data->>'title') AS title, category, updated_at FROM services ORDER BY updated_at DESC LIMIT 50")
  const [queryResult, setQueryResult] = useState<{ columns: string[]; rows: any[] } | null>(null)
  const [queryError, setQueryError] = useState<string | null>(null)
  const [queryLoading, setQueryLoading] = useState(false)
  const [prettyPrint, setPrettyPrint] = useState<boolean>(true)
  type SavedQuery = { id: string; name: string; sql: string }
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([])
  const savedQueriesKey = 'admin-postgres-saved-queries'

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
  const [offsetInput, setOffsetInput] = useState<string>("0")

  // Schema, sorting, filters
  const [columnsMeta, setColumnsMeta] = useState<ColumnMeta[] | null>(null)
  const [sortBy, setSortBy] = useState<string | undefined>(undefined)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  // JSON-path sorting (if sortBy is empty)
  const [sortJsonBase, setSortJsonBase] = useState<string | undefined>(undefined)
  const [sortJsonPathStr, setSortJsonPathStr] = useState<string>("")
  const [sortJsonText, setSortJsonText] = useState<boolean>(true)
  type Filter = { col?: string; op: string; val: string; isJson?: boolean; jsonBase?: string; jsonPathStr?: string; text?: boolean }
  const [filters, setFilters] = useState<Filter[]>([])

  useEffect(() => {
    // Load saved queries from localStorage
    try {
      const raw = localStorage.getItem(savedQueriesKey)
      if (raw) setSavedQueries(JSON.parse(raw))
    } catch {}
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

  // Client-side export helpers (top-level)
  const exportRowsAsCSV = (columns: string[], rows: any[], filename: string) => {
    const esc = (v: any) => {
      if (v == null) return ''
      const s = typeof v === 'string' ? v : JSON.stringify(v)
      const needsQuotes = /[",\n]/.test(s)
      const inner = s.replace(/"/g, '""')
      return needsQuotes ? `"${inner}"` : inner
    }
    const header = columns.join(',')
    const lines = rows.map(r => columns.map(c => esc(r[c])).join(','))
    const csv = [header, ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportRowsAsJSON = (rows: any[], filename: string) => {
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // Saved queries helpers (top-level)
  const saveCurrentQuery = () => {
    const name = prompt('Name für diese Abfrage eingeben:')
    if (!name) return
    const next: SavedQuery[] = [{ id: String(Date.now()), name, sql }, ...savedQueries].slice(0, 50)
    setSavedQueries(next)
    try { localStorage.setItem(savedQueriesKey, JSON.stringify(next)) } catch {}
  }

  const deleteSavedQuery = (id: string) => {
    const next = savedQueries.filter(q => q.id !== id)
    setSavedQueries(next)
    try { localStorage.setItem(savedQueriesKey, JSON.stringify(next)) } catch {}
  }

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
      if (sortBy) params.set('sortBy', sortBy)
      if (sortDir) params.set('sortDir', sortDir)
      // JSON sort (optional). Backend prefers sortBy if present.
      if (sortJsonBase) params.set('sortJsonBase', sortJsonBase)
      if (sortJsonPathStr) params.set('sortJsonPath', sortJsonPathStr)
      params.set('sortJsonText', String(sortJsonText))
      if (filters.length) {
        const sendFilters = filters.map((f: Filter) => {
          if (f.isJson) {
            return {
              jsonBase: f.jsonBase || '',
              jsonPath: (f.jsonPathStr || '').split(',').map((s: string) => s.trim()).filter(Boolean),
              text: f.text !== false,
              op: f.op,
              val: f.val,
            }
          }
          return { col: f.col || '', op: f.op, val: f.val }
        })
        params.set('filters', JSON.stringify(sendFilters))
      }
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

  const loadSchema = async (schema: string, name: string) => {
    try {
      setColumnsMeta(null)
      const params = new URLSearchParams({ schema, table: name })
      const res = await fetch(`/api/admin/db/table-schema?${params.toString()}`, { cache: 'no-store' })
      const body = await res.json()
      if (!res.ok) throw new Error(body?.error || `HTTP ${res.status}`)
      setColumnsMeta(body.columns as ColumnMeta[])
      // Initialize sortBy if empty
      if (!sortBy && (body.columns?.[0]?.name)) setSortBy(String(body.columns[0].name))
    } catch (e) {
      // non-fatal
      setColumnsMeta([])
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
                  {tables.map((t: TableInfo) => {
                    const key = `${t.schema}.${t.name}`
                    const active = selected && selected.schema === t.schema && selected.name === t.name
                    return (
                      <li key={key}>
                        <button
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/60 ${active ? 'bg-muted' : ''}`}
                          onClick={() => {
                            setSelected(t)
                            setRowsResult(null)
                            // reset sort/filters when switching table
                            setSortBy(undefined)
                            setSortDir('asc')
                            setFilters([])
                            setSortJsonBase(undefined)
                            setSortJsonPathStr("")
                            setSortJsonText(true)
                            loadSchema(t.schema, t.name)
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPageLimit(Math.max(1, Math.min(200, Number(e.target.value) || 50)))}
                    />
                    <Input
                      className="w-28 h-8"
                      type="number"
                      min={0}
                      value={offsetInput}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOffsetInput(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => selected && loadRows(selected.schema, selected.name, Math.max(0, parseInt(offsetInput || '0', 10)))}
                      disabled={rowsLoading}
                    >Gehe zu Offset</Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Bitte eine Tabelle links auswählen</div>
              )}

              {selected && (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-xs text-muted-foreground">Sortierung:</div>
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={sortBy || ''}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value || undefined)}
                    >
                      <option value="">(keine)</option>
                      {(columnsMeta || rowsResult?.columns || []).map((c: any) => {
                        const name = typeof c === 'string' ? c : c.name
                        return <option key={name} value={name}>{name}</option>
                      })}
                    </select>
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={sortDir}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortDir(e.target.value as 'asc' | 'desc')}
                    >
                      <option value="asc">asc</option>
                      <option value="desc">desc</option>
                    </select>
                    <div className="flex items-center gap-2 ml-2 text-xs text-muted-foreground">JSON Sort (falls Spalte leer):</div>
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={sortJsonBase || ''}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortJsonBase(e.target.value || undefined)}
                    >
                      <option value="">JSON-Spalte…</option>
                      {(columnsMeta || []).filter(c => typeof c !== 'string' && /json/i.test((c as any).type)).map((c: any) => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <Input
                      className="h-8 w-48"
                      placeholder="Pfad, z.B. ip,address"
                      value={sortJsonPathStr}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSortJsonPathStr(e.target.value)}
                    />
                    <label className="flex items-center gap-1 text-xs">
                      <input type="checkbox" checked={sortJsonText} onChange={(e) => setSortJsonText(e.target.checked)} />
                      <span>als Text ({"->>"})</span>
                    </label>
                    <Button
                      variant="outline"
                      onClick={() => selected && loadRows(selected.schema, selected.name, 0)}
                      disabled={rowsLoading}
                    >Anwenden</Button>

                    <div className="ml-auto flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (!selected) return
                          const params = new URLSearchParams({ schema: selected.schema, table: selected.name })
                          if (sortBy) params.set('sortBy', sortBy)
                          if (sortDir) params.set('sortDir', sortDir)
                          if (sortJsonBase) params.set('sortJsonBase', sortJsonBase)
                          if (sortJsonPathStr) params.set('sortJsonPath', sortJsonPathStr)
                          params.set('sortJsonText', String(sortJsonText))
                          if (filters.length) {
                            const sendFilters = filters.map((f: Filter) => {
                              if (f.isJson) {
                                return {
                                  jsonBase: f.jsonBase || '',
                                  jsonPath: (f.jsonPathStr || '').split(',').map((s: string) => s.trim()).filter(Boolean),
                                  text: f.text !== false,
                                  op: f.op,
                                  val: f.val,
                                }
                              }
                              return { col: f.col || '', op: f.op, val: f.val }
                            })
                            params.set('filters', JSON.stringify(sendFilters))
                          }
                          params.set('cap', '10000')
                          window.location.href = `/api/admin/db/export-csv?${params.toString()}`
                        }}
                      >CSV Export</Button>
                      {rowsResult && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => exportRowsAsCSV(rowsResult.columns, rowsResult.rows, `${selected?.schema}.${selected?.name}.csv`)}
                          >CSV (Client)</Button>
                          <Button
                            variant="outline"
                            onClick={() => exportRowsAsJSON(rowsResult.rows, `${selected?.schema}.${selected?.name}.json`)}
                          >JSON Export</Button>
                        </>
                      )}
                      <label className="ml-3 text-xs flex items-center gap-1">
                        <input type="checkbox" checked={prettyPrint} onChange={(e) => setPrettyPrint(e.target.checked)} />
                        <span>Pretty JSON</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Filter:</div>
                    {(filters.length ? filters : [{ col: '', op: '=', val: '' }]).map((f: Filter, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={!!f.isJson}
                            onChange={(e) => {
                              const next = [...filters]
                              if (!next[idx]) next[idx] = { op: '=', val: '' }
                              next[idx].isJson = e.target.checked
                              // reset fields when toggling
                              if (e.target.checked) {
                                next[idx].col = undefined
                                next[idx].jsonBase = ''
                                next[idx].jsonPathStr = ''
                                next[idx].text = true
                              } else {
                                next[idx].col = ''
                                next[idx].jsonBase = undefined
                                next[idx].jsonPathStr = undefined
                                next[idx].text = undefined
                              }
                              setFilters(next)
                            }}
                          />
                          <span>JSON</span>
                        </label>
                        {f.isJson ? (
                          <>
                            <select
                              className="border rounded px-2 py-1 text-sm"
                              value={f.jsonBase || ''}
                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                const next = [...filters]
                                if (!next[idx]) next[idx] = { op: '=', val: '' }
                                next[idx].jsonBase = e.target.value
                                setFilters(next)
                              }}
                            >
                              <option value="">JSON-Spalte…</option>
                              {(columnsMeta || []).filter(c => typeof c !== 'string' && /json/i.test((c as any).type)).map((c: any) => (
                                <option key={c.name} value={c.name}>{c.name}</option>
                              ))}
                            </select>
                            <Input
                              className="h-8 w-44"
                              placeholder="Pfad z.B. ip,address"
                              value={f.jsonPathStr || ''}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const next = [...filters]
                                if (!next[idx]) next[idx] = { op: '=', val: '' }
                                next[idx].jsonPathStr = e.target.value
                                setFilters(next)
                              }}
                            />
                            <label className="flex items-center gap-1 text-xs">
                              <input
                                type="checkbox"
                                checked={f.text !== false}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  const next = [...filters]
                                  if (!next[idx]) next[idx] = { op: '=', val: '' }
                                  next[idx].text = e.target.checked
                                  setFilters(next)
                                }}
                              />
                              <span>als Text ({"->>"})</span>
                            </label>
                          </>
                        ) : (
                          <select
                            className="border rounded px-2 py-1 text-sm"
                            value={f.col || ''}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                              const next = [...filters]
                              if (!next[idx]) next[idx] = { col: '', op: '=', val: '' }
                              next[idx].col = e.target.value
                              setFilters(next)
                            }}
                          >
                            <option value="">Spalte…</option>
                            {(columnsMeta || rowsResult?.columns || []).map((c: any) => {
                              const name = typeof c === 'string' ? c : c.name
                              return <option key={name} value={name}>{name}</option>
                            })}
                          </select>
                        )}
                        <select
                          className="border rounded px-2 py-1 text-sm"
                          value={f.op}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            const next = [...filters]
                            if (!next[idx]) next[idx] = { col: '', op: '=', val: '' }
                            next[idx].op = e.target.value
                            setFilters(next)
                          }}
                        >
                          {['=', '<>', '<', '>', '<=', '>=', 'LIKE', 'ILIKE'].map((op) => (
                            <option key={op} value={op}>{op}</option>
                          ))}
                        </select>
                        <Input
                          className="h-8"
                          value={f.val}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const next = [...filters]
                            if (!next[idx]) next[idx] = { col: '', op: '=', val: '' }
                            next[idx].val = e.target.value
                            setFilters(next)
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            const next = filters.filter((_v: Filter, i: number) => i !== idx)
                            setFilters(next)
                          }}
                        >Entfernen</Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => setFilters([...filters, { col: '', op: '=', val: '' }])}
                      >Filter hinzufügen</Button>
                      <Button
                        variant="outline"
                        onClick={() => selected && loadRows(selected.schema, selected.name, 0)}
                        disabled={rowsLoading}
                      >Filter anwenden</Button>
                    </div>
                  </div>
                </div>
              )}

              {rowsError && <div className="text-red-600 text-sm">{rowsError}</div>}
              {rowsLoading && <div className="text-sm">Lade Daten…</div>}
              {rowsResult && (
                <div className="space-y-2">
                  <div className="overflow-auto border rounded">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          {rowsResult.columns.map((c: string) => (
                            <th key={c} className="text-left px-2 py-1 border-b bg-muted">{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rowsResult.rows.map((row: any, idx: number) => (
                          <tr key={idx} className="odd:bg-muted/30">
                            {rowsResult.columns.map((c: string) => (
                              <td key={c} className="px-2 py-1 align-top border-b">
                                <pre className="whitespace-pre-wrap break-words">{prettyPrint ? JSON.stringify(row[c], null, 2) : JSON.stringify(row[c])}</pre>
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
          <Textarea value={sql} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSql(e.target.value)} rows={6} />
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={runQuery} disabled={queryLoading}>Ausführen</Button>
            <label className="ml-2 text-xs flex items-center gap-1">
              <input type="checkbox" checked={prettyPrint} onChange={(e) => setPrettyPrint(e.target.checked)} />
              <span>Pretty JSON</span>
            </label>
            {queryResult && (
              <>
                <Button variant="outline" onClick={() => exportRowsAsCSV(queryResult.columns, queryResult.rows, 'query-result.csv')}>CSV (Client)</Button>
                <Button variant="outline" onClick={() => exportRowsAsJSON(queryResult.rows, 'query-result.json')}>JSON Export</Button>
              </>
            )}
            <Button variant="outline" onClick={saveCurrentQuery}>Abfrage speichern</Button>
            {savedQueries.length > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground">Gespeichert:</span>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const q = savedQueries.find(sq => sq.id === e.target.value)
                    if (q) setSql(q.sql)
                  }}
                >
                  <option value="">(wählen)</option>
                  {savedQueries.map((q) => (
                    <option key={q.id} value={q.id}>{q.name}</option>
                  ))}
                </select>
                <Button
                  variant="ghost"
                  onClick={() => {
                    const id = prompt('ID der gespeicherten Abfrage zum Löschen eingeben:')
                    if (id) deleteSavedQuery(id)
                  }}
                >Löschen…</Button>
              </div>
            )}
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
                          <pre className="whitespace-pre-wrap break-words">{prettyPrint ? JSON.stringify(row[c], null, 2) : JSON.stringify(row[c])}</pre>
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
