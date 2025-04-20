import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable is not set. Email functionality will not work.");
}

// Initialize the mail service if we have an API key
const mailService = new MailService();

if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string | string[];
  from: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
  attachments?: Array<{
    content: string;
    filename: string;
    type?: string;
    disposition?: string;
  }>;
}

/**
 * Send an email using SendGrid
 * 
 * @param params Email parameters
 * @returns boolean indicating success/failure
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("Email not sent: SENDGRID_API_KEY is not set");
    return false;
  }

  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
      templateId: params.templateId,
      dynamicTemplateData: params.dynamicTemplateData,
      attachments: params.attachments,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

/**
 * Send a test email to verify SendGrid configuration
 * 
 * @param toEmail Email address to send the test to
 * @returns boolean indicating success/failure
 */
export async function sendTestEmail(toEmail: string): Promise<boolean> {
  return sendEmail({
    to: toEmail,
    from: 'no-reply@greenupp.app',
    subject: 'Greenupp Email Service Test',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1e293b; padding: 20px; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Email Service Test</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none;">
          <p>This is a test email to verify that your Greenupp email service is configured correctly.</p>
          <p>If you're receiving this, everything is working properly!</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-left: 4px solid #10b981;">
            <p style="margin: 0; font-size: 14px;">Sent at: ${new Date().toISOString()}</p>
          </div>
        </div>
      </div>
    `,
    text: `Email Service Test

This is a test email to verify that your Greenupp email service is configured correctly.
If you're receiving this, everything is working properly!

Sent at: ${new Date().toISOString()}`
  });
}

/**
 * Send a welcome email to a new user
 */
export async function sendWelcomeEmail(
  toEmail: string,
  userData: { 
    firstName?: string | null;
    username: string;
  }
): Promise<boolean> {
  const name = userData.firstName || userData.username;
  
  return sendEmail({
    to: toEmail,
    from: 'welcome@greenupp.app',
    subject: 'Welcome to Greenupp!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1e293b; padding: 20px; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Welcome to Greenupp!</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none;">
          <p>Hello ${name},</p>
          <p>Welcome to Greenupp, your comprehensive digital agriculture platform!</p>
          <p>We're excited to have you on board. Here are a few things you can do to get started:</p>
          <ul>
            <li>Complete your profile information</li>
            <li>Set up your first farm field</li>
            <li>Explore crop management features</li>
            <li>Check the marketplace for agricultural supplies</li>
          </ul>
          <div style="margin-top: 20px;">
            <a href="https://greenupp.app/dashboard" style="display: inline-block; background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Go to Dashboard</a>
          </div>
          <p style="margin-top: 20px;">If you have any questions, feel free to contact our support team.</p>
          <p>Best regards,<br>The Greenupp Team</p>
        </div>
      </div>
    `,
    text: `Welcome to Greenupp!

Hello ${name},

Welcome to Greenupp, your comprehensive digital agriculture platform!

We're excited to have you on board. Here are a few things you can do to get started:
- Complete your profile information
- Set up your first farm field
- Explore crop management features
- Check the marketplace for agricultural supplies

Visit your dashboard at: https://greenupp.app/dashboard

If you have any questions, feel free to contact our support team.

Best regards,
The Greenupp Team`
  });
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(
  toEmail: string, 
  resetToken: string
): Promise<boolean> {
  const resetUrl = `https://greenupp.app/reset-password?token=${resetToken}`;
  
  return sendEmail({
    to: toEmail,
    from: 'security@greenupp.app',
    subject: 'Reset Your Greenupp Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1e293b; padding: 20px; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Reset Your Password</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none;">
          <p>You requested a password reset for your Greenupp account.</p>
          <p>Click the button below to set a new password. This link will expire in 1 hour.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a>
          </div>
          <p>If you didn't request this reset, you can safely ignore this email.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
            <p>For security reasons, this link will expire after 1 hour.</p>
            <p>If the button above doesn't work, copy and paste this URL into your browser:</p>
            <p style="word-break: break-all;">${resetUrl}</p>
          </div>
        </div>
      </div>
    `,
    text: `Reset Your Password

You requested a password reset for your Greenupp account.

Use the following link to set a new password. This link will expire in 1 hour:
${resetUrl}

If you didn't request this reset, you can safely ignore this email.

For security reasons, this link will expire after 1 hour.`
  });
}

/**
 * Send a digest email with multiple notifications
 */
export async function sendNotificationsDigest(
  toEmail: string,
  notifications: Array<{
    id: number;
    title: string;
    message: string;
    type: string;
    createdAt: Date;
    actionUrl?: string;
  }>,
  digestType: 'daily' | 'weekly'
): Promise<boolean> {
  if (notifications.length === 0) {
    return true; // Nothing to send
  }
  
  const notificationItems = notifications.map(notification => `
    <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 4px;">
      <h3 style="margin-top: 0; color: #1e293b;">${notification.title}</h3>
      <p style="color: #334155;">${notification.message}</p>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="color: #64748b; font-size: 12px;">${notification.createdAt.toLocaleString()}</span>
        ${notification.actionUrl ? `
          <a href="${notification.actionUrl}" style="font-size: 14px; color: #10b981; text-decoration: none;">View Details →</a>
        ` : ''}
      </div>
    </div>
  `).join('');
  
  return sendEmail({
    to: toEmail,
    from: 'notifications@greenupp.app',
    subject: `Your ${digestType === 'daily' ? 'Daily' : 'Weekly'} Greenupp Digest`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1e293b; padding: 20px; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Your ${digestType === 'daily' ? 'Daily' : 'Weekly'} Greenupp Digest</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none;">
          <p>Here's a summary of your recent notifications:</p>
          
          <div style="margin-top: 20px;">
            ${notificationItems}
          </div>
          
          <div style="margin-top: 20px; text-align: center;">
            <a href="https://greenupp.app/notifications" style="display: inline-block; background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View All Notifications</a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
            <p>You're receiving this digest because you've configured your notification preferences to ${digestType}.</p>
            <p>To change your notification settings, visit your <a href="https://greenupp.app/settings" style="color: #10b981;">account settings</a>.</p>
          </div>
        </div>
      </div>
    `,
    text: `Your ${digestType === 'daily' ? 'Daily' : 'Weekly'} Greenupp Digest

Here's a summary of your recent notifications:

${notifications.map(n => `
* ${n.title}
  ${n.message}
  ${n.actionUrl ? `View Details: ${n.actionUrl}` : ''}
  ${n.createdAt.toLocaleString()}
`).join('\n')}

View all notifications: https://greenupp.app/notifications

You're receiving this digest because you've configured your notification preferences to ${digestType}.
To change your notification settings, visit your account settings: https://greenupp.app/settings`
  });
}