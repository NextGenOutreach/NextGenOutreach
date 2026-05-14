"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { auth } from '@/lib/firebase';

const ONBOARDING_KEY = 'ngo_onboarding_v1';
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const STEPS = [
  {
    id: 'profile',
    label: 'Complete your profile',
    description: 'Add your company name, industry, and target audience so we can match you with the right reps.',
    href: '/dashboard/client/profile',
    cta: 'Complete Profile →',
    accent: 'var(--accent-1)',
  },
  {
    id: 'browse',
    label: 'Browse the rep marketplace',
    description: 'Explore ID-verified outreach professionals and find the right match for your niche.',
    href: '/dashboard/client/marketplace',
    cta: 'Browse Reps →',
    accent: 'var(--accent-2)',
  },
  {
    id: 'campaign',
    label: 'Launch your first campaign',
    description: 'Create a campaign brief, select a rep, and start generating pipeline within 24 hours.',
    href: '/dashboard/client/campaigns',
    cta: 'Create Campaign →',
    accent: 'var(--accent-3)',
  },
];

export default function ClientOverviewPage() {
  const { user } = useAuth();
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    connectionsSent: 0,
    meetingsBooked: 0,
    pipelineValue: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ONBOARDING_KEY);
      if (saved) setCompleted(JSON.parse(saved));
    } catch { /* ignore */ }
    setHydrated(true);

    const fetchStats = async () => {
      if (!user) return;
      
      try {
        const idToken = await auth?.currentUser?.getIdToken();
        if (!idToken) return;

        const response = await fetch(`${API_URL}/api/v1/analytics/overview`, {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          setStats(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [user]);

  const toggle = (id: string) => {
    const next = { ...completed, [id]: !completed[id] };
    setCompleted(next);
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(next));
  };

  const doneCount = STEPS.filter((s) => completed[s.id]).length;
  const allDone = doneCount === STEPS.length;
  const progressPct = (doneCount / STEPS.length) * 100;

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded w-1/3" />
          <div className="h-4 bg-white/5 rounded w-1/2" />
          <div className="h-48 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-4xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Client Overview</h1>
          <p className="text-white/40 font-bold mt-1">Welcome to NextGenOutreach. Let&apos;s get your first campaign live.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active campaigns', value: stats.activeCampaigns, color: 'var(--accent-1)' },
            { label: 'Connections sent', value: stats.connectionsSent, color: 'var(--accent-2)' },
            { label: 'Meetings booked', value: stats.meetingsBooked, color: 'var(--accent-3)' },
            { label: 'Pipeline value', value: `$${stats.pipelineValue.toLocaleString()}`, color: 'var(--accent-4)' },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 relative overflow-hidden">
              {loadingStats && (
                <div className="absolute inset-0 bg-white/5 animate-pulse" />
              )}
              <p className="text-[11px] font-black uppercase tracking-widest text-white/40 mb-2">{s.label}</p>
              <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Onboarding checklist — hidden once all steps completed */}
        {!allDone && (
          <div className="mb-8 border-2 border-accent-1/30 rounded-3xl p-6 md:p-8 bg-accent-1/[0.03]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-black uppercase tracking-tight text-white">
                Getting started — {doneCount}/{STEPS.length} done
              </h2>
              <span className="text-xs font-black text-accent-3">{Math.round(progressPct)}%</span>
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full bg-white/10 mb-6 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, var(--accent-1), var(--accent-2))' }}
              />
            </div>

            <div className="space-y-3">
              {STEPS.map((step, i) => {
                const done = !!completed[step.id];
                return (
                  <div
                    key={step.id}
                    className="flex items-start gap-4 p-4 rounded-2xl border transition-colors"
                    style={{
                      borderColor: done ? 'rgba(255,255,255,0.08)' : step.accent + '40',
                      background: done ? 'rgba(255,255,255,0.02)' : step.accent + '08',
                    }}
                  >
                    <button
                      onClick={() => toggle(step.id)}
                      className="shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all"
                      style={{
                        borderColor: done ? step.accent : 'rgba(255,255,255,0.2)',
                        background: done ? step.accent : 'transparent',
                      }}
                      aria-label={done ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {done && <span className="text-background text-xs font-black">✓</span>}
                      {!done && <span className="text-white/30 text-xs font-black">{i + 1}</span>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-black uppercase tracking-wide ${done ? 'text-white/30 line-through' : 'text-white'}`}>
                        {step.label}
                      </p>
                      {!done && (
                        <p className="text-xs font-medium text-white/45 mt-1 leading-relaxed">{step.description}</p>
                      )}
                    </div>
                    {!done && (
                      <Link
                        href={step.href}
                        className="shrink-0 text-xs font-black uppercase tracking-wide px-3 py-1.5 rounded-full border transition-colors"
                        style={{ borderColor: step.accent, color: step.accent }}
                      >
                        {step.cta}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {allDone && (
          <div className="mb-8 border-2 border-accent-2/40 rounded-3xl p-6 bg-accent-2/[0.05] flex items-center gap-4">
            <span className="text-3xl">🎉</span>
            <div>
              <p className="font-black text-white uppercase tracking-wide">Onboarding complete!</p>
              <p className="text-sm text-white/50 font-bold mt-0.5">Your account is fully set up. Launch campaigns any time from the sidebar.</p>
            </div>
          </div>
        )}

        {/* Empty state / Quick actions */}
        {stats.activeCampaigns === 0 && (
          <div className="border-2 border-dashed border-white/15 rounded-3xl p-10 text-center">
            <p className="text-5xl mb-4">📭</p>
            <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">No active campaigns yet</h3>
            <p className="text-sm font-bold text-white/40 mb-6 max-w-sm mx-auto">
              Your pipeline will appear here once you launch your first campaign.
            </p>
            <Link
              href="/dashboard/client/campaigns"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-black uppercase tracking-wide text-sm text-background transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent-1)' }}
            >
              Create Your First Campaign →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
