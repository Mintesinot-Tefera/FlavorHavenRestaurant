import nodemailer from "nodemailer";
import { env } from "../config/env";

function createTransporter() {
  if (!env.SMTP_HOST) {
    return null; // dev fallback: log to console
  }
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
) {
  const link = `${env.APP_URL}/verify-email?token=${token}`;
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`[EMAIL] Verification link for ${to}: ${link}`);
    return;
  }

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: "Verify your FlavorHaven account",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#e85d04">Welcome to FlavorHaven, ${name}!</h2>
        <p>Thanks for registering. Please verify your email address to activate your account:</p>
        <a href="${link}" style="display:inline-block;padding:12px 24px;background:#e85d04;color:white;text-decoration:none;border-radius:8px;font-weight:600;margin:16px 0">
          Verify Email
        </a>
        <p style="color:#6b7280;font-size:13px">Or copy this link into your browser:<br>${link}</p>
        <p style="color:#6b7280;font-size:13px">This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>
      </div>
    `,
  });
}
