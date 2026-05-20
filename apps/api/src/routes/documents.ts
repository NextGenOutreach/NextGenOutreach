import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import prisma from '../lib/database';
import { asyncHandler } from '../middleware/asyncHandler';
import { ok, created, badRequest, notFound, forbidden } from '../lib/response';
import { FirebaseAuthRequest } from '../middleware/firebaseAuth.middleware';
import { createGoogleDoc, uploadFileToDrive, deleteFromDrive, isDriveConfigured } from '../lib/googleDrive';
import { logger } from '../lib/logger';

function isAdmin(user?: FirebaseAuthRequest['user']) {
  return user?.role === 'admin' || user?.role === 'super_admin';
}

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

const createDocSchema = z.object({
  title: z.string().min(1).max(255),
  type: z.enum(['MEETING_NOTES', 'CONTRACT', 'PROPOSAL', 'ID_DOCUMENT', 'REPORT', 'OTHER']).default('OTHER'),
  entityType: z.enum(['lead', 'client', 'campaign', 'rep']).optional(),
  entityId: z.string().optional(),
  driveUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

const createLeadSchema = z.object({
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  source: z.string().default('Manual'),
  industry: z.string().default('Unknown'),
  companySize: z.string().default('Unknown'),
  pipelineStage: z.enum(['NEW_LEAD','QUALIFYING','QUALIFIED','PROPOSAL_SENT','NEGOTIATION','WON_ONBOARDING','ACTIVE_CLIENT','CHURNED','DISQUALIFIED']).default('NEW_LEAD'),
  notes: z.string().optional(),
  autoCreateDoc: z.boolean().default(true),
});

// GET /documents — list all documents (admin) or own uploads
router.get('/', asyncHandler(async (req, res) => {
  const { entityType, entityId, type, page = '1', limit = '20' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where: any = {};
  if (!isAdmin(req.user)) where.uploadedById = req.user!.id;
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;
  if (type) where.type = type;

  const [docs, total] = await Promise.all([
    prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
      include: { uploadedBy: { select: { id: true, email: true, role: true } } },
    }),
    prisma.document.count({ where }),
  ]);

  return ok(res, { documents: docs, total, page: parseInt(page), limit: parseInt(limit) });
}));

// GET /documents/drive-status — check if Google Drive is configured
router.get('/drive-status', asyncHandler(async (_req, res) => {
  return ok(res, { configured: isDriveConfigured() });
}));

// GET /documents/leads — list all leads with doc info (B2B CRM view)
router.get('/leads', asyncHandler(async (req, res) => {
  const { stage, page = '1', limit = '50', search } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where: any = {};
  if (stage) where.pipelineStage = stage;
  if (search) {
    where.OR = [
      { contactName: { contains: search, mode: 'insensitive' } },
      { companyName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
      include: { documents: { orderBy: { createdAt: 'desc' }, take: 5 } },
    }),
    prisma.lead.count({ where }),
  ]);

  return ok(res, { leads, total });
}));

// POST /documents/leads — create a B2B lead + auto Google Doc
router.post('/leads', asyncHandler(async (req, res) => {
  const parsed = createLeadSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, parsed.error.issues[0].message);
  const { autoCreateDoc, ...data } = parsed.data;

  const lead = await prisma.lead.create({
    data: {
      ...data,
      assignedToId: req.user!.id,
    },
  });

  let driveDocUrl: string | null = null;
  let driveDocId: string | null = null;

  if (autoCreateDoc && isDriveConfigured()) {
    const doc = await createGoogleDoc(
      `${data.contactName} — ${data.companyName} | Meeting Notes & Specs`,
      ['Meeting Notes', 'Requirements & Specifications', 'Action Items', 'Follow-up']
    );
    if (doc) {
      driveDocUrl = doc.webViewLink;
      driveDocId = doc.fileId;
      await prisma.lead.update({
        where: { id: lead.id },
        data: { driveDocUrl, driveDocId },
      });
      await prisma.document.create({
        data: {
          title: `${data.contactName} — Meeting Notes & Specs`,
          type: 'MEETING_NOTES',
          entityType: 'lead',
          entityId: lead.id,
          driveFileId: driveDocId,
          driveUrl: driveDocUrl,
          mimeType: 'application/vnd.google-apps.document',
          uploadedById: req.user!.id,
        },
      });
    }
  }

  return created(res, { ...lead, driveDocUrl, driveDocId });
}));

