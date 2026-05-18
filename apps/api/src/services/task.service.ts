import prisma from '../lib/database';
import { Priority, TaskStatus } from '@prisma/client';
import { logger } from '../lib/logger';

export async function createAutoTask(
  title: string,
  description: string,
  category: string,
  priority: Priority,
  assignedToRole: string,
  relatedTo?: { type: string; id: string },
  dueHours: number = 48
) {
  // Find a user with the required role
  const assignee = await prisma.user.findFirst({
    where: { role: assignedToRole as any },
  });

  if (!assignee) {
    logger.warn(`[TaskService] Could not find assignee with role ${assignedToRole} for task: ${title}`);
    return;
  }

  return await prisma.task.create({
    data: {
      title,
      description,
      category,
      priority,
      status: 'TODO',
      assignedToId: assignee.id,
      createdById: assignee.id, // Fallback to assignee as creator for auto-tasks
      relatedToType: relatedTo?.type,
      relatedToId: relatedTo?.id,
      dueDate: new Date(Date.now() + dueHours * 60 * 60 * 1000),
    },
  });
}

/**
 * Triggers based on Section 3.3
 */
export const TaskTriggers = {
  async onClientApplication(clientId: string) {
    return createAutoTask(
      'Review client application for ICP fit',
      'A new client has applied. Review their industry, website, and target audience.',
      'Compliance',
      'HIGH',
      'ADMIN',
      { type: 'client', id: clientId },
      48
    );
  },

  async onCampaignMessagingApproved(campaignId: string) {
    return createAutoTask(
      'Match and assign rep(s) to campaign',
      'Messaging has been approved. Assign the best-fitting reps to this campaign.',
      'Operations',
      'HIGH',
      'ADMIN',
      { type: 'campaign', id: campaignId },
      24
    );
  },

  async onRepViolation(repId: string, type: string) {
    return createAutoTask(
      `Investigate Rep Violation: ${type}`,
      'A compliance alert or manual violation was reported. Investigate and take action.',
      'Compliance',
      'URGENT',
      'ADMIN',
      { type: 'rep', id: repId },
      4
    );
  }
};
