import { type NextRequest, NextResponse } from "next/server";
import { UnitCard } from "@/types/unit-cards"
import FileManager from "@/app/api/shared/file-manager";
import { isAuthenticated, unauthorizedResponse } from "@/app/api/shared/auth-utils";

const FileManagerInstance = FileManager.getInstance();

export async function GET(request: NextRequest) {
    // Check if request is authenticated for admin access
    if (!isAuthenticated(request)) {
        return unauthorizedResponse();
    }

    try {
        console.log("[ADMIN-UNITCARDS-API] GET - Lade alle Unit-Cards für Admin-Ansicht...");
        const unitcards = await FileManagerInstance.getFile("pathfinder/unit-cards/unit-cards.json");
        if (unitcards && unitcards.length > 0) {
            console.log(`[ADMIN-UNITCARDS-API] ${unitcards.length} Unit-Cards (alle, inklusive inaktive) geladen`);
            return NextResponse.json(unitcards);
        }
        else
        {
            console.log("[ADMIN-UNITCARDS-API] Keine Unit-Cards in der Datenbank gefunden");
            return NextResponse.json([]);
        }
    } catch (error) {
        console.error("[ADMIN-UNITCARDS-API] Fehler beim Laden der Unit-Cards:", error);
        return NextResponse.json(error);
    }
}
