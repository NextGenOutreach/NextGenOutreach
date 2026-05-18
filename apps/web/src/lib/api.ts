import { getAuth } from 'firebase/auth';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function getToken(): Promise<string | null> {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T; meta?: Record<string, unknown> }> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}/api/v1${path}`, { ...options, headers });
  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json?.error?.message ?? `API error ${res.status}`);
  }

  return { data: json.data, meta: json.meta };
}

// ─── Campaigns ────────────────────────────────────────────────────────────────

export interface APICampaign {
  id: string;
  name: string;
  status: string;
  type: string;
  dailyLimit: number;
  startDate: string | null;
  endDate: string | null;
  notes: string | null;
  createdAt: string;
  rep: { id: string; industry: string | null; rating: string; linkedinFollowers: number } | null;
  _count: { activities: number };
}

export async function fetchCampaigns(params?: { status?: string; page?: number }): Promise<{ campaigns: APICampaign[]; total: number }> {
  const qs = new URLSearchParams();
  if (params?.status && params.status !== 'all') qs.set('status', params.status);
  if (params?.page) qs.set('page', String(params.page));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  const { data, meta } = await request<APICampaign[]>(`/campaigns${query}`);
  return { campaigns: data, total: (meta as any)?.total ?? data.length };
}

export async function createCampaign(body: {
  name: string;
  type: string;
  dailyLimit: number;
  targetIcp?: Record<string, unknown>;
  notes?: string;
}): Promise<APICampaign> {
  const { data } = await request<APICampaign>('/campaigns', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return data;
}

export async function updateCampaignStatus(id: string, status: string): Promise<APICampaign> {
  const { data } = await request<APICampaign>(`/campaigns/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return data;
}

// ─── Reps / Marketplace ────────────────────────────────────────────────────────

export interface APIRep {
  id: string;
  linkedinUrl: string;
  linkedinFollowers: number;
  industry?: string;
  locationCountry?: string;
  locationCity?: string;
  bio?: string;
  rating: number;
  totalReviews: number;
  availabilityStatus: string;
  maxClients: number;
  hourlyRateUsd?: number;
}

export async function fetchReps(params?: {
  industry?: string;
  country?: string;
  sort?: 'rating' | 'followers' | 'rate';
  page?: number;
  clientPreferences?: any;
}): Promise<{ reps: APIRep[]; total: number }> {
  const qs = new URLSearchParams();
  if (params?.industry && params.industry !== 'all') qs.set('industry', params.industry);
  if (params?.country && params.country !== 'all') qs.set('country', params.country);
  if (params?.sort) qs.set('sort', params.sort);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.clientPreferences) qs.set('clientPreferences', JSON.stringify(params.clientPreferences));

  const query = qs.toString() ? `?${qs.toString()}` : '';
  const { data, meta } = await request<APIRep[]>(`/reps${query}`);
  return { reps: data, total: (meta as any)?.total ?? data.length };
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface APIUser {
  id: string;
  email: string;
  role: string;
  status: string;
  twoFaEnabled: boolean;
  createdAt: string;
  clientProfile?: {
    id: string;
    companyName?: string;
    plan: string;
    planStatus: string;
  } | null;
  repProfile?: {
    id: string;
    linkedinFollowers: number;
    industry?: string;
    idVerified: boolean;
    rating: number;
    availabilityStatus: string;
  } | null;
}

export interface AdminStats {
  totalUsers: number;
  totalReps: number;
  totalClients: number;
  activeCampaigns: number;
}

export async function fetchAdminUsers(params?: {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
}): Promise<{ users: APIUser[]; total: number }> {
  const qs = new URLSearchParams();
  if (params?.role && params.role !== 'all') qs.set('role', params.role);
  if (params?.status && params.status !== 'all') qs.set('status', params.status);
  if (params?.search) qs.set('search', params.search);
  if (params?.page) qs.set('page', String(params.page));

  const query = qs.toString() ? `?${qs.toString()}` : '';
  const { data, meta } = await request<APIUser[]>(`/admin/users${query}`);
  return { users: data, total: (meta as any)?.total ?? data.length };
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const { data } = await request<AdminStats>('/admin/stats');
  return data;
}

export async function updateUserStatus(id: string, status: string): Promise<APIUser> {
  const { data } = await request<APIUser>(`/admin/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return data;
}

export async function updateUserRole(id: string, role: string): Promise<APIUser> {
  const { data } = await request<APIUser>(`/admin/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
  return data;
}

export async function verifyRepId(userId: string, verified: boolean): Promise<any> {
  const { data } = await request<any>(`/admin/users/${userId}/verify-id`, {
    method: 'PATCH',
    body: JSON.stringify({ verified }),
  });
  return data;
}

export async function payEarning(id: string): Promise<any> {
  const { data } = await request<any>(`/admin/earnings/${id}/pay`, {
    method: 'PATCH'
  });
  return data;
}

export async function importMarketplaceReps(repIds: string[]): Promise<{ message: string; importedCount: number }> {
  const { data } = await request<{ message: string; importedCount: number }>('/admin/reps/import', {
    method: 'POST',
    body: JSON.stringify({ repIds }),
  });
  return data;
}

// ─── Admin Extended ───────────────────────────────────────────────────────────

export interface AdminActivity {
  type: string;
  label: string;
  time: string;
}

export interface AdminLead {
  id: string;
  activityType: string;
  prospectName: string | null;
  prospectUrl: string | null;
  notes: string | null;
  occurredAt: string;
  campaign: {
    id: string;
    name: string;
    rep: { id: string; industry: string | null; user: { email: string } } | null;
  };
}

export interface AdminRep {
  id: string;
  linkedinUrl: string;
  industry: string | null;
  availabilityStatus: string;
  idVerified: boolean;
  rating: string;
  linkedinFollowers: number;
  user: { email: string; status: string; createdAt: string };
  _count: { campaigns: number; earnings: number };
  stats: { connectionsSent: number; acceptanceRate: number; meetingsBooked: number };
}

export interface AdminEarning {
  id: string;
  amountUsd: number;
  periodStart: string;
  periodEnd: string;
  status: string;
  createdAt: string;
  rep: { id: string; user: { email: string } };
  client: { id: string; companyName: string | null };
  campaign: { id: string; name: string };
}

export async function fetchAdminActivity(): Promise<AdminActivity[]> {
  const { data } = await request<AdminActivity[]>('/admin/activity');
  return data;
}

export async function fetchAdminLeads(params?: { page?: number; type?: string }): Promise<{ leads: AdminLead[]; total: number }> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.type) qs.set('type', params.type);
  const query = qs.toString() ? `?${qs.toString()}` : '';
  const { data, meta } = await request<AdminLead[]>(`/admin/leads${query}`);
  return { leads: data, total: (meta as any)?.total ?? data.length };
}

