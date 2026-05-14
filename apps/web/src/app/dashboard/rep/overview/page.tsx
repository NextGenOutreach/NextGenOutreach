"use client";

import { useMemo } from 'react';
import Link from 'next/link';

const STATS = {
  activeClients: 2,
  tasksDueToday: 3,
  connectionsThisWeek: 68,
  earningsThisMonth: 360,
  payoutTarget: 540,
  tier: 'Scout',
};

const TODAY_TASKS = [
  { id: 1, client: 'TechCorp', task: 'Send 15 connection requests', type: 'connections', accent: 'var(--accent-1)' },
  { id: 2, client: 'SaaS Startup', task: 'Follow up on 8 open DMs', type: 'dms', accent: 'var(--accent-2)' },
  { id: 3, client: 'Finance Client', task: 'Post LinkedIn content update', type: 'content', accent: 'var(--accent-3)' },
];

const ACTIVITY = [
  { label: 'Completed 12 connection requests for TechCorp', color: 'var(--accent-2)', time: '2h ago' },
  { label: '5 new connection acceptances received', color: 'var(--accent-3)', time: '4h ago' },
  { label: 'New campaign assignment: Finance Client', color: 'var(--accent-1)', time: 'Yesterday' },
  { label: 'Payout of $180 processed for last month', color: 'var(--accent-4)', time: '3 days ago' },
];

function daysUntilPayout(): number {
  const today = new Date();
  const payout = new Date(today.getFullYear(), today.getMonth(), 25);
  if (today.getDate() >= 25) payout.setMonth(payout.getMonth() + 1);
  return Math.ceil((payout.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function RepOverviewPage() {
  const days = useMemo(() => daysUntilPayout(), []);
  const earningsPct = Math.min((STATS.earningsThisMonth / STATS.payoutTarget) * 100, 100);

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-4xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Rep Overview</h1>
          <p className="text-white/40 font-bold mt-1">Your missions, earnings, and today&apos;s task brief.</p>
        </div>

        {/* Verification banner */}
        <div className="mb-6 border-2 border-dashed border-accent-3/60 rounded-2xl p-4 flex items-center justify-between gap-4 bg-accent-3/[0.04]">
          <div className="flex items-center gap-3">
            <span className="text-xl">🪪</span>
            <div>
              <p className="text-sm font-black text-accent-3 uppercase tracking-wide">ID Verification Pending</p>
              <p className="text-xs font-medium text-white/50 mt-0.5">Submit your ID to get matched with clients and receive payouts.</p>
            </div>
          </div>
          <Link
            href="/dashboard/vault"
            className="shrink-0 text-xs font-black uppercase tracking-wide px-4 py-2 rounded-full border-2 border-accent-3 text-accent-3 hover:bg-accent-3/10 transition-colors whitespace-nowrap"
          >
            Verify Now →
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active clients', value: STATS.activeClients, color: 'var(--accent-1)' },
            { label: 'Tasks due today', value: STATS.tasksDueToday, color: 'var(--accent-3)' },
            { label: 'Connections this week', value: STATS.connectionsThisWeek, color: 'var(--accent-2)' },
            { label: 'Earnings this month', value: `$${STATS.earningsThisMonth}`, color: 'var(--accent-4)' },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
              <p className="text-[11px] font-black uppercase tracking-widest text-white/40 mb-2">{s.label}</p>
              <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Earnings progress */}
        <div className="mb-8 border-2 border-accent-4/30 rounded-2xl p-5 bg-accent-4/[0.03]">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-black uppercase tracking-wide text-white">
              Earnings — payout in <span className="text-accent-3">{days} day{days !== 1 ? 's' : ''}</span>
            </p>
            <p className="text-sm font-black text-accent-4">
              ${STATS.earningsThisMonth} / ${STATS.payoutTarget}
            </p>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{ width: `${earningsPct}%`, background: 'linear-gradient(90deg, var(--accent-4), var(--accent-1))' }}
            />
          </div>
          <p className="text-[11px] font-bold text-white/35 mt-2">
            {STATS.tier} tier · add {STATS.activeClients < 3 ? `${3 - STATS.activeClients} more mission${3 - STATS.activeClients !== 1 ? 's' : ''}` : 'more activity'} to reach target
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Today's tasks */}
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white/50 mb-4">Today&apos;s Tasks</h2>
            <div className="space-y-3">
              {TODAY_TASKS.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-4 p-4 rounded-2xl border"
                  style={{ borderColor: t.accent + '40', background: t.accent + '08' }}
                >
                  <div className="shrink-0 w-2 h-2 rounded-full" style={{ backgroundColor: t.accent }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white">{t.client}</p>
                    <p className="text-xs font-medium text-white/50 mt-0.5">{t.task}</p>
                  </div>
                  <Link
                    href="/dashboard/missions"
                    className="shrink-0 text-[11px] font-black uppercase tracking-wide px-3 py-1.5 rounded-full border transition-colors hover:opacity-80"
                    style={{ borderColor: t.accent, color: t.accent }}
                  >
                    Start
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white/50 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {ACTIVITY.map((a, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-white/[0.06] last:border-none">
                  <span className="mt-1.5 shrink-0 w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
                  <p className="text-sm font-medium text-white/60 flex-1 leading-snug">{a.label}</p>
                  <span className="shrink-0 text-[11px] font-bold text-white/25">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
