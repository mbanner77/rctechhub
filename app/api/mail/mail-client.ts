import { ConfidentialClientApplication } from "@azure/msal-node";
import { getMailConfig } from "./mail-config";

export async function getAccessToken(): Promise<string> {
  const mailConfig = await getMailConfig();
  
  const msalConfig = {
    auth: {
      clientId: mailConfig.clientId,
      authority: `https://login.microsoftonline.com/${mailConfig.tenantId}`,
      clientSecret: mailConfig.clientSecret,
    },
  };

  const cca = new ConfidentialClientApplication(msalConfig);
  const tokenRequest = { scopes: ["https://graph.microsoft.com/.default"] };
  const response = await cca.acquireTokenByClientCredential(tokenRequest);
  if (!response?.accessToken) throw new Error("Access token acquisition failed.");
  return response.accessToken;
}
