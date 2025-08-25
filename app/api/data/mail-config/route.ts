import { getMailConfig, saveMailConfig } from "@/lib/mail-config-service";
import type { IMailConfig } from "@/types/mail-config";

export async function GET() {
  try {
    const memoryMailConfig: IMailConfig = await getMailConfig();
    return Response.json(memoryMailConfig);
  } catch (error) {
    console.error("Fehler beim Abrufen der Mail-Konfiguration:", error);
    return Response.json({ error: "Fehler beim Abrufen der Mail-Konfiguration" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { config } = await request.json();
    const success = await saveMailConfig(config as IMailConfig);

    if (success) {
      return Response.json({ success: true });
    } else {
      throw new Error("Failed to save mail configuration");
    }
  } catch (error) {
    console.error("Fehler beim Speichern der Mail-Konfiguration:", error);
    return Response.json(
      { success: false, error: "Fehler beim Speichern der Mail-Konfiguration" },
      { status: 500 }
    );
  }
}
