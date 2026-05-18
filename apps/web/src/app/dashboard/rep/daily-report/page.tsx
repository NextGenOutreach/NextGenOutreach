"use client";

import { useState, useEffect, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

type Prefill = {
  connectionsSent: number;
  messagesSent: number;
  repliesReceived: number;
  meetingsBooked: number;
  reportDate: string;
  source: string;
};

type Campaign = { id: string; campaignName: string };

async function getToken() {
  const { getAuth } = await import('firebase/auth');
  return getAuth().currentUser?.getIdToken();
}

export default function DailyReportPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [prefill, setPrefill] = useState<Prefill | null>(null);
  const [form, setForm] = useState({
    connectionsSent: 0,
    messagesSent: 0,
    repliesReceived: 0,
    meetingsBooked: 0,
    notes: '',
    accountHealth: 'normal',
  });
  const [submitted, setSubmitted] = useState(false);
  const [mismatch, setMismatch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(false);

  const authHeaders = useCallback(async () => {
    const token = await getToken();
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  }, []);

  useEffect(() => {
    (async () => {
      const headers = await authHeaders();
      const res = await fetch(`${API}/api/v1/rep/tasks`, { headers });
      if (res.ok) {
        const d = await res.json();
        const list: Campaign[] = (d.data ?? []).map((t: any) => ({ id: t.campaignId, campaignName: t.campaignName }));
        setCampaigns(list);
        if (list.length > 0) setSelectedCampaign(list[0].id);
      }
    })();
  }, [authHeaders]);

  useEffect(() => {
    if (!selectedCampaign) return;
    (async () => {
      setPrefillLoading(true);
      const headers = await authHeaders();
      const res = await fetch(`${API}/api/v1/daily-report/prefill?campaignId=${selectedCampaign}`, { headers });
      if (res.ok) {
        const d = await res.json();
        const p: Prefill = d.data;
        setPrefill(p);
        setForm((prev) => ({
          ...prev,
          connectionsSent: p.connectionsSent,
          messagesSent: p.messagesSent,
          repliesReceived: p.repliesReceived,
          meetingsBooked: p.meetingsBooked,
        }));
      }
      setPrefillLoading(false);
    })();
  }, [selectedCampaign, authHeaders]);

  const handleSubmit = async () => {
    if (!selectedCampaign) return;
    setLoading(true);
    const headers = await authHeaders();
    const res = await fetch(`${API}/api/v1/daily-report`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...form, campaignId: selectedCampaign }),
    });
    if (res.ok) {
      const d = await res.json();
      setMismatch(d.data?.mismatch ?? false);
      setSubmitted(true);
    }
    setLoading(false);
  };

  const field = (
    label: string,
    key: keyof typeof form,
    platformValue?: number
  ) => {
    const val = form[key] as number;
    const hasMismatch = platformValue !== undefined && Math.abs(val - platformValue) > 2;
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-widest text-white/50">{label}</label>
          {platformValue !== undefined && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${hasMismatch ? 'bg-amber-500/20 text-amber-400' : 'bg-white/[0.06] text-white/30'}`}>
              Platform: {platformValue}
            </span>
          )}
        </div>
        <input
          type="number"
          min={0}
          value={val}
          onChange={(e) => setForm((p) => ({ ...p, [key]: parseInt(e.target.value) || 0 }))}
          className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white font-black text-lg focus:outline-none focus:border-accent-1/50 transition-colors"
          style={{ borderColor: hasMismatch ? 'rgba(245,158,11,0.4)' : undefined }}
        />
        {hasMismatch && (
          <p className="text-[11px] text-amber-400 font-bold">
            ⚠ Differs from platform log by {Math.abs(val - platformValue)} — ops will review
          </p>
        )}
      </div>
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-sm space-y-4">
          <div className="text-5xl">{mismatch ? '⚠️' : '✅'}</div>
          <h2 className="text-xl font-black uppercase tracking-tight text-white">
            Report {mismatch ? 'Flagged for Review' : 'Submitted'}
          </h2>
          <p className="text-sm text-white/50 font-bold">
            {mismatch
              ? 'Your numbers differ from the platform activity log. Marketplace Ops will review.'
              : 'Your daily report has been submitted successfully.'}
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-6 py-2.5 rounded-xl font-black uppercase tracking-wide text-sm text-white transition-all"
            style={{ background: 'var(--accent-1)' }}
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-5 md:p-8">
      <div className="max-w-xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">Daily Report</h1>
          <p className="text-white/40 font-bold text-sm mt-0.5">
            Numbers are pre-filled from your platform activity. Review and submit.
          </p>
        </div>

        {/* Campaign selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-widest text-white/50">Campaign</label>
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none"
          >
            {campaigns.map((c) => (
              <option key={c.id} value={c.id} className="bg-gray-900">{c.campaignName}</option>
            ))}
          </select>
        </div>

        {prefillLoading ? (
          <div className="flex items-center gap-3 text-white/40 font-bold text-sm">
            <div className="w-4 h-4 border-2 border-accent-1 border-t-transparent rounded-full animate-spin" />
            Loading activity data…
          </div>
        ) : (
          prefill && (
            <div className="flex items-center gap-2 bg-accent-2/10 border border-accent-2/30 rounded-xl px-4 py-2.5">
              <span className="text-accent-2 text-sm">📊</span>
              <p className="text-xs font-bold text-accent-2">
                Auto-filled from platform activity log. You can edit if needed — differences are flagged.
              </p>
            </div>
          )
        )}

        <div className="space-y-4">
          {field('Connections Sent', 'connectionsSent', prefill?.connectionsSent)}
          {field('Messages Sent', 'messagesSent', prefill?.messagesSent)}
          {field('Replies Received', 'repliesReceived', prefill?.repliesReceived)}
          {field('Meetings Booked', 'meetingsBooked', prefill?.meetingsBooked)}
        </div>

        {/* Account health */}
        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-widest text-white/50">Account Health</label>
          <div className="grid grid-cols-3 gap-2">
            {(['normal', 'verification_prompt', 'other'] as const).map((h) => (
              <button
                key={h}
                onClick={() => setForm((p) => ({ ...p, accountHealth: h }))}
                className="py-2.5 rounded-xl text-xs font-black uppercase tracking-wide border transition-all"
                style={{
                  borderColor: form.accountHealth === h
                    ? h === 'normal' ? '#22c55e' : h === 'verification_prompt' ? '#f59e0b' : '#ef4444'
                    : 'rgba(255,255,255,0.1)',
                  background: form.accountHealth === h
                    ? h === 'normal' ? '#22c55e15' : h === 'verification_prompt' ? '#f59e0b15' : '#ef444415'
                    : 'transparent',
                  color: form.accountHealth === h
                    ? h === 'normal' ? '#22c55e' : h === 'verification_prompt' ? '#f59e0b' : '#ef4444'
                    : 'rgba(255,255,255,0.35)',
                }}
              >
                {h === 'normal' ? 'Normal' : h === 'verification_prompt' ? 'Prompted' : 'Other'}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-widest text-white/50">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            placeholder="ICP observations, anything unusual, compliance concerns…"
            rows={4}
            className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white font-medium text-sm focus:outline-none focus:border-accent-1/50 transition-colors resize-none placeholder:text-white/20"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !selectedCampaign}
          className="w-full py-3.5 rounded-xl font-black uppercase tracking-wide text-sm text-white transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))' }}
        >
          {loading ? 'Submitting…' : 'Submit Daily Report'}
        </button>
      </div>
    </div>
  );
}
