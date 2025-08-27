"use server";

import { revalidatePath } from "next/cache";
import {
  defaultServices,
  defaultWorkshops,
  defaultKnowledgeHubContent,
  defaultResources,
} from "@/data/default-data";
import { defaultLandingPage } from "@/data/landing-page-data";
import { checkAuthAction } from "./auth-actions";
import { defaultMailConfig } from "./mail-config-default";

// Blob-Storage-Funktionen importieren
import {
  getServicesFromBlob,
  saveServicesToBlob,
  getWorkshopsFromBlob,
  saveWorkshopsToBlob,
  getKnowledgeHubContentFromBlob,
  saveKnowledgeHubContentToBlob,
  getResourcesFromBlob,
  saveResourcesToBlob,
  getMailConfigFromBlob,
  saveMailConfigToBlob,
  getLandingPageFromBlob,
  saveLandingPageToBlob,
  resetBlobDB,
} from "./blob-db-actions";

// Prüfen, ob wir in einer Produktionsumgebung sind
const isProduction = process.env.NODE_ENV === "production";

// Debug-Funktion
function debug(message: string, ...args: any[]) {
  console.log(`[UNIFIED-DATA-SERVICE] ${message}`, ...args);
}

// Hilfsfunktion zum Bereinigen von Objekten für die Serialisierung
function sanitizeForServer(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForServer(item));
  }

  const result: Record<string, any> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      // Überspringe Funktionen und Symbol-Eigenschaften
      if (typeof value === "function" || typeof value === "symbol") {
        continue;
      }

      // Rekursiv bereinigen
      result[key] = sanitizeForServer(value);
    }
  }

  return result;
}

// Hilfsfunktion zur Überprüfung der Authentifizierung für Admin-Operationen
async function ensureAuth() {
  if (isProduction) {
    try {
      debug(`Produktionsmodus: Überprüfe Authentifizierung`);
      const authResult = await checkAuthAction();
      if (!authResult.authenticated) {
        debug(`Nicht authentifiziert`);
        throw new Error("Nicht authentifiziert");
      }
    } catch (authError) {
      debug(`Fehler bei der Authentifizierungsprüfung`);
      throw authError;
    }
  } else {
    debug(`Entwicklungsmodus: Überspringe Authentifizierung`);
  }
}

// Revalidierungsfunktion für alle relevanten Pfade
async function revalidateAllPaths() {
  // Revalidiere alle wichtigen Pfade
  const paths = [
    "/",
    "/landing",
    "/home",
    "/services",
    "/workshops",
    "/knowledge-hub",
    "/resources",
    "/templates",
    "/btp-services",
    "/pathfinder",
    "/admin",
  ];

  for (const path of paths) {
    revalidatePath(path, "page");
    revalidatePath(path, "layout");
  }

  debug(`Alle Pfade revalidiert: ${paths.join(", ")}`);
}

// Services
export async function getServices() {
  debug(`getServices aufgerufen`);
  try {
    // Lade Daten aus Blob Storage
    const services = await getServicesFromBlob();
    debug(`${services.length} Services aus Blob Storage geladen`);
    return services;
  } catch (error) {
    console.error("Fehler beim Laden der Services:", error);
    debug(`Fehler beim Laden der Services, verwende Standarddaten`);
    return [...defaultServices];
  }
}

export async function saveServices(services: any[]) {
  debug(`saveServices aufgerufen mit ${services?.length || 0} Services`);
  try {
    // Überprüfe die Authentifizierung
    await ensureAuth();

    // Bereinige die Daten vor dem Speichern
    const sanitizedServices = services.map((service) => sanitizeForServer(service));

    // Speichere in Blob Storage
    const success = await saveServicesToBlob(sanitizedServices);

    if (success) {
      debug(`${sanitizedServices.length} Services in Blob Storage gespeichert`);
      // Revalidiere alle Pfade
      await revalidateAllPaths();
    } else {
      debug(`Fehler beim Speichern der Services in Blob Storage`);
    }

    return success;
  } catch (error) {
    console.error("Fehler beim Speichern der Services:", error);
    debug(`Fehler beim Speichern der Services`);
    return false;
  }
}

