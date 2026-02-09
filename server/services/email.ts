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
 * Send an email using SMTP or log to console when not configured.
 * SMTP is considered configured when SMTP_USER and SMTP_PASS are set;
 * SMTP_HOST defaults to smtp.gmail.com if omitted.
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const hasCredentials = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
  if (!hasCredentials) {
    console.warn(
      "⚠️ SMTP not configured - email will only be logged to console"
    );
    console.warn(
      "📧 To send real emails, set SMTP_USER and SMTP_PASS (and optionally SMTP_HOST=smtp.gmail.com, SMTP_PORT=587)"
    );
    logEmailToDev(options);
    return {
      success: true,
      error: "SMTP not configured - email logged to console only",
    };
  }

  try {
    console.log(`📧 Sending email to ${options.to} via SMTP...`);
    await sendSmtpEmail(options);
    console.log(`✅ Email sent successfully to ${options.to}`);
    return { success: true };
  } catch (err) {
    const error = err as any;
    console.error("❌ Failed to send email via SMTP:", error);

    // Return the actual error instead of falling back silently
    return {
      success: false,
      error: `SMTP Error: ${error.message || error}`,
    };
  }
}

/**
 * Generate a professional, styled HTML email template with branding
 */
export function generateHtmlEmail(
  title: string,
  message: string,
  actionUrl?: string,
  actionText?: string,
  footerText?: string
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f8fafc;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      border-radius: 12px;
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 40px 30px;
      text-align: center;
      position: relative;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" fill="white" opacity="0.1"><path d="M0,0 C150,100 350,0 500,50 C650,100 850,0 1000,50 L1000,0 Z"></path></svg>') no-repeat center bottom;
      background-size: cover;
    }
    
    .logo {
      position: relative;
      z-index: 1;
    }
    
         .logo-text {
       font-size: 32px;
       font-weight: 700;
       color: white;
       text-decoration: none;
       letter-spacing: -0.5px;
       display: inline-flex;
       align-items: center;
       gap: 8px;
     }
     
     .logo-text img {
       height: 40px;
       width: auto;
       margin-right: 8px;
       filter: brightness(0) invert(1); /* Make logo white to match header */
     }
    
    .logo-icon {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    
    .tagline {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      margin-top: 8px;
      font-weight: 400;
    }
    
    .content {
      padding: 40px 30px;
    }
    
    .content-title {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 24px;
      text-align: center;
    }
    
    .content-message {
      font-size: 16px;
      line-height: 1.7;
      color: #4b5563;
      margin-bottom: 32px;
    }
    
    .cta-container {
      text-align: center;
      margin: 32px 0;
    }
    
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      transition: all 0.3s ease;
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    }
    
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
      margin: 32px 0;
    }
    
    .footer {
      background-color: #f9fafb;
      padding: 32px 30px;
      border-top: 1px solid #e5e7eb;
    }
    
    .footer-content {
      text-align: center;
    }
    
    .footer-message {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    
    .contact-info {
      margin-bottom: 24px;
    }
    
    .contact-info h4 {
      font-size: 16px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 12px;
    }
    
    .contact-details {
      font-size: 14px;
      color: #6b7280;
      line-height: 1.6;
    }
    
    .contact-details a {
      color: #10b981;
      text-decoration: none;
    }
    
    .social-links {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .social-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background-color: #10b981;
      border-radius: 50%;
      text-decoration: none;
      transition: all 0.3s ease;
    }
    
    .social-link:hover {
      background-color: #059669;
      transform: translateY(-2px);
    }
    
    .social-icon {
      width: 20px;
      height: 20px;
      fill: white;
    }
    
    .copyright {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }
    
    .unsubscribe {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 8px;
    }
    
    .unsubscribe a {
      color: #6b7280;
      text-decoration: none;
    }
    
    /* Mobile Responsive */
    @media only screen and (max-width: 600px) {
      .email-container {
        margin: 0;
        border-radius: 0;
      }
      
      .header {
        padding: 30px 20px;
      }
      
      .logo-text {
        font-size: 28px;
      }
      
      .content {
        padding: 30px 20px;
      }
      
      .content-title {
        font-size: 22px;
      }
      
      .footer {
        padding: 24px 20px;
      }
      
      .social-links {
        gap: 12px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header with Logo -->
    <div class="header">
      <div class="logo">
        <a href="https://www.greenupp.earth" class="logo-text">
          <img src="https://www.greenupp.earth/assets/greenupp-full-logo.png" alt="GreenUpp Logo" />
          GreenUpp
        </a>
        <div class="tagline">Agricultural Intelligence Platform</div>
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="content">
      <h1 class="content-title">${title}</h1>
      <div class="content-message">
        ${message}
      </div>
      
        ${
          actionUrl && actionText
            ? `
      <div class="cta-container">
        <a href="${actionUrl}" class="cta-button">
              ${actionText}
            </a>
          </div>
        `
            : ""
        }
      
      <div class="divider"></div>
      
      <div class="footer-message">
        ${
          footerText ||
          "This message was sent from GreenUpp, your trusted agricultural intelligence platform."
        }
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-content">
                 <!-- Contact Information -->
         <div class="contact-info">
           <h4>Get in Touch</h4>
           <div class="contact-details">
             <div>📧 <a href="mailto:support@greenupp.earth">support@greenupp.earth</a></div>
             <div>📱 <a href="https://wa.me/260975808750">WhatsApp Support</a></div>
             <div>🌐 <a href="https://www.greenupp.earth">www.greenupp.earth</a></div>
           </div>
         </div>
        
                 <!-- Social Media Links -->
         <div class="social-links">
           <a href="https://twitter.com/greenuppearth" class="social-link" title="Follow us on Twitter">
            <svg class="social-icon" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </a>
          
                     <a href="https://linkedin.com/company/greenuppearth" class="social-link" title="Connect on LinkedIn">
            <svg class="social-icon" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          
                     <a href="https://instagram.com/greenuppearth" class="social-link" title="Follow us on Instagram">
            <svg class="social-icon" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          
                     <a href="https://facebook.com/greenuppearth" class="social-link" title="Like us on Facebook">
            <svg class="social-icon" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
        </div>
        
        <!-- Copyright and Legal -->
        <div class="copyright">
          © ${new Date().getFullYear()} GreenUpp. All rights reserved.<br>
          Empowering farmers with intelligent agricultural solutions.
        </div>
        
                 <div class="unsubscribe">
           <a href="https://www.greenupp.earth/unsubscribe">Unsubscribe</a> | 
           <a href="https://www.greenupp.earth/privacy">Privacy Policy</a> | 
           <a href="https://www.greenupp.earth/terms">Terms of Service</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
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
    from: process.env.SMTP_FROM || "GreenUpp <support@greenupp.earth>",
    subject: "Test Email from Greenupp",
    html,
    text: "This is a test email from Greenupp to verify that email functionality is working correctly.",
  });
}
