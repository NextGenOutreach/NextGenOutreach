import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { ok, badRequest, forbidden } from '../lib/response';
import { sendEmail, sendWelcomeEmail, isEmailConfigured } from '../lib/email';
import { FirebaseAuthRequest } from '../middleware/firebaseAuth.middleware';

const router = Router();

function isAdmin(user?: FirebaseAuthRequest['user']) {
  return user?.role === 'admin' || user?.role === 'super_admin';
}

// GET /email/status — check if SendGrid is configured
router.get('/status', asyncHandler(async (_req, res) => {
  return ok(res, {
    configured: isEmailConfigured(),
    from: process.env.FROM_EMAIL || 'noreply@nextgenoutreach.co.za',
  });
}));

// POST /email/test — send a test email (admin only)
router.post('/test', asyncHandler(async (req, res) => {
  const authReq = req as unknown as FirebaseAuthRequest;
  if (!isAdmin(authReq.user)) return forbidden(res, 'Admin only');

  const to = req.body.to || authReq.user!.email;
  if (!to) return badRequest(res, 'to email is required');

  if (!isEmailConfigured()) {
    return badRequest(res, 'SENDGRID_API_KEY is not configured on Railway');
  }

  const sent = await sendEmail({
    to,
    subject: 'NextGenOutreach — Test Email ✅',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:12px;">
        <h1 style="font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:2px;">Email is working! ✅</h1>
        <p style="color:#aaa;font-size:15px;line-height:1.6;">
          This test was sent from <strong style="color:#fff;">NextGenOutreach</strong> via SendGrid.<br/>
          If you can read this, your email integration is fully operational.
        </p>
        <p style="color:#555;font-size:12px;margin-top:40px;">Sent to: ${to} · nextgenoutreach.co.za</p>
      </div>
    `,
  });

  if (!sent) return badRequest(res, 'Email send failed — check Railway logs for SendGrid error details');

  return ok(res, { sent: true, to: String(to) });
}));

// POST /email/welcome — manually trigger welcome email (admin only)
router.post('/welcome', asyncHandler(async (req, res) => {
  const authReq = req as unknown as FirebaseAuthRequest;
  if (!isAdmin(authReq.user)) return forbidden(res, 'Admin only');
  const { to, role = 'client' } = req.body;
  if (!to) return badRequest(res, 'to is required');
  const sent = await sendWelcomeEmail(to, role);
  return ok(res, { sent, to });
}));

export default router;
