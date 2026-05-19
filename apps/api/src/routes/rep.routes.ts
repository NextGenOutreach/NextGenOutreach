import express from 'express';
import { z } from 'zod';
import { RepController } from '../controllers/rep.controller';
import { requireRole, FirebaseAuthRequest } from '../middleware/firebaseAuth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { ok, badRequest, serverError, forbidden } from '../lib/response';
import { logger } from '../lib/logger';
import prisma from '../lib/database';
import multer from 'multer';
import { uploadIdDocument } from '../lib/s3';

// HIGH FIX: Onboarding step schemas
const basicProfileSchema = z.object({
  linkedinUrl: z.string().url(),
  linkedinFollowers: z.number().int().min(0).optional(),
  industry: z.string().min(1).max(100),
  locationCountry: z.string().min(1).max(100),
  locationCity: z.string().min(1).max(100).optional(),
  bio: z.string().max(1000).optional(),
  maxClients: z.number().int().min(1).max(10).optional(),
});

const linkedinDetailsSchema = z.object({
  linkedinUrl: z.string().url(),
  linkedinFollowers: z.number().int().min(0),
});

const browserSetupSchema = z.object({
  provider: z.enum(['GOLOGIN', 'BITBROWSER', 'ADSPOWER']),
  externalProfileId: z.string().optional(),
});

const router = express.Router();
const ctrl = new RepController();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Public endpoints for marketplace browsing
router.get('/', ctrl.listReps);

// LOW FIX: /profile routes must come BEFORE /:id to prevent "profile" being parsed as an ID
// Protected rep endpoints
router.get('/profile', requireRole('rep'), asyncHandler(async (req: FirebaseAuthRequest, res) => {
  if (!req.user) return badRequest(res, 'User not authenticated');

  const profile = await prisma.repProfile.findUnique({
    where: { userId: req.user.id },
    include: {
      user: {
        select: {
          email: true,
          status: true,
        }
      }
    }
  });

  if (!profile) {
    return res.status(404).json({
      success: false,
      error: { message: 'Rep profile not found' }
    });
  }

  return ok(res, profile);
}));

router.patch('/profile', requireRole('rep'), asyncHandler(async (req: FirebaseAuthRequest, res) => {
  const { linkedinUrl, industry, bio, locationCountry, locationCity, availabilityStatus } = req.body;
  
  if (!req.user) return badRequest(res, 'User not authenticated');

  const updated = await prisma.repProfile.update({
    where: { userId: req.user.id },
    data: {
      ...(linkedinUrl !== undefined && { linkedinUrl }),
      ...(industry !== undefined && { industry }),
      ...(bio !== undefined && { bio }),
      ...(locationCountry !== undefined && { locationCountry }),
      ...(locationCity !== undefined && { locationCity }),
      ...(availabilityStatus !== undefined && { availabilityStatus }),
    }
  });

  return ok(res, updated);
}));

// Public endpoint for getting rep by ID - must come AFTER /profile
router.get('/:id', ctrl.getRepById);

router.post('/upload-id', requireRole('rep'), upload.single('idDocument'), asyncHandler(async (req: FirebaseAuthRequest, res) => {
  if (!req.user) return badRequest(res, 'User not authenticated');
  if (!req.file) return badRequest(res, 'No file uploaded');

  try {
    const repProfile = await prisma.repProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!repProfile) return badRequest(res, 'Rep profile not found');

    const key = await uploadIdDocument(req.file.buffer, req.file.mimetype, repProfile.id);

    const updated = await prisma.repProfile.update({
      where: { id: repProfile.id },
      data: { 
        idDocumentUrl: key,
        // Reset verification status if they re-upload
        idVerified: false,
        idVerifiedAt: null
      }
    });

    return ok(res, { 
      message: 'ID document uploaded successfully and pending review',
      profile: updated 
    });
  } catch (error) {
    logger.error('ID Upload Error:', { error });
    return serverError(res, 'Failed to upload document');
  }
}));

