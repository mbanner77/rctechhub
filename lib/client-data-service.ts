// Verbesserte Client-Datenzugriffsbibliothek
import { defaultLandingPage } from "@/data/landing-page-data"; // Korrigierter Import-Pfad

const API_BASE_URL = "/api";

// Hilfsfunktion für Fetch mit besserer Fehlerbehandlung und Logging
async function fetchWithErrorHandling(url: string, options?: RequestInit) {
  try {
    // Cache-Buster hinzufügen
    const cacheBuster = new Date().getTime();
    const urlWithCacheBuster = `${url}${url.includes("?") ? "&" : "?"}t=${cacheBuster}`;

    const response = await fetch(urlWithCacheBuster, {
      ...options,
      headers: {
        ...options?.headers,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });

    if (!response.ok) {
      // Versuche, den Fehler als JSON zu lesen
      try {
        const errorData = await response.json();
        throw new Error(
          `API-Fehler (${response.status}): ${errorData.error || "Unbekannter Fehler"}`
        );
      } catch (jsonError) {
        // Wenn der Fehler nicht als JSON gelesen werden kann, verwende den Statustext
        throw new Error(`API-Fehler (${response.status}): ${response.statusText}`);
      }
    }

    return response;
  } catch (error) {
    console.error(`Fetch-Fehler für ${url}:`, error);
    throw error;
  }
}

// Services
export async function getClientServices() {
  console.log("getClientServices aufgerufen");
  try {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/services`);
    const data = await response.json();
    console.log(`${data.length} Services geladen`);
    return data;
  } catch (error) {
    console.error("Fehler beim Laden der Services:", error);
    throw error;
  }
}

export async function saveClientServices(services: any[]) {
  console.log(`saveClientServices aufgerufen mit ${services.length} Services`);
  try {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/services`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(services),
    });
    const result = await response.json();
    console.log("Services gespeichert:", result);
    return result.success;
  } catch (error) {
    console.error("Fehler beim Speichern der Services:", error);
    throw error;
  }
}

// Workshops
export async function getClientWorkshops() {
  console.log("getClientWorkshops aufgerufen");
  try {
    const response = await fetchWithErrorHandling("/api/data/workshops");

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err?.error || "Failed to load workshops")
    }

    const data = await response.json();
    console.log(`${data.length} Workshops geladen`);
    return data;
  } catch (error) {
    console.error("Fehler beim Laden der Workshops:", error);
    throw error;
  }
}

export async function saveClientWorkshops(workshops: any[]) {
  console.log(`saveClientWorkshops aufgerufen mit ${workshops.length} Workshops`);
  try {
    const response = await fetchWithErrorHandling("/api/data/workshops", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(workshops),
    });

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err?.error || "Failed to save workshops")
    }

    const result = await response.json();

    console.log("Workshops gespeichert");
    return result.success;
  } catch (error) {
    console.error("Fehler beim Speichern der Workshops:", error);
    throw error;
  }
}

// Knowledge Hub Inhalte
export async function getClientKnowledgeHubContent() {
  console.log("getClientKnowledgeHubContent aufgerufen");
  try {
    const response = await fetchWithErrorHandling("/api/data/knowledge-hub");
    const data = await response.json();
    console.log(`${data.length} Knowledge Hub Inhalte geladen`);
    return data;
  } catch (error) {
    console.error("Fehler beim Laden der Knowledge Hub Inhalte:", error);
    throw error;
  }
}

export async function saveClientKnowledgeHubContent(knowledgeHubContent: any[]) {
  console.log(
    `saveClientKnowledgeHubContent aufgerufen mit ${knowledgeHubContent.length} content items`
  );
  try {
    const response = await fetchWithErrorHandling("/api/data/knowledge-hub", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(knowledgeHubContent),
    });
    const result = await response.json();
    console.log("Knowledge Hub Inhalte gespeichert:", result);
    return result.success;
  } catch (error) {
    console.error("Fehler beim Speichern der Knowledge Hub Inhalte:", error);
    throw error;
  }
}

// Resources
export async function getClientResources() {
  console.log("getClientResources aufgerufen");
  try {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/resources`);
    const data = await response.json();
    console.log(`${data.length} Resources geladen`);
    return data;
  } catch (error) {
    console.error("Fehler beim Laden der Resources:", error);
    throw error;
  }
}

export async function saveClientResources(resources: any[]) {
  console.log(`saveClientResources aufgerufen mit ${resources.length} Resources`);
  try {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/resources`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resources),
    });
    const result = await response.json();
    console.log("Resources gespeichert:", result);
    return result.success;
  } catch (error) {
    console.error("Fehler beim Speichern der Resources:", error);
    throw error;
  }
}

