"use client";

import { useState, useEffect } from "react";
import {
  defaultServices,
  defaultWorkshops,
  defaultKnowledgeHubContent,
  defaultResources,
} from "@/data/default-data";
import {
  db,
  initializeDatabase,
  sanitizeService,
  sanitizeWorkshop,
  sanitizeKnowledgeHubContent,
  sanitizeResource,
} from "./db";

// Initialisiere die Datenbank beim ersten Laden
if (typeof window !== "undefined") {
  // Verwende eine IIFE, um async/await zu nutzen
  (async () => {
    try {
      console.log("[USE-CONTENT-DATA] Initialisiere Datenbank...");
      const success = await initializeDatabase();
      if (success) {
        console.log("[USE-CONTENT-DATA] Datenbank erfolgreich initialisiert");
      } else {
        console.error("[USE-CONTENT-DATA] Fehler bei der Initialisierung der Datenbank");
      }
    } catch (error) {
      console.error("[USE-CONTENT-DATA] Fehler bei der Initialisierung der Datenbank:", error);
    }
  })();
}

// Hilfsfunktion zum Laden von Daten aus der Datenbank mit Fallback auf Standarddaten
async function loadFromDatabase<T>(
  tableName: string,
  defaultData: T[],
  sanitizeFn: (item: any) => any
): Promise<{ data: T[]; source: string }> {
  try {
    console.log(`[USE-CONTENT-DATA] Lade ${tableName} aus der Datenbank...`);

    // Lade Daten aus der entsprechenden Datenbanktabelle
    const table = db[tableName as keyof typeof db];
    if (!table) {
      throw new Error(`Tabelle ${tableName} existiert nicht in der Datenbank`);
    }

    const dbData = await table.toArray();

    if (dbData && dbData.length > 0) {
      console.log(
        `[USE-CONTENT-DATA] ${dbData.length} Einträge für ${tableName} aus der Datenbank geladen`
      );
      return { data: dbData, source: "database" };
    }

    console.log(
      `[USE-CONTENT-DATA] Keine Daten für ${tableName} in der Datenbank gefunden, initialisiere mit Standarddaten`
    );

    // Initialisiere die Datenbank mit Standarddaten
    try {
      const sanitizedData = defaultData.map(sanitizeFn);
      await table.clear();
      await table.bulkPut(sanitizedData);
      console.log(
        `[USE-CONTENT-DATA] Datenbank für ${tableName} mit ${sanitizedData.length} Standarddaten initialisiert`
      );
      return { data: sanitizedData, source: "default" };
    } catch (dbError) {
      console.error(
        `[USE-CONTENT-DATA] Fehler beim Initialisieren der Datenbank für ${tableName}:`,
        dbError
      );
      throw dbError;
    }
  } catch (error) {
    console.error(
      `[USE-CONTENT-DATA] Fehler beim Laden von ${tableName} aus der Datenbank:`,
      error
    );
    return { data: defaultData.map(sanitizeFn), source: "default" };
  }
}

export function useServices() {
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        console.log("[USE-CONTENT-DATA] useServices: Lade Services direkt aus der Datenbank...");
        setIsLoading(true);
        setError(null);

        const result = await loadFromDatabase("services", defaultServices, sanitizeService);
        setServices(result.data);
      } catch (err) {
        console.error("[USE-CONTENT-DATA] useServices: Fehler beim Laden der Services:", err);
        setServices(defaultServices.map(sanitizeService));
        setError("Fehler beim Laden der Services. Standarddaten werden verwendet.");
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
  }, []);

  return { services, isLoading, error };
}