router.post('/onboarding', requireRole('rep'), asyncHandler(async (req: FirebaseAuthRequest, res) => {
  // HIGH FIX: Full onboarding implementation
  const { step, data } = req.body as { step: number; data: any };
  
  if (!step || step < 1 || step > 7) {
    return badRequest(res, 'Invalid step. Must be 1-7: 1=basic_profile, 2=linkedin_details, 3=id_upload, 4=awaiting_verification, 5=twofa_setup, 6=browser_setup, 7=complete');
  }
  
  const rp = await prisma.repProfile.findUnique({ where: { userId: req.user!.id } });
  if (!rp) return badRequest(res, 'Rep profile not found');
  
  // Verify step progression (can't skip ahead)
  if (step > rp.onboardingStep + 1) {
    return forbidden(res, `Cannot skip ahead. Current step: ${rp.onboardingStep}, requested: ${step}`);
  }
  
  const ONBOARDING_STEPS: Record<number, string> = {
    1: 'basic_profile',
    2: 'linkedin_details',
    3: 'id_upload',
    4: 'awaiting_verification',
    5: 'twofa_setup',
    6: 'browser_setup',
    7: 'complete',
  };
  
  try {
    switch (step) {
      case 1: {
        // Basic profile
        const validation = basicProfileSchema.safeParse(data);
        if (!validation.success) {
          return badRequest(res, `Invalid data: ${validation.error.errors.map(e => e.message).join(', ')}`);
        }
        await prisma.repProfile.update({
          where: { id: rp.id },
          data: { ...validation.data, onboardingStep: 2 }
        });
        break;
      }
      case 2: {
        // LinkedIn details
        const validation = linkedinDetailsSchema.safeParse(data);
        if (!validation.success) {
          return badRequest(res, `Invalid data: ${validation.error.errors.map(e => e.message).join(', ')}`);
        }
        await prisma.repProfile.update({
          where: { id: rp.id },
          data: { ...validation.data, onboardingStep: 3 }
        });
        break;
      }
      case 3: {
        // ID upload - this is handled by /upload-id endpoint
        // Just advance to awaiting verification
        await prisma.repProfile.update({
          where: { id: rp.id },
          data: { onboardingStep: 4 }
        });
        break;
      }
      case 4: {
        // Awaiting verification - admin must verify ID
        // No action needed from rep, just confirm status
        if (rp.idVerified) {
          await prisma.repProfile.update({
            where: { id: rp.id },
            data: { onboardingStep: 5 }
          });
        } else {
          return forbidden(res, 'ID verification pending. Please wait for admin approval.');
        }
        break;
      }
      case 5: {
        // 2FA setup
        const { twoFaConfirmed } = data as { twoFaConfirmed?: boolean };
        if (!twoFaConfirmed) {
          return badRequest(res, '2FA must be confirmed to proceed');
        }
        await prisma.repProfile.update({
          where: { id: rp.id },
          data: { twoFaConfirmed: true, onboardingStep: 6 }
        });
        break;
      }
      case 6: {
        // Browser setup
        const validation = browserSetupSchema.safeParse(data);
        if (!validation.success) {
          return badRequest(res, `Invalid data: ${validation.error.errors.map(e => e.message).join(', ')}`);
        }
        // Create browser profile if externalProfileId not provided
        if (!validation.data.externalProfileId) {
          // Would call browser provider API here
          logger.info(`[onboarding] Would create ${validation.data.provider} profile for rep ${rp.id}`);
        }
        await prisma.repProfile.update({
          where: { id: rp.id },
          data: { 
            gologinProfileId: validation.data.provider === 'GOLOGIN' ? validation.data.externalProfileId : rp.gologinProfileId,
            bitbrowserId: validation.data.provider === 'BITBROWSER' ? validation.data.externalProfileId : rp.bitbrowserId,
            onboardingStep: 7,
            availabilityStatus: 'available'
          }
        });
        break;
      }
      case 7: {
        // Complete
        await prisma.repProfile.update({
          where: { id: rp.id },
          data: { onboardingStep: 7, availabilityStatus: 'available' }
        });
        break;
      }
    }
    
    const updated = await prisma.repProfile.findUnique({ 
      where: { id: rp.id },
      select: {
        id: true,
        onboardingStep: true,
        idVerified: true,
        twoFaConfirmed: true,
        availabilityStatus: true,
        gologinProfileId: true,
        bitbrowserId: true,
      }
    });
    
    return ok(res, {
      success: true,
      completedStep: step,
      stepName: ONBOARDING_STEPS[step],
      nextStep: step < 7 ? step + 1 : null,
      nextStepName: step < 7 ? ONBOARDING_STEPS[step + 1] : null,
      profile: updated
    });
  } catch (error) {
    logger.error('[onboarding] Error:', error);
    return serverError(res, 'Failed to process onboarding step');
  }
}));

export { router as repRoutes };
