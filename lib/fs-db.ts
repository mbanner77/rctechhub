import fs from "fs";
import path from "path";
import type { IService } from "@/types/service";
import type { IWorkshop } from "@/types/workshop";
import type { IKnowledgeHubContent } from "@/types/knowledge-hub-content";
import type { IResource } from "@/types/resource";
import type { IMailConfig } from "@/types/mail-config";
import type { ILandingPageData } from "@/types/landing-page";

// Definiere den Pfad zum Datenverzeichnis
const DATA_DIR = path.join(process.cwd(), "data-store");

// Stelle sicher, dass das Datenverzeichnis existiert
async function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    return true;
  } catch (error) {
    console.error("Fehler beim Erstellen des Datenverzeichnisses:", error);
    return false;
  }
}

// Generische Funktion zum Lesen von Daten aus einer Datei
async function readDataFromFile<T>(filename: string, defaultData: T): Promise<T> {
  try {
    await ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);

    if (!fs.existsSync(filePath)) {
      // Wenn die Datei nicht existiert, erstelle sie mit den Standarddaten
      await writeDataToFile(filename, defaultData);
      return defaultData;
    }

    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Fehler beim Lesen der Datei ${filename}:`, error);
    return defaultData;
  }
}

// Generische Funktion zum Schreiben von Daten in eine Datei
async function writeDataToFile<T>(filename: string, data: T): Promise<boolean> {
  try {
    await ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error(`Fehler beim Schreiben der Datei ${filename}:`, error);
    return false;
  }
}

// Spezifische Funktionen für verschiedene Datentypen
export async function readServices(defaultServices: IService[]): Promise<IService[]> {
  return readDataFromFile<IService[]>("services.json", defaultServices);
}

export async function writeServices(services: IService[]): Promise<boolean> {
  return writeDataToFile<IService[]>("services.json", services);
}

export async function readWorkshops(defaultWorkshops: IWorkshop[]): Promise<IWorkshop[]> {
  return readDataFromFile<IWorkshop[]>("workshops.json", defaultWorkshops);
}

export async function writeWorkshops(workshops: IWorkshop[]): Promise<boolean> {
  return writeDataToFile<IWorkshop[]>("workshops.json", workshops);
}

export async function readKnowledgeHubContent(
  defaultBestPractices: IKnowledgeHubContent[]
): Promise<IKnowledgeHubContent[]> {
  return readDataFromFile<IKnowledgeHubContent[]>(
    "knowledge-hub-content.json",
    defaultBestPractices
  );
}

export async function writeKnowledgeHubContent(
  bestPractices: IKnowledgeHubContent[]
): Promise<boolean> {
  return writeDataToFile<IKnowledgeHubContent[]>("knowledge-hub-content.json", bestPractices);
}

export async function readResources(defaultResources: IResource[]): Promise<IResource[]> {
  return readDataFromFile<IResource[]>("resources.json", defaultResources);
}

export async function writeResources(resources: IResource[]): Promise<boolean> {
  return writeDataToFile<IResource[]>("resources.json", resources);
}

export async function readMailConfig(defaultMailConfig: IMailConfig): Promise<IMailConfig> {
  return readDataFromFile<IMailConfig>("mail-config.json", defaultMailConfig);
}

export async function writeMailConfig(mailConfig: IMailConfig): Promise<boolean> {
  return writeDataToFile<IMailConfig>("mail-config.json", mailConfig);
}

export async function readLandingPage(
  defaultLandingPage: ILandingPageData
): Promise<ILandingPageData> {
  return readDataFromFile<ILandingPageData>("landing-page.json", defaultLandingPage);
}

export async function writeLandingPage(landingPage: ILandingPageData): Promise<boolean> {
  return writeDataToFile<ILandingPageData>("landing-page.json", landingPage);
}

// Funktion zum Initialisieren der Dateisystem-Datenbank
export async function initializeFileSystemDB(defaultData: {
  services: IService[];
  workshops: IWorkshop[];
  knowledgeHubContent: IKnowledgeHubContent[];
  resources: IResource[];
  mailConfig: IMailConfig;
  landingPage: ILandingPageData;
}): Promise<boolean> {
  try {
    await ensureDataDir();

    // Prüfe, ob die Dateien bereits existieren
    const servicesPath = path.join(DATA_DIR, "services.json");
    const workshopsPath = path.join(DATA_DIR, "workshops.json");
    const knowledgeHubContentPath = path.join(DATA_DIR, "knowledge-hub-content.json");
    const resourcesPath = path.join(DATA_DIR, "resources.json");
    const mailConfigPath = path.join(DATA_DIR, "mail-config.json");
    const landingPagePath = path.join(DATA_DIR, "landing-page.json");

    // Erstelle die Dateien mit Standarddaten, wenn sie nicht existieren
    if (!fs.existsSync(servicesPath)) {
      await writeServices(defaultData.services);
    }

    if (!fs.existsSync(workshopsPath)) {
      await writeWorkshops(defaultData.workshops);
    }

    if (!fs.existsSync(knowledgeHubContentPath)) {
      await writeKnowledgeHubContent(defaultData.knowledgeHubContent);
    }

    if (!fs.existsSync(resourcesPath)) {
      await writeResources(defaultData.resources);
    }

    if (!fs.existsSync(mailConfigPath)) {
      await writeMailConfig(defaultData.mailConfig);
    }

    if (!fs.existsSync(landingPagePath)) {
      await writeLandingPage(defaultData.landingPage);
    }

    return true;
  } catch (error) {
    console.error("Fehler bei der Initialisierung der Dateisystem-Datenbank:", error);
    return false;
  }
}

// Funktion zum Zurücksetzen der Dateisystem-Datenbank
export async function resetFileSystemDB(defaultData: {
  services: IService[];
  workshops: IWorkshop[];
  knowledgeHubContent: IKnowledgeHubContent[];
  resources: IResource[];
  mailConfig: IMailConfig;
  landingPage: ILandingPageData;
}): Promise<boolean> {
  try {
    await ensureDataDir();

    // Überschreibe alle Dateien mit Standarddaten
    await writeServices(defaultData.services);
    await writeWorkshops(defaultData.workshops);
    await writeKnowledgeHubContent(defaultData.knowledgeHubContent);
    await writeResources(defaultData.resources);
    await writeMailConfig(defaultData.mailConfig);
    await writeLandingPage(defaultData.landingPage);

    return true;
  } catch (error) {
    console.error("Fehler beim Zurücksetzen der Dateisystem-Datenbank:", error);
    return false;
  }
}
