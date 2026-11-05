import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(options: SendEmailOptions) {
  if (!resend) {
    console.warn("Resend not configured. Email would have been sent to:", options.to);
    return { success: false, error: "Email service not configured" };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const fromName = process.env.RESEND_FROM_NAME || "Event Platform";

  try {
    const result = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    });

    if (result.error) {
      console.error("Resend error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (error: any) {
    console.error("Email send failed:", error);
    return { success: false, error: error.message || "Failed to send email" };
  }
}

export function replaceVariables(
  template: string,
  vars: Record<string, string | undefined | null>
): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "gi");
    result = result.replace(regex, value || "");
  }
  return result;
}

export function buildConfirmationEmailHtml(data: {
  participantName: string;
  eventName: string;
  eventDate: string;
  eventVenue: string;
  ticketNumber: string;
  registrationId: string;
  ticketType: string;
  qrCodeUrl?: string;
  spocName?: string;
  spocEmail?: string;
  spocPhone?: string;
  ticketUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Confirmation</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#F3EBDD;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F3EBDD;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background-color:#174D36;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:600;">Registration Confirmed</h1>
              <p style="margin:8px 0 0;color:#A8C98A;font-size:14px;">${data.eventName}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 16px;color:#103B2B;font-size:16px;">Dear <strong>${data.participantName}</strong>,</p>
              <p style="margin:0 0 24px;color:#103B2B;font-size:15px;line-height:1.6;">
                Thank you for registering for <strong>${data.eventName}</strong>. Your registration has been confirmed.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F3EBDD;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 8px;color:#174D36;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Registration Details</p>
                    <p style="margin:0 0 4px;color:#103B2B;font-size:14px;"><strong>Registration ID:</strong> ${data.registrationId}</p>
                    <p style="margin:0 0 4px;color:#103B2B;font-size:14px;"><strong>Ticket Number:</strong> ${data.ticketNumber}</p>
                    <p style="margin:0 0 4px;color:#103B2B;font-size:14px;"><strong>Ticket Type:</strong> ${data.ticketType}</p>
                    <p style="margin:0 0 4px;color:#103B2B;font-size:14px;"><strong>Date:</strong> ${data.eventDate}</p>
                    <p style="margin:0;color:#103B2B;font-size:14px;"><strong>Venue:</strong> ${data.eventVenue}</p>
                  </td>
                </tr>
              </table>
              ${
                data.qrCodeUrl
                  ? `
              <div style="text-align:center;margin-bottom:24px;">
                <p style="margin:0 0 12px;color:#174D36;font-size:14px;font-weight:600;">Your Entry QR Code</p>
                <img src="${data.qrCodeUrl}" alt="QR Code" width="180" height="180" style="border:4px solid #174D36;border-radius:8px;" />
                <p style="margin:12px 0 0;color:#666;font-size:12px;">Present this QR code at the venue for check-in</p>
              </div>
              `
                  : ""
              }
              ${
                data.spocName
                  ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #A8C98A;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 8px;color:#174D36;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Your Point of Contact</p>
                    <p style="margin:0 0 4px;color:#103B2B;font-size:14px;"><strong>${data.spocName}</strong></p>
                    ${data.spocEmail ? `<p style="margin:0 0 4px;color:#103B2B;font-size:14px;">Email: ${data.spocEmail}</p>` : ""}
                    ${data.spocPhone ? `<p style="margin:0;color:#103B2B;font-size:14px;">Phone: ${data.spocPhone}</p>` : ""}
                  </td>
                </tr>
              </table>
              `
                  : ""
              }
              <div style="text-align:center;margin-top:32px;">
                <a href="${data.ticketUrl}" style="display:inline-block;background-color:#174D36;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
                  View Your Ticket
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color:#103B2B;padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#A8C98A;font-size:12px;">\u00a9 ${new Date().getFullYear()} ${data.eventName}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
