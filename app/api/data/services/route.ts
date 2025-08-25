import { type NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import FileManager from "../../shared/file-manager";
import { ICookieStore } from "../../shared/Interfaces/ICookieStore";
import { isAuthenticated as authUtilsIsAuthenticated, unauthorizedResponse } from "../../shared/auth-utils";
import { defaultServices as frontendDefaultServices } from "@/data/default-data";

const FileManagerInstance = FileManager.getInstance();

// Hilfsfunktion zum Abrufen eines Blobs
async function getBlobContent(url: string): Promise<any> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching blob:", error);
    throw error;
  }
}

// Hilfsfunktion zum Überprüfen, ob ein Blob existiert
async function blobExists(key: string): Promise<any | null> {
  try {
    const file: any = await FileManagerInstance.getFile(key);
    return file || null;
  } catch (error) {
    console.error("Error checking if blob exists:", error);
    return null;
  }
}

// Use the shared auth-utils isAuthenticated function
function isAuthenticated(request: NextRequest): boolean {
  return authUtilsIsAuthenticated(request);
}

// Funktion zum Laden der Services aus dem Blob Storage
async function getServices() {
  try {
    const blobPath = `services/data.json`;
    const blob = await blobExists(blobPath);

    if (blob) {
      return blob;
    }

    // Wenn keine Daten gefunden wurden, speichere die Standarddaten
    // await FileManagerInstance.uploadFile(defaultServices, "services/data.json");
    // await saveServices(defaultServices);
    return frontendDefaultServices;
  } catch (error) {
    console.error("Fehler beim Laden der Services aus Blob Storage:", error);
    // return frontendDefaultServices;
  }
}

// Funktion zum Speichern der Services im Blob Storage
async function saveServices(services: any[]) {
  try {
    // Überprüfe die Authentifizierung

    // Erstelle zuerst ein Backup der aktuellen Daten
    const blobPath = `services/data.json`;
    const blob = await blobExists(blobPath);

    if (blob) {
      const timestamp = Date.now();
      const backupPath = `services/backup-${timestamp}.json`;

      await FileManagerInstance.uploadFile(blob, backupPath);
    }

    // Speichere die neuen Daten
    await FileManagerInstance.uploadFile(services, blobPath);

    revalidatePath("/admin/services");

    return true;
  } catch (error) {
    console.error("Fehler beim Speichern der Services in Blob Storage:", error);
    return false;
  }
}

export async function GET() {
  try {
    const services = await getServices();
    return NextResponse.json(services);
  } catch (error) {
    console.error("Fehler beim Laden der Services:", error);
    return NextResponse.json({ error: "Fehler beim Laden der Services" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    if (!isAuthenticated(request)) {
      return unauthorizedResponse();
    }

    // Hole die Daten aus dem Request
    const services = await request.json();

    // Speichere die Services
    const result = await saveServices(services);

    if (result) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Fehler beim Speichern der Services" }, { status: 500 });
    }
  } catch (error) {
    console.error("Fehler beim Speichern der Services:", error);
    return NextResponse.json({ error: "Fehler beim Speichern der Services" }, { status: 500 });
  }
}
