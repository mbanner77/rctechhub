// Entferne alle Neon-spezifischen Imports und Code
// Behalte nur die Dexie.js-Implementierung

import Dexie, { type Table } from "dexie";
import type { ILandingPageData } from "@/types/landing-page";

// Definiere die Typen für unsere Datenbanktabellen
export interface IService {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  isStarterPackage: boolean;
  technologies: string[];
  image: string;
  phase: number;
  included: string[];
  notIncluded: string[];
  dependencies: string[];
  process: {
    title: string;
    description: string;
  }[];
  prerequisites: string;
  outcomes: string;
  rating: number;
  technologyCategory?: string;
  processCategory?: string;
}

export interface IWorkshop {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  icon: string;
  benefits?: string[];
  unitId?: string;
  audience?: string;
  nextDate?: string;
  location?: string;
  isNew?: boolean;
}

export interface IKnowledgeHubContent {
  id: string;
  type: "template" | "best-practice" | "unknown";
  title: string;
  subtitle: string;
  description: string;
  image?: string;
  category: string;
  downloads: number;
  featured?: boolean;
  tags?: string[];
  downloadUrl?: string;
  externalUrl?: string;
  pdfDocument?: {
    fileUrl: string;
    deleted: boolean; 
    filename: string;
    uploadDate: string;
  };
}

export interface IResource {
  id: string;
  title: string;
  type?: string;
  category: string;
  description?: string;
  image?: string;
  featured?: boolean;
  downloadUrl?: string;
  externalUrl?: string;
}

export interface IMailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  senderEmail: string;
  senderName: string;
  enabled: boolean;
}

// Technology Tag interface for centralized tag management
export interface ITag {
  id: string;        // Unique identifier for the tag
  name: string;      // Display name of the tag
  category?: string; // Optional category for grouping tags
  count: number;     // Number of references to this tag
  createdAt: string; // Creation timestamp
  updatedAt: string; // Last update timestamp
}

// Spezifische Bereinigungsfunktionen für jeden Datentyp
export function sanitizeService(service: any): IService {
  return {
    id: String(service.id || ""),
    title: String(service.title || ""),
    description: String(service.description || ""),
    price: Number(service.price || 0),
    duration: String(service.duration || ""),
    category: String(service.category || ""),
    isStarterPackage: Boolean(service.isStarterPackage || false),
    technologies: Array.isArray(service.technologies)
      ? service.technologies.map((t: any) => String(t || ""))
      : [],
    image: String(service.image || ""),
    phase: Number(service.phase || 0),
    included: Array.isArray(service.included)
      ? service.included.map((i: any) => String(i || ""))
      : [],
    notIncluded: Array.isArray(service.notIncluded)
      ? service.notIncluded.map((i: any) => String(i || ""))
      : [],
    dependencies: Array.isArray(service.dependencies)
      ? service.dependencies.map((d: any) => String(d || ""))
      : [],
    process: Array.isArray(service.process)
      ? service.process.map((p: any) => ({
          title: String(p?.title || ""),
          description: String(p?.description || ""),
        }))
      : [],
    prerequisites: String(service.prerequisites || ""),
    outcomes: String(service.outcomes || ""),
    rating: Number(service.rating || 0),
    // Neue Felder für zusätzliche Kategorisierung
    technologyCategory: service.technologyCategory ? String(service.technologyCategory) : undefined,
    processCategory: service.processCategory ? String(service.processCategory) : undefined,
  };
}

export function sanitizeWorkshop(workshop: any): IWorkshop {
  return {
    id: String(workshop.id || ""),
    title: String(workshop.title || ""),
    description: String(workshop.description || ""),
    duration: String(workshop.duration || ""),
    price: Number(workshop.price || 0),
    icon: String(workshop.icon || ""),
    benefits: Array.isArray(workshop.benefits)
      ? workshop.benefits.map((b: any) => String(b || ""))
      : [],
    unitId: workshop.unitId ? String(workshop.unitId) : undefined,
    audience: workshop.audience ? String(workshop.audience) : undefined,
    nextDate: workshop.nextDate ? String(workshop.nextDate) : undefined,
    location: workshop.location ? String(workshop.location) : undefined,
    isNew: workshop.isNew === true,
  };
}

