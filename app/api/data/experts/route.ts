import { type NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import FileManager from "../../shared/file-manager";
import { defaultExperts } from "../../../../data/experts";

const FileManagerInstance = FileManager.getInstance();

function validateExperts(experts: any[]): { isValid: boolean; error?: string } {
  if (!Array.isArray(experts)) {
    return { isValid: false, error: "Expert data must be an array" };
  }

  for (const expert of experts) {
    if (!expert.id || !expert.name || !expert.firstName) {
      return {
        isValid: false,
        error: "Each expert must have at least ID, name and first name"
      };
    }

    if (!expert.name.trim() || !expert.firstName.trim()) {
      return {
        isValid: false,
        error: "Expert name and first name cannot be empty"
      };
    }
  }

  return { isValid: true };
}

export async function GET(request: NextRequest) {
  try {
    console.log("[EXPERTS-API] GET - Lade Experten aus der Datenbank...");
    // Load experts from the file manager / DB
    const experts = await FileManagerInstance.getFile("pathfinder/experts/experts.json");
    if (experts && experts.length > 0) {
      console.log(`[EXPERTS-API] ${experts.length} Experten aus der Datenbank geladen`);
      return NextResponse.json(experts);
    } else {
      console.log("[EXPERTS-API] Keine Experten in der Datenbank gefunden, verwende Standarddaten");
      return NextResponse.json(defaultExperts);
    }
  } catch (error) {
    console.error("[EXPERTS-API] Fehler beim Laden der Experten:", error);
    return NextResponse.json(defaultExperts);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[EXPERTS-API] POST - Speichere Experten in der Datenbank...");

    const experts = await request.json();

    // validate the experts data
    const { isValid, error } = validateExperts(experts);
    if (!isValid) {
      return NextResponse.json(
        { error },
        { status: 400 }
      );
    }

    // Save to file manager / DB
    await FileManagerInstance.uploadFile(experts, "pathfinder/experts/experts.json");
    console.log(`[EXPERTS-API] ${experts.length} Experten erfolgreich gespeichert`);

    // Revalidate relevant paths
    revalidatePath("/admin/experts");
    revalidatePath("/experts");
    return NextResponse.json({
      success: true,
      message: "Experten erfolgreich gespeichert",
      count: experts.length
    });

  } catch (error) {
    console.error("[EXPERTS-API] Fehler beim Speichern der Experten:", error);
    return NextResponse.json(
      { error: "Fehler beim Speichern der Experten" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("[EXPERTS-API] DELETE - Lösche alle Experten...");

    await FileManagerInstance.deleteFile("pathfinder/experts/experts.json");

    console.log("[EXPERTS-API] Alle Experten erfolgreich gelöscht");

    // Revalidate relevant paths
    revalidatePath("/admin/experts");
    revalidatePath("/experts");

    return NextResponse.json({
      success: true,
      message: "Alle Experten erfolgreich gelöscht"
    });

  } catch (error) {
    console.error("[EXPERTS-API] Fehler beim Löschen der Experten:", error);
    return NextResponse.json(
      { error: "Fehler beim Löschen der Experten" },
      { status: 500 }
    );
  }
}
