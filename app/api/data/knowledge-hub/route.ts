import { type NextRequest, NextResponse } from "next/server";
import { defaultKnowledgeHubContent } from "@/data/default-data";
import FileManager from "../../shared/file-manager";
import { revalidatePath } from "next/cache";
import { isAuthenticated, unauthorizedResponse } from "../../shared/auth-utils";
const Cache = new Map();

// Pfad zum Blob
const BASE_PATH = "knowledge-hub";

const FileManagerInstance = FileManager.getInstance();

// GET-Handler für Knowledge Hub Inhalte
export async function GET() {
  try {
    // Prüfe, ob der Blob existiert
    const knowledgeHubContent = await FileManagerInstance.getFile(`${BASE_PATH}/data.json`);

    // Wenn keine Daten gefunden wurden, verwende die Standarddaten
    if (!knowledgeHubContent) return NextResponse.json(defaultKnowledgeHubContent);
    let knowledgeHubContentCached: any = Cache.get('knowledgeHubContent');
    if (!knowledgeHubContentCached) {
      Cache.set('knowledgeHubContent', knowledgeHubContent);
      knowledgeHubContentCached = Cache.get('knowledgeHubContent');
    }

    return NextResponse.json(knowledgeHubContentCached, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Surrogate-Control": "no-store",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Fehler beim Laden der Knowledge Hub Inhalten:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Knowledge Hub Inhalten" },
      { status: 500 }
    );
  }
}

// POST-Handler für Knowledge Hub Inhalte
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    if (!isAuthenticated(request)) {
      return unauthorizedResponse();
    }

    // Hole die Daten aus dem Request
    const knowledgeHubContent = await request.json();

    const isUploaded = await FileManagerInstance.uploadFile(
      knowledgeHubContent,
      `${BASE_PATH}/data.json`
    );

    Cache.set('knowledgeHubContent', knowledgeHubContent);

    revalidatePath("/admin/knowledge-hub");
    return NextResponse.json({ success: isUploaded });
  } catch (error) {
    console.error("Fehler beim Speichern der Knowledge Hub Inhaltens:", error);
    return NextResponse.json(
      { error: "Fehler beim Speichern der Knowledge Hub Inhalten" },
      { status: 500 }
    );
  }
}
