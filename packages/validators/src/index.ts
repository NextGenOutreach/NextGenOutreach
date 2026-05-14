import { z } from 'zod';

// Base schemas
export const uuidSchema = z.string().uuid();
export const emailSchema = z.string().email();
export const passwordSchema = z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character');
export const urlSchema = z.string().url();
export const decimalSchema = z.string().regex(/^\d+\.\d{2}$/, 'Must be a valid decimal with 2 places');

// User schemas
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['client', 'rep']),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1)
});

export const twoFaSetupSchema = z.object({
  token: z.string().length(6, 'TOTP token must be 6 digits')
});

// Rep Profile schemas
export const repProfileSchema = z.object({
  linkedinUrl: urlSchema,
  linkedinFollowers: z.number().min(0),
  industry: z.string().optional(),
  locationCountry: z.string().optional(),
  locationCity: z.string().optional(),
  bio: z.string().max(500).optional(),
  maxClients: z.number().min(1).max(5),
  hourlyRateUsd: decimalSchema.optional()
});

export const repVerificationSchema = z.object({
  idDocument: z.string().min(1, 'ID document is required'),
  selfieWithId: z.string().optional()
});

// Client Profile schemas
export const clientProfileSchema = z.object({
  companyName: z.string().max(255).optional(),
  website: urlSchema.optional(),
  industry: z.string().optional(),
  targetMarket: z.string().optional(),
  billingEmail: emailSchema.optional()
});

// Campaign schemas
export const campaignSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['connections', 'dms', 'posts', 'mixed']),
  targetIcp: z.object({
    industries: z.array(z.string()),
    seniorities: z.array(z.string()),
    companySizes: z.array(z.string()),
    locations: z.array(z.string())
  }).optional(),
  messageTemplates: z.object({
    connectionNote: z.string().max(300),
    dmSequence: z.array(z.string().max(500))
  }).optional(),
  dailyLimit: z.number().min(1).max(100),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  notes: z.string().max(1000).optional()
});

export const campaignUpdateSchema = campaignSchema.partial();

// Activity schemas
export const activityLogSchema = z.object({
  activityType: z.enum([
    'connection_sent',
    'connection_accepted',
    'dm_sent',
    'dm_replied',
    'post_published',
    'meeting_booked',
    'error'
  ]),
  prospectName: z.string().max(255).optional(),
  prospectUrl: urlSchema.optional(),
  notes: z.string().max(500).optional()
});

// Browser Session schemas
export const browserSessionSchema = z.object({
  provider: z.enum(['gologin', 'bitbrowser']),
  campaignId: uuidSchema.optional()
});

// Subscription schemas
export const subscriptionSchema = z.object({
  plan: z.enum(['starter', 'pro', 'managed']),
  payfastToken: z.string().optional()
});

// Analytics schemas
export const analyticsQuerySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
  granularity: z.enum(['hour', 'day', 'week', 'month']).default('day')
});

// Admin schemas
export const userStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'active', 'suspended', 'banned']),
  reason: z.string().optional()
});

export const repVerificationAdminSchema = z.object({
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional()
});

// Marketplace schemas
export const repSearchSchema = z.object({
  industry: z.array(z.string()).optional(),
  location: z.array(z.string()).optional(),
  followerRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0)
  }).optional(),
  rating: z.number().min(0).max(5).optional(),
  availability: z.enum(['available', 'all']).default('available'),
  sortBy: z.enum(['rating', 'followers', 'match_score']).default('rating'),
  page: z.number().min(1).default(1),
  perPage: z.number().min(1).max(50).default(20)
});

// Notification schemas
export const notificationSchema = z.object({
  type: z.string(),
  title: z.string().max(255),
  body: z.string().max(1000),
  actionUrl: urlSchema.optional()
});

// API Response schemas
export const paginationSchema = z.object({
  page: z.number().min(1),
  perPage: z.number().min(1).max(100),
  total: z.number().min(0)
});

export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) => z.object({
  success: z.boolean(),
  data: dataSchema.optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    statusCode: z.number()
  }).optional(),
  meta: z.object({
    page: z.number().optional(),
    perPage: z.number().optional(),
    total: z.number().optional(),
    requestId: z.string()
  }).optional()
});

// PayFast schemas
export const payfastWebhookSchema = z.object({
  m_payment_id: z.string(),
  pf_payment_id: z.string(),
  payment_status: z.string(),
  item_name: z.string(),
  item_description: z.string(),
  amount_gross: z.string(),
  amount_fee: z.string(),
  amount_net: z.string(),
  custom_str1: z.string().optional(),
  custom_str2: z.string().optional(),
  custom_str3: z.string().optional(),
  custom_str4: z.string().optional(),
  custom_str5: z.string().optional(),
  signature: z.string()
});

// GoLogin schemas
export const gologinProfileSchema = z.object({
  name: z.string(),
  os: z.enum(['win', 'mac', 'linux']),
  browserType: z.enum(['chrome', 'firefox', 'opera']),
  googleServicesEnabled: z.boolean().default(false),
  navigator: z.object({
    language: z.string(),
    platform: z.string(),
    userAgent: z.string()
  })
});

// BitBrowser schemas
export const bitbrowserEnvironmentSchema = z.object({
  name: z.string(),
  remark: z.string(),
  proxyMethod: z.number(),
  browserFingerPrint: z.object({
    coreVersion: z.string(),
    ostype: z.string(),
    os: z.string()
  })
});

// Export all schemas for easy importing
export const schemas = {
  register: registerSchema,
  login: loginSchema,
  twoFaSetup: twoFaSetupSchema,
  repProfile: repProfileSchema,
  repVerification: repVerificationSchema,
  clientProfile: clientProfileSchema,
  campaign: campaignSchema,
  campaignUpdate: campaignUpdateSchema,
  activityLog: activityLogSchema,
  browserSession: browserSessionSchema,
  subscription: subscriptionSchema,
  analyticsQuery: analyticsQuerySchema,
  userStatusUpdate: userStatusUpdateSchema,
  repVerificationAdmin: repVerificationAdminSchema,
  repSearch: repSearchSchema,
  notification: notificationSchema,
  payfastWebhook: payfastWebhookSchema,
  gologinProfile: gologinProfileSchema,
  bitbrowserEnvironment: bitbrowserEnvironmentSchema
};

// Export types from auth validators
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
