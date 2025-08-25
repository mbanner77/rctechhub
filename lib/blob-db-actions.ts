"use server";

import { put, list } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { defaultData } from "@/data/default-data";
import { checkAuthAction } from "./auth-actions";
import { getBlobContent, blobExists, type BlobDataType } from "./blob-storage";

// Debug-Funktion
function debug(message: string, ...args: any[]) {
  console.log(`[BLOB-DB-ACTIONS] ${message}`, ...args);
}

// Hilfsfunktion zum Überprüfen der Authentifizierung
async function ensureAuth() {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    try {
      debug("Produktionsmodus: Überprüfe Authentifizierung");
      const authResult = await checkAuthAction();
      if (!authResult.authenticated) {
        debug("Nicht authentifiziert");
        throw new Error("Nicht authentifiziert");
      }
      debug("Authentifizierung erfolgreich");
    } catch (error) {
      debug("Fehler bei der Authentifizierung");
      throw error;
    }
  } else {
    debug("Entwicklungsmodus: Überspringe Authentifizierung");
  }
}

// Services
export async function getServicesFromBlob() {
  debug("getServicesFromBlob aufgerufen");
  try {
    const blobPath = `realcore-data/services/data.json`;
    const blob = await blobExists(blobPath);

    if (blob) {
      debug(`Blob gefunden: ${blob.url}`);
      const data = await getBlobContent(blob.url);
      debug(`${data.length} Services aus Blob geladen`);
      return data;
    }

    // Wenn keine Daten gefunden wurden, speichere die Standarddaten
    debug("Keine Services im Blob gefunden, verwende Standarddaten");
    await saveServicesToBlob(defaultData.services);
    return defaultData.services;
  } catch (error) {
    console.error("Fehler beim Laden der Services aus Blob Storage:", error);
    debug("Fehler beim Laden der Services, verwende Standarddaten");
    return defaultData.services;
  }
}

export async function saveServicesToBlob(services: any[]) {
  debug(`saveServicesToBlob aufgerufen mit ${services.length} Services`);
  try {
    await ensureAuth();
    // Erstelle zuerst ein Backup der aktuellen Daten
    const blobPath = `realcore-data/services/data.json`;
    const blob = await blobExists(blobPath);

    if (blob) {
      debug("Erstelle Backup der aktuellen Services");
      const data = await getBlobContent(blob.url);
      const timestamp = Date.now();
      const backupPath = `realcore-data/services/backup-${timestamp}.json`;

      await put(backupPath, JSON.stringify(data), {
        contentType: "application/json",
        access: "public",
        allowOverwrite: true,
      });
      debug(`Backup erstellt: ${backupPath}`);
    }

    // Speichere die neuen Daten
    debug("Speichere neue Services-Daten");
    await put(blobPath, JSON.stringify(services), {
      contentType: "application/json",
      access: "public",
      allowOverwrite: true,
    });
    debug(`${services.length} Services in ${blobPath} gespeichert`);

    // Revalidiere die entsprechenden Pfade
    revalidatePath("/", "page");
    revalidatePath(`/services`, "page");
    revalidatePath("/", "layout");
    revalidatePath(`/services`, "layout");
    debug("Pfade revalidiert");

    return true;
  } catch (error) {
    console.error("Fehler beim Speichern der Services in Blob Storage:", error);
    debug("Fehler beim Speichern der Services");
    return false;
  }
}

// Workshops
export async function getWorkshopsFromBlob() {
  debug("getWorkshopsFromBlob aufgerufen");
  try {
    const blobPath = `realcore-data/workshops/data.json`;
    const blob = await blobExists(blobPath);

    if (blob) {
      debug(`Blob gefunden: ${blob.url}`);
      const data = await getBlobContent(blob.url);
      debug(`${data.length} Workshops aus Blob geladen`);
      return data;
    }

    // Wenn keine Daten gefunden wurden, speichere die Standarddaten
    debug("Keine Workshops im Blob gefunden, verwende Standarddaten");
    await saveWorkshopsToBlob(defaultData.workshops);
    return defaultData.workshops;
  } catch (error) {
    console.error("Fehler beim Laden der Workshops aus Blob Storage:", error);
    debug("Fehler beim Laden der Workshops, verwende Standarddaten");
    return defaultData.workshops;
  }
}

