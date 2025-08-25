"use server";
import type { IMailConfig } from "@/types/mail-config";
import { getMailConfig as getMailConfigService, saveMailConfig as saveMailConfigService } from "./mail-config-service";

export async function getMailConfig(): Promise<IMailConfig> {
  return await getMailConfigService();
}

export async function saveMailConfig(config: IMailConfig): Promise<boolean> {
  return await saveMailConfigService(config);
}
