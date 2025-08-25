"use client";

import { type mailRequest } from "@/types/mail-request";
import { getMailConfig } from "@/lib/mail-config-service";

/**
 * Sends a confirmation email to the user after submitting a form.
 * 
 * @param userEmail The email address of the user who submitted the form
 * @param userName The name of the user who submitted the form
 * @param formType The type of form that was submitted (for tracking and subject line)
 * @param formContent Optional additional content to include in the email
 * @returns A promise that resolves to a boolean indicating whether the email was sent successfully
 */
export async function sendFormConfirmationEmail(
  userEmail: string,
  userName: string,
  formType: string,
  formContent?: string
): Promise<boolean> {
  try {
    const content: mailRequest = {
      subject: "Wir haben Ihre Anfrage erhalten – RealCore Group",
      html: `
        Sehr geehrte Damen und Herren,<br/><br/>
        
        vielen Dank für Ihre Nachricht und Ihr Interesse an unseren Leistungen im Tech Hub.<br/><br/>
        
        Ihre Anfrage ist erfolgreich bei uns eingegangen. Ein Teammitglied wird sich zeitnah mit Ihnen in Verbindung setzen, um Ihr Anliegen persönlich zu besprechen.<br/><br/>
        
        ${formContent ? `<div>${formContent}</div><br/><br/>` : ''}
        
        Für Rückfragen stehen wir Ihnen gerne unter techhub@realcore.de zur Verfügung.<br/><br/>
        
        Mit freundlichen Grüßen<br/>
        Ihr Team der RealCore Group<br/><br/>
        
        <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />
        
        <div style="font-size: 12px; color: #666;">
          <strong>RealCore Group</strong><br/>
          Im Welterbe 2<br/>
          D- 45141 Essen<br/>
          E: <a href="mailto:techhub@realcore.de">techhub@realcore.de</a><br/>
          W: <a href="http://www.realcore.de">http://www.realcore.de</a><br/><br/>
          
          ……………………………………………………………………………………………..
          <br/><br/>
          
          <strong>WHERE TECHNOLOGY MEETS BUSINESS</strong><br/>
          ……………………………………………………………………………………………..
          <br/><br/>
          
          Geschäftsführer: Marcus Banner, Roger Hillebrand, Michael Thielecke<br/>
          RealCore Group GmbH l Sitz der Gesellschaft: Essen l Registergericht: Essen, HRB 25272 l Umsatzsteuer-ID: DE293733893<br/><br/>
          
          <strong>BE GREEN KEEP IT ON THE SCREEN.</strong>
        </div>
      `,
      testEmail: userEmail
    };

    // API-Route für E-Mail-Versand
    const apiUrl = '/api/send-email';

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
      credentials: "same-origin" // Stellt sicher, dass Cookies mitgesendet werden
    });

    const result = await response.json();

    if (result.success) {
      console.log(`[MAIL] Confirmation email sent successfully to ${userEmail} for ${formType}`);
      return true;
    } else {
      console.warn(`[MAIL] Error sending confirmation email to ${userEmail} for ${formType}:`, result);
      return false;
    }
  } catch (error) {
    console.error(`[MAIL] Exception sending confirmation email to ${userEmail} for ${formType}:`, error);
    return false;
  }
}

/**
 * Sends a notification email to the RealCore team about a new form submission
 * 
 * @param userEmail The email of the user who submitted the form
 * @param userName The name of the user who submitted the form
 * @param formType The type of form that was submitted
 * @param formDetails The details of the form submission
 * @returns A promise that resolves to a boolean indicating whether the email was sent successfully
 */
export async function sendTeamNotificationEmail(
  userEmail: string,
  userName: string,
  formType: string,
  formDetails: Record<string, string>
): Promise<boolean> {
  try {
    // Get mail configuration
    const mailConfig = await getMailConfig();
    const targetEmail = mailConfig.defaultTarget || 'techhub@realcore.de';

    // Format form details for email
    const formDetailsHtml = Object.entries(formDetails)
      .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
      .join('<br/>');

    const content: mailRequest = {
      subject: `Neue ${formType}-Anfrage eingegangen`,
      html: `
        Guten Tag,<br/><br/>
        
        eine neue ${formType}-Anfrage ist über das Tech Hub eingegangen.<br/><br/>
        
        <strong>Kontaktdaten:</strong><br/>
        Name: ${userName}<br/>
        E-Mail: ${userEmail}<br/><br/>
        
        <strong>Details der Anfrage:</strong><br/>
        ${formDetailsHtml}<br/><br/>
        
        Diese Nachricht wurde automatisch generiert.
      `,
      testEmail: targetEmail
    };

    // API-Route für E-Mail-Versand
    const apiUrl = '/api/send-email';

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
      credentials: "same-origin" // Stellt sicher, dass Cookies mitgesendet werden
    });

    const result = await response.json();

    if (result.success) {
      console.log(`[MAIL] Team notification email sent successfully for ${formType} submission`);
      return true;
    } else {
      console.warn(`[MAIL] Error sending team notification email for ${formType} submission:`, result);
      return false;
    }
  } catch (error) {
    console.error(`[MAIL] Exception sending team notification email for ${formType} submission:`, error);
    return false;
  }
}
