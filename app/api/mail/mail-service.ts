import { getAccessToken } from "./mail-client";
import { generateMessage } from "./mail-message";
import { getMailConfig } from "./mail-config";
import { mailRequest } from "@/types/mail-request"

export async function sendMailRequest(request: mailRequest): Promise<void> {
  const recipient = request.testEmail || null

  const content = {
    subject: request.subject,
    html: request.html,
  }

  await sendMail(recipient, content)
}

export async function sendMail(recipient: string | null, content: any): Promise<void> {
  const config = await getMailConfig();
  const token = await getAccessToken();
  const message = await generateMessage(recipient, content);

  const response = await fetch(`https://graph.microsoft.com/v1.0/users/${config.defaultFrom}/sendMail`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${response.status} - ${error}`);
  }
}
