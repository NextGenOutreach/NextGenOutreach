import express from 'express';
import { RepController } from '../controllers/rep.controller';
import { requireRole, FirebaseAuthRequest } from '../middleware/firebaseAuth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { ok, badRequest, serverError } from '../lib/response';
import { logger } from '../lib/logger';
import prisma from '../lib/database';
import multer from 'multer';
import { uploadIdDocument } from '../lib/s3';

const router = express.Router();
const ctrl = new RepController();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Public endpoints for marketplace browsing
router.get('/', ctrl.listReps);
router.get('/:id', ctrl.getRepById);

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
  // TODO: Implement onboarding steps
  return ok(res, { message: 'Rep onboarding endpoint - to be implemented' });
}));

export { router as repRoutes };
