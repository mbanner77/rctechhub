"use client";

import { useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type AnalyticsEvent = {
  id: number
  name: string
  props: any
  path: string | null
  referrer: string | null
  user_agent: string | null
  session_id: string | null
  ip: string | null
  created_at: string
}

type ApiResponse = {
  page: number
  limit: number
  total: number
  items: AnalyticsEvent[]
}

export default function BesucheranalysenPage() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [name, setName] = useState<string>("")
  const [q, setQ] = useState<string>("")

  const totalPages = useMemo(() => data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1, [data])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set('page', String(page))
        params.set('limit', String(limit))
        if (name.trim()) params.set('name', name.trim())
        if (q.trim()) params.set('q', q.trim())
        const res = await fetch(`/api/analytics/events?${params.toString()}`)
        const json = await res.json()
        if (!cancelled) setData(json)
      } catch (e) {
        console.error('Failed to load analytics events', e)
        if (!cancelled) setData({ page: 1, limit, total: 0, items: [] })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [page, limit, name, q])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Besucheranalysen</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPage(1)}>Neu laden</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="col-span-1">
          <label className="text-sm text-muted-foreground">Event-Name</label>
          <Input placeholder="z.B. navigation_click" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="text-sm text-muted-foreground">Volltextsuche</label>
          <Input placeholder="Pfad, Referrer, User Agent, Props" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="col-span-1">
          <label className="text-sm text-muted-foreground">Einträge pro Seite</label>
          <Select value={String(limit)} onValueChange={(v) => { setPage(1); setLimit(parseInt(v, 10)) }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="200">200</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zeit</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Pfad</TableHead>
              <TableHead>Props</TableHead>
              <TableHead>Land</TableHead>
              <TableHead>Organisation</TableHead>
              <TableHead>Hostname</TableHead>
              <TableHead>Referrer</TableHead>
              <TableHead>UA</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Session</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={8}>Lade Daten…</TableCell></TableRow>
            )}
            {!loading && data?.items.length === 0 && (
              <TableRow><TableCell colSpan={8}>Keine Einträge</TableCell></TableRow>
            )}
            {data?.items.map((ev: any) => (
              <TableRow key={ev.id}>
                <TableCell className="whitespace-nowrap">{new Date(ev.created_at).toLocaleString()}</TableCell>
                <TableCell className="font-mono text-xs">{ev.name}</TableCell>
                <TableCell className="truncate max-w-[220px]" title={ev.path || ''}>{ev.path}</TableCell>
                <TableCell className="truncate max-w-[320px]" title={JSON.stringify(ev.props)}>
                  <code className="text-xs">{JSON.stringify(ev.props)}</code>
                </TableCell>
                <TableCell title={ev.country_name || ''}>{ev.country_code || ''}</TableCell>
                <TableCell className="truncate max-w-[220px]" title={ev.org || ''}>{ev.org}</TableCell>
                <TableCell className="truncate max-w-[220px]" title={ev.hostname || ''}>{ev.hostname}</TableCell>
                <TableCell className="truncate max-w-[220px]" title={ev.referrer || ''}>{ev.referrer}</TableCell>
                <TableCell className="truncate max-w-[260px]" title={ev.user_agent || ''}>{ev.user_agent}</TableCell>
                <TableCell>{ev.ip}</TableCell>
                <TableCell className="font-mono text-[10px]">{ev.session_id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">Seite {data?.page ?? page} von {totalPages} • Gesamt: {data?.total ?? 0}</div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Zurück</Button>
          <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Weiter</Button>
        </div>
      </div>
    </div>
  )
}