export async function saveWorkshopsToBlob(workshops: any[]) {
  debug(`saveWorkshopsToBlob aufgerufen mit ${workshops.length} Workshops`);
  try {
    await ensureAuth();
    // Erstelle zuerst ein Backup der aktuellen Daten
    const blobPath = `realcore-data/workshops/data.json`;
    const blob = await blobExists(blobPath);

    if (blob) {
      debug("Erstelle Backup der aktuellen Workshops");
      const data = await getBlobContent(blob.url);
      const timestamp = Date.now();
      const backupPath = `realcore-data/workshops/backup-${timestamp}.json`;

      await put(backupPath, JSON.stringify(data), {
        contentType: "application/json",
        access: "public",
        allowOverwrite: true,
      });
      debug(`Backup erstellt: ${backupPath}`);
    }

    // Speichere die neuen Daten
    debug("Speichere neue Workshops-Daten");
    await put(blobPath, JSON.stringify(workshops), {
      contentType: "application/json",
      access: "public",
      allowOverwrite: true,
    });
    debug(`${workshops.length} Workshops in ${blobPath} gespeichert`);

    // Revalidiere die entsprechenden Pfade
    revalidatePath("/", "page");
    revalidatePath(`/workshops`, "page");
    revalidatePath("/", "layout");
    revalidatePath(`/workshops`, "layout");
    debug("Pfade revalidiert");

    return true;
  } catch (error) {
    console.error("Fehler beim Speichern der Workshops in Blob Storage:", error);
    debug("Fehler beim Speichern der Workshops");
    return false;
  }
}

// Knowledge Hub Content
export async function getKnowledgeHubContentFromBlob() {
  debug("getKnowledgeHubContentFromBlob aufgerufen");
  try {
    const blobPath = `realcore-data/best-practices/data.json`;
    const blob = await blobExists(blobPath);

    if (blob) {
      debug(`Blob gefunden: ${blob.url}`);
      const data = await getBlobContent(blob.url);
      debug(`${data.length} Knowledge Hub Content aus Blob geladen`);
      return data;
    }

    // Wenn keine Daten gefunden wurden, speichere die Standarddaten
    debug("Keine Knowledge Hub Content im Blob gefunden, verwende Standarddaten");
    await saveKnowledgeHubContentToBlob(defaultData.knowledgeHubContent);
    return defaultData.knowledgeHubContent;
  } catch (error) {
    console.error("Fehler beim Laden der Knowledge Hub Content aus Blob Storage:", error);
    debug("Fehler beim Laden der Knowledge Hub Content, verwende Standarddaten");
    return defaultData.knowledgeHubContent;
  }
}

export async function saveKnowledgeHubContentToBlob(knowledgeHubContent: any[]) {
  debug(
    `saveKnowledgeHubContentToBlob aufgerufen mit ${knowledgeHubContent.length} Knowledge Hub Content`
  );
  try {
    await ensureAuth();
    // Erstelle zuerst ein Backup der aktuellen Daten
    const blobPath = `realcore-data/best-practices/data.json`;
    const blob = await blobExists(blobPath);

    if (blob) {
      debug("Erstelle Backup der aktuellen Knowledge Hub Content");
      const data = await getBlobContent(blob.url);
      const timestamp = Date.now();
      const backupPath = `realcore-data/best-practices/backup-${timestamp}.json`;

      await put(backupPath, JSON.stringify(data), {
        contentType: "application/json",
        access: "public",
        allowOverwrite: true,
      });
      debug(`Backup erstellt: ${backupPath}`);
    }

    // Speichere die neuen Daten
    debug("Speichere neue Knowledge Hub Content-Daten");
    await put(blobPath, JSON.stringify(knowledgeHubContent), {
      contentType: "application/json",
      access: "public",
      allowOverwrite: true,
    });
    debug(`${knowledgeHubContent.length} Knowledge Hub Content in ${blobPath} gespeichert`);

    // Revalidiere die entsprechenden Pfade
    revalidatePath("/", "page");
    revalidatePath(`/best-practices`, "page");
    revalidatePath("/", "layout");
    revalidatePath(`/best-practices`, "layout");
    debug("Pfade revalidiert");

    return true;
  } catch (error) {
    console.error("Fehler beim Speichern der Knowledge Hub Content in Blob Storage:", error);
    debug("Fehler beim Speichern der Knowledge Hub Content");
    return false;
  }
}

