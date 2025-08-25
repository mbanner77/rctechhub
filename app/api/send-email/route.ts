// import { ConfidentialClientApplication } from "@azure/msal-node";
// import { type MailConfig } from '@/types/mail-config';
// import { type NextRequest, NextResponse } from "next/server"
// import { getMailConfig } from "@/lib/mail-actions";
// import { type mailRequest } from "@/types/mail-request"

// // Load environment variables.  In a real app, these should be
// // set in your hosting environment, not directly in a file.
// let mailConfig: MailConfig = JSON.parse(process.env.MAIL_CONFIG || "{}");
// const config = {
//   auth: {
//     clientId: mailConfig.clientId || "35c00140-4da9-4ba3-a606-a53a7999a911",
//     authority: `https://login.microsoftonline.com/${mailConfig.tenantId || "99c7da52-56fc-49ca-aa95-8f7fb09c995e"}`,
//     clientSecret: mailConfig.clientSecret || "uso8Q~NR9K2d.JV6QWdTx6RBfTO85EIV0VYPibVA",
//   }
// };

// /**
//  * Retrieves an access token using the Client Credentials Grant flow.
//  * @returns {Promise<string>} - A promise that resolves to the access token.
//  * @throws {Error} - If the token acquisition fails.
//  */
// async function getToken(): Promise<string> {
//   const tokenRequest = {
//     scopes: ["https://graph.microsoft.com/.default"], // Requesting general Graph API access
//   };

//   try {
//     const cca = new ConfidentialClientApplication(config);
//     const response = await cca.acquireTokenByClientCredential(tokenRequest);
//     if (!response || !response.accessToken) {
//       throw new Error("Failed to acquire access token.");
//     }
//     return response.accessToken;
//   } catch (error) {
//     console.error("Error in getToken:", error);
//     throw new Error(`Error acquiring token: ${(error as Error).message || 'Unknown error'}`);
//   }
// }

// const messageGenerator = (recipientEmail: string | null, content: any): any => {
//   // Testmails do not require "subject" or "html"
//   content.subject = content.subject ? '[realcore techhub] ' + content.subject : null;
//   content.html = content.html ? content.html + '\r\n\r\n- realcore techhub' : null;
//   return {
//     message: {
//       subject: content.subject || "Testmail send",
//       body: {
//         contentType: "Text",
//         content: content.html || `Testmail has been successfully send. \n \r Recipient: ${recipientEmail || mailConfig.defaultTarget}`,
//       },
//       toRecipients: [
//         {
//           emailAddress: {
//             address: recipientEmail || mailConfig.defaultTarget,
//           },
//         },
//       ],
//     },
//     saveToSentItems: true,
//   }
// };
// /**
//  * Sends an email using the Microsoft Graph API.
//  * @param {string} accessToken - The access token used to authenticate the request.
//  * @param {string} recipientEmail - The email address of the recipient.
//  * @returns {Promise<any>} - A promise that resolves to the API response.
//  * @throws {Error} - If sending the email fails.
//  */
// async function sendMail(accessToken: string, message: any): Promise<any> {
//   const graphAPIEndpoint = `https://graph.microsoft.com/v1.0/users/${mailConfig.defaultFrom}/sendMail`;

//   const requestOptions = {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${accessToken}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(message),
//   };

//   try {
//     const response = await fetch(graphAPIEndpoint, requestOptions);
//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(`Failed to send email: ${response.status} - ${errorText}`);
//     }
//     // M. R.: I don't know why we should return this on "success" and it also throws an error (Invalid end of JSON). We already have an error-handler and this is not a GET method. 
//     // return await response.json(); // Or response.text(), depending on expected response
//   } catch (error) {
//     console.error("Error in sendMail:", error);
//     throw new Error(`Error sending email: ${(error as Error).message || 'Unknown error'}`);
//   }
// }

// export function isValidEmail(content: mailRequest): boolean {
//   return content.testEmail || typeof content.subject === 'string' && typeof content.html === 'string';
// }

// /**
//  * Handles the sending of an email.  This is the function you requested.
//  * @param {string} recipientEmail - The email address to send the email to.
//  * @returns {Promise<void>}
//  * @throws {Error}
//  */
// export async function sendMailHandler(resources: any): Promise<void> {
//   try {
//     const accessToken = await getToken();
//     if (resources.testEmail) {
//       await sendMail(accessToken, messageGenerator(resources.testEmail, {}));
//     } else {
//       await sendMail(accessToken, messageGenerator(null, resources));
//     }
//     console.log(`Email sent successfully to ${resources.testEmail}!`);
//   } catch (error) {
//     //  Important:  Handle errors appropriately in your application.
//     //  This example just logs to the console and re-throws.  You might
//     //  want to show a user-friendly message, retry, etc.
//     console.error("Error in sendMailHandler:", error);
//     throw error; // Re-throw to be caught by the caller (e.g., in your API route)
//   }
// }

// /**
//  * Next.js API route to handle the email sending request.
//  */
// export async function POST(req: NextRequest) {
//   try {
//     await getMailConfig()
//     // Updating the variable in case that it was empty when module was loaded 
//     mailConfig = JSON.parse(process.env.MAIL_CONFIG as string);
//     const resources = await req.json()
//     if (isValidEmail(resources)) {
//       await sendMailHandler(resources);
//     } else {
//       return NextResponse.json(
//         { error: 'Mail attributes are missing or invalid' },
//         { status: 400 }
//       )
//     }
//     return NextResponse.json({ success: true })
//   } catch (error) {
//     console.error("Fehler beim Speichern der Ressourcen:", error)
//     return NextResponse.json({ error: "Fehler beim Speichern der Ressourcen" }, { status: 500 })
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { isValidEmailRequest } from "../mail/mail-message";
import { sendMail } from "../mail/mail-service";

export async function POST(req: NextRequest) {
  try {
    const content = await req.json();

    console.log("[MAIL] Received a new Request: ", content);

    if (!isValidEmailRequest(content)) {
      console.log("[MAIL] Invalid Request! Code: 400")
      return NextResponse.json({ error: "Invalid email payload" }, { status: 400 });
    }

    console.log("[MAIL] Sending Mail to ", content.testEmail)
    await sendMail(content.testEmail ?? null, content);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[MAIL API ERROR]:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
