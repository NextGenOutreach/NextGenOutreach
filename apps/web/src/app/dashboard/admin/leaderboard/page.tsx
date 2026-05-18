"use client";

import { useState, useEffect, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

type LeaderboardEntry = {
  rank: number;
  repId: string;
  email: string;
  trustScore: number;
  tier: string;
  badges: Array<{ key: string; name: string; icon: string }>;
};

type HealthEntry = {
  id: string;
  repId: string;
  score: number;
  status: string;
  warmupDay: number;
  acceptanceRate7d: number | null;
  recentWarning: boolean;
  rep: { user: { email: string } };
};

const TIER_COLOR: Record<string, string> = {
  BRONZE: '#cd7f32',
  SILVER: '#c0c0c0',
  GOLD: '#ffd700',
  ELITE: 'var(--accent-1)',
};

const HEALTH_COLOR: Record<string, string> = {
  healthy: '#22c55e',
  stable: '#3b82f6',
  caution: '#f59e0b',
  at_risk: '#ef4444',
};

async function getToken() {
  const { getAuth } = await import('firebase/auth');
  return getAuth().currentUser?.getIdToken();
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [healthScores, setHealthScores] = useState<HealthEntry[]>([]);
  const [tab, setTab] = useState<'leaderboard' | 'health'>('leaderboard');
  const [loading, setLoading] = useState(true);

  const authHeaders = useCallback(async () => {
    const token = await getToken();
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  }, []);

  useEffect(() => {
    (async () => {
      const headers = await authHeaders();
      const [lbRes, hRes] = await Promise.all([
        fetch(`${API}/api/v1/gamification/leaderboard`, { headers }),
        fetch(`${API}/api/v1/linkedin-health`, { headers }),
      ]);
      if (lbRes.ok) { const d = await lbRes.json(); setLeaderboard(d.data ?? []); }
      if (hRes.ok) { const d = await hRes.json(); setHealthScores(d.data ?? []); }
      setLoading(false);
    })();
  }, [authHeaders]);

  return (
    <div className="min-h-screen bg-background p-5 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">Rep Performance</h1>
          <p className="text-white/40 font-bold text-sm mt-0.5">Leaderboard & LinkedIn account health overview</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/[0.07]">
          {(['leaderboard', 'health'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all border-b-2"
              style={{
                color: tab === t ? 'var(--accent-1)' : 'rgba(255,255,255,0.3)',
                borderBottomColor: tab === t ? 'var(--accent-1)' : 'transparent',
              }}
            >
              {t === 'leaderboard' ? '🏆 Leaderboard' : '🫀 LinkedIn Health'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-accent-1 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tab === 'leaderboard' ? (
          <div className="space-y-3">
            {leaderboard.length === 0 ? (
              <p className="text-center text-white/25 font-bold text-sm py-12">No reps yet</p>
            ) : leaderboard.map((entry) => (
              <div
                key={entry.repId}
                className="flex items-center gap-4 p-4 rounded-2xl border border-white/[0.07] hover:border-white/[0.12] transition-colors"
                style={{ background: entry.rank <= 3 ? 'rgba(255,255,255,0.03)' : 'transparent' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                  style={{
                    background: entry.rank === 1 ? '#ffd700' : entry.rank === 2 ? '#c0c0c0' : entry.rank === 3 ? '#cd7f32' : 'rgba(255,255,255,0.08)',
                    color: entry.rank <= 3 ? '#000' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {entry.rank}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white truncate">{entry.email}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ background: TIER_COLOR[entry.tier] + '25', color: TIER_COLOR[entry.tier] }}
                    >
                      {entry.tier}
                    </span>
                    {entry.badges.slice(0, 3).map((b) => (
                      <span key={b.key} title={b.name} className="text-sm">{b.icon}</span>
                    ))}
                    {entry.badges.length > 3 && (
                      <span className="text-[10px] text-white/30 font-bold">+{entry.badges.length - 3}</span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-lg font-black" style={{ color: 'var(--accent-1)' }}>{entry.trustScore}</p>
                  <p className="text-[10px] text-white/30 font-bold uppercase">Trust Score</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {healthScores.length === 0 ? (
              <p className="text-center text-white/25 font-bold text-sm py-12">No health data yet</p>
            ) : healthScores.map((h) => {
              const color = HEALTH_COLOR[h.status] ?? '#888';
              return (
                <div key={h.id} className="flex items-center gap-4 p-4 rounded-2xl border border-white/[0.07]">
                  {/* Score gauge */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black border-2 shrink-0"
                    style={{ borderColor: color, color }}
                  >
                    {h.score}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white truncate">{h.rep?.user?.email ?? '—'}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span
                        className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ background: color + '20', color }}
                      >
                        {h.status.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-white/35 font-bold">Day {h.warmupDay}</span>
                      {h.acceptanceRate7d !== null && (
                        <span className="text-[10px] text-white/35 font-bold">
                          {((h.acceptanceRate7d ?? 0) * 100).toFixed(1)}% acceptance
                        </span>
                      )}
                      {h.recentWarning && (
                        <span className="text-[10px] font-black text-amber-400">⚠ Warning</span>
                      )}
                    </div>
                  </div>

                  {/* Health bar */}
                  <div className="w-24 shrink-0">
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${h.score}%`, background: color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
