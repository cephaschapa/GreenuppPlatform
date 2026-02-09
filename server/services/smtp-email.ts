import nodemailer from "nodemailer";

// Default to Google SMTP when no host set (use SMTP_USER + SMTP_PASS with Gmail App Password)
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT) || 587;
const isSecure = smtpPort === 465;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: isSecure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  ...(smtpHost === "smtp.gmail.com" && smtpPort === 587 && { requireTLS: true }),
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 30000,
});

export async function sendSmtpEmail({
  to,
  from,
  subject,
  html,
  text,
}: {
  to: string;
  from?: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  const mailOptions = {
    from: from || process.env.SMTP_FROM || "GreenUpp <support@greenupp.earth>",
    to,
    subject,
    html,
    text,
  };
  return transporter.sendMail(mailOptions);
}
