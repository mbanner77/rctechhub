import { type NextRequest, NextResponse } from "next/server"
import { isAuthenticated as authUtilsIsAuthenticated, unauthorizedResponse } from "../../shared/auth-utils"
import { ConsultingPhasesData } from "@/types/consulting-phases"
import FileManager from "../../shared/file-manager"

const defaultData: ConsultingPhasesData = {
  introTitle: "Unser Beratungsbaukasten",
  introText:
    "Mit unserem modularen Beratungsbaukasten können Sie genau die Leistungen auswählen, die Sie benötigen. Kombinieren Sie Workshops, Beratungsleistungen und Implementierungspakete zu einer maßgeschneiderten Lösung.",
  ctaText: "Individuelles Beratungspaket zusammenstellen",
  phases: [
    {
      id: "phase-1",
      title: "Phase 1: Analyse",
      description:
        "Wir verstehen Ziele, Rahmenbedingungen und Ist-Situation und schaffen eine belastbare Entscheidungsgrundlage.",
      offers: [
        { id: "p1-o1", title: "Discovery Workshop" },
        { id: "p1-o2", title: "BTP Readiness Assessment" },
        { id: "p1-o3", title: "Anforderungsanalyse" },
      ],
    },
    {
      id: "phase-2",
      title: "Phase 2: Design",
      description:
        "Wir entwickeln tragfähige Zielbilder, Architektur- und Sicherheitskonzepte sowie Umsetzungsroadmaps.",
      offers: [
        { id: "p2-o1", title: "Solution Design Workshop" },
        { id: "p2-o2", title: "Architekturdesign" },
        { id: "p2-o3", title: "Sicherheitskonzept" },
      ],
    },
    {
      id: "phase-3",
      title: "Phase 3: Implementierung",
      description:
        "Wir setzen die Lösung iterativ um, integrieren Systeme und liefern schnell nutzbare Ergebnisse.",
      offers: [
        { id: "p3-o1", title: "CAP Entwicklung" },
        { id: "p3-o2", title: "Fiori App-Entwicklung" },
        { id: "p3-o3", title: "Integration Suite Setup" },
      ],
    },
    {
      id: "phase-4",
      title: "Phase 4: Go-Live",
      description:
        "Wir bereiten den stabilen Betrieb vor, unterstützen beim Rollout und qualifizieren das Team.",
      offers: [
        { id: "p4-o1", title: "Deployment & Go-Live" },
        { id: "p4-o2", title: "Monitoring Setup" },
        { id: "p4-o3", title: "Schulung & Enablement" },
      ],
    },
  ],
}

const dataKey = `realcore-data/consulting-phases/data.json`

function isAuthenticated(request: NextRequest): boolean {
  return authUtilsIsAuthenticated(request)
}

async function getData(): Promise<ConsultingPhasesData> {
  const fm = FileManager.getInstance()
  const existing = await fm.getFile(dataKey)
  if (existing) return existing as ConsultingPhasesData
  await saveData(defaultData)
  return defaultData
}

async function saveData(data: ConsultingPhasesData) {
  try {
    const fm = FileManager.getInstance()
    const ok = await fm.uploadFile(data, dataKey)
    return !!ok
  } catch (e) {
    console.error("Error saving consulting phases", e)
    return false
  }
}

export async function GET() {
  try {
    const data = await getData()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) return unauthorizedResponse()
  try {
    const body = (await request.json()) as ConsultingPhasesData
    const ok = await saveData(body)
    if (ok) return NextResponse.json({ success: true })
    return NextResponse.json({ error: "Fehler beim Speichern" }, { status: 500 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Fehler beim Speichern" }, { status: 500 })
  }
}
