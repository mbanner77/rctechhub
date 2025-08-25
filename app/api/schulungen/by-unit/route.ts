import { NextResponse } from 'next/server';
import FileManager from '../../shared/file-manager';
import { Schulung } from '@/types/schulung';

// Path for storing schulungen data in blob storage - must match path in main schulungen API
const SCHULUNGEN_BLOB_PATH = 'realcore-data/pathfinder/schulungen/data.json';

export async function GET(request: Request) {
  try {
    // Get the unitId from query params if provided
    const url = new URL(request.url);
    const unitId = url.searchParams.get('unitId');
    
    // Get the FileManager instance
    const fileManager = FileManager.getInstance();
    
    // Get schulungen from the same path used by the main API
    const schulungenData = await fileManager.getFile(SCHULUNGEN_BLOB_PATH);
    
    if (!schulungenData || !Array.isArray(schulungenData) || schulungenData.length === 0) {
      console.log("[SCHULUNGEN] No schulungen found in data file");
      return NextResponse.json([], { status: 200 });
    }
    
    // Filter by unitId if provided
    if (unitId) {
      const filteredSchulungen = schulungenData.filter(
        (schulung: Schulung) => schulung.unitId === unitId || schulung.unitId === 'all'
      );
      console.log(`[SCHULUNGEN] Found ${filteredSchulungen.length} schulungen for unitId ${unitId}`);
      return NextResponse.json(filteredSchulungen, { status: 200 });
    }
    
    // If no unitId provided, return all schulungen
    console.log(`[SCHULUNGEN] Returning all ${schulungenData.length} schulungen`);
    return NextResponse.json(schulungenData, { status: 200 });
    
  } catch (error) {
    console.error('Error in GET /api/schulungen/by-unit:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Schulungen' },
      { status: 500 }
    );
  }
}