// Resources
export async function getResourcesFromBlob() {
  debug("getResourcesFromBlob aufgerufen");
  try {
    const blobPath = `realcore-data/resources/data.json`;
    const blob = await blobExists(blobPath);

    if (blob) {
      debug(`Blob gefunden: ${blob.url}`);
      const data = await getBlobContent(blob.url);
      debug(`${data.length} Resources aus Blob geladen`);
      return data;
    }

    // Wenn keine Daten gefunden wurden, speichere die Standarddaten
    debug("Keine Resources im Blob gefunden, verwende Standarddaten");
    await saveResourcesToBlob(defaultData.resources);
    return defaultData.resources;
  } catch (error) {
    console.error("Fehler beim Laden der Resources aus Blob Storage:", error);
    debug("Fehler beim Laden der Resources, verwende Standarddaten");
    return defaultData.resources;
  }
}

export async function saveResourcesToBlob(resources: any[]) {
  debug(`saveResourcesToBlob aufgerufen mit ${resources.length} Resources`);
  try {
    await ensureAuth();
    // Erstelle zuerst ein Backup der aktuellen Daten
    const blobPath = `realcore-data/resources/data.json`;
    const blob = await blobExists(blobPath);

    if (blob) {
      debug("Erstelle Backup der aktuellen Resources");
      const data = await getBlobContent(blob.url);
      const timestamp = Date.now();
      const backupPath = `realcore-data/resources/backup-${timestamp}.json`;

      await put(backupPath, JSON.stringify(data), {
        contentType: "application/json",
        access: "public",
        allowOverwrite: true,
      });
      debug(`Backup erstellt: ${backupPath}`);
    }

    // Speichere die neuen Daten
    debug("Speichere neue Resources-Daten");
    await put(blobPath, JSON.stringify(resources), {
      contentType: "application/json",
      access: "public",
      allowOverwrite: true,
    });
    debug(`${resources.length} Resources in ${blobPath} gespeichert`);

    // Revalidiere die entsprechenden Pfade
    revalidatePath("/", "page");
    revalidatePath(`/resources`, "page");
    revalidatePath("/", "layout");
    revalidatePath(`/resources`, "layout");
    debug("Pfade revalidiert");

    return true;
  } catch (error) {
    console.error("Fehler beim Speichern der Resources in Blob Storage:", error);
    debug("Fehler beim Speichern der Resources");
    return false;
  }
}

// Mail Config
export async function getMailConfigFromBlob() {
  debug("getMailConfigFromBlob aufgerufen");
  try {
    const blobPath = `realcore-data/mail-config/data.json`;
    const blob = await blobExists(blobPath);

    if (blob) {
      debug(`Blob gefunden: ${blob.url}`);
      const data = await getBlobContent(blob.url);
      debug("Mail Config aus Blob geladen");
      return data;
    }

    // Wenn keine Daten gefunden wurden, speichere die Standarddaten
    debug("Keine Mail Config im Blob gefunden, verwende Standarddaten");
    await saveMailConfigToBlob(defaultData.mailConfig);
    return defaultData.mailConfig;
  } catch (error) {
    console.error("Fehler beim Laden der Mail-Konfiguration aus Blob Storage:", error);
    debug("Fehler beim Laden der Mail Config, verwende Standarddaten");
    return defaultData.mailConfig;
  }
}

