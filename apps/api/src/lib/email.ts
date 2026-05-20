import sgMail from '@sendgrid/mail';
import { logger } from './logger';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@nextgenoutreach.co.za';
const FROM_NAME = process.env.FROM_NAME || 'NextGenOutreach';

let isConfigured = false;

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  isConfigured = true;
  logger.info('[Email] SendGrid configured');
} else {
  logger.warn('[Email] SENDGRID_API_KEY not set — emails will be logged only');
}

export function isEmailConfigured() {
  return isConfigured;
}

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const msg = {
    to: payload.to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: payload.subject,
    html: payload.html,
    text: payload.text || payload.html.replace(/<[^>]+>/g, ''),
    ...(payload.replyTo ? { replyTo: payload.replyTo } : {}),
  };

  if (!isConfigured) {
    logger.warn('[Email] Skipped (not configured):', { to: payload.to, subject: payload.subject });
    return false;
  }

  try {
    await sgMail.send(msg);
    logger.info('[Email] Sent:', { to: payload.to, subject: payload.subject });
    return true;
  } catch (err: any) {
    logger.error('[Email] Send failed:', err?.response?.body || err.message);
    return false;
  }
}

// ─── Templated emails ──────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, role: string) {
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  return sendEmail({
    to,
    subject: `Welcome to NextGenOutreach — Your ${roleLabel} account is ready`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:12px;">
        <h1 style="font-size:28px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#fff;">Welcome aboard.</h1>
        <p style="color:#aaa;font-size:15px;line-height:1.6;">Your <strong style="color:#fff;">${roleLabel}</strong> account has been created on NextGenOutreach.</p>
        <a href="https://nextgenoutreach.co.za/login" style="display:inline-block;margin-top:24px;padding:14px 32px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:1px;">
          Access Dashboard →
        </a>
        <p style="color:#555;font-size:12px;margin-top:40px;">NextGenOutreach · nextgenoutreach.co.za</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  return sendEmail({
    to,
    subject: 'Reset your NextGenOutreach password',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:12px;">
        <h1 style="font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:2px;">Password Reset</h1>
        <p style="color:#aaa;font-size:15px;line-height:1.6;">You requested a password reset. Click the link below — it expires in 1 hour.</p>
        <a href="${resetLink}" style="display:inline-block;margin-top:24px;padding:14px 32px;background:#ef4444;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:1px;">
          Reset Password →
        </a>
        <p style="color:#555;font-size:12px;margin-top:40px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendCampaignStatusEmail(to: string, campaignName: string, status: string) {
  const statusColors: Record<string, string> = {
    ACTIVE: '#22c55e',
    PAUSED: '#f59e0b',
    COMPLETED: '#3b82f6',
    CANCELLED: '#ef4444',
  };
  const color = statusColors[status] || '#7c3aed';

  return sendEmail({
    to,
    subject: `Campaign update: ${campaignName} is now ${status}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:12px;">
        <h1 style="font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:2px;">Campaign Update</h1>
        <p style="color:#aaa;font-size:15px;line-height:1.6;">
          Your campaign <strong style="color:#fff;">${campaignName}</strong> status has changed to
          <strong style="color:${color};">${status}</strong>.
        </p>
        <a href="https://nextgenoutreach.co.za/dashboard/client/campaigns" style="display:inline-block;margin-top:24px;padding:14px 32px;background:${color};color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:1px;">
          View Campaign →
        </a>
        <p style="color:#555;font-size:12px;margin-top:40px;">NextGenOutreach · nextgenoutreach.co.za</p>
      </div>
    `,
  });
}

export async function sendRepVerifiedEmail(to: string) {
  return sendEmail({
    to,
    subject: 'Your identity has been verified — NextGenOutreach',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:12px;">
        <h1 style="font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:2px;">✅ Identity Verified</h1>
        <p style="color:#aaa;font-size:15px;line-height:1.6;">
          Your identity has been confirmed by our compliance team. You can now receive payouts and be matched to clients.
        </p>
        <a href="https://nextgenoutreach.co.za/dashboard/rep/overview" style="display:inline-block;margin-top:24px;padding:14px 32px;background:#22c55e;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:1px;">
          Go to Dashboard →
        </a>
        <p style="color:#555;font-size:12px;margin-top:40px;">NextGenOutreach · nextgenoutreach.co.za</p>
      </div>
    `,
  });
}