export function sanitizeKnowledgeHubContent(contentItem: any): IKnowledgeHubContent {
  return {
    id: String(contentItem.id || ""),
    type:
      String(contentItem.type) === "template"
        ? "template"
        : String(contentItem.type) === "best-practice"
        ? "best-practice"
        : "unknown",
    title: String(contentItem.title || ""),
    subtitle: String(contentItem.subtitle || ""),
    description: String(contentItem.description || ""),
    category: String(contentItem.category || ""),
    image: contentItem.image ? String(contentItem.image) : undefined,
    downloads: !isNaN(contentItem.downloads) ? contentItem.downloads : 0,
    tags: contentItem.tags?.map((item: any) => String(item)) || [],
    featured: Boolean(contentItem.featured),
    downloadUrl: contentItem.downloadUrl ? String(contentItem.downloadUrl) : undefined,
    externalUrl: contentItem.externalUrl ? String(contentItem.externalUrl) : undefined,
    pdfDocument: contentItem.pdfDocument ? {
      fileUrl: String(contentItem.pdfDocument.fileUrl || ""),
      deleted: Boolean(contentItem.pdfDocument.deleted),
      filename: String(contentItem.pdfDocument.filename || ""),
      uploadDate: String(contentItem.pdfDocument.uploadDate || ""),
    } : undefined
  };
}

export function sanitizeResource(resource: any): IResource {
  return {
    id: String(resource.id || ""),
    title: String(resource.title || ""),
    type: resource.type ? String(resource.type) : undefined,
    category: String(resource.category || ""),
    description: resource.description ? String(resource.description) : undefined,
    image: resource.image ? String(resource.image) : undefined,
    featured: Boolean(resource.featured),
    downloadUrl: resource.downloadUrl ? String(resource.downloadUrl) : undefined,
    externalUrl: resource.externalUrl ? String(resource.externalUrl) : undefined,
  };
}

export function sanitizeMailConfig(config: any): IMailConfig {
  return {
    smtpHost: String(config.smtpHost || ""),
    smtpPort: Number(config.smtpPort || 0),
    smtpUser: String(config.smtpUser || ""),
    smtpPassword: String(config.smtpPassword || ""),
    senderEmail: String(config.senderEmail || ""),
    senderName: String(config.senderName || ""),
    enabled: Boolean(config.enabled),
  };
}

export function sanitizeTag(tag: any): ITag {
  return {
    id: String(tag.id || ""),
    name: String(tag.name || ""),
    category: tag.category ? String(tag.category) : undefined,
    count: Number(tag.count || 0),
    createdAt: String(tag.createdAt || new Date().toISOString()),
    updatedAt: String(tag.updatedAt || new Date().toISOString())
  };
}

export function sanitizeLandingPage(data: any): ILandingPageData {
  // Hero Section
  const hero = {
    title: String(data?.hero?.title || ""),
    subtitle: String(data?.hero?.subtitle || ""),
    primaryButtonText: String(data?.hero?.primaryButtonText || ""),
    secondaryButtonText: String(data?.hero?.secondaryButtonText || ""),
    backgroundImage: String(data?.hero?.backgroundImage || ""),
    heroImage: String(data?.hero?.heroImage || ""),
  };

  // Feature Cards
  const featureCards = Array.isArray(data?.featureCards)
    ? data.featureCards.map((card: any) => ({
        id: String(
          card?.id || `feature-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        ),
        icon: String(card?.icon || ""),
        title: String(card?.title || ""),
        description: String(card?.description || ""),
      }))
    : [];

  // Technology Section
  const technologySection = {
    title: String(data?.technologySection?.title || ""),
    subtitle: String(data?.technologySection?.subtitle || ""),
    image: String(data?.technologySection?.image || ""),
    features: Array.isArray(data?.technologySection?.features)
      ? data.technologySection.features.map((feature: any) => ({
          title: String(feature?.title || ""),
          description: String(feature?.description || ""),
        }))
      : [],
    buttonText: String(data?.technologySection?.buttonText || ""),
  };

  // Approach Section
  const approachSection = {
    title: String(data?.approachSection?.title || ""),
    subtitle: String(data?.approachSection?.subtitle || ""),
    image: String(data?.approachSection?.image || ""),
    features: Array.isArray(data?.approachSection?.features)
      ? data.approachSection.features.map((feature: any) => ({
          title: String(feature?.title || ""),
          description: String(feature?.description || ""),
        }))
      : [],
    buttonText: String(data?.approachSection?.buttonText || ""),
  };

  // Success Stories
  const successStories = Array.isArray(data?.successStories)
    ? data.successStories.map((story: any) => ({
        id: String(
          story?.id || `story-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        ),
        title: String(story?.title || ""),
        industry: String(story?.industry || ""),
        backgroundImage: String(story?.backgroundImage || ""),
        tags: Array.isArray(story?.tags) ? story.tags.map((tag: any) => String(tag || "")) : [],
        description: String(story?.description || ""),
        achievement: {
          icon: String(story?.achievement?.icon || ""),
          text: String(story?.achievement?.text || ""),
        },
      }))
    : [];

  // Stats Section
  const statsSection = {
    title: String(data?.statsSection?.title || ""),
    subtitle: String(data?.statsSection?.subtitle || ""),
    stats: Array.isArray(data?.statsSection?.stats)
      ? data.statsSection.stats.map((stat: any) => ({
          value: Number(stat?.value || 0),
          label: String(stat?.label || ""),
          suffix: stat?.suffix ? String(stat.suffix) : undefined,
        }))
      : [],
  };

  // Innovation Section
  const innovationSection = {
    title: String(data?.innovationSection?.title || ""),
    subtitle: String(data?.innovationSection?.subtitle || ""),
    image: String(data?.innovationSection?.image || ""),
    features: Array.isArray(data?.innovationSection?.features)
      ? data.innovationSection.features.map((feature: any) => ({
          title: String(feature?.title || ""),
          description: String(feature?.description || ""),
        }))
      : [],
    buttonText: String(data?.innovationSection?.buttonText || ""),
  };

  // CTA Section
  const ctaSection = {
    title: String(data?.ctaSection?.title || ""),
    subtitle: String(data?.ctaSection?.subtitle || ""),
    primaryButtonText: String(data?.ctaSection?.primaryButtonText || ""),
    secondaryButtonText: String(data?.ctaSection?.secondaryButtonText || ""),
  };

  return {
    hero,
    featureCards,
    technologySection,
    approachSection,
    successStories,
    statsSection,
    innovationSection,
    ctaSection,
  };
}

