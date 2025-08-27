import type { IMailConfig } from "@/types/mail-config";

// Default mail configuration (pure value module; safe to import anywhere)
export const defaultMailConfig: IMailConfig = {
  enabled: false,
  clientId: "",
  clientSecret: "",
  tenantId: "",
  defaultFrom: "",
  defaultTarget: "",
};
