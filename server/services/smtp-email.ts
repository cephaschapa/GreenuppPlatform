import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
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
