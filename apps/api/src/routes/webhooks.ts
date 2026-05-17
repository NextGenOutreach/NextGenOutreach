import express, { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { ok, badRequest } from '../lib/response';
import prisma from '../lib/database';
import crypto from 'crypto';
import { PAYFAST_PASSPHRASE, PAYFAST_MERCHANT_ID } from '../config/environment';

const router = express.Router();

/**
 * PayFast ITN (Instant Transaction Notification) handler
 * @see https://developers.payfast.co.za/docs/software_itn
 */
router.post('/payfast', asyncHandler(async (req: Request, res: Response) => {
  const data = req.body;

  // 1. Validate Merchant ID
  if (data.merchant_id !== PAYFAST_MERCHANT_ID) {
    console.error('PayFast Webhook: Merchant ID mismatch');
    return badRequest(res, 'Invalid merchant ID');
  }

  // 2. Validate Signature
  const pfParamString = Object.keys(data)
    .filter(key => key !== 'signature')
    .map(key => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`)
    .join('&');

  const finalString = PAYFAST_PASSPHRASE 
    ? `${pfParamString}&passphrase=${encodeURIComponent(PAYFAST_PASSPHRASE).replace(/%20/g, '+')}`
    : pfParamString;

  const signature = crypto.createHash('md5').update(finalString).digest('hex');

  if (data.signature !== signature) {
    console.error('PayFast Webhook: Signature mismatch');
    // In production, you should also verify the IP address and call back to PayFast to verify the data
    return badRequest(res, 'Invalid signature');
  }

  // 3. Process Transaction
  const { 
    m_payment_id: userId, // We'll pass userId as m_payment_id
    pf_payment_id: payfastPaymentId,
    payment_status: status,
    item_name: plan,
    amount_gross: amount 
  } = data;

  if (status === 'COMPLETE') {
    // Find user and update profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { clientProfile: true }
    });

    if (user && user.clientProfile) {
      await prisma.$transaction([
        // Update client profile
        prisma.clientProfile.update({
          where: { id: user.clientProfile.id },
          data: {
            plan: (plan as string).toUpperCase() as any,
            planStatus: 'active',
            payfastToken: data.token || null, // For recurring payments if applicable
          }
        }),
        // Record payment
        prisma.payment.create({
          data: {
            clientId: user.clientProfile.id,
            amountUsd: Number(amount) / 18, // Rough conversion if amount was in ZAR
            currency: 'ZAR',
            provider: 'PAYFAST',
            providerId: payfastPaymentId,
            status: 'COMPLETED',
          }
        })
      ]);
      console.log(`PayFast: Successfully processed payment for user ${userId}`);
    }
  }

  return ok(res, { received: true });
}));

export default router;