export function useWorkshops() {
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkshops = async () => {
      try {
        console.log("[USE-CONTENT-DATA] useWorkshops: Lade Workshops direkt aus der Datenbank...");
        setIsLoading(true);
        setError(null);

        const result = await loadFromDatabase("workshops", defaultWorkshops, sanitizeWorkshop);
        setWorkshops(result.data);
      } catch (err) {
        console.error("[USE-CONTENT-DATA] useWorkshops: Fehler beim Laden der Workshops:", err);
        setWorkshops(defaultWorkshops.map(sanitizeWorkshop));
        setError("Fehler beim Laden der Workshops. Standarddaten werden verwendet.");
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkshops();
  }, []);

  return { workshops, isLoading, error };
}

export function useKnowledgeHubContent() {
  const [knowledgeHubContent, setKnowledgeHubContent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBestPractices = async () => {
      try {
        console.log(
          "[USE-CONTENT-DATA] useKnowledgeHubContent: Lade Knowledge Hub Inhalte direkt aus der Datenbank..."
        );
        setIsLoading(true);
        setError(null);

        const result = await loadFromDatabase(
          "defaultKnowledgeHubContent",
          defaultKnowledgeHubContent,
          sanitizeKnowledgeHubContent
        );
        setKnowledgeHubContent(result.data);
      } catch (err) {
        console.error(
          "[USE-CONTENT-DATA] useKnowledgeHubContent: Fehler beim Laden der Best Practices:",
          err
        );
        setKnowledgeHubContent(defaultKnowledgeHubContent.map(sanitizeKnowledgeHubContent));
        setError("Fehler beim Laden der Best Practices. Standarddaten werden verwendet.");
      } finally {
        setIsLoading(false);
      }
    };

    loadBestPractices();
  }, []);

  return { knowledgeHubContent, isLoading, error };
}

export function useResources() {
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResources = async () => {
      try {
        console.log("[USE-CONTENT-DATA] useResources: Lade Resources direkt aus der Datenbank...");
        setIsLoading(true);
        setError(null);

        const result = await loadFromDatabase("resources", defaultResources, sanitizeResource);
        setResources(result.data);
      } catch (err) {
        console.error("[USE-CONTENT-DATA] useResources: Fehler beim Laden der Resources:", err);
        setResources(defaultResources.map(sanitizeResource));
        setError("Fehler beim Laden der Resources. Standarddaten werden verwendet.");
      } finally {
        setIsLoading(false);
      }
    };

    loadResources();
  }, []);

  return { resources, isLoading, error };
}

export function useContentData(dataType: string) {
  const [data, setData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let defaultData: any[] = [];
        let tableName = "";
        let sanitizeFn: (item: any) => any = (item) => item;

        switch (dataType) {
          case "services":
            defaultData = defaultServices;
            tableName = "services";
            sanitizeFn = sanitizeService;
            break;
          case "workshops":
            defaultData = defaultWorkshops;
            tableName = "workshops";
            sanitizeFn = sanitizeWorkshop;
            break;
          case "knowledgeHubContent":
            defaultData = defaultKnowledgeHubContent;
            tableName = "knowledgeHubContent";
            sanitizeFn = sanitizeKnowledgeHubContent;
            break;
          case "resources":
            defaultData = defaultResources;
            tableName = "resources";
            sanitizeFn = sanitizeResource;
            break;
          default:
            setError(`Ungültiger Datentyp: ${dataType}`);
            setData([]);
            setIsLoading(false);
            return;
        }

        const result = await loadFromDatabase(tableName, defaultData, sanitizeFn);
        setData(result.data);
      } catch (err) {
        console.error(`[USE-CONTENT-DATA] useContentData: Fehler beim Laden von ${dataType}:`, err);

        // Verwende Standarddaten im Fehlerfall
        switch (dataType) {
          case "services":
            setData(defaultServices.map(sanitizeService));
            break;
          case "workshops":
            setData(defaultWorkshops.map(sanitizeWorkshop));
            break;
          case "knowledgeHubContent":
            setData(defaultKnowledgeHubContent.map(sanitizeKnowledgeHubContent));
            break;
          case "resources":
            setData(defaultResources.map(sanitizeResource));
            break;
          default:
            setData([]);
            break;
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dataType]);

  return { data, isLoading, error };
}
