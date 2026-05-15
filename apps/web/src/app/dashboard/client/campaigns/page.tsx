"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { fetchCampaigns, updateCampaignStatus, type APICampaign } from '@/lib/api';

export default function ClientCampaignsPage() {
  const [campaigns, setCampaigns] = useState<APICampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'completed'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCampaigns();
      setCampaigns(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const updated = await updateCampaignStatus(id, newStatus);
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: updated.status } : c));
    } catch (e) {
      console.error('Status update failed:', e);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    if (filter === 'all') return true;
    return campaign.status.toLowerCase() === filter;
  });

  const STATUS: Record<string, { color: string; label: string }> = {
    active:        { color: 'var(--accent-2)', label: 'Active' },
    draft:         { color: 'var(--accent-3)', label: 'Draft' },
    paused:        { color: 'var(--accent-4)', label: 'Paused' },
    completed:     { color: 'var(--accent-5)', label: 'Done' },
    pending_match: { color: 'var(--accent-1)', label: 'Matching' },
    cancelled:     { color: 'rgba(255,80,80,0.8)', label: 'Cancelled' },
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'connections': return '🤝';
      case 'dms': return '💬';
      case 'posts': return '📝';
      case 'mixed': return '🔄';
      default: return '📊';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-10">
        <div className="max-w-4xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded-xl w-1/3" />
          {[...Array(3)].map((_, i) => <div key={i} className="h-36 bg-white/5 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-white/60 font-bold mb-4">{error}</p>
          <button onClick={load} className="px-4 py-2 rounded-full border-2 border-accent-1 text-accent-1 text-xs font-black uppercase">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">Campaigns</h1>
            <p className="text-white/40 font-bold mt-1">Your active LinkedIn outreach missions.</p>
          </div>
          <Link
            href="/dashboard/client/campaigns/create"
            className="text-xs font-black uppercase tracking-wide px-4 py-2 rounded-full border-2 border-accent-1 text-accent-1 hover:bg-accent-1/10 transition-colors"
          >
            + Create Campaign
          </Link>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'active', 'draft', 'completed'] as const).map((f) => {
            const s = STATUS[f as keyof typeof STATUS];
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wide border-2 transition-colors capitalize"
                style={{
                  borderColor: filter === f ? (s?.color ?? 'var(--accent-1)') : 'rgba(255,255,255,0.1)',
                  color: filter === f ? (s?.color ?? 'var(--accent-1)') : 'rgba(255,255,255,0.4)',
                  background: filter === f ? (s?.color ?? 'var(--accent-1)') + '12' : 'transparent',
                }}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* Campaign cards */}
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => {
            const ss = STATUS[campaign.status.toLowerCase()] ?? { color: 'rgba(255,255,255,0.3)', label: campaign.status };
            return (
              <div
                key={campaign.id}
                className="border rounded-2xl p-5"
                style={{ borderColor: ss.color + '35', background: ss.color + '07' }}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-lg">{getTypeIcon(campaign.type)}</span>
                      <h3 className="text-sm font-black text-white">{campaign.name}</h3>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full border" style={{ color: ss.color, borderColor: ss.color + '50', background: ss.color + '15' }}>
                        {ss.label}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-white/45">
                      {campaign.rep ? `Rep · ${campaign.rep.industry ?? 'SDR'} · ` : ''}
                      {campaign.startDate ? `Started ${new Date(campaign.startDate).toLocaleDateString()} · ` : ''}
                      {campaign.endDate ? `Ended ${new Date(campaign.endDate).toLocaleDateString()} · ` : ''}
                      {`${campaign.dailyLimit}/day limit`}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {campaign.status.toLowerCase() === 'active' && (
                      <button
                        disabled={actionLoading === campaign.id}
                        onClick={() => handleStatusChange(campaign.id, 'paused')}
                        className="text-[11px] font-black uppercase px-3 py-1.5 rounded-full border-2 transition-colors disabled:opacity-40"
                        style={{ borderColor: 'var(--accent-4)', color: 'var(--accent-4)' }}
                      >
                        {actionLoading === campaign.id ? '…' : 'Pause'}
                      </button>
                    )}
                    {campaign.status.toLowerCase() === 'paused' && (
                      <button
                        disabled={actionLoading === campaign.id}
                        onClick={() => handleStatusChange(campaign.id, 'active')}
                        className="text-[11px] font-black uppercase px-3 py-1.5 rounded-full border-2 border-accent-2 text-accent-2 transition-colors hover:bg-accent-2/10 disabled:opacity-40"
                      >
                        {actionLoading === campaign.id ? '…' : 'Resume'}
                      </button>
                    )}
                    <Link
                      href={`/dashboard/client/campaigns/${campaign.id}`}
                      className="text-[11px] font-black uppercase px-3 py-1.5 rounded-full border-2 border-white/20 text-white/50 hover:border-white/40 hover:text-white/80 transition-colors"
                    >
                      Details
                    </Link>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Activities', value: campaign._count?.activities ?? 0, color: 'var(--accent-1)' },
                    { label: 'Daily Limit', value: campaign.dailyLimit,              color: 'var(--accent-2)' },
                    { label: 'Rep Rating', value: campaign.rep ? `${Number(campaign.rep.rating).toFixed(1)}★` : '—', color: 'var(--accent-3)' },
                    { label: 'Type',       value: campaign.type.toLowerCase(),      color: 'var(--accent-4)' },
                  ].map((m) => (
                    <div key={m.label} className="bg-white/[0.04] rounded-xl p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/35 mb-1">{m.label}</p>
                      <p className="text-xl font-black" style={{ color: m.color }}>{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-3xl">
            <p className="text-5xl mb-4">�</p>
            <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">No campaigns found</h3>
            <p className="text-sm font-medium text-white/40 mb-6">
              {filter === 'all' ? "You haven't launched any campaigns yet." : `No ${filter} campaigns.`}
            </p>
            {filter === 'all' && (
              <Link
                href="/dashboard/client/campaigns/create"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-black uppercase tracking-wide text-sm text-background transition-opacity hover:opacity-90"
                style={{ background: 'var(--accent-1)' }}
              >
                Create Your First Campaign →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
