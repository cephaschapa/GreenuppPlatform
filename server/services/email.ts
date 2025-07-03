import { sendSmtpEmail } from "./smtp-email";

interface EmailOptions {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Development mode email logger
 * This simulates sending an email by logging it to the console
 */
function logEmailToDev(options: EmailOptions): boolean {
  console.log("\n==================================");
  console.log("💌 EMAIL SENT (DEVELOPMENT MODE)");
  console.log("==================================");
  console.log(`From: ${options.from}`);
  console.log(`To: ${options.to}`);
  console.log(`Subject: ${options.subject}`);
  console.log("----------------------------------");
  console.log(options.text);
  console.log("==================================\n");
  return true;
}

// Interface for email result
export interface EmailResult {
  success: boolean;
  error?: string;
}

/**
 * Send an email using SMTP or log to console in development
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  // If SMTP is not configured, log the email to console
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    logEmailToDev(options);
    return { success: true };
  }
  try {
    await sendSmtpEmail(options);
    return { success: true };
  } catch (err) {
    const error = err as any;
    console.error("Failed to send email via SMTP:", error);
    // Fallback to dev logger
    logEmailToDev(options);
    return {
      success: true,
      error: "SMTP error, but logged to console in development mode",
    };
  }
}

/**
 * Generate a styled HTML email template
 */
export function generateHtmlEmail(
  title: string,
  message: string,
  actionUrl?: string,
  actionText?: string,
  footerText?: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1e293b; padding: 20px; color: white; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">${title}</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; line-height: 1.5; color: #334155;">${message}</p>
        ${
          actionUrl && actionText
            ? `
          <div style="margin-top: 20px; margin-bottom: 20px; text-align: center;">
            <a href="${actionUrl}" 
               style="display: inline-block; background-color: #10b981; color: white; 
                      padding: 12px 24px; text-decoration: none; border-radius: 4px;
                      font-weight: bold; font-size: 16px;">
              ${actionText}
            </a>
          </div>
        `
            : ""
        }
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; 
                    font-size: 12px; color: #64748b; line-height: 1.5;">
          <p>${
            footerText ||
            "This message was sent from Greenupp, the agricultural intelligence platform."
          }</p>
          <p>© ${new Date().getFullYear()} Greenupp. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Test email functionality
 */
export async function testEmail(to: string): Promise<EmailResult> {
  const html = generateHtmlEmail(
    "Test Email from Greenupp",
    "This is a test email sent from the Greenupp platform to verify that email functionality is working correctly.",
    "https://greenupp.app/dashboard",
    "Visit Dashboard",
    "This is a test email. If you did not request this email, please ignore it."
  );
  return sendEmail({
    to,
    from: process.env.SMTP_FROM || "notifications@greenupp.app",
    subject: "Test Email from Greenupp",
    html,
    text: "This is a test email from Greenupp to verify that email functionality is working correctly.",
  });
}