// Definiere die Datenbankklasse
class RealcoreDatabase extends Dexie {
  services!: Table<IService, string>;
  workshops!: Table<IWorkshop, string>;
  knowledgeHubContent!: Table<IKnowledgeHubContent, string>;
  resources!: Table<IResource, string>;
  mailConfig!: Table<IMailConfig, number>;
  landingPage!: Table<ILandingPageData, number>;
  tags!: Table<ITag, string>; // Add tags table

  constructor() {
    super("RealcoreDatabase");

    // Definiere die Schemas für die Tabellen
    this.version(3).stores({
      services: "id, category, phase, technologyCategory, processCategory",
      workshops: "id, title",
      knowledgeHubContent: "id, category",
      resources: "id, category, type",
      mailConfig: "++id",
      landingPage: "++id",
      tags: "id, name, category, count, createdAt, updatedAt" // Schema for centralized tag management
    });
  }
}

// Erstelle eine Instanz der Datenbank
export const db = new RealcoreDatabase();

// Hilfsfunktion zum sicheren Speichern eines einzelnen Elements
export async function safePut<T>(table: Table<T, any>, item: any): Promise<boolean> {
  try {
    // Bereinige das Element je nach Tabellentyp
    let cleanItem: any;

    if (table === db.services) {
      cleanItem = sanitizeService(item);
    } else if (table === db.workshops) {
      cleanItem = sanitizeWorkshop(item);
    } else if (table === db.knowledgeHubContent) {
      cleanItem = sanitizeKnowledgeHubContent(item);
    } else if (table === db.resources) {
      cleanItem = sanitizeResource(item);
    } else if (table === db.mailConfig) {
      cleanItem = sanitizeMailConfig(item);
    } else if (table === db.landingPage) {
      cleanItem = sanitizeLandingPage(item);
    } else if (table === db.tags) {
      cleanItem = sanitizeTag(item);
    } else {
      console.error("Unbekannte Tabelle, kann Element nicht bereinigen");
      return false;
    }

    // Versuche, das Element zu speichern
    await table.put(cleanItem);
    return true;
  } catch (error) {
    console.error(`Fehler beim Speichern eines Elements:`, error);
    return false;
  }
}

