"use server";

import type { IMailConfig } from "@/types/mail-config";
import { getMailConfigFromBlob, saveMailConfigToBlob } from "./blob-db-actions";
import { revalidatePath } from "next/cache";

// Default mail configuration
export const defaultMailConfig: IMailConfig = {
  enabled: false,
  clientId: "",
  clientSecret: "",
  tenantId: "",
  defaultFrom: "",
  defaultTarget: "",
};

/**
 * Get mail configuration with fallback hierarchy:
 * 1. Try blob storage first (persistent across deployments)
 * 2. Fallback to environment variable
 * 3. Fallback to default config
 */
export async function getMailConfig(): Promise<IMailConfig> {
  try {
    // First, try to get from blob storage (persistent)
    const blobConfig = await getMailConfigFromBlob();
    if (blobConfig && isValidMailConfig(blobConfig)) {
      return blobConfig;
    }
  } catch (error) {
    console.warn("Could not load mail config from blob storage:", error);
  }

  try {
    // Fallback to environment variable
    const envConfigString = process.env.MAIL_CONFIG;
    if (envConfigString) {
      const envConfig: IMailConfig = JSON.parse(envConfigString);
      if (isValidMailConfig(envConfig)) {
        // If env config is valid, save it to blob storage for persistence
        await saveMailConfigToBlob(envConfig);
        return envConfig;
      }
    }
  } catch (error) {
    console.warn("Could not parse MAIL_CONFIG environment variable:", error);
  }

  // Final fallback to default config
  return defaultMailConfig;
}

/**
 * Save mail configuration to both blob storage and environment variable
 * This ensures persistence across deployments and immediate availability
 */
export async function saveMailConfig(config: IMailConfig): Promise<boolean> {
  if (!isValidMailConfig(config)) {
    console.error("Invalid mail configuration provided");
    return false;
  }

  try {
    // Save to blob storage for persistence
    const blobSuccess = await saveMailConfigToBlob(config);
    
    if (blobSuccess) {
      // Update environment variable for immediate availability
      process.env.MAIL_CONFIG = JSON.stringify(config);
      
      // Revalidate relevant paths to ensure the changes are reflected
      revalidatePath("/admin/mail-config");
      revalidatePath("/api/mail-config");
      revalidatePath("/api/unified-data/mail-config");
      
      console.log("Mail configuration saved successfully");
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error saving mail configuration:", error);
    return false;
  }
}

/**
 * Validate mail configuration
 */
function isValidMailConfig(config: IMailConfig): boolean {
  return (
    config &&
    typeof config.enabled === "boolean" &&
    typeof config.clientId === "string" &&
    typeof config.clientSecret === "string" &&
    typeof config.tenantId === "string" &&
    typeof config.defaultFrom === "string" &&
    typeof config.defaultTarget === "string"
  );
}

/**
 * Test mail configuration by sending a test email
 */
export async function testMailConfig(testEmail: string, config?: IMailConfig): Promise<boolean> {
  try {
    const mailConfig = config || await getMailConfig();
    
    if (!mailConfig.enabled) {
      throw new Error("Mail configuration is disabled");
    }

    if (!isValidMailConfig(mailConfig)) {
      throw new Error("Invalid mail configuration");
    }

    // Send test email using the current mail service
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        testEmail,
        subject: "Test Mail Configuration",
        html: `
          <h2>Test Email</h2>
          <p>This is a test email to verify the mail configuration.</p>
          <p><strong>Test Email:</strong> ${testEmail}</p>
          <p><strong>Sent from:</strong> ${mailConfig.defaultFrom}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        `,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error testing mail configuration:", error);
    return false;
  }
}
