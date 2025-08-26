import { type NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { UnitCard, Advantage, Challenge, CaseStudy, Approach, Step, Resource } from "../../../../types/unit-cards"
import FileManager from "../../shared/file-manager";
import { isAuthenticated, unauthorizedResponse } from "../../shared/auth-utils";
import { pathfinderUnits } from "@/app/pathfinder/pathfinder-units";

const FileManagerInstance = FileManager.getInstance();

export async function GET(request: NextRequest) {
    try {
        console.log("[UNITCARDS-API] GET - Lade Unit-Cards aus der Datenbank...");
        const unitcards = await FileManagerInstance.getFile("pathfinder/unit-cards/unit-cards.json");
        
        if (unitcards && unitcards.length > 0) {
            const activeUnitCards = unitcards.filter((card: UnitCard) => card.active !== false);
            console.log(`[UNITCARDS-API] ${activeUnitCards.length} aktive Unit-Cards aus der Datenbank geladen (${unitcards.length} gesamt)`);
            return NextResponse.json(activeUnitCards);
        } else {
            // Seed once from pathfinderUnits if DB is empty
            console.log("[UNITCARDS-API] Keine Unit-Cards in der DB – führe Initialimport aus pathfinder-units.ts durch...");

            const toId = (idx: number) => idx + 1;
            const mapped: UnitCard[] = (pathfinderUnits || []).slice(0, 6).map((unit: any, index: number) => {
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
                        approach.push({ title: p.title, description: p.description || "", steps });
                    });
                }
                const resources: Resource[] = [];
                (unit.resources || []).forEach((r: any) => resources.push({
                    title: r.title,
                    description: r.description || r.format || r.type || "",
                    format: r.format,
                    icon: r.icon,
                    pdf: r.pdf,
                }));
                (unit.workshops || []).forEach((w: any) => resources.push({
                    title: w.title,
                    description: w.description || "",
                    duration: w.duration,
                    price: w.price ? String(w.price) : undefined,
                    icon: w.icon,
                }));
                (unit.events || []).forEach((e: any) => resources.push({
                    title: e.title,
                    description: e.description || `${e.date || ""} ${e.time || ""} ${e.location || ""}`.trim(),
                }));
                (unit.trainings || []).forEach((t: any) => resources.push({
                    title: t.title,
                    description: t.description || "",
                    duration: t.duration,
                }));

                const tags: string[] = Array.isArray(unit.technologies) ? unit.technologies : [];

                const uc: UnitCard = {
                    id: toId(index),
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
            });

            await FileManagerInstance.uploadFile(mapped, "pathfinder/unit-cards/unit-cards.json");
            try {
                revalidatePath("/admin/unit-cards");
                revalidatePath("/pathfinder");
                revalidatePath("/landing");
                mapped.forEach(m => { if (m.id) revalidatePath(`/pathfinder/${m.id}`) });
            } catch (e) {
                console.error("[UNITCARDS-API] Revalidate nach Initialimport fehlgeschlagen", e);
            }

            const active = mapped.filter((card: UnitCard) => card.active !== false);
            console.log(`[UNITCARDS-API] Initialimport abgeschlossen: ${active.length} aktive Unit-Cards`);
            return NextResponse.json(active);
        }
    } catch (error) {
        console.error("[UNITCARDS-API] Fehler beim Laden der Unit-Cards:", error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST (request: NextRequest) {
    // Check if request is authenticated
    if (!isAuthenticated(request)) {
        return unauthorizedResponse();
    }

    const new_unitCard: UnitCard = await request.json();
    if (new_unitCard.active === undefined) {
        new_unitCard.active = true;
    }
    
    let db_unitCards: UnitCard[] = await FileManagerInstance.getFile("pathfinder/unit-cards/unit-cards.json");
    if (db_unitCards) {
        new_unitCard.id = _generateId(db_unitCards)
        db_unitCards.push(new_unitCard);
        return await _saveToBlob(db_unitCards);
    }
    else {
        console.log("[UNITCARDS-API]- Keine Unit-Cards Datenbank gefunden, lege neue an!");
        db_unitCards = [];
        new_unitCard.id = Math.floor(Math.random() * 90000 + 10000)
        db_unitCards.push(new_unitCard);
        return await _saveToBlob(db_unitCards);
    }
}

async function _saveToBlob (unitcards: UnitCard[]) {
    await FileManagerInstance.uploadFile(unitcards, "pathfinder/unit-cards/unit-cards.json");
    console.log(`[UNITCARDS-API] ${unitcards.length} Unit-Cards erfolgreich gespeichert`);
    revalidatePath("/admin/unit-cards");
    revalidatePath("/landing");
    revalidatePath("/pathfinder");
    return NextResponse.json({
        success: true,
        message: "Unit-Cards erfolgreich gespeichert",
    })
}

function _generateId (unitcards: UnitCard[]) {
    let attempts = 0;
    while (attempts < 3) {
        const randomId = Math.floor(Math.random() * 90000 + 10000);
        if (!unitcards.some(card => card.id === randomId)) {
            return randomId;
        }
        attempts++;
    }
    throw new Error("Could not generate unique ID");
}