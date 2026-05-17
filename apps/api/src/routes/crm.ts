import express, { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { FirebaseAuthRequest, requireRole } from '../middleware/firebaseAuth.middleware';
import { ok, badRequest, forbidden } from '../lib/response';
import prisma from '../lib/database';
import { PipelineStage } from '@prisma/client';

const router = express.Router();

// Middleware to ensure only internal staff can access the Sales CRM
const isInternal = (req: FirebaseAuthRequest, res: Response, next: any) => {
  const role = req.user?.role;
  if (role === 'admin' || role === 'super_admin' || role === 'executive') {
    return next();
  }
  return forbidden(res, 'Internal access required');
};

router.use(requireRole('admin')); // Default to admin, but refined by isInternal
router.use(isInternal);

// GET /api/v1/crm/leads — list sales leads
router.get('/leads', asyncHandler(async (req: FirebaseAuthRequest, res) => {
  const { stage, assignedTo, search } = req.query;

  const where: any = {};
  if (stage) where.pipelineStage = stage as PipelineStage;
  if (assignedTo) where.assignedToId = assignedTo as string;
  if (search) {
    where.OR = [
      { companyName: { contains: search as string, mode: 'insensitive' } },
      { contactName: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const leads = await prisma.lead.findMany({
    where,
    include: { assignedTo: { select: { email: true } } },
    orderBy: { updatedAt: 'desc' },
  });

  return ok(res, leads);
}));

// POST /api/v1/crm/leads — create a new sales lead
router.post('/leads', asyncHandler(async (req: FirebaseAuthRequest, res) => {
  const data = req.body;
  
  const lead = await prisma.lead.create({
    data: {
      ...data,
      assignedToId: data.assignedToId || req.user?.id,
    }
  });

  // Log activity
  await prisma.crmActivity.create({
    data: {
      leadId: lead.id,
      userId: req.user!.id,
      type: 'STAGE_CHANGE',
      content: 'Lead created',
    }
  });

  return ok(res, lead);
}));

// PATCH /api/v1/crm/leads/:id — update lead or stage
router.patch('/leads/:id', asyncHandler(async (req: FirebaseAuthRequest, res) => {
  const { pipelineStage, ...data } = req.body;
  const leadId = req.params.id;

  const currentLead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!currentLead) return badRequest(res, 'Lead not found');

  const updatedLead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      ...data,
      ...(pipelineStage && { pipelineStage: pipelineStage as PipelineStage }),
    }
  });

  // If stage changed, log it and potentially trigger tasks
  if (pipelineStage && pipelineStage !== currentLead.pipelineStage) {
    await prisma.crmActivity.create({
      data: {
        leadId,
        userId: req.user!.id,
        type: 'STAGE_CHANGE',
        content: `Stage changed from ${currentLead.pipelineStage} to ${pipelineStage}`,
      }
    });

    // Auto-trigger tasks based on Section 2.2 logic
    if (pipelineStage === 'QUALIFIED') {
      // Create discovery call task if not already done
    }
  }

  return ok(res, updatedLead);
}));

// POST /api/v1/crm/leads/:id/activity — log a note/call/email
router.post('/leads/:id/activity', asyncHandler(async (req: FirebaseAuthRequest, res) => {
  const { type, content, metadata } = req.body;
  const leadId = req.params.id;

  const activity = await prisma.crmActivity.create({
    data: {
      leadId,
      userId: req.user!.id,
      type,
      content,
      metadata,
    }
  });

  return ok(res, activity);
}));

// POST /api/v1/crm/leads/:id/score — calculate and save ICP score
router.post('/leads/:id/score', asyncHandler(async (req: FirebaseAuthRequest, res) => {
  const { 
    industryFit, // 1-10
    budgetFit,   // 1-10
    timelineFit, // 1-10
    needFit,     // 1-10
    authorityFit // 1-10
  } = req.body;

  const score = (industryFit + budgetFit + timelineFit + needFit + authorityFit) * 2; // Scale to 100

  const lead = await prisma.lead.update({
    where: { id: req.params.id },
    data: { icpScore: score }
  });

  // Log activity
  await prisma.crmActivity.create({
    data: {
      leadId: lead.id,
      userId: req.user!.id,
      type: 'ICP_SCORE_UPDATED',
      content: `ICP Score updated to ${score}`,
      metadata: req.body,
    }
  });

  return ok(res, lead);
}));

export default router;
