"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

type Campaign = { id: string; campaignName: string; dailyLimit: number; status: string };
type Prospect = {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string;
  linkedinUrl: string;
};
type SequenceItem = {
  id: string;
  currentStep: string;
  status: string;
  prospect: Prospect;
  campaign: { id: string; name: string; dailyLimit: number; messageTemplates: unknown };
};
type HealthData = { score: number; status: string; warmupDay: number; acceptanceRate7d: number | null };
type BrowserProfile = { id: string; externalProfileId: string | null; provider: string; sessionStatus: string; warmupDay: number };
type ActivitySummary = Record<string, number>;

function HealthGauge({ score, status }: { score: number; status: string }) {
  const color =
    status === 'healthy' ? '#22c55e'
    : status === 'stable' ? '#3b82f6'
    : status === 'caution' ? '#f59e0b'
    : '#ef4444';

  const angle = (score / 100) * 180 - 90;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-12 overflow-hidden">
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full border-[10px]" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
        <div
          className="absolute bottom-0 left-0 w-24 h-24 rounded-full border-[10px] transition-all duration-700"
          style={{
            borderColor: color,
            clipPath: `polygon(0 50%, 100% 50%, 100% 100%, 0 100%)`,
            transform: `rotate(${angle}deg)`,
            transformOrigin: '50% 100%',
          }}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-lg font-black" style={{ color }}>
          {score}
        </div>
      </div>
      <span
        className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
        style={{ background: color + '20', color }}
      >
        {status.replace('_', ' ')}
      </span>
    </div>
  );
}

function ActionCounter({ sent, limit }: { sent: number; limit: number }) {
  const pct = Math.min((sent / limit) * 100, 100);
  const remaining = Math.max(limit - sent, 0);
  const atLimit = sent >= limit;
  const warning = remaining <= Math.ceil(limit * 0.2) && !atLimit;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-black uppercase tracking-widest text-white/50">Connections today</span>
        <span
          className="text-sm font-black"
          style={{ color: atLimit ? '#ef4444' : warning ? '#f59e0b' : '#22c55e' }}
        >
          {sent} / {limit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: atLimit ? '#ef4444' : warning ? '#f59e0b' : 'linear-gradient(90deg, var(--accent-2), var(--accent-1))',
          }}
        />
      </div>
      {warning && !atLimit && (
        <p className="text-xs font-bold text-amber-400">⚠️ {remaining} connection{remaining !== 1 ? 's' : ''} remaining today</p>
      )}
      {atLimit && (
        <p className="text-xs font-bold text-red-400">🛑 Daily limit reached — stop sending connections</p>
      )}
    </div>
  );
}

