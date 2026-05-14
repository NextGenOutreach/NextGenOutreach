// User and Authentication Types
export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  twoFaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  CLIENT = 'client',
  REP = 'rep',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned'
}

// Rep Profile Types
export interface RepProfile {
  id: string;
  userId: string;
  linkedinUrl: string;
  linkedinFollowers: number;
  industry?: string;
  locationCountry?: string;
  locationCity?: string;
  bio?: string;
  idVerified: boolean;
  idVerifiedAt?: Date;
  idDocumentUrl?: string;
  twoFaConfirmed: boolean;
  gologinProfileId?: string;
  bitbrowserId?: string;
  availabilityStatus: string;
  maxClients: number;
  hourlyRateUsd?: number;
  rating: number;
  totalReviews: number;
  createdAt: Date;
}

// Client Profile Types
export interface ClientProfile {
  id: string;
  userId: string;
  companyName?: string;
  website?: string;
  industry?: string;
  targetMarket?: string;
  billingEmail?: string;
  plan: Plan;
  planStatus: string;
  payfastToken?: string;
  createdAt: Date;
}

export enum Plan {
  STARTER = 'starter',
  PRO = 'pro',
  MANAGED = 'managed'
}

// Campaign Types
export interface Campaign {
  id: string;
  clientId: string;
  repId?: string;
  name: string;
  status: CampaignStatus;
  type: CampaignType;
  targetIcp?: Record<string, any>;
  messageTemplates?: Record<string, any>;
  dailyLimit: number;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum CampaignStatus {
  DRAFT = 'draft',
  PENDING_MATCH = 'pending_match',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum CampaignType {
  CONNECTIONS = 'connections',
  DMS = 'dms',
  POSTS = 'posts',
  MIXED = 'mixed'
}

// Activity Types
export interface CampaignActivity {
  id: string;
  campaignId: string;
  activityType: ActivityType;
  prospectName?: string;
  prospectUrl?: string;
  notes?: string;
  occurredAt: Date;
}

export enum ActivityType {
  CONNECTION_SENT = 'connection_sent',
  CONNECTION_ACCEPTED = 'connection_accepted',
  DM_SENT = 'dm_sent',
  DM_REPLIED = 'dm_replied',
  POST_PUBLISHED = 'post_published',
  MEETING_BOOKED = 'meeting_booked',
  ERROR = 'error'
}

// Browser Session Types
export interface BrowserSession {
  id: string;
  repId: string;
  campaignId?: string;
  provider: BrowserProvider;
  externalProfileId?: string;
  status: SessionStatus;
  lastActiveAt?: Date;
  sessionMeta?: Record<string, any>;
  createdAt: Date;
}

export enum BrowserProvider {
  GOLOGIN = 'gologin',
  BITBROWSER = 'bitbrowser'
}

export enum SessionStatus {
  IDLE = 'idle',
  LAUNCHING = 'launching',
  ACTIVE = 'active',
  CLOSED = 'closed',
  ERROR = 'error'
}

// Billing and Subscription Types
export interface Subscription {
  id: string;
  clientId: string;
  plan: Plan;
  amountUsd: number;
  status: string;
  payfastPaymentId?: string;
  billingCycleStart?: Date;
  billingCycleEnd?: Date;
  nextBillingDate?: Date;
  createdAt: Date;
}

export interface RepEarning {
  id: string;
  repId: string;
  campaignId: string;
  clientId: string;
  amountUsd: number;
  periodStart: Date;
  periodEnd: Date;
  status: string;
  paidAt?: Date;
  createdAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  actorId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

// API Request/Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    statusCode: number;
  };
  meta?: {
    page?: number;
    perPage?: number;
    total?: number;
    requestId: string;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Matching Algorithm Types
export interface ClientPreferences {
  targetIndustry?: string;
  targetCountry?: string;
  followerRange?: {
    min: number;
    max: number;
  };
  rating?: number;
}

export interface RepMatchScore {
  repId: string;
  score: number;
  breakdown: {
    industry: number;
    location: number;
    followers: number;
    availability: number;
    rating: number;
  };
}

// Task Queue Types
export interface CampaignTask {
  id: string;
  campaignId: string;
  repId: string;
  type: 'connection' | 'dm' | 'post';
  prospectUrl: string;
  prospectName: string;
  templateId: string;
  scheduledFor: Date;
  status: 'queued' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  retryCount: number;
}

// GoLogin/BitBrowser Types
export interface GoLoginProfile {
  id: string;
  name: string;
  os: string;
  browserType: string;
  proxy?: {
    type: string;
    host: string;
    port: number;
    username?: string;
    password?: string;
  };
  navigator: {
    language: string;
    platform: string;
    userAgent: string;
  };
}

export interface BitBrowserEnvironment {
  id: string;
  name: string;
  remark: string;
  proxyMethod: number;
  browserFingerPrint: {
    coreVersion: string;
    ostype: string;
    os: string;
  };
}

// Analytics Types
export interface CampaignAnalytics {
  campaignId: string;
  period: {
    from: Date;
    to: Date;
  };
  metrics: {
    connectionsSent: number;
    connectionsAccepted: number;
    dmsSent: number;
    dmsReplied: number;
    meetingsBooked: number;
    postsPublished: number;
  };
  funnel: {
    sent: number;
    accepted: number;
    replied: number;
    meetings: number;
  };
}

export interface PlatformAnalytics {
  totalReps: number;
  totalClients: number;
  activeCampaigns: number;
  monthlyRevenue: number;
  avgMatchTime: number;
  uptime: number;
}

// JWT Payload Interface
export interface JWTPayload {
  sub: string;   // user ID
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