// Landing Page
export async function getClientLandingPage() {
  console.log("[CLIENT] getClientLandingPage aufgerufen");
  try {
    // Generiere einen Cache-Buster-Parameter
    const cacheBuster = new Date().getTime();
    console.log(`[CLIENT] Cache-Buster: ${cacheBuster}`);

    // Versuche, die Daten vom Server zu laden mit strikten Cache-Control-Headern
    const response = await fetch(`${API_BASE_URL}/landing-page?t=${cacheBuster}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
        "X-Cache-Buster": cacheBuster.toString(),
      },
    });

    if (response.ok) {
      const landingPage = await response.json();
      console.log("[CLIENT] Landing Page vom Server geladen");
      return landingPage;
    }

    // Wenn der Server-Aufruf fehlschlägt, verwende Standarddaten
    console.error("[CLIENT] Fehler beim Laden der Landing Page vom Server, verwende Standarddaten");
    console.error(`[CLIENT] Status: ${response.status}, Statustext: ${response.statusText}`);

    try {
      const errorText = await response.text();
      console.error(`[CLIENT] Fehlerdetails: ${errorText}`);
    } catch (e) {
      console.error("[CLIENT] Konnte Fehlerdetails nicht lesen");
    }

    return JSON.parse(JSON.stringify(defaultLandingPage));
  } catch (error) {
    console.error("[CLIENT] Fehler beim Laden der Landing Page:", error);
    return JSON.parse(JSON.stringify(defaultLandingPage));
  }
}

export async function saveClientLandingPage(landingPage: any) {
  console.log("[CLIENT] saveClientLandingPage aufgerufen");
  try {
    // Generiere einen Cache-Buster-Parameter
    const cacheBuster = new Date().getTime();
    console.log(`[CLIENT] Cache-Buster: ${cacheBuster}`);

    // Versuche, die Daten auf dem Server zu speichern
    const response = await fetch(`${API_BASE_URL}/landing-page?t=${cacheBuster}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
        "X-Cache-Buster": cacheBuster.toString(),
      },
      body: JSON.stringify(landingPage),
    });

    if (response.ok) {
      const result = await response.json();
      console.log(
        `[CLIENT] Landing Page erfolgreich auf dem Server gespeichert: ${JSON.stringify(result)}`
      );

      // Warte kurz, um sicherzustellen, dass die Änderungen gespeichert wurden
      console.log("[CLIENT] Warte 1 Sekunde vor dem Neuladen...");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Erzwinge ein Neuladen der Daten
      console.log("[CLIENT] Erzwinge Neuladen der Daten");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("landingpage-updated"));
      }

      return true;
    } else {
      console.error(
        `[CLIENT] Fehler beim Speichern der Landing Page auf dem Server: ${response.status} ${response.statusText}`
      );

      try {
        const errorText = await response.text();
        console.error(`[CLIENT] Fehlerdetails: ${errorText}`);
      } catch (e) {
        console.error("[CLIENT] Konnte Fehlerdetails nicht lesen");
      }

      return false;
    }
  } catch (error) {
    console.error("[CLIENT] Fehler beim Speichern der Landing Page:", error);
    return false;
  }
}

// Mail Config
export async function getClientMailConfig() {
  console.log("getClientMailConfig aufgerufen");
  try {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/mail-config`);
    const data = await response.json();
    console.log("Mail Config geladen");
    return data;
  } catch (error) {
    console.error("Fehler beim Laden der Mail Config:", error);
    throw error;
  }
}

export async function saveClientMailConfig(mailConfig: any) {
  console.log("saveClientMailConfig aufgerufen");
  try {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/mail-config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mailConfig),
    });
    const result = await response.json();
    console.log("Mail Config gespeichert:", result);
    return result.success;
  } catch (error) {
    console.error("Fehler beim Speichern der Mail Config:", error);
    throw error;
  }
}

// Reset
export async function resetClientData() {
  console.log("resetClientData aufgerufen");
  try {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/reset`, {
      method: "POST",
    });
    const result = await response.json();
    console.log("Daten zurückgesetzt:", result);
    return result.success;
  } catch (error) {
    console.error("Fehler beim Zurücksetzen der Daten:", error);
    throw error;
  }
}
