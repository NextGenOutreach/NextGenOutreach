import express, { Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler';
import { FirebaseAuthRequest, requireRole } from '../middleware/firebaseAuth.middleware';
import { ok, badRequest, forbidden } from '../lib/response';
import prisma from '../lib/database';
import { PipelineStage } from '@prisma/client';

const router = express.Router();

// Middleware to ensure only internal staff can access the Sales CRM
// NOTE: 'executive' role doesn't exist in DB schema, but kept for future use
const isInternal = (req: FirebaseAuthRequest, res: Response, next: any) => {
  const role = req.user?.role;
  if (role === 'admin' || role === 'super_admin') {
    return next();
  }
  return forbidden(res, 'Internal access required');
};

router.use(requireRole('admin', 'super_admin'));
router.use(isInternal);

// HIGH FIX: Zod schemas for validation
const leadCreateSchema = z.object({
  companyName: z.string().min(1).max(255),
  contactName: z.string().min(1).max(255),
  email: z.string().email(),
  phone: z.string().max(50).optional(),
  linkedinUrl: z.string().url().optional().nullable(),
  source: z.string().max(100),
  industry: z.string().max(100),
  companySize: z.string().max(50),
  estRevenue: z.string().optional(),
  assignedToId: z.string().optional(),
  nextAction: z.string().optional(),
  nextActionDate: z.string().datetime().optional(),
  painPoints: z.array(z.string()).optional(),
  outreachHistory: z.string().optional(),
  budgetRange: z.string().optional(),
  timeline: z.string().optional(),
  isDecisionMaker: z.boolean().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const leadUpdateSchema = z.object({
  companyName: z.string().min(1).max(255).optional(),
  contactName: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  source: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  companySize: z.string().max(50).optional(),
  estRevenue: z.string().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  pipelineStage: z.nativeEnum(PipelineStage).optional(),
  nextAction: z.string().optional().nullable(),
  nextActionDate: z.string().datetime().optional().nullable(),
  painPoints: z.array(z.string()).optional(),
  outreachHistory: z.string().optional().nullable(),
  budgetRange: z.string().optional().nullable(),
  timeline: z.string().optional().nullable(),
  isDecisionMaker: z.boolean().optional(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  icpScore: z.number().int().min(0).max(100).optional(),
});

const activitySchema = z.object({
  type: z.enum(['STAGE_CHANGE', 'NOTE_ADDED', 'CALL_LOGGED', 'EMAIL_SENT', 'MEETING_BOOKED', 'PROPOSAL_SENT']),
  content: z.string().min(1).max(1000),
  metadata: z.record(z.unknown()).optional(),
});

const scoreSchema = z.object({
  industryFit: z.number().int().min(1).max(10),
  budgetFit: z.number().int().min(1).max(10),
  timelineFit: z.number().int().min(1).max(10),
  needFit: z.number().int().min(1).max(10),
  authorityFit: z.number().int().min(1).max(10),
});

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
  // HIGH FIX: Validate input with Zod
  const validation = leadCreateSchema.safeParse(req.body);
  if (!validation.success) {
    return badRequest(res, `Invalid input: ${validation.error.errors.map(e => e.message).join(', ')}`);
  }
  
  const data = validation.data;
  
  const lead = await prisma.lead.create({
    data: {
      ...data,
      assignedToId: data.assignedToId || req.user?.id,
      painPoints: data.painPoints || [],
      tags: data.tags || [],
    }
  });

  // Log activity
  await prisma.cRMActivity.create({
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
  // HIGH FIX: Validate input with Zod
  const validation = leadUpdateSchema.safeParse(req.body);
  if (!validation.success) {
    return badRequest(res, `Invalid input: ${validation.error.errors.map(e => e.message).join(', ')}`);
  }
  
  const { pipelineStage, ...data } = validation.data;
  const leadId = req.params.id;

  const currentLead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!currentLead) return badRequest(res, 'Lead not found');

  const updatedLead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      ...data,
      ...(pipelineStage && { pipelineStage }),
    }
  });

  // If stage changed, log it and potentially trigger tasks
  if (pipelineStage && pipelineStage !== currentLead.pipelineStage) {
    await prisma.cRMActivity.create({
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
  // HIGH FIX: Validate input with Zod
  const validation = activitySchema.safeParse(req.body);
  if (!validation.success) {
    return badRequest(res, `Invalid input: ${validation.error.errors.map(e => e.message).join(', ')}`);
  }
  
  const { type, content, metadata } = validation.data;
  const leadId = req.params.id;

  const activity = await prisma.cRMActivity.create({
    data: {
      leadId,
      userId: req.user!.id,
      type,
      content,
      metadata: metadata ? (metadata as any) : undefined,
    }
  });

  return ok(res, activity);
}));

// POST /api/v1/crm/leads/:id/score — calculate and save ICP score
router.post('/leads/:id/score', asyncHandler(async (req: FirebaseAuthRequest, res) => {
  // HIGH FIX: Validate input with Zod (bounds check)
  const validation = scoreSchema.safeParse(req.body);
  if (!validation.success) {
    return badRequest(res, `Invalid input: ${validation.error.errors.map(e => e.message).join(', ')}`);
  }
  
  const { 
    industryFit, // 1-10
    budgetFit,   // 1-10
    timelineFit, // 1-10
    needFit,     // 1-10
    authorityFit // 1-10
  } = validation.data;

  const score = (industryFit + budgetFit + timelineFit + needFit + authorityFit) * 2; // Scale to 100

  const lead = await prisma.lead.update({
    where: { id: req.params.id },
    data: { icpScore: score }
  });

  // Log activity
  await prisma.cRMActivity.create({
    data: {
      leadId: lead.id,
      userId: req.user!.id,
      type: 'ICP_SCORE_UPDATED',
      content: `ICP Score updated to ${score}`,
      metadata: validation.data,
    }
  });

  return ok(res, lead);
}));

export default router;
