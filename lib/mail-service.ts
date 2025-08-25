"use server";
import type { IMailConfig } from "@/types/mail-config";

export interface SendEmailProps {
  to: string;
  subject: string;
  html: string;
}

// Füge die defaultMailConfig hinzu und exportiere sie
const defaultMailConfig: IMailConfig = {
  enabled: false,
  clientId: "",
  clientSecret: "",
  tenantId: "",
  defaultFrom: "",
  defaultTarget: "",
};

export async function getMailConfig(): Promise<IMailConfig> {
  try {
    let mailConfigString = process.env.MAIL_CONFIG;
    if (!mailConfigString) {
      console.warn("MAIL_CONFIG environment variable is not set.");
      const response = await fetch("api/data/mail-config", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      mailConfigString = JSON.stringify(await response.json());
      process.env.MAIL_CONFIG = mailConfigString;
    }

    const mailConfig: IMailConfig = JSON.parse(mailConfigString);
    return mailConfig;
  } catch (error) {
    console.error("Fehler beim Abrufen der Mail-Konfiguration:", error);
    return defaultMailConfig;
  }
}

export async function saveMailConfig(config: IMailConfig): Promise<void> {
  process.env.MAIL_CONFIG = JSON.stringify(config);
}