export async function saveMailConfigToBlob(mailConfig: any) {
  debug("saveMailConfigToBlob aufgerufen");
  try {
    await ensureAuth();
    // Erstelle zuerst ein Backup der aktuellen Daten
    const blobPath = `realcore-data/mail-config/data.json`;
    const blob = await blobExists(blobPath);

    if (blob) {
      debug("Erstelle Backup der aktuellen Mail Config");
      const data = await getBlobContent(blob.url);
      const timestamp = Date.now();
      const backupPath = `realcore-data/mail-config/backup-${timestamp}.json`;

      await put(backupPath, JSON.stringify(data), {
        contentType: "application/json",
        access: "public",
        allowOverwrite: true,
      });
      debug(`Backup erstellt: ${backupPath}`);
    }

    // Speichere die neuen Daten
    debug("Speichere neue Mail Config-Daten");
    await put(blobPath, JSON.stringify(mailConfig), {
      contentType: "application/json",
      access: "public",
      allowOverwrite: true,
    });
    debug("Mail Config in Blob gespeichert");

    // Revalidiere die entsprechenden Pfade
    revalidatePath("/", "page");
    revalidatePath(`/mail-config`, "page");
    revalidatePath("/", "layout");
    revalidatePath(`/mail-config`, "layout");
    debug("Pfade revalidiert");

    return true;
  } catch (error) {
    console.error("Fehler beim Speichern der Mail-Konfiguration in Blob Storage:", error);
    debug("Fehler beim Speichern der Mail Config");
    return false;
  }
}

// Landing Page
export async function getLandingPageFromBlob() {
  debug("getLandingPageFromBlob aufgerufen");
  try {
    const blobPath = `realcore-data/landing-page/data.json`;
    debug(`Suche Blob: ${blobPath}`);
    const blob = await blobExists(blobPath);

    if (blob) {
      debug(`Blob gefunden: ${blob.url}`);

      // Füge einen Cache-Buster-Parameter hinzu
      const cacheBuster = new Date().getTime();
      const url = new URL(blob.url);
      url.searchParams.append("t", cacheBuster.toString());
      debug(`Lade Blob mit Cache-Buster: ${url.toString()}`);

      // Hole den Inhalt mit Cache-Buster und strikten Cache-Control-Headern
      const response = await fetch(url.toString(), {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
          "X-Cache-Buster": cacheBuster.toString(),
        },
      });

      if (!response.ok) {
        debug(`Fehler beim Laden des Blobs: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch blob: ${response.statusText}`);
      }

      const data = await response.json();
      debug(`Landing Page aus Blob geladen: ${JSON.stringify(data).substring(0, 100)}...`);
      return data;
    }

    // Wenn keine Daten gefunden wurden, speichere die Standarddaten
    debug("Keine Landing Page im Blob gefunden, verwende Standarddaten");
    await saveLandingPageToBlob(defaultData.landingPage);
    return defaultData.landingPage;
  } catch (error) {
    console.error("Fehler beim Laden der Landing Page aus Blob Storage:", error);
    debug("Fehler beim Laden der Landing Page, verwende Standarddaten");
    return defaultData.landingPage;
  }
}

export async function saveLandingPageToBlob(landingPage: any) {
  debug("saveLandingPageToBlob aufgerufen");
  try {
    await ensureAuth();

    // Erstelle zuerst ein Backup der aktuellen Daten
    const blobPath = `realcore-data/landing-page/data.json`;
    debug(`Suche aktuellen Blob: ${blobPath}`);
    const blob = await blobExists(blobPath);

    if (blob) {
      debug("Erstelle Backup der aktuellen Landing Page");
      const data = await getBlobContent(blob.url);
      const timestamp = Date.now();
      const backupPath = `realcore-data/landing-page/backup-${timestamp}.json`;
      debug(`Speichere Backup in: ${backupPath}`);

      await put(backupPath, JSON.stringify(data), {
        contentType: "application/json",
        access: "public",
        allowOverwrite: true,
      });
      debug(`Backup erstellt: ${backupPath}`);
    }

    // Speichere die neuen Daten mit einem Zeitstempel im Dateinamen
    const timestamp = Date.now();
    const newBlobPath = `realcore-data/landing-page/data-${timestamp}.json`;
    debug(`Speichere neue Landing Page-Daten in: ${newBlobPath}`);

    // Speichere die neuen Daten in einer zeitgestempelten Datei
    await put(newBlobPath, JSON.stringify(landingPage), {
      contentType: "application/json",
      access: "public",
      allowOverwrite: true,
    });
    debug(`Neue Daten in zeitgestempelter Datei gespeichert: ${newBlobPath}`);

    // Speichere auch unter dem Standardpfad
    debug(`Speichere neue Landing Page-Daten in Standardpfad: ${blobPath}`);
    const result = await put(blobPath, JSON.stringify(landingPage), {
      contentType: "application/json",
      access: "public",
      allowOverwrite: true,
    });
    debug(`Neue Daten in Standardpfad gespeichert: ${result.url}`);

    // Revalidiere die entsprechenden Pfade
    debug("Revalidiere Pfade");
    revalidatePath("/", "page");
    revalidatePath("/landing", "page");
    revalidatePath("/", "layout");
    revalidatePath("/landing", "layout");
    debug("Pfade revalidiert");

    return true;
  } catch (error) {
    console.error("Fehler beim Speichern der Landing Page in Blob Storage:", error);
    debug(`Fehler beim Speichern der Landing Page: ${error}`);
    return false;
  }
}