export default function RepWorkspacePage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [queue, setQueue] = useState<{ day1: SequenceItem[]; day4: SequenceItem[]; day8: SequenceItem[]; noResponse: SequenceItem[] }>({ day1: [], day4: [], day8: [], noResponse: [] });
  const [health, setHealth] = useState<HealthData | null>(null);
  const [browserProfile, setBrowserProfile] = useState<BrowserProfile | null>(null);
  const [activitySummary, setActivitySummary] = useState<ActivitySummary>({});
  const [launching, setLaunching] = useState(false);
  const [activeTab, setActiveTab] = useState<'day1' | 'day4' | 'day8' | 'noResponse'>('day1');
  const [replyModal, setReplyModal] = useState<{ sequenceId: string; prospect: Prospect } | null>(null);
  const [replySentiment, setReplySentiment] = useState<'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'>('POSITIVE');
  const [loading, setLoading] = useState(true);

  const getToken = useCallback(async () => {
    const { getAuth } = await import('firebase/auth');
    return getAuth().currentUser?.getIdToken();
  }, []);

  const authHeaders = useCallback(async () => {
    const token = await getToken();
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  }, [getToken]);

  const fetchAll = useCallback(async () => {
    const headers = await authHeaders();
    const [tasksRes, healthRes, profilesRes] = await Promise.all([
      fetch(`${API}/api/v1/rep/tasks`, { headers }),
      fetch(`${API}/api/v1/linkedin-health`, { headers }),
      fetch(`${API}/api/v1/browser-profiles`, { headers }),
    ]);

    if (tasksRes.ok) {
      const d = await tasksRes.json();
      const cList: Campaign[] = (d.data ?? []).map((t: any) => ({
        id: t.campaignId,
        campaignName: t.campaignName,
        dailyLimit: t.dailyLimit,
        status: t.status,
      }));
      setCampaigns(cList);
      if (!selectedCampaign && cList.length > 0) setSelectedCampaign(cList[0].id);
    }

    if (healthRes.ok) {
      const d = await healthRes.json();
      setHealth(d.data);
    }

    if (profilesRes.ok) {
      const d = await profilesRes.json();
      const profiles: BrowserProfile[] = d.data ?? [];
      setBrowserProfile(profiles[0] ?? null);
    }

    setLoading(false);
  }, [authHeaders, selectedCampaign]);

  const fetchQueueAndSummary = useCallback(async () => {
    if (!selectedCampaign) return;
    const headers = await authHeaders();
    const [qRes, sRes] = await Promise.all([
      fetch(`${API}/api/v1/outreach-queue?campaignId=${selectedCampaign}`, { headers }),
      fetch(`${API}/api/v1/activity-log/summary?campaignId=${selectedCampaign}`, { headers }),
    ]);
    if (qRes.ok) { const d = await qRes.json(); setQueue(d.data ?? { day1: [], day4: [], day8: [], noResponse: [] }); }
    if (sRes.ok) { const d = await sRes.json(); setActivitySummary(d.data ?? {}); }
  }, [authHeaders, selectedCampaign]);

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { fetchQueueAndSummary(); }, [selectedCampaign]);

  const logAction = async (actionType: string, prospectId?: string) => {
    const headers = await authHeaders();
    await fetch(`${API}/api/v1/activity-log`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ campaignId: selectedCampaign, prospectId, actionType }),
    });
    fetchQueueAndSummary();
  };

  const advanceSequence = async (sequenceId: string) => {
    const headers = await authHeaders();
    await fetch(`${API}/api/v1/outreach-queue/${sequenceId}/advance`, { method: 'PATCH', headers });
    logAction('CONNECTION_SENT');
    fetchQueueAndSummary();
  };

  const markReplied = async () => {
    if (!replyModal) return;
    const headers = await authHeaders();
    await fetch(`${API}/api/v1/outreach-queue/${replyModal.sequenceId}/reply`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ sentiment: replySentiment }),
    });
    logAction('DM_REPLIED', replyModal.prospect.id);
    setReplyModal(null);
    fetchQueueAndSummary();
  };

  const launchBrowser = async () => {
    if (!browserProfile) return;
    setLaunching(true);
    const headers = await authHeaders();
    await fetch(`${API}/api/v1/browser-profiles/${browserProfile.id}/launch`, { method: 'POST', headers });
    setLaunching(false);
    fetchAll();
  };

  const campaign = campaigns.find((c) => c.id === selectedCampaign);
  const connectionsSent = activitySummary['CONNECTION_SENT'] ?? 0;
  const atLimit = campaign ? connectionsSent >= campaign.dailyLimit : false;

  const TABS = [
    { key: 'day1', label: 'New (Day 1)', count: queue.day1.length, color: 'var(--accent-2)' },
    { key: 'day4', label: 'Follow-up (Day 4)', count: queue.day4.length, color: 'var(--accent-1)' },
    { key: 'day8', label: 'Final Touch (Day 8)', count: queue.day8.length, color: 'var(--accent-3)' },
    { key: 'noResponse', label: 'No Response', count: queue.noResponse.length, color: 'rgba(255,255,255,0.3)' },
  ] as const;

  const currentQueue = queue[activeTab];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-1 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-5 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">Daily Workspace</h1>
            <p className="text-white/40 font-bold text-sm mt-0.5">
              {new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>

          {/* Campaign selector */}
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-white focus:outline-none"
          >
            {campaigns.map((c) => (
              <option key={c.id} value={c.id} className="bg-gray-900">{c.campaignName}</option>
            ))}
          </select>
        </div>

        {/* Morning Briefing Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Action Counter */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 col-span-1">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Session Tracker</h2>
            <ActionCounter sent={connectionsSent} limit={campaign?.dailyLimit ?? 40} />
            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              {[
                { label: 'Messages', value: activitySummary['DM_SENT'] ?? 0, color: 'var(--accent-2)' },
                { label: 'Replies', value: activitySummary['DM_REPLIED'] ?? 0, color: 'var(--accent-3)' },
              ].map((s) => (
                <div key={s.label} className="bg-white/[0.04] rounded-xl p-3">
                  <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/35">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* LinkedIn Health */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Account Health</h2>
            {health ? (
              <div className="flex flex-col items-center gap-3">
                <HealthGauge score={health.score} status={health.status} />
                <div className="w-full space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/50">Warm-up day</span>
                    <span className="font-black text-white">{health.warmupDay}</span>
                  </div>
                  {health.acceptanceRate7d !== null && (
                    <div className="flex justify-between">
                      <span className="text-white/50">Acceptance rate (7d)</span>
                      <span className="font-black text-white">{((health.acceptanceRate7d ?? 0) * 100).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-white/30 font-bold">No health data yet</p>
            )}
          </div>

          {/* Browser Profile Launch */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Browser Profile</h2>
            {browserProfile ? (
              <div className="space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/50">Provider</span>
                    <span className="font-black text-white uppercase">{browserProfile.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Status</span>
                    <span
                      className="font-black uppercase"
                      style={{ color: browserProfile.sessionStatus === 'ACTIVE' ? '#22c55e' : browserProfile.sessionStatus === 'ERROR' ? '#ef4444' : 'rgba(255,255,255,0.5)' }}
                    >
                      {browserProfile.sessionStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Warm-up day</span>
                    <span className="font-black text-white">{browserProfile.warmupDay}</span>
                  </div>
                </div>
                <button
                  onClick={launchBrowser}
                  disabled={launching}
                  className="w-full py-2.5 rounded-xl font-black uppercase tracking-wide text-sm transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))', color: '#fff' }}
                >
                  {launching ? 'Launching…' : '▶ Start Session'}
                </button>
              </div>
            ) : (
              <p className="text-sm text-white/30 font-bold">No browser profile assigned. Contact your manager.</p>
            )}
          </div>
        </div>

        {/* Outreach Queue */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex border-b border-white/[0.07] overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 px-5 py-3.5 text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all"
                style={{
                  color: activeTab === tab.key ? tab.color : 'rgba(255,255,255,0.3)',
                  borderBottom: activeTab === tab.key ? `2px solid ${tab.color}` : '2px solid transparent',
                  background: activeTab === tab.key ? tab.color + '10' : 'transparent',
                }}
              >
                {tab.label}
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-black"
                  style={{ background: tab.color + '30', color: tab.color }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="divide-y divide-white/[0.05]">
            {currentQueue.length === 0 ? (
              <div className="px-6 py-10 text-center text-white/25 font-bold text-sm">
                No prospects in this queue
              </div>
            ) : (
              currentQueue.map((item) => (
                <div key={item.id} className="px-5 py-4 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white">
                      {item.prospect.firstName} {item.prospect.lastName}
                    </p>
                    <p className="text-xs text-white/40 font-bold mt-0.5">
                      {item.prospect.jobTitle} · {item.prospect.company}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={item.prospect.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-black uppercase tracking-wide px-3 py-1.5 rounded-full border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 transition-colors"
                    >
                      LinkedIn
                    </a>
                    {activeTab !== 'noResponse' && (
                      <button
                        onClick={() => advanceSequence(item.id)}
                        disabled={atLimit && activeTab === 'day1'}
                        className="text-[11px] font-black uppercase tracking-wide px-3 py-1.5 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: 'var(--accent-2)', color: '#fff' }}
                      >
                        Mark Sent
                      </button>
                    )}
                    <button
                      onClick={() => setReplyModal({ sequenceId: item.id, prospect: item.prospect })}
                      className="text-[11px] font-black uppercase tracking-wide px-3 py-1.5 rounded-full border border-accent-3/50 text-accent-3 hover:bg-accent-3/10 transition-colors"
                    >
                      Got Reply
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reply Modal */}
        {replyModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Log Reply</h3>
              <p className="text-xs text-white/50 font-bold">
                {replyModal.prospect.firstName} {replyModal.prospect.lastName} · {replyModal.prospect.company}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(['POSITIVE', 'NEUTRAL', 'NEGATIVE'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setReplySentiment(s)}
                    className="py-2 rounded-xl text-xs font-black uppercase tracking-wide border transition-all"
                    style={{
                      borderColor: replySentiment === s
                        ? s === 'POSITIVE' ? '#22c55e' : s === 'NEUTRAL' ? '#f59e0b' : '#ef4444'
                        : 'rgba(255,255,255,0.1)',
                      background: replySentiment === s
                        ? s === 'POSITIVE' ? '#22c55e20' : s === 'NEUTRAL' ? '#f59e0b20' : '#ef444420'
                        : 'transparent',
                      color: replySentiment === s
                        ? s === 'POSITIVE' ? '#22c55e' : s === 'NEUTRAL' ? '#f59e0b' : '#ef4444'
                        : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {replySentiment === 'POSITIVE' && (
                <p className="text-xs font-bold text-green-400 bg-green-400/10 rounded-xl p-3">
                  ✅ Positive reply — consider passing to appointment setter or continuing the conversation
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setReplyModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-black uppercase text-white/50 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={markReplied}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase text-white transition-all"
                  style={{ background: 'var(--accent-1)' }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
