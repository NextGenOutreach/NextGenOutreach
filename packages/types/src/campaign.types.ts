export interface Campaign {
  id: string;
  clientId: string;
  repId?: string;
  name: string;
  status: CampaignStatus;
  type: CampaignType;
  targetIcp?: any;
  messageTemplates?: any;
  dailyLimit: number;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignActivity {
  id: string;
  campaignId: string;
  activityType: ActivityType;
  prospectName?: string;
  prospectUrl?: string;
  notes?: string;
  occurredAt: Date;
}

export interface BrowserSession {
  id: string;
  repId: string;
  campaignId?: string;
  provider: BrowserProvider;
  externalProfileId?: string;
  status: SessionStatus;
  lastActiveAt?: Date;
  sessionMeta?: any;
  createdAt: Date;
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

export enum ActivityType {
  CONNECTION_SENT = 'connection_sent',
  CONNECTION_ACCEPTED = 'connection_accepted',
  DM_SENT = 'dm_sent',
  DM_REPLIED = 'dm_replied',
  POST_PUBLISHED = 'post_published',
  MEETING_BOOKED = 'meeting_booked',
  ERROR = 'error'
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