// Hilfsfunktion zum Initialisieren der Datenbank mit Standarddaten
export async function initializeDatabase(forceReset = false) {
  console.log("[DB] Initialisiere Datenbank...");

  try {
    // Prüfe, ob die Datenbank bereits initialisiert wurde
    const serviceCount = await db.services.count();
    const workshopCount = await db.workshops.count();
    const knowledgeHubContentItemCount = await db.knowledgeHubContent.count();
    const resourceCount = await db.resources.count();
    const mailConfigCount = await db.mailConfig.count();
    const landingPageCount = await db.landingPage.count();
    const tagCount = await db.tags.count(); // Add tag count

    console.log(
      `[DB] Aktuelle Datenbankeinträge: Services=${serviceCount}, Workshops=${workshopCount}, KnowledgeHubContent=${knowledgeHubContentItemCount}, Resources=${resourceCount}, MailConfig=${mailConfigCount}, LandingPage=${landingPageCount}, Tags=${tagCount}`
    );

    // Wenn forceReset true ist oder die Datenbank leer ist, initialisiere mit Standarddaten
    if (
      forceReset ||
      serviceCount === 0 ||
      workshopCount === 0 ||
      knowledgeHubContentItemCount === 0 ||
      resourceCount === 0 ||
      mailConfigCount === 0 ||
      landingPageCount === 0 ||
      tagCount === 0 // Add tag count check
    ) {
      console.log("[DB] Initialisiere Datenbank mit Standarddaten...");

      // Importiere die Standarddaten
      const { defaultServices, defaultWorkshops, defaultKnowledgeHubContent, defaultResources } =
        await import("@/data/default-data");
      const { defaultLandingPage } = await import("@/data/landing-page-data");

      // Wenn forceReset true ist, lösche alle vorhandenen Daten
      if (forceReset) {
        console.log("[DB] Lösche vorhandene Daten...");
        await db.services.clear();
        await db.workshops.clear();
        await db.knowledgeHubContent.clear();
        await db.resources.clear();
        await db.mailConfig.clear();
        await db.landingPage.clear();
        await db.tags.clear(); // Add tag clear
      }

      // Füge die Standarddaten hinzu, wenn die entsprechenden Tabellen leer sind
      if (forceReset || serviceCount === 0) {
        console.log("[DB] Füge Standarddaten für Services hinzu...");
        let successCount = 0;
        for (const service of defaultServices) {
          if (await safePut(db.services, service)) {
            successCount++;
          }
        }
        console.log(
          `[DB] ${successCount} von ${defaultServices.length} Services erfolgreich hinzugefügt`
        );
      }

      if (forceReset || workshopCount === 0) {
        console.log("[DB] Füge Standarddaten für Workshops hinzu...");
        let successCount = 0;
        for (const workshop of defaultWorkshops) {
          if (await safePut(db.workshops, workshop)) {
            successCount++;
          }
        }
        console.log(
          `[DB] ${successCount} von ${defaultWorkshops.length} Workshops erfolgreich hinzugefügt`
        );
      }

      if (forceReset || knowledgeHubContentItemCount === 0) {
        console.log("[DB] Füge Standarddaten für Knowledge Hub Inhalte hinzu...");
        let successCount = 0;
        for (const bp of defaultKnowledgeHubContent) {
          if (await safePut(db.knowledgeHubContent, bp)) {
            successCount++;
          }
        }
        console.log(
          `[DB] ${successCount} von ${defaultKnowledgeHubContent.length} Knowledge Hub Inhalte erfolgreich hinzugefügt`
        );
      }

      if (forceReset || resourceCount === 0) {
        console.log("[DB] Füge Standarddaten für Resources hinzu...");
        let successCount = 0;
        for (const resource of defaultResources) {
          if (await safePut(db.resources, resource)) {
            successCount++;
          }
        }
        console.log(
          `[DB] ${successCount} von ${defaultResources.length} Resources erfolgreich hinzugefügt`
        );
      }

      if (forceReset || mailConfigCount === 0) {
        console.log("[DB] Füge Standarddaten für Mail-Konfiguration hinzu...");
        if (await safePut(db.mailConfig)) {
          console.log(`[DB] Mail-Konfiguration erfolgreich hinzugefügt`);
        } else {
          console.error(`[DB] Fehler beim Hinzufügen der Mail-Konfiguration`);
        }
      }

      if (forceReset || landingPageCount === 0) {
        console.log("[DB] Füge Standarddaten für Landing Page hinzu...");
        if (await safePut(db.landingPage, defaultLandingPage)) {
          console.log(`[DB] Landing Page Daten erfolgreich hinzugefügt`);
        } else {
          console.error(`[DB] Fehler beim Hinzufügen der Landing Page Daten`);
        }
      }

      console.log("[DB] Datenbank erfolgreich mit Standarddaten initialisiert");
    } else {
      console.log("[DB] Datenbank bereits initialisiert, keine Aktion erforderlich");
    }

    return true;
  } catch (error) {
    console.error("[DB] Fehler bei der Initialisierung der Datenbank:", error);
    return false;
  }
}

