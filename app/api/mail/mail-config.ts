import { type IMailConfig } from "@/types/mail-config";
import { getMailConfig as getMailConfigService } from "@/lib/mail-config-service";

export async function getMailConfig(): Promise<IMailConfig> {
  const config = await getMailConfigService();
  
  // Ensure the config has all required fields for the mail service
  if (!config.enabled || !config.clientId || !config.clientSecret || !config.tenantId) {
    throw new Error("Mail configuration is incomplete or disabled");
  }
  
  return config;
}
