import { type NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { UnitCard } from "../../../../../types/unit-cards";
import FileManager from "../../../shared/file-manager";
import { isAuthenticated, unauthorizedResponse } from "../../../shared/auth-utils";

const FileManagerInstance = FileManager.getInstance();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[UNITCARDS-API] GET - Loading Unit-Card with ID: ${params.id}`);
    const unitCards = await FileManagerInstance.getFile("pathfinder/unit-cards/unit-cards.json");
    
    if (!unitCards || !unitCards.length) {
      return NextResponse.json({ error: "Unit Cards database not found" }, { status: 404 });
    }
    
    const unitCard = unitCards.find((card: UnitCard) => card.id === parseInt(params.id));
    
    if (!unitCard) {
      return NextResponse.json({ error: "Unit Card not found" }, { status: 404 });
    }
    
    return NextResponse.json(unitCard);
  } catch (error) {
    console.error("[UNITCARDS-API] Error loading Unit-Card:", error);
    return NextResponse.json({ error: "Failed to load unit card" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check if request is authenticated
  if (!isAuthenticated(request)) {
    return unauthorizedResponse();
  }

  try {
    console.log(`[UNITCARDS-API] PUT - Updating Unit-Card with ID: ${params.id}`);
    const updatedUnitCard: UnitCard = await request.json();
    let unitCards: UnitCard[] = await FileManagerInstance.getFile("pathfinder/unit-cards/unit-cards.json");
    
    if (!unitCards || !unitCards.length) {
      return NextResponse.json({ error: "Unit Cards database not found" }, { status: 404 });
    }
    
    const cardIndex = unitCards.findIndex((card: UnitCard) => card.id === parseInt(params.id));
    
    if (cardIndex === -1) {
      return NextResponse.json({ error: "Unit Card not found" }, { status: 404 });
    }
    
    // Ensure the ID remains the same
    updatedUnitCard.id = parseInt(params.id);
    unitCards[cardIndex] = updatedUnitCard;
    
    await FileManagerInstance.uploadFile(unitCards, "pathfinder/unit-cards/unit-cards.json");
    
    console.log(`[UNITCARDS-API] Unit-Card with ID: ${params.id} successfully updated`);
    
    try {
        console.log(`[UNITCARDS-API] Starting revalidation for updated card ${params.id}`);
        revalidatePath("/admin/unit-cards");
        console.log(`[UNITCARDS-API] Revalidated /admin/unit-cards`);
        revalidatePath("/pathfinder");
        console.log(`[UNITCARDS-API] Revalidated /pathfinder`);
        revalidatePath(`/pathfinder/${params.id}`);
        console.log(`[UNITCARDS-API] Revalidated /pathfinder/${params.id}`);
        revalidatePath("/landing");
        console.log(`[UNITCARDS-API] Revalidated /landing`);
        console.log(`[UNITCARDS-API] All paths revalidated successfully`);
    } catch (revalidateError) {
        console.error(`[UNITCARDS-API] Error during revalidation:`, revalidateError);
    }
    
    return NextResponse.json({
      success: true,
      message: "Unit Card successfully updated",
    });
  } catch (error) {
    console.error("[UNITCARDS-API] Error updating Unit-Card:", error);
    return NextResponse.json({ error: "Failed to update unit card" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check if request is authenticated
  if (!isAuthenticated(request)) {
    return unauthorizedResponse();
  }

  try {
    console.log(`[UNITCARDS-API] DELETE - Deleting Unit-Card with ID: ${params.id}`);
    // Convert string ID to number for proper comparison
    const numericId = parseInt(params.id);
    let unitCards: UnitCard[] = await FileManagerInstance.getFile("pathfinder/unit-cards/unit-cards.json");
    
    if (!unitCards || !unitCards.length) {
      return NextResponse.json({ error: "Unit Cards database not found" }, { status: 404 });
    }
    
    const filteredUnitCards = unitCards.filter((card: UnitCard) => card.id !== numericId);
    
    if (filteredUnitCards.length === unitCards.length) {
      return NextResponse.json({ error: "Unit Card not found" }, { status: 404 });
    }
    
    await FileManagerInstance.uploadFile(filteredUnitCards, "pathfinder/unit-cards/unit-cards.json");
    
    console.log(`[UNITCARDS-API] Unit-Card with ID: ${params.id} successfully deleted`);
    
    try {
        console.log(`[UNITCARDS-API] Starting revalidation for deleted card ${params.id}`);
        revalidatePath("/admin/unit-cards");
        console.log(`[UNITCARDS-API] Revalidated /admin/unit-cards`);
        revalidatePath("/pathfinder");
        console.log(`[UNITCARDS-API] Revalidated /pathfinder`);
        revalidatePath(`/pathfinder/${params.id}`);
        console.log(`[UNITCARDS-API] Revalidated /pathfinder/${params.id}`);
        revalidatePath("/landing");
        console.log(`[UNITCARDS-API] Revalidated /landing`);
        console.log(`[UNITCARDS-API] All paths revalidated successfully`);
    } catch (revalidateError) {
        console.error(`[UNITCARDS-API] Error during revalidation:`, revalidateError);
    }
    
    return NextResponse.json({
      success: true,
      message: "Unit Card successfully deleted",
    });
  } catch (error) {
    console.error("[UNITCARDS-API] Error deleting Unit-Card:", error);
    return NextResponse.json({ error: "Failed to delete unit card" }, { status: 500 });
  }
}