// Hilfsfunktion zum Zurücksetzen der Datenbank auf Standardwerte
export async function resetDatabase() {
  console.log("[DB] Setze Datenbank zurück...");
  try {
    return await initializeDatabase(true);
  } catch (error) {
    console.error("[DB] Fehler beim Zurücksetzen der Datenbank:", error);
    return false;
  }
}

// Hilfsfunktion zum Aktualisieren der Datenbank mit neuen Standarddaten
export async function updateDatabaseWithDefaults() {
  console.log("[DB] Aktualisiere Datenbank mit neuen Standarddaten...");

  try {
    // Importiere die Standarddaten
    const { defaultServices, defaultWorkshops, defaultKnowledgeHubContent, defaultResources } =
      await import("@/data/default-data");
    const { defaultLandingPage } = await import("@/data/landing-page-data");

    // Hole die aktuellen Daten aus der Datenbank
    const currentServices = await db.services.toArray();
    const currentWorkshops = await db.workshops.toArray();
    const currentKnowledgeHubContent = await db.knowledgeHubContent.toArray();
    const currentResources = await db.resources.toArray();
    const landingPageCount = await db.landingPage.count();
    const currentTags = await db.tags.toArray(); // Add current tags

    // Erstelle Maps für schnellen Zugriff auf vorhandene Einträge
    const serviceMap = new Map(currentServices.map((s) => [s.id, s]));
    const workshopMap = new Map(currentWorkshops.map((w) => [w.id, w]));
    const knowledgeHubContentItemMap = new Map(currentKnowledgeHubContent.map((bp) => [bp.id, bp]));
    const resourceMap = new Map(currentResources.map((r) => [r.id, r]));
    const tagMap = new Map(currentTags.map((tag) => [tag.id, tag])); // Add tag map

    // Aktualisiere Services
    let newServicesCount = 0;
    for (const service of defaultServices) {
      if (!serviceMap.has(service.id)) {
        if (await safePut(db.services, service)) {
          newServicesCount++;
          console.log(`[DB] Neuer Service hinzugefügt: ${service.title}`);
        }
      }
    }

    // Aktualisiere Workshops
    let newWorkshopsCount = 0;
    for (const workshop of defaultWorkshops) {
      if (!workshopMap.has(workshop.id)) {
        if (await safePut(db.workshops, workshop)) {
          newWorkshopsCount++;
          console.log(`[DB] Neuer Workshop hinzugefügt: ${workshop.title}`);
        }
      }
    }

    // Aktualisiere Knowledge Hub Inhalt
    let newKnowledgeHubContentCount = 0;
    for (const knowledgeHubContentItem of defaultKnowledgeHubContent) {
      if (!knowledgeHubContentItemMap.has(knowledgeHubContentItem.id)) {
        if (await safePut(db.knowledgeHubContent, knowledgeHubContentItem)) {
          newKnowledgeHubContentCount++;
          console.log(
            `[DB] Neue Knowledge Hub Inhalt hinzugefügt: ${knowledgeHubContentItem.title}`
          );
        }
      }
    }

    // Aktualisiere Resources
    let newResourcesCount = 0;
    for (const resource of defaultResources) {
      if (!resourceMap.has(resource.id)) {
        if (await safePut(db.resources, resource)) {
          newResourcesCount++;
          console.log(`[DB] Neue Resource hinzugefügt: ${resource.title}`);
        }
      }
    }

    // Aktualisiere Mail Config, wenn keine vorhanden ist
    const mailConfigCount = await db.mailConfig.count();
    if (mailConfigCount === 0) {
      if (await safePut(db.mailConfig)) {
        console.log(`[DB] Mail-Konfiguration hinzugefügt`);
      }
    }

    // Aktualisiere Landing Page, wenn keine vorhanden ist
    if (landingPageCount === 0) {
      if (await safePut(db.landingPage, defaultLandingPage)) {
        console.log(`[DB] Landing Page Daten hinzugefügt`);
      }
    }

    console.log(
      `[DB] Datenbank aktualisiert: ${newServicesCount} neue Services, ${newWorkshopsCount} neue Workshops, ${newKnowledgeHubContentCount} neue Knowledge Hub Inhalte, ${newResourcesCount} neue Resources`
    );
    return true;
  } catch (error) {
    console.error("[DB] Fehler bei der Aktualisierung der Datenbank:", error);
    return false;
  }
}