// Alle Daten zurücksetzen
export async function resetBlobDB(): Promise<boolean> {
  debug("resetBlobDB aufgerufen");
  try {
    await ensureAuth();

    // Backup aller Daten erstellen
    debug("Erstelle Backups aller Daten");
    const servicesBlob = await blobExists(`realcore-data/services/data.json`);
    const workshopsBlob = await blobExists(`realcore-data/workshops/data.json`);
    const knowledgeHubContentBlob = await blobExists(`realcore-data/best-practices/data.json`);
    const resourcesBlob = await blobExists(`realcore-data/resources/data.json`);
    const mailConfigBlob = await blobExists(`realcore-data/mail-config/data.json`);
    const landingPageBlob = await blobExists(`realcore-data/landing-page/data.json`);

    const timestamp = Date.now();

    if (servicesBlob) {
      debug("Erstelle Backup der Services");
      const data = await getBlobContent(servicesBlob.url);
      await put(`realcore-data/services/backup-${timestamp}.json`, JSON.stringify(data), {
        contentType: "application/json",
        access: "public",
        allowOverwrite: true,
      });
    }

    if (workshopsBlob) {
      debug("Erstelle Backup der Workshops");
      const data = await getBlobContent(workshopsBlob.url);
      await put(`realcore-data/workshops/backup-${timestamp}.json`, JSON.stringify(data), {
        contentType: "application/json",
        access: "public",
        allowOverwrite: true,
      });
    }

    if (knowledgeHubContentBlob) {
      debug("Erstelle Backup der Knowledge Hub Content");
      const data = await getBlobContent(knowledgeHubContentBlob.url);
      await put(`realcore-data/best-practices/backup-${timestamp}.json`, JSON.stringify(data), {
        contentType: "application/json",
        access: "public",
        allowOverwrite: true,
      });
    }

    if (resourcesBlob) {
      debug("Erstelle Backup der Resources");
      const data = await getBlobContent(resourcesBlob.url);
      await put(`realcore-data/resources/backup-${timestamp}.json`, JSON.stringify(data), {
        contentType: "application/json",
        access: "public",
        allowOverwrite: true,
      });
    }

    if (mailConfigBlob) {
      debug("Erstelle Backup der Mail Config");
      const data = await getBlobContent(mailConfigBlob.url);
      await put(`realcore-data/mail-config/backup-${timestamp}.json`, JSON.stringify(data), {
        contentType: "application/json",
        access: "public",
        allowOverwrite: true,
      });
    }

    if (landingPageBlob) {
      debug("Erstelle Backup der Landing Page");
      const data = await getBlobContent(landingPageBlob.url);
      await put(`realcore-data/landing-page/backup-${timestamp}.json`, JSON.stringify(data), {
        contentType: "application/json",
        access: "public",
        allowOverwrite: true,
      });
    }

    // Alle Daten auf Standardwerte zurücksetzen
    debug("Setze alle Daten auf Standardwerte zurück");
    await put(`realcore-data/services/data.json`, JSON.stringify(defaultData.services), {
      contentType: "application/json",
      access: "public",
      allowOverwrite: true,
    });

    await put(`realcore-data/workshops/data.json`, JSON.stringify(defaultData.workshops), {
      contentType: "application/json",
      access: "public",
      allowOverwrite: true,
    });

    await put(
      `realcore-data/best-practices/data.json`,
      JSON.stringify(defaultData.knowledgeHubContent),
      {
        contentType: "application/json",
        access: "public",
        allowOverwrite: true,
      }
    );

    await put(`realcore-data/resources/data.json`, JSON.stringify(defaultData.resources), {
      contentType: "application/json",
      access: "public",
      allowOverwrite: true,
    });

    await put(`realcore-data/mail-config/data.json`, JSON.stringify(defaultData.mailConfig), {
      contentType: "application/json",
      access: "public",
      allowOverwrite: true,
    });

    await put(`realcore-data/landing-page/data.json`, JSON.stringify(defaultData.landingPage), {
      contentType: "application/json",
      access: "public",
      allowOverwrite: true,
    });

    // Revalidiere alle Pfade
    debug("Revalidiere alle Pfade");
    revalidatePath("/", "page");
    revalidatePath("/", "layout");

    return true;
  } catch (error) {
    console.error("Fehler beim Zurücksetzen der Blob-Datenbank:", error);
    debug("Fehler beim Zurücksetzen der Blob-Datenbank");
    return false;
  }
}

