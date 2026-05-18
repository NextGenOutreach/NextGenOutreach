"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { auth } from '@/lib/firebase';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

type Prospect = {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string;
  linkedinUrl: string;
  connectionStatus: string;
  messageStatus: string;
  replySentiment: string | null;
  meetingBooked: boolean;
  meetingDate: string | null;
  updatedAt: string;
  campaign: { id: string; name: string };
  rep: { id: string; user: { email: string } } | null;
};

type Campaign = { id: string; name: string };

const CONNECTION_COLOR: Record<string, string> = {
  NOT_SENT: 'rgba(255,255,255,0.2)',
  PENDING: '#f59e0b',
  ACCEPTED: '#22c55e',
  WITHDRAWN: '#ef4444',
  IGNORED: 'rgba(255,255,255,0.2)',
};

const SENTIMENT_COLOR: Record<string, string> = {
  POSITIVE: '#22c55e',
  NEUTRAL: '#f59e0b',
  NEGATIVE: '#ef4444',
};

const SENTIMENT_ICON: Record<string, string> = {
  POSITIVE: '✅',
  NEUTRAL: '⚡',
  NEGATIVE: '❌',
};

function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
      style={{ background: color + '25', color }}
    >
      {label.replace('_', ' ')}
    </span>
  );
}

export default function ClientProspectsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters, setFilters] = useState({ campaignId: '', status: '', sentiment: '' });
  const loaderRef = useRef<HTMLDivElement>(null);
  const PER_PAGE = 30;

  const authHeaders = useCallback(async () => {
    const token = await auth?.currentUser?.getIdToken();
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  }, []);

  const fetchCampaigns = useCallback(async () => {
    const headers = await authHeaders();
    const res = await fetch(`${API}/api/v1/campaigns`, { headers });
    if (res.ok) {
      const d = await res.json();
      setCampaigns((d.data ?? []).map((c: any) => ({ id: c.id, name: c.name })));
    }
  }, [authHeaders]);

  const fetchProspects = useCallback(async (pageNum: number, append = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);

    const headers = await authHeaders();
    const params = new URLSearchParams({ page: String(pageNum), limit: String(PER_PAGE) });
    if (filters.campaignId) params.set('campaignId', filters.campaignId);
    if (filters.status) params.set('status', filters.status);
    if (filters.sentiment) params.set('sentiment', filters.sentiment);

    const res = await fetch(`${API}/api/v1/analytics/prospects?${params}`, { headers });
    if (res.ok) {
      const d = await res.json();
      const data: Prospect[] = d.data ?? [];
      setTotal(d.meta?.total ?? 0);
      setProspects((prev) => (append ? [...prev, ...data] : data));
    }

    if (!append) setLoading(false);
    else setLoadingMore(false);
  }, [authHeaders, filters]);

  useEffect(() => { fetchCampaigns(); }, []);

  useEffect(() => {
    setPage(1);
    fetchProspects(1, false);
  }, [filters]);

  // Infinite scroll
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && prospects.length < total && !loadingMore) {
          const next = page + 1;
          setPage(next);
          fetchProspects(next, true);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [prospects.length, total, loadingMore, page, fetchProspects]);

  const meetings = prospects.filter((p) => p.meetingBooked).length;
  const positive = prospects.filter((p) => p.replySentiment === 'POSITIVE').length;
  const accepted = prospects.filter((p) => p.connectionStatus === 'ACCEPTED').length;

  return (
    <div className="min-h-screen bg-background p-5 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">Live Prospect Feed</h1>
          <p className="text-white/40 font-bold text-sm mt-0.5">Real-time view of every prospect your reps are working</p>
        </div>

        {/* Summary pills */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: `${total} Total`, color: 'var(--accent-1)' },
            { label: `${accepted} Accepted`, color: '#22c55e' },
            { label: `${positive} Positive replies`, color: '#3b82f6' },
            { label: `${meetings} Meetings`, color: 'var(--accent-3)' },
          ].map((s) => (
            <div
              key={s.label}
              className="px-4 py-2 rounded-full text-xs font-black border"
              style={{ borderColor: s.color + '50', background: s.color + '12', color: s.color }}
            >
              {s.label}
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={filters.campaignId}
            onChange={(e) => setFilters((p) => ({ ...p, campaignId: e.target.value }))}
            className="bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
          >
            <option value="" className="bg-gray-900">All campaigns</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id} className="bg-gray-900">{c.name}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
            className="bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
          >
            <option value="" className="bg-gray-900">All statuses</option>
            {['NOT_SENT', 'PENDING', 'ACCEPTED', 'IGNORED', 'WITHDRAWN'].map((s) => (
              <option key={s} value={s} className="bg-gray-900">{s.replace('_', ' ')}</option>
            ))}
          </select>

          <select
            value={filters.sentiment}
            onChange={(e) => setFilters((p) => ({ ...p, sentiment: e.target.value }))}
            className="bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
          >
            <option value="" className="bg-gray-900">All sentiments</option>
            {['POSITIVE', 'NEUTRAL', 'NEGATIVE'].map((s) => (
              <option key={s} value={s} className="bg-gray-900">{s}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-accent-1 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : prospects.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-sm font-bold text-white/30">No prospects match your filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.07]">
                      {['Prospect', 'Company', 'Campaign', 'Connection', 'Message', 'Reply', 'Meeting', 'Updated'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/35 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {prospects.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <a
                              href={p.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-black text-white hover:text-accent-2 transition-colors"
                            >
                              {p.firstName} {p.lastName} ↗
                            </a>
                            <p className="text-[10px] text-white/35 font-medium mt-0.5">{p.jobTitle}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-bold text-white/60">{p.company}</td>
                        <td className="px-4 py-3 text-xs text-white/40 font-medium">{p.campaign.name}</td>
                        <td className="px-4 py-3">
                          <StatusPill
                            label={p.connectionStatus}
                            color={CONNECTION_COLOR[p.connectionStatus] ?? 'rgba(255,255,255,0.2)'}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill
                            label={p.messageStatus.replace('NOT_STARTED', 'PENDING')}
                            color={p.messageStatus === 'NOT_STARTED' ? 'rgba(255,255,255,0.2)' : '#3b82f6'}
                          />
                        </td>
                        <td className="px-4 py-3">
                          {p.replySentiment ? (
                            <span className="text-sm" title={p.replySentiment}>
                              {SENTIMENT_ICON[p.replySentiment]}
                            </span>
                          ) : (
                            <span className="text-white/20 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {p.meetingBooked ? (
                            <div>
                              <span className="text-xs font-black text-green-400">✅ Booked</span>
                              {p.meetingDate && (
                                <p className="text-[10px] text-white/30 mt-0.5">
                                  {new Date(p.meetingDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-white/20 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[10px] text-white/30 whitespace-nowrap">
                          {new Date(p.updatedAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Infinite scroll trigger */}
              <div ref={loaderRef} className="py-4 flex justify-center">
                {loadingMore && (
                  <div className="w-5 h-5 border-2 border-accent-1 border-t-transparent rounded-full animate-spin" />
                )}
                {!loadingMore && prospects.length >= total && total > 0 && (
                  <p className="text-xs text-white/20 font-bold">All {total} prospects loaded</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
