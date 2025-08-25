export interface IMailConfig {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  tenantId: string;
  defaultFrom: string;
  defaultTarget: string;
}
