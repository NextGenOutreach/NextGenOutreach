"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchAdminStats, fetchAdminActivity, fetchAdminRedAlerts, type AdminStats, type AdminActivity, type AdminAlert } from '@/lib/api';

const QUICK_ACTIONS = [
  { label: 'Manage Users', href: '/dashboard/admin/users', accent: 'var(--accent-1)' },
  { label: 'Lead Vault', href: '/dashboard/vault', accent: 'var(--accent-3)' },
  { label: 'Monitor Campaigns', href: '/dashboard/missions', accent: 'var(--accent-2)' },
  { label: 'Rep Intelligence', href: '/dashboard/agents', accent: 'var(--accent-4)' },
  { label: 'Earnings Audit', href: '/dashboard/admin/earnings', accent: 'var(--accent-5)' },
];

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const ACTIVITY_COLORS: Record<string, string> = {
  user_registered: 'var(--accent-2)',
  campaign: 'var(--accent-1)',
  connection_sent: 'var(--accent-3)',
  connection_accepted: 'var(--accent-2)',
  meeting_booked: 'var(--accent-4)',
  dm_sent: 'var(--accent-5)',
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<AdminActivity[]>([]);
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAdminStats(), fetchAdminActivity(), fetchAdminRedAlerts()])
      .then(([s, a, al]) => { setStats(s); setActivity(a); setAlerts(al); })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const STATS = [
    { label: 'Total reps',       value: stats?.totalReps ?? '—',       color: 'var(--accent-1)' },
    { label: 'Total clients',    value: stats?.totalClients ?? '—',    color: 'var(--accent-2)' },
    { label: 'Active campaigns', value: stats?.activeCampaigns ?? '—', color: 'var(--accent-3)' },
    { label: 'Total revenue',    value: stats ? `$${(stats as any).totalRevenue?.toLocaleString() ?? 0}` : '—', color: 'var(--accent-4)' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-10">
        <div className="max-w-5xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded-xl w-1/3" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-2xl" />)}
          </div>
          <div className="h-48 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">Admin Overview</h1>
            <p className="text-white/40 font-bold mt-1">Platform health, pending actions, and recent events.</p>
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-accent-1/40 text-accent-1 bg-accent-1/[0.06]">
            Super Admin
          </span>
        </div>

        {/* Platform stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
              <p className="text-[11px] font-black uppercase tracking-widest text-white/40 mb-2">{s.label}</p>
              <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Red Alerts */}
        {alerts.length > 0 && (
          <div className="mb-8 border-2 border-accent-4 bg-accent-4/5 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-3 h-3 rounded-full bg-accent-4 animate-pulse" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-accent-4">Tactical Alerts — Stale Missions</h2>
            </div>
            <div className="grid gap-3">
              {alerts.map((alert) => (
                <div key={alert.campaignId} className="flex items-center justify-between p-4 bg-background border border-accent-4/30 rounded-2xl">
                  <div>
                    <p className="text-sm font-black text-white">{alert.campaignName}</p>
                    <p className="text-[10px] font-bold text-accent-4 uppercase mt-1">Status: No activity in 24h</p>
                  </div>
                  <Link 
                    href="/dashboard/missions"
                    className="text-[10px] font-black uppercase px-4 py-2 rounded-full border border-white/20 text-white/40 hover:text-white transition-colors"
                  >
                    Investigate
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Quick actions */}
          <div className="lg:col-span-1">
            <h2 className="text-sm font-black uppercase tracking-widest text-white/50 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {QUICK_ACTIONS.map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className="flex items-center justify-between w-full p-3 rounded-xl border transition-colors group"
                  style={{ borderColor: a.accent + '30' }}
                >
                  <span className="text-sm font-black text-white group-hover:opacity-80">{a.label}</span>
                  <span className="text-white/30 group-hover:text-white/60 transition-colors">→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Platform totals */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-black uppercase tracking-widest text-white/50 mb-4">Platform Totals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: 'Total Users', value: stats?.totalUsers ?? '—', color: 'var(--accent-1)' },
                { label: 'Total Reps', value: stats?.totalReps ?? '—', color: 'var(--accent-2)' },
                { label: 'Total Clients', value: stats?.totalClients ?? '—', color: 'var(--accent-3)' },
                { label: 'Active Campaigns', value: stats?.activeCampaigns ?? '—', color: 'var(--accent-4)' },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                  <span className="text-sm font-bold text-white/60">{s.label}</span>
                  <span className="text-lg font-black" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-white/50 mb-4">Recent Platform Activity</h2>
          {activity.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-white/10 rounded-2xl">
              <p className="text-white/30 font-bold">No recent activity yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {activity.map((a, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-white/[0.05] last:border-none">
                  <span className="mt-1.5 shrink-0 w-2 h-2 rounded-full" style={{ backgroundColor: ACTIVITY_COLORS[a.type] ?? 'rgba(255,255,255,0.3)' }} />
                  <p className="text-sm font-medium text-white/60 flex-1 leading-snug">{a.label}</p>
                  <span className="shrink-0 text-[11px] font-bold text-white/25">{timeAgo(a.time)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
