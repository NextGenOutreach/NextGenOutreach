import { z } from 'zod';
import { CampaignType, ActivityType } from '@nextgenoutreach/types';

export const createCampaignSchema = z.object({
  name:              z.string().min(1, 'Campaign name is required').max(100),
  type:              z.nativeEnum(CampaignType),
  targetIcp:         z.object({
    industries:       z.array(z.string()).optional(),
    locations:        z.array(z.string()).optional(),
    companySizes:     z.array(z.string()).optional(),
    jobTitles:        z.array(z.string()).optional(),
  }).optional(),
  messageTemplates: z.record(z.string()).optional(),
  dailyLimit:        z.number().min(1).max(35, 'Daily limit must be between 1 and 35'),
  startDate:         z.string().datetime().optional(),
  endDate:           z.string().datetime().optional(),
  notes:             z.string().max(1000).optional(),
});

export const updateCampaignSchema = createCampaignSchema.partial();

export const logActivitySchema = z.object({
  activityType: z.nativeEnum(ActivityType),
  prospectName: z.string().optional(),
  prospectUrl:  z.string().url().optional(),
  notes:        z.string().max(500).optional(),
});

export const assignRepSchema = z.object({
  repId: z.string().min(1, 'Rep ID is required'),
});

export const updateCampaignStatusSchema = z.object({
  status: z.enum(['draft', 'pending_match', 'active', 'paused', 'completed', 'cancelled']),
  reason: z.string().optional(),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type LogActivityInput = z.infer<typeof logActivitySchema>;
export type AssignRepInput = z.infer<typeof assignRepSchema>;
export type UpdateCampaignStatusInput = z.infer<typeof updateCampaignStatusSchema>;
