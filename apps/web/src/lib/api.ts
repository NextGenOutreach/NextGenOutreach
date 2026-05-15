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
  notes?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  rep?: { id: string; linkedinFollowers: number; industry?: string; rating: number } | null;
  _count?: { activities: number };
}

export async function fetchCampaigns(status?: string): Promise<APICampaign[]> {
  const qs = status && status !== 'all' ? `?status=${status}` : '';
  const { data } = await request<APICampaign[]>(`/campaigns${qs}`);
  return data;
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
}): Promise<{ reps: APIRep[]; total: number }> {
  const qs = new URLSearchParams();
  if (params?.industry && params.industry !== 'all') qs.set('industry', params.industry);
  if (params?.country && params.country !== 'all') qs.set('country', params.country);
  if (params?.sort) qs.set('sort', params.sort);
  if (params?.page) qs.set('page', String(params.page));

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
