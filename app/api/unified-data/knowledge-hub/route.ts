import { type NextRequest, NextResponse } from "next/server";
import { getKnowledgeHubContent, saveKnowledgeHubContent } from "@/lib/unified-data-service";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export async function GET() {
  console.log("[API] GET /api/unified-data/knowledge-hub aufgerufen");
  try {
    const knowledgeHubContent = await getKnowledgeHubContent();
    console.log(`[API] ${knowledgeHubContent.length} Knowledge Hub geladen`);

    return NextResponse.json(knowledgeHubContent, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Surrogate-Control": "no-store",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("[API] Fehler beim Laden der Knowledge Hub:", error);
    return NextResponse.json({ error: "Fehler beim Laden der Knowledge Hub" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log("[API] POST /api/unified-data/knowledge-hub aufgerufen");
  try {
    const knowledgeHubContent = await request.json();
    console.log(`[API] Speichere ${knowledgeHubContent.length} Knowledge Hub`);

    const success = await saveKnowledgeHubContent(knowledgeHubContent);

    if (success) {
      console.log("[API] Knowledge Hub erfolgreich gespeichert");
      return NextResponse.json({ success: true });
    } else {
      console.error("[API] Fehler beim Speichern der Knowledge Hub");
      return NextResponse.json(
        { error: "Fehler beim Speichern der Knowledge Hub" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[API] Fehler beim Speichern der Knowledge Hub:", error);
    return NextResponse.json({ error: "Fehler beim Speichern der Knowledge Hub" }, { status: 500 });
  }
}
