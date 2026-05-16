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
  industry: string | null;
  availabilityStatus: string;
  idVerified: boolean;
  rating: string;
  linkedinFollowers: number;
  linkedinUrl: string;
  user: { email: string; status: string; createdAt: string };
  _count: { campaigns: number; earnings: number };
  stats: { connectionsSent: number; acceptanceRate: number; meetingsBooked: number };
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
