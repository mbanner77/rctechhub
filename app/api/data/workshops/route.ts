import { type NextRequest, NextResponse } from "next/server";
import { defaultWorkshops } from "@/data/default-data";

import FileManager from "../../shared/file-manager";
import { revalidatePath } from "next/cache";
import { isAuthenticated, unauthorizedResponse } from "../../shared/auth-utils";

// Pfad zum Blob
const BASE_PATH = "workshops";

const FileManagerInstance = FileManager.getInstance();

interface Workshop {
  id?: string
  title: string
  description: string
  duration: string
  price: number
  icon?: string
}

// GET-Handler für Workshops Inhalte
export async function GET() {
  try {
    // Prüfe, ob der Blob existiert
    const workshopsContent = await FileManagerInstance.getFile(`${BASE_PATH}/data.json`);

    if (workshopsContent) {
      return NextResponse.json(workshopsContent);
    }

    // Wenn keine Daten gefunden wurden, verwende die Standarddaten
    return NextResponse.json(defaultWorkshops);
  } catch (error) {
    console.error("Fehler beim Laden der Workshops Inhalten:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Workshops Inhalten" },
      { status: 500 }
    );
  }
}

// POST-Handler für Workshops Inhalte
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    if (!isAuthenticated(request)) {
      return unauthorizedResponse();
    }

    // Hole die Daten aus dem Request
    const workshopsContent = await request.json();

    const isUploaded = await FileManagerInstance.uploadFile(
      workshopsContent,
      `${BASE_PATH}/data.json`
    );

    revalidatePath("/admin/landing-page");
    return NextResponse.json({ success: isUploaded });
  } catch (error) {
    console.error("Fehler beim Speichern der Workshops Inhaltens:", error);
    return NextResponse.json(
      { error: "Fehler beim Speichern der Workshops Inhalten" },
      { status: 500 }
    );
  }
}