export async function fetchAdminReps(): Promise<AdminRep[]> {
  const { data } = await request<AdminRep[]>('/admin/reps');
  return data;
}

export async function fetchAdminEarnings(params?: { page?: number; status?: string }): Promise<{ earnings: AdminEarning[]; total: number }> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.status) qs.set('status', params.status);
  const query = qs.toString() ? `?${qs.toString()}` : '';
  const { data, meta } = await request<AdminEarning[]>(`/admin/earnings${query}`);
  return { earnings: data, total: (meta as any)?.total ?? data.length };
}

export interface AdminAnalytics {
  revenueByMonth: Record<string, number>;
  userGrowthByMonth: Record<string, { total: number, client: number, rep: number }>;
  activityByDay: Record<string, Record<string, number>>;
}

export async function fetchAdminAnalytics(): Promise<AdminAnalytics> {
  const { data } = await request<AdminAnalytics>('/analytics/admin');
  return data;
}

// ─── Rep Dashboard ────────────────────────────────────────────────────────────

export interface APITask {
  id: string;
  campaignId: string;
  campaignName: string;
  clientName: string;
  type: string;
  status: string;
  dailyLimit: number;
  completedCount: number;
  prospectCount: number;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
  technicalStatus: string;
}

export interface AdminAlert {
  campaignId: string;
  campaignName: string;
  lastActivity: string | null;
  issue: string;
}

export async function fetchAdminRedAlerts(): Promise<AdminAlert[]> {
  const { data } = await request<AdminAlert[]>('/admin/alerts');
  return data;
}

export interface APIEarning {
  id: string;
  campaignId: string;
  campaignName: string;
  clientName: string;
  amount: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  paidAt?: string | null;
  notes?: string | null;
}

export interface APIMonthlyEarning {
  month: string;
  earnings: number;
  campaigns: number;
}

export async function fetchRepTasks(): Promise<APITask[]> {
  const { data } = await request<APITask[]>('/rep/tasks');
  return data;
}

export async function fetchRepEarnings(status?: string): Promise<{ earnings: APIEarning[]; monthly: APIMonthlyEarning[] }> {
  const qs = status && status !== 'all' ? `?status=${status}` : '';
  const { data } = await request<{ earnings: APIEarning[]; monthly: APIMonthlyEarning[] }>(`/rep/earnings${qs}`);
  return data;
}

// ─── Profiles ─────────────────────────────────────────────────────────────────

export interface APIRepProfile extends APIRep {
  userId: string;
  idVerified: boolean;
  onboardingStep: number;
  user: {
    email: string;
    status: string;
  };
}

export async function fetchRepProfile(): Promise<APIRepProfile> {
  const { data } = await request<APIRepProfile>('/reps/profile');
  return data;
}

export async function updateRepProfile(body: Partial<APIRep>): Promise<APIRepProfile> {
  const { data } = await request<APIRepProfile>('/reps/profile', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return data;
}

export async function uploadIdDocument(file: File): Promise<any> {
  const token = await getToken();
  const formData = new FormData();
  formData.append('idDocument', file);

  const res = await fetch(`${BASE}/api/v1/reps/upload-id`, {
    method: 'POST',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json?.error?.message ?? `Upload error ${res.status}`);
  }
  return json.data;
}

export interface APIClientProfile {
  id: string;
  userId: string;
  companyName: string | null;
  website: string | null;
  industry: string | null;
  targetMarket: string | null;
  plan: string;
  planStatus: string;
  user: {
    email: string;
  };
}

export async function fetchClientProfile(): Promise<APIClientProfile> {
  const { data } = await request<APIClientProfile>('/clients/profile');
  return data;
}

export async function updateClientProfile(body: Partial<APIClientProfile>): Promise<APIClientProfile> {
  const { data } = await request<APIClientProfile>('/clients/profile', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return data;
}

export async function createSubscription(plan: string): Promise<{ url: string; payload: Record<string, string> }> {
  const { data } = await request<{ url: string; payload: Record<string, string> }>('/billing/subscribe', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  });
  return data;
}

export async function syncCRM(): Promise<{ message: string; syncedCount: number }> {
  const { data } = await request<{ message: string; syncedCount: number }>('/clients/sync-crm', {
    method: 'POST',
  });
  return data;
}
