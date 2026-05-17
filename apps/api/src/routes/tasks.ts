import express from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { FirebaseAuthRequest } from '../middleware/firebaseAuth.middleware';
import { ok, badRequest } from '../lib/response';
import prisma from '../lib/database';
import { Priority, TaskStatus } from '@prisma/client';

const router = express.Router();

// GET /api/v1/tasks — list tasks for current user
router.get('/', asyncHandler(async (req: FirebaseAuthRequest, res) => {
  const { status, priority, category } = req.query;
  const user = req.user!;

  const where: any = { assignedToId: user.id };
  if (status) where.status = status as TaskStatus;
  if (priority) where.priority = priority as Priority;
  if (category) where.category = category as string;

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [
      { priority: 'asc' }, // Note: Priority enum order matters here
      { dueDate: 'asc' }
    ],
  });

  return ok(res, tasks);
}));

// PATCH /api/v1/tasks/:id — update status (Done, In Progress, etc.)
router.patch('/:id', asyncHandler(async (req: FirebaseAuthRequest, res) => {
  const { status, blockedReason } = req.body;
  const user = req.user!;

  const task = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!task) return badRequest(res, 'Task not found');
  if (task.assignedToId !== user.id && user.role !== 'admin') {
    return badRequest(res, 'Not authorized to update this task');
  }

  const updated = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      ...(status && { status: status as TaskStatus }),
      ...(blockedReason !== undefined && { blockedReason }),
      ...(status === 'DONE' && { completedAt: new Date() }),
    }
  });

  // Log audit trail
  await prisma.taskAuditLog.create({
    data: {
      taskId: updated.id,
      userId: user.id,
      action: `Status changed to ${status}`,
      before: { status: task.status },
      after: { status: updated.status },
    }
  });

  return ok(res, updated);
}));

// POST /api/v1/tasks/:id/comments — add a comment to a task
router.post('/:id/comments', asyncHandler(async (req: FirebaseAuthRequest, res) => {
  const { content } = req.body;
  const user = req.user!;

  const comment = await prisma.taskComment.create({
    data: {
      taskId: req.params.id,
      userId: user.id,
      content,
    }
  });

  return ok(res, comment);
}));

export default router;