// POST /documents/leads/bulk — CSV bulk import
router.post('/leads/bulk', asyncHandler(async (req, res) => {
  const { rows } = req.body as { rows: Array<{ name: string; company: string; email: string; phone?: string; status?: string }> };
  if (!Array.isArray(rows) || rows.length === 0) return badRequest(res, 'rows array is required');
  if (rows.length > 200) return badRequest(res, 'Max 200 rows per import');

  const results: Array<{ success: boolean; email: string; leadId?: string; docUrl?: string; error?: string }> = [];

  for (const row of rows) {
    try {
      const lead = await prisma.lead.create({
        data: {
          contactName: row.name,
          companyName: row.company,
          email: row.email,
          phone: row.phone || null,
          source: 'CSV Import',
          industry: 'Unknown',
          companySize: 'Unknown',
          assignedToId: req.user!.id,
        },
      });

      let docUrl: string | undefined;
      if (isDriveConfigured()) {
        const doc = await createGoogleDoc(
          `${row.name} — ${row.company} | Meeting Notes & Specs`,
          ['Meeting Notes', 'Requirements & Specifications', 'Action Items', 'Follow-up']
        );
        if (doc) {
          await prisma.lead.update({ where: { id: lead.id }, data: { driveDocUrl: doc.webViewLink, driveDocId: doc.fileId } });
          docUrl = doc.webViewLink;
        }
      }

      results.push({ success: true, email: row.email, leadId: lead.id, docUrl });
    } catch (err: any) {
      results.push({ success: false, email: row.email, error: err.message });
    }
  }

  const imported = results.filter((r) => r.success).length;
  return ok(res, { imported, total: rows.length, results });
}));

// POST /documents — link or create a document record
router.post('/', upload.single('file'), asyncHandler(async (req, res) => {
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const parsed = createDocSchema.safeParse(body);
  if (!parsed.success) return badRequest(res, parsed.error.issues[0].message);

  let driveUrl = parsed.data.driveUrl;
  let driveFileId: string | undefined;

  if (req.file && isDriveConfigured()) {
    const result = await uploadFileToDrive(req.file.originalname, req.file.mimetype, req.file.buffer);
    if (result) {
      driveUrl = result.webViewLink;
      driveFileId = result.fileId;
    }
  }

  const doc = await prisma.document.create({
    data: {
      title: parsed.data.title,
      type: parsed.data.type as any,
      entityType: parsed.data.entityType,
      entityId: parsed.data.entityId,
      driveUrl,
      driveFileId,
      mimeType: req.file?.mimetype,
      sizeBytes: req.file?.size,
      notes: parsed.data.notes,
      uploadedById: req.user!.id,
    },
    include: { uploadedBy: { select: { id: true, email: true, role: true } } },
  });

  return created(res, doc);
}));

// DELETE /documents/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!doc) return notFound(res, 'Document not found');
  if (doc.uploadedById !== req.user!.id && !isAdmin(req.user)) return forbidden(res, 'Not your document');

  if (doc.driveFileId) await deleteFromDrive(doc.driveFileId);
  await prisma.document.delete({ where: { id: req.params.id } });

  return ok(res, { deleted: true });
}));

// DELETE /documents/leads/:id
router.delete('/leads/:id', asyncHandler(async (req, res) => {
  if (!isAdmin(req.user)) return forbidden(res, 'Admin only');
  const lead = await prisma.lead.findUnique({ where: { id: req.params.id } }) as any;
  if (!lead) return notFound(res, 'Lead not found');
  if (lead.driveDocId) await deleteFromDrive(lead.driveDocId);
  await prisma.lead.delete({ where: { id: req.params.id } });
  return ok(res, { deleted: true });
}));

export default router;