// Workshops
export async function getWorkshops() {
  debug(`getWorkshops aufgerufen`);
  try {
    // Lade Daten aus Blob Storage
    const workshops = await getWorkshopsFromBlob();
    debug(`${workshops.length} Workshops aus Blob Storage geladen`);
    return workshops;
  } catch (error) {
    console.error("Fehler beim Laden der Workshops:", error);
    debug(`Fehler beim Laden der Workshops, verwende Standarddaten`);
    return [...defaultWorkshops];
  }
}

export async function saveWorkshops(workshops: any[]) {
  debug(`saveWorkshops aufgerufen mit ${workshops?.length || 0} Workshops`);
  try {
    // Überprüfe die Authentifizierung
    await ensureAuth();

    // Stelle sicher, dass jeder Workshop eine ID hat
    const validatedWorkshops = workshops.map((workshop) => {
      if (!workshop.id) {
        return {
          ...workshop,
          id: `workshop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
      }
      return workshop;
    });

    // Bereinige die Daten vor dem Speichern
    const sanitizedWorkshops = validatedWorkshops.map((workshop) => sanitizeForServer(workshop));

    // Speichere in Blob Storage
    const success = await saveWorkshopsToBlob(sanitizedWorkshops);

    if (success) {
      debug(`${sanitizedWorkshops.length} Workshops in Blob Storage gespeichert`);
      // Revalidiere alle Pfade
      await revalidateAllPaths();
    } else {
      debug(`Fehler beim Speichern der Workshops in Blob Storage`);
    }

    return success;
  } catch (error) {
    console.error("Fehler beim Speichern der Workshops:", error);
    debug(`Fehler beim Speichern der Workshops`);
    return false;
  }
}

// Knowledge Hub Content
export async function getKnowledgeHubContent() {
  debug(`getKnowledgeHubContent aufgerufen`);
  try {
    // Lade Daten aus Blob Storage
    const knowledgeHubContent = await getKnowledgeHubContentFromBlob();
    debug(`${knowledgeHubContent.length} Knowledge Hub Content aus Blob Storage geladen`);
    return knowledgeHubContent;
  } catch (error) {
    console.error("Fehler beim Laden der Knowledge Hub Content:", error);
    debug(`Fehler beim Laden der Knowledge Hub Content, verwende Standarddaten`);
    return [...defaultKnowledgeHubContent];
  }
}

export async function saveKnowledgeHubContent(knowledgeHubContent: any[]) {
  debug(
    `saveKnowledgeHubContent aufgerufen mit ${
      knowledgeHubContent?.length || 0
    } Knowledge Hub Content`
  );
  try {
    // Überprüfe die Authentifizierung
    await ensureAuth();

    // Bereinige die Daten vor dem Speichern
    const sanitizedKnowledgeHubContent = knowledgeHubContent.map((bp) => sanitizeForServer(bp));

    // Speichere in Blob Storage
    const success = await saveKnowledgeHubContentToBlob(sanitizedKnowledgeHubContent);

    if (success) {
      debug(
        `${sanitizedKnowledgeHubContent.length} Knowledge Hub Content in Blob Storage gespeichert`
      );
      // Revalidiere alle Pfade
      await revalidateAllPaths();
    } else {
      debug(`Fehler beim Speichern der Knowledge Hub Content in Blob Storage`);
    }

    return success;
  } catch (error) {
    console.error("Fehler beim Speichern der Knowledge Hub Content:", error);
    debug(`Fehler beim Speichern der Knowledge Hub Content`);
    return false;
  }
}

// Resources
export async function getResources() {
  debug(`getResources aufgerufen`);
  try {
    // Lade Daten aus Blob Storage
    const resources = await getResourcesFromBlob();
    debug(`${resources.length} Resources aus Blob Storage geladen`);
    return resources;
  } catch (error) {
    console.error("Fehler beim Laden der Ressourcen:", error);
    debug(`Fehler beim Laden der Ressourcen, verwende Standarddaten`);
    return [...defaultResources];
  }
}

export async function saveResources(resources: any[]) {
  debug(`saveResources aufgerufen mit ${resources?.length || 0} Resources`);
  try {
    // Überprüfe die Authentifizierung
    await ensureAuth();

    // Bereinige die Daten vor dem Speichern
    const sanitizedResources = resources.map((resource) => sanitizeForServer(resource));

    // Speichere in Blob Storage
    const success = await saveResourcesToBlob(sanitizedResources);

    if (success) {
      debug(`${sanitizedResources.length} Resources in Blob Storage gespeichert`);
      // Revalidiere alle Pfade
      await revalidateAllPaths();
    } else {
      debug(`Fehler beim Speichern der Resources in Blob Storage`);
    }

    return success;
  } catch (error) {
    console.error("Fehler beim Speichern der Ressourcen:", error);
    debug(`Fehler beim Speichern der Ressourcen`);
    return false;
  }
}

// Landing Page
export async function getLandingPage() {
  debug(`getLandingPage aufgerufen`);
  try {
    // Lade Daten aus Blob Storage
    const landingPage = await getLandingPageFromBlob();
    debug(`Landing Page aus Blob Storage geladen`);
    return landingPage;
  } catch (error) {
    console.error("Fehler beim Laden der Landing Page:", error);
    debug(`Fehler beim Laden der Landing Page, verwende Standarddaten`);
    return JSON.parse(JSON.stringify(defaultLandingPage)); // Tiefe Kopie zurückgeben
  }
}

export async function saveLandingPage(landingPage: any) {
  debug(`saveLandingPage aufgerufen`);
  try {
    // Überprüfe die Authentifizierung
    await ensureAuth();

    // Bereinige die Daten vor dem Speichern
    const sanitizedLandingPage = sanitizeForServer(landingPage);

    // Speichere in Blob Storage
    const success = await saveLandingPageToBlob(sanitizedLandingPage);

    if (success) {
      debug(`Landing Page in Blob Storage gespeichert`);
      // Revalidiere alle Pfade
      await revalidateAllPaths();
    } else {
      debug(`Fehler beim Speichern der Landing Page in Blob Storage`);
    }

    return success;
  } catch (error) {
    console.error("Fehler beim Speichern der Landing Page:", error);
    debug(`Fehler beim Speichern der Landing Page`);
    return false;
  }
}

// Mail Config
export async function getMailConfig() {
  debug(`getMailConfig aufgerufen`);
  try {
    // Lade Daten aus Blob Storage
    const mailConfig = await getMailConfigFromBlob();
    debug(`Mail-Konfiguration aus Blob Storage geladen`);
    return mailConfig;
  } catch (error) {
    console.error("Fehler beim Laden der Mail-Konfiguration:", error);
    debug(`Fehler beim Laden der Mail-Konfiguration, verwende Standarddaten`);
    return JSON.parse(JSON.stringify(defaultMailConfig)); // Tiefe Kopie zurückgeben
  }
}

export async function saveMailConfig(mailConfig: any) {
  debug(`saveMailConfig aufgerufen`);
  try {
    // Überprüfe die Authentifizierung
    await ensureAuth();

    // Bereinige die Daten vor dem Speichern
    const sanitizedMailConfig = sanitizeForServer(mailConfig);

    // Speichere in Blob Storage
    const success = await saveMailConfigToBlob(sanitizedMailConfig);

    if (success) {
      debug(`Mail-Konfiguration in Blob Storage gespeichert`);
      // Revalidiere alle Pfade
      await revalidateAllPaths();
    } else {
      debug(`Fehler beim Speichern der Mail-Konfiguration in Blob Storage`);
    }

    return success;
  } catch (error) {
    console.error("Fehler beim Speichern der Mail-Konfiguration:", error);
    debug(`Fehler beim Speichern der Mail-Konfiguration`);
    return false;
  }
}

// Funktion zum Zurücksetzen aller Daten auf die Standardwerte
export async function resetAllData(): Promise<boolean> {
  debug(`Setze alle Daten zurück`);

  try {
    // Überprüfe die Authentifizierung
    await ensureAuth();

    // Setze die Blob-Datenbank zurück
    const success = await resetBlobDB();

    if (success) {
      debug(`Blob-Datenbank zurückgesetzt`);
      // Revalidiere alle Pfade
      await revalidateAllPaths();
    } else {
      debug(`Fehler beim Zurücksetzen der Blob-Datenbank`);
    }

    return success;
  } catch (error) {
    console.error("Fehler beim Zurücksetzen der Daten:", error);
    debug(`Fehler beim Zurücksetzen der Daten`);
    return false;
  }
}
