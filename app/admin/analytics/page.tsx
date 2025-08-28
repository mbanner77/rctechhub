"use client";

import { useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
// register Chart.js globally via side-effect module
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, LineController, BarElement, BarController, Title, Tooltip, Legend, Filler } from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler,
);
import { Chart as ReactChart } from "react-chartjs-2";

type AnalyticsEvent = {
  id: number
  name: string
  props: any
  path: string | null
  referrer: string | null
  user_agent: string | null
  session_id: string | null
  ip: string | null
  country_code?: string | null
  country_name?: string | null
  org?: string | null
  asn?: string | null
  hostname?: string | null
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
  const [error, setError] = useState<string>("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [name, setName] = useState<string>("")
  const [q, setQ] = useState<string>("")
  const [from, setFrom] = useState<string>("")
  const [to, setTo] = useState<string>("")
  const [summary, setSummary] = useState<any | null>(null)
  const [series, setSeries] = useState<{ interval: string; items: { ts: string; total: number; unique_sessions: number }[] } | null>(null)

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
        if (from) params.set('from', from)
        if (to) params.set('to', to)
        const res = await fetch(`/api/analytics/events?${params.toString()}`, { cache: 'no-store' })
        if (!res.ok) {
          const text = await res.text().catch(() => '')
          if (!cancelled) { setError(`Fehler beim Laden der Events (${res.status})`); setData({ page: 1, limit, total: 0, items: [] }) }
          return
        }

  function ccToFlag(cc?: string | null) {
    const code = (cc || '').toUpperCase();
    if (!code || code.length !== 2) return '🏳️';
    const A = 0x1F1E6;
    const offset = (c: string) => (c.charCodeAt(0) - 65);
    return String.fromCodePoint(A + offset(code[0]), A + offset(code[1]));
  }

  const Muted = ({children}:{children: any}) => (
    <span className="text-muted-foreground">{children}</span>
  )
        const json = await res.json().catch(() => null)
        if (!json) {
          if (!cancelled) { setError('Ungültige Server-Antwort für Events'); setData({ page: 1, limit, total: 0, items: [] }) }
          return
        }
        if (!cancelled) { setError(''); setData(json) }
      } catch (e) {
        console.error('Failed to load analytics events', e)
        if (!cancelled) { setError('Netzwerkfehler beim Laden der Events'); setData({ page: 1, limit, total: 0, items: [] }) }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [page, limit, name, q, from, to])

  useEffect(() => {
    let cancelled = false
    async function loadSummary() {
      try {
        const params = new URLSearchParams()
        if (name.trim()) params.set('name', name.trim())
        if (q.trim()) params.set('q', q.trim())
        if (from) params.set('from', from)
        if (to) params.set('to', to)
        const res = await fetch(`/api/analytics/summary?${params.toString()}`, { cache: 'no-store' })
        if (!res.ok) {
          if (!cancelled) setSummary(null)
          return
        }
        const json = await res.json().catch(() => null)
        if (!json) { if (!cancelled) setSummary(null); return }
        if (!cancelled) setSummary(json)
      } catch (e) {
        console.error('Failed to load analytics summary', e)
        if (!cancelled) setSummary(null)
      }
    }
    loadSummary()
    return () => { cancelled = true }
  }, [name, q, from, to])

  useEffect(() => {
    let cancelled = false
    async function loadSeries() {
      try {
        const params = new URLSearchParams()
        if (name.trim()) params.set('name', name.trim())
        if (q.trim()) params.set('q', q.trim())
        if (from) params.set('from', from)
        if (to) params.set('to', to)
        const res = await fetch(`/api/analytics/timeseries?${params.toString()}`, { cache: 'no-store' })
        if (!res.ok) { if (!cancelled) setSeries(null); return }
        const json = await res.json().catch(() => null)
        if (!json) { if (!cancelled) setSeries(null); return }
        if (!cancelled) setSeries(json)
      } catch (e) {
        console.error('Failed to load analytics timeseries', e)
        if (!cancelled) setSeries(null)
      }
    }
    loadSeries()
    return () => { cancelled = true }
  }, [name, q, from, to])

  function setPresetDays(days: number) {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - (days - 1))
    setFrom(start.toISOString().slice(0,10))
    setTo(end.toISOString().slice(0,10))
    setPage(1)
  }

  function exportCsv() {
    const rows = (data?.items || [])
    const header = [
      'created_at','name','path','referrer','user_agent','ip','country_code','country_name','org','asn','hostname','session_id','props'
    ]
    const lines = [header.join(',')]
    for (const ev of rows as any[]) {
      const vals = [
        ev.created_at,
        ev.name,
        ev.path || '',
        ev.referrer || '',
        ev.user_agent || '',
        ev.ip || '',
        ev.country_code || '',
        ev.country_name || '',
        ev.org || '',
        ev.asn || '',
        ev.hostname || '',
        ev.session_id || '',
        JSON.stringify(ev.props || {})
      ].map(v => '"' + String(v).replaceAll('"','""') + '"')
      lines.push(vals.join(','))
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const stamp = new Date().toISOString().slice(0,19).replaceAll(':','-')
    a.download = `analytics-export-${stamp}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Besucheranalysen</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPage(1)}>Neu laden</Button>
          <Button variant="outline" onClick={exportCsv}>CSV Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border p-4">
          <div className="mb-2 font-medium">Besuche über Zeit</div>
          {series && series.items.length > 0 ? (
            <ReactChart
              type="line"
              data={{
                labels: series.items.map(i => new Date(i.ts).toLocaleString()),
                datasets: [
                  {
                    label: 'Events',
                    data: series.items.map(i => i.total),
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37,99,235,0.2)',
                    tension: 0.3,
                    fill: true,
                  },
                  {
                    label: 'Eindeutige Sessions',
                    data: series.items.map(i => i.unique_sessions),
                    borderColor: '#16a34a',
                    backgroundColor: 'rgba(22,163,74,0.2)',
                    tension: 0.3,
                    fill: true,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true } },
                scales: { x: { ticks: { autoSkip: true } }, y: { beginAtZero: true } },
              }}
              height={260}
            />
          ) : (
            <div className="text-sm text-muted-foreground">Keine Daten im gewählten Zeitraum</div>
          )}
        </div>

        <div className="rounded-lg border p-4">
          <div className="mb-2 font-medium">Top Länder</div>
          {summary?.top_countries?.length ? (
            <ReactChart
              type="bar"
              data={{
                labels: summary.top_countries.map((c: any) => c.label),
                datasets: [{
                  label: 'Anzahl',
                  data: summary.top_countries.map((c: any) => c.c),
                  backgroundColor: '#7c3aed'
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { ticks: { autoSkip: true } }, y: { beginAtZero: true } },
              }}
              height={260}
            />
          ) : (
            <div className="text-sm text-muted-foreground">Noch keine Länderdaten</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
        <div className="col-span-1">
          <label className="text-sm text-muted-foreground">Event-Name</label>
          <Input placeholder="z.B. navigation_click" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="text-sm text-muted-foreground">Volltextsuche</label>
          <Input placeholder="Pfad, Referrer, User Agent, Props" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Von</label>
          <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1) }} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Bis</label>
          <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1) }} />
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

      <div className="flex flex-wrap gap-2 mb-6">
        <Button variant="outline" onClick={() => setPresetDays(1)}>Heute</Button>
        <Button variant="outline" onClick={() => setPresetDays(7)}>Letzte 7 Tage</Button>
        <Button variant="outline" onClick={() => setPresetDays(30)}>Letzte 30 Tage</Button>
        <Button variant="outline" onClick={() => { setFrom(''); setTo(''); setPage(1) }}>Alle</Button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="border rounded-md p-4">
            <div className="text-sm text-muted-foreground">Events gesamt</div>
            <div className="text-2xl font-semibold">{summary.total}</div>
            <div className="text-sm text-muted-foreground mt-2">Unique Sessions: {summary.unique_sessions} • Unique IPs: {summary.unique_ips}</div>
          </div>
          <div className="border rounded-md p-4">
            <div className="text-sm font-medium mb-2">Top Events</div>
            <ul className="text-sm space-y-1">
              {summary.top_events?.map((e: any) => (
                <li key={e.name} className="flex justify-between"><span className="truncate max-w-[70%]" title={e.name}>{e.name}</span><span className="tabular-nums">{e.c}</span></li>
              ))}
            </ul>
          </div>
          <div className="border rounded-md p-4">
            <div className="text-sm font-medium mb-2">Top Länder / Organisationen</div>
            <ul className="text-sm space-y-1">
              {summary.top_countries?.map((c: any) => (
                <li key={c.country_code + c.country_name} className="flex justify-between"><span>{c.country_code || '?'}</span><span className="tabular-nums">{c.c}</span></li>
              ))}
            </ul>
            <div className="h-2" />
            <ul className="text-sm space-y-1">
              {summary.top_orgs?.map((o: any) => (
                <li key={o.org} className="flex justify-between"><span className="truncate max-w-[70%]" title={o.org}>{o.org}</span><span className="tabular-nums">{o.c}</span></li>
              ))}
            </ul>
          </div>
        </div>
      )}

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
              <TableRow><TableCell colSpan={11}>Lade Daten…</TableCell></TableRow>
            )}
            {!loading && data?.items.length === 0 && (
              <TableRow><TableCell colSpan={11}>Keine Einträge</TableCell></TableRow>
            )}
            {data?.items.map((ev: any) => (
              <TableRow key={ev.id}>
                <TableCell className="whitespace-nowrap">{new Date(ev.created_at).toLocaleString()}</TableCell>
                <TableCell className="font-mono text-xs">{ev.name}</TableCell>
                <TableCell className="truncate max-w-[220px]" title={ev.path || ''}>{ev.path}</TableCell>
                <TableCell className="truncate max-w-[320px]" title={JSON.stringify(ev.props)}>
                  <code className="text-xs">{JSON.stringify(ev.props)}</code>
                </TableCell>
                <TableCell title={ev.country_name || ''}>
                  {ev.country_code ? (
                    <Badge variant="secondary" title={ev.country_name || ''}>
                      <span className="mr-1">{ccToFlag(ev.country_code)}</span>{ev.country_code}
                    </Badge>
                  ) : <Muted>—</Muted>}
                </TableCell>
                <TableCell className="truncate max-w-[220px]" title={ev.org || ''}>
                  {ev.org ? <Badge variant="outline">{ev.org}</Badge> : <Muted>—</Muted>}
                </TableCell>
                <TableCell className="truncate max-w-[220px]" title={ev.hostname || ''}>
                  {ev.hostname ? <Badge variant="outline">{ev.hostname}</Badge> : <Muted>—</Muted>}
                </TableCell>
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
