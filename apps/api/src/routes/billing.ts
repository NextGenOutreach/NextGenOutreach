import express, { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { FirebaseAuthRequest, requireRole } from '../middleware/firebaseAuth.middleware';
import { ok, badRequest } from '../lib/response';
import crypto from 'crypto';
import { 
  PAYFAST_MERCHANT_ID, 
  PAYFAST_MERCHANT_KEY, 
  PAYFAST_PASSPHRASE, 
  PAYFAST_MODE,
  CORS_ORIGIN 
} from '../config/environment';

const router = express.Router();

const PLAN_PRICES: Record<string, number> = {
  'STARTER': 75,
  'PRO': 150,
  'MANAGED': 300,
};

router.post('/subscribe', requireRole('client'), asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const { plan } = req.body;
  if (!plan || !PLAN_PRICES[plan.toUpperCase()]) {
    return badRequest(res, 'Invalid plan selected');
  }

  const user = req.user!;
  const amount = PLAN_PRICES[plan.toUpperCase()];

  const data: Record<string, string> = {
    merchant_id: PAYFAST_MERCHANT_ID,
    merchant_key: PAYFAST_MERCHANT_KEY,
    return_url: `${CORS_ORIGIN}/dashboard/client/profile?payment=success`,
    cancel_url: `${CORS_ORIGIN}/dashboard/client/profile?payment=cancel`,
    notify_url: `${process.env.API_URL || 'http://localhost:3001'}/api/v1/webhooks/payfast`,
    m_payment_id: user.id,
    amount: amount.toFixed(2),
    item_name: plan,
    email_address: user.email,
  };

  // Generate signature
  const pfParamString = Object.keys(data)
    .map(key => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`)
    .join('&');

  const finalString = PAYFAST_PASSPHRASE 
    ? `${pfParamString}&passphrase=${encodeURIComponent(PAYFAST_PASSPHRASE).replace(/%20/g, '+')}`
    : pfParamString;

  const signature = crypto.createHash('md5').update(finalString).digest('hex');

  const baseUrl = PAYFAST_MODE === 'live' 
    ? 'https://www.payfast.co.za/eng/process' 
    : 'https://sandbox.payfast.co.za/eng/process';

  return ok(res, {
    url: baseUrl,
    payload: { ...data, signature }
  });
}));

export default router;
