import { type NextRequest, NextResponse } from "next/server";
import FileManager from "@/app/api/shared/file-manager";
import { isAuthenticated, unauthorizedResponse } from "@/app/api/shared/auth-utils";
import { revalidatePath } from "next/cache";
import { UnitCard, Advantage, Challenge, CaseStudy, Approach, Step, Resource } from "@/types/unit-cards";
import { pathfinderUnits } from "@/app/pathfinder/pathfinder-units";

const FileManagerInstance = FileManager.getInstance();

function toUnitCardId(index: number): number {
  // Stable numeric IDs 1..N in the order of pathfinderUnits
  return index + 1;
}

function mapUnit(unit: any, index: number): UnitCard {
  const advantages: (string | Advantage)[] = (unit.benefits || []).map((b: any) => ({
    title: b.title,
    description: b.description,
    catchPhrase: undefined,
    outcome: b.outcome,
    colorClass: b.colorClass,
  }));

  const challenges: (string | Challenge)[] = (unit.challenges || []).map((c: any) => ({
    title: c.title,
    description: c.description,
  }));

  const caseStudies: CaseStudy[] = (unit.caseStudies || []).map((cs: any) => ({
    title: cs.title,
    description: cs.summary || cs.description || "",
    summary: cs.summary,
    challenge: cs.challenge,
    solution: cs.solution,
    results: cs.results,
    tags: cs.tags || [],
    industry: cs.industry,
    category: unit.title,
    client_name: cs.client || cs.client_name || "",
    client: cs.client,
    clientLogo: cs.clientLogo,
    location: cs.location,
    image: cs.image,
    pdf: cs.pdf,
  }));

  const approach: Approach[] = [];
  if (unit.approach && unit.approach.phases) {
    unit.approach.phases.forEach((p: any) => {
      const steps: Step[] = [{
        title: p.title,
        description: p.description || "",
        activities: p.activities || [],
        results: p.outcomes || [],
      }];
      approach.push({
        title: p.title,
        description: p.description || "",
        steps,
      });
    });
  }

  const resources: Resource[] = [];
  (unit.resources || []).forEach((r: any) => {
    resources.push({
      title: r.title,
      description: r.description || r.format || r.type || "",
      format: r.format,
      icon: r.icon,
      pdf: r.pdf,
    });
  });
  (unit.workshops || []).forEach((w: any) => {
    resources.push({
      title: w.title,
      description: w.description || "",
      duration: w.duration,
      price: w.price ? String(w.price) : undefined,
      icon: w.icon,
    });
  });
  (unit.events || []).forEach((e: any) => {
    resources.push({
      title: e.title,
      description: e.description || `${e.date || ""} ${e.time || ""} ${e.location || ""}`.trim(),
    });
  });
  (unit.trainings || []).forEach((t: any) => {
    resources.push({
      title: t.title,
      description: t.description || "",
      duration: t.duration,
    });
  });

  const tags: string[] = Array.isArray(unit.technologies) ? unit.technologies : [];

  const uc: UnitCard = {
    id: toUnitCardId(index),
    title: unit.title,
    subtitle: unit.shortDescription || "",
    description: unit.description || "",
    tags,
    category: unit.title,
    image: unit.image,
    introduction: unit.quote || unit.description || "",
    slogan: unit.shortDescription || "",
    quote: unit.quote,
    advantages,
    challenges,
    caseStudies,
    approach,
    resources,
    heroImage: unit.heroImage,
    backgroundPattern: unit.backgroundPattern,
    expertIds: unit.expertIds || [],
    active: true,
  };
  return uc;
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return unauthorizedResponse();
  }

  try {
    // Load existing DB
    let existing: UnitCard[] = await FileManagerInstance.getFile("pathfinder/unit-cards/unit-cards.json");
    if (!Array.isArray(existing)) existing = [] as UnitCard[];

    // Build mapped units
    const mapped: UnitCard[] = (pathfinderUnits || []).slice(0, 6).map((u: any, idx: number) => mapUnit(u, idx));

    // Merge by title (idempotent): update if title matches, else add
    const byTitle = new Map<string, UnitCard>(existing.map(u => [u.title, u]));
    mapped.forEach((m) => {
      const prev = byTitle.get(m.title);
      if (prev) {
        // keep existing numeric id if present
        m.id = prev.id ?? m.id;
      }
      byTitle.set(m.title, m);
    });

    // Create stable array sorted by id then title
    const result = Array.from(byTitle.values())
      .sort((a, b) => {
        const ai = a.id ?? 0;
        const bi = b.id ?? 0;
        if (ai !== bi) return ai - bi;
        return a.title.localeCompare(b.title);
      });

    await FileManagerInstance.uploadFile(result, "pathfinder/unit-cards/unit-cards.json");

    try {
      revalidatePath("/admin/unit-cards");
      revalidatePath("/pathfinder");
      revalidatePath("/landing");
      // Revalidate individual unit pages (numeric ids)
      (mapped || []).forEach((m) => {
        const id = m.id ?? 0;
        if (id) {
          try {
            revalidatePath(`/pathfinder/${id}`);
          } catch {}
        }
      });
    } catch (e) {
      console.error("[ADMIN-UNITCARDS-IMPORT] Revalidate error", e);
    }

    return NextResponse.json({ success: true, count: mapped.length });
  } catch (error) {
    console.error("[ADMIN-UNITCARDS-IMPORT] Error during import", error);
    return NextResponse.json({ success: false, error: "Import failed" }, { status: 500 });
  }
}
