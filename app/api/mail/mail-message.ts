import { type mailRequest } from "@/types/mail-request";
import { getMailConfig } from "./mail-config";

export async function generateMessage(recipient: string | null, content: mailRequest): Promise<any> {
  const config = await getMailConfig();
  
  const subject = content.subject ? `[realcore techhub] ${content.subject}` : "Testmail send";
  const bodyText = content.html
    ? `${content.html}\r\n\r\n- realcore techhub`
    : `Testmail has been successfully sent.\n\nRecipient: ${recipient || config.defaultTarget}`;

  return {
    message: {
      subject,
      body: {
        contentType: "HTML",
        content: bodyText,
      },
      toRecipients: [
        {
          emailAddress: { address: recipient || config.defaultTarget },
        },
      ],
    },
    saveToSentItems: true,
  };
}

export function isValidEmailRequest(content: mailRequest): boolean {
  return (
    typeof content.subject === "string" &&
    content.subject.trim() !== "" &&
    typeof content.html === "string" &&
    content.html.trim() !== ""
  );
}

