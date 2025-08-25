"use server";

import { getMailConfig, saveMailConfig } from "./mail-service";
import type { IMailConfig } from "@/types/mail-config";

export async function getMailConfigAction(): Promise<IMailConfig> {
  return getMailConfig();
}

export async function saveMailConfigAction(config: IMailConfig): Promise<void> {
  await saveMailConfig(config);
}
