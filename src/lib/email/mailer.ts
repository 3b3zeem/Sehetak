import nodemailer from 'nodemailer';

/**
 * Nodemailer Transporter Configuration for Sehetak
 * Configure SMTP environment variables in .env or Vercel settings:
 * SMTP_HOST (e.g. smtp.gmail.com)
 * SMTP_PORT (e.g. 587 or 465)
 * SMTP_USER (e.g. your-email@gmail.com)
 * SMTP_PASS (e.g. your-16-digit-app-password)
 * SMTP_FROM (e.g. "صحتك | Sehetak" <your-email@gmail.com>)
 */

export function createMailerTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, ''); // Remove spaces from Gmail app password

  if (!user || !pass) {
    throw new Error('بيانات البريد الإلكتروني غير مكتملة (SMTP_USER أو SMTP_PASS غير محددة في متغيرات البيئة).');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    // Optional TLS settings for Gmail / custom SMTP
    tls: {
      rejectUnauthorized: false,
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
