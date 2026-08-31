import nodemailer from 'nodemailer';

/**
 * Nodemailer Transporter Configuration for Sehetak
 * Configure SMTP environment variables in .env:
 * SMTP_HOST (e.g. smtp.gmail.com)
 * SMTP_PORT (e.g. 587 or 465)
 * SMTP_USER (e.g. your-email@gmail.com)
 * SMTP_PASS (e.g. your-app-password)
 * SMTP_FROM (e.g. "Sehetak صحتك" <noreply@sehetak.app>)
 */

export function createMailerTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn('⚠️ SMTP_USER or SMTP_PASS missing in environment variables.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendSehetakEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const transporter = createMailerTransporter();
  const from = process.env.SMTP_FROM || `"صحتك | Sehetak" <${process.env.SMTP_USER || 'no-reply@sehetak.app'}>`;

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });

  return info;
}
