import { type NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { UnitCard } from "../../../../types/unit-cards"
import FileManager from "../../shared/file-manager";
import { isAuthenticated, unauthorizedResponse } from "../../shared/auth-utils";

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
            console.log("[UNITCARDS-API] Keine Unit-Cards in der Datenbank gefunden, verwende Mock-Daten...");
            const mockData = await FileManagerInstance.getMockData("unit-cards");
            
            if (mockData && mockData.length > 0) {
                const activeMockCards = mockData.filter((card: UnitCard) => card.active !== false);
                console.log(`[UNITCARDS-API] ${activeMockCards.length} aktive Unit-Cards aus Mock-Daten geladen (${mockData.length} gesamt)`);
                return NextResponse.json(activeMockCards);
            } else {
                console.log("[UNITCARDS-API] Keine Mock-Daten verfügbar");
                return NextResponse.json([]);
            }
        }
    } catch (error) {
        console.error("[UNITCARDS-API] Fehler beim Laden der Unit-Cards:", error);
        console.log("[UNITCARDS-API] Versuche Mock-Daten zu laden...");
        
        try {
            const mockData = await FileManagerInstance.getMockData("unit-cards");
            if (mockData && mockData.length > 0) {
                const activeMockCards = mockData.filter((card: UnitCard) => card.active !== false);
                console.log(`[UNITCARDS-API] ${activeMockCards.length} aktive Unit-Cards aus Mock-Daten als Fallback geladen`);
                return NextResponse.json(activeMockCards);
            }
        } catch (mockError) {
            console.error("[UNITCARDS-API] Fehler beim Laden der Mock-Daten:", mockError);
        }
        
        return NextResponse.json([]);
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