// Hilfsfunktion zum Auflisten von Backups
export async function listBackups(dataType: BlobDataType) {
  debug(`listBackups aufgerufen für ${dataType}`);
  try {
    await ensureAuth();
    // Liste alle Blobs im Pfad auf
    const prefix = `realcore-data/${dataType}/backup-`;
    const { blobs } = await list({ prefix });

    // Extrahiere relevante Informationen
    const backups = blobs.map((blob) => {
      // Extrahiere Zeitstempel aus dem Dateinamen (backup-{timestamp})
      const nameParts = blob.pathname.split("/").pop()?.split(".")[0].split("-") || [];
      const timestamp = Number.parseInt(nameParts[nameParts.length - 1]) || 0;

      return {
        url: blob.url,
        name: blob.pathname.split("/").pop() || "",
        timestamp,
      };
    });

    // Sortiere nach Zeitstempel (neueste zuerst)
    backups.sort((a, b) => b.timestamp - a.timestamp);

    debug(`${backups.length} Backups gefunden für ${dataType}`);
    return backups;
  } catch (error) {
    console.error(`Fehler beim Auflisten der Backups für ${dataType}:`, error);
    debug(`Fehler beim Auflisten der Backups für ${dataType}`);
    return [];
  }
}

// Hilfsfunktion zum Wiederherstellen eines Backups
export async function restoreBackup(backupUrl: string, dataType: BlobDataType) {
  debug(`restoreBackup aufgerufen für ${dataType} mit URL ${backupUrl}`);
  try {
    await ensureAuth();
    // Hole die Daten vom Backup
    const response = await fetch(backupUrl, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      debug(`Backup nicht gefunden: ${backupUrl}`);
      return false;
    }

    const data = await response.json();
    debug(`Backup-Daten geladen: ${backupUrl}`);

    // Speichere die Daten als aktuelle Version
    const blobPath = `realcore-data/${dataType}/data.json`;
    const jsonData = JSON.stringify(data);

    // Speichere die Daten im Blob Storage
    await put(blobPath, jsonData, {
      contentType: "application/json",
      access: "public",
      allowOverwrite: true,
    });
    debug(`Backup wiederhergestellt in ${blobPath}`);

    // Revalidiere die entsprechenden Pfade
    revalidatePath("/", "page");
    revalidatePath(`/${dataType}`, "page");
    revalidatePath("/", "layout");
    revalidatePath(`/${dataType}`, "layout");
    debug("Pfade revalidiert");

    return true;
  } catch (error) {
    console.error(`Fehler beim Wiederherstellen des Backups für ${dataType}:`, error);
    debug(`Fehler beim Wiederherstellen des Backups für ${dataType}`);
    return false;
  }
}
