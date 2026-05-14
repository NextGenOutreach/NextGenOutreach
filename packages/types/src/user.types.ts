export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  twoFaSecret?: string;
  twoFaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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

export enum Plan {
  STARTER = 'starter',
  PRO = 'pro',
  MANAGED = 'managed'
}

export interface JWTPayload {
  sub: string;   // user ID
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
