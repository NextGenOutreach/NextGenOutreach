"use client";

import { useState, useEffect, useCallback } from 'react';
import { auth } from '@/lib/firebase';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

type RoiData = {
  totalProspects: number;
  connectionsSent: number;
  connectionsAccepted: number;
  repliesReceived: number;
  meetingsBooked: number;
  totalSpend: number;
  acceptanceRate: number;
  replyRate: number;
  meetingRate: number;
  costPerMeeting: number | null;
  trend: Array<{ date: string; CONNECTION_SENT?: number; MEETING_BOOKED?: number; DM_SENT?: number }>;
};

type Campaign = { id: string; name: string };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-bold text-white/50">{label}</span>
        <span className="text-sm font-black" style={{ color }}>{value.toLocaleString()}</span>
      </div>
      <div className="h-2.5 rounded-full bg-white/[0.07] overflow-hidden">
        <div
          className="h-2.5 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <p className="text-[10px] text-white/30 font-bold">{pct.toFixed(1)}% of prospects</p>
    </div>
  );
}

function RateCard({ label, value, good, bad, format = 'pct' }: { label: string; value: number | null; good: number; bad: number; format?: 'pct' | 'currency' }) {
  if (value === null) {
    return (
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/35 mb-2">{label}</p>
        <p className="text-xl font-black text-white/20">—</p>
        <p className="text-[10px] text-white/20 mt-1">No data yet</p>
      </div>
    );
  }

  const color = format === 'pct'
    ? (value >= good ? '#22c55e' : value >= bad ? '#f59e0b' : '#ef4444')
    : (value <= bad ? '#22c55e' : value <= good * 2 ? '#f59e0b' : '#ef4444');

  const display = format === 'pct'
    ? `${(value * 100).toFixed(1)}%`
    : `$${value.toFixed(0)}`;

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 text-center">
      <p className="text-[10px] font-black uppercase tracking-widest text-white/35 mb-2">{label}</p>
      <p className="text-2xl font-black" style={{ color }}>{display}</p>
      <div className="mt-2 flex justify-center gap-3 text-[10px] font-bold">
        <span style={{ color: '#22c55e' }}>Good: {format === 'pct' ? `≥${(good * 100).toFixed(0)}%` : `≤$${bad}`}</span>
        <span style={{ color: '#ef4444' }}>Weak: {format === 'pct' ? `<${(bad * 100).toFixed(0)}%` : `>$${good * 2}`}</span>
      </div>
    </div>
  );
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 120;
  const h = 36;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function RoiPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [roi, setRoi] = useState<RoiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dealValue, setDealValue] = useState(5000);
  const [closeRate, setCloseRate] = useState(20);

  const authHeaders = useCallback(async () => {
    const token = await auth?.currentUser?.getIdToken();
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  }, []);

  useEffect(() => {
    (async () => {
      const headers = await authHeaders();
      const res = await fetch(`${API}/api/v1/campaigns`, { headers });
      if (res.ok) {
        const d = await res.json();
        const list: Campaign[] = (d.data ?? []).map((c: any) => ({ id: c.id, name: c.name }));
        setCampaigns(list);
      }
    })();
  }, [authHeaders]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const headers = await authHeaders();
      const params = new URLSearchParams();
      if (selectedCampaign) params.set('campaignId', selectedCampaign);
      const res = await fetch(`${API}/api/v1/analytics/roi?${params}`, { headers });
      if (res.ok) {
        const d = await res.json();
        setRoi(d.data);
      }
      setLoading(false);
    })();
  }, [selectedCampaign, authHeaders]);

  const closedDeals = roi ? Math.floor(roi.meetingsBooked * (closeRate / 100)) : 0;
  const projectedRevenue = closedDeals * dealValue;
  const roiMultiple = roi?.totalSpend && roi.totalSpend > 0 ? projectedRevenue / roi.totalSpend : null;

  const connectionTrend = roi?.trend.map((d) => d.CONNECTION_SENT ?? 0) ?? [];
  const meetingTrend = roi?.trend.map((d) => d.MEETING_BOOKED ?? 0) ?? [];

  return (
    <div className="min-h-screen bg-background p-5 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">ROI Dashboard</h1>
            <p className="text-white/40 font-bold text-sm mt-0.5">Pipeline funnel, conversion rates & projected return</p>
          </div>
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-white focus:outline-none"
          >
            <option value="" className="bg-gray-900">All campaigns</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id} className="bg-gray-900">{c.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-accent-1 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !roi ? (
          <p className="text-white/30 font-bold text-sm text-center py-12">No data available yet</p>
        ) : (
          <>
            {/* Funnel */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-5">Outreach Funnel</h2>
              <div className="space-y-4">
                <FunnelBar label="Total Prospects" value={roi.totalProspects} max={roi.totalProspects} color="var(--accent-1)" />
                <FunnelBar label="Connections Sent" value={roi.connectionsSent} max={roi.totalProspects} color="var(--accent-2)" />
                <FunnelBar label="Connections Accepted" value={roi.connectionsAccepted} max={roi.totalProspects} color="#3b82f6" />
                <FunnelBar label="Replies Received" value={roi.repliesReceived} max={roi.totalProspects} color="var(--accent-3)" />
                <FunnelBar label="Meetings Booked" value={roi.meetingsBooked} max={roi.totalProspects} color="#22c55e" />
              </div>
            </div>

            {/* Conversion Rates */}
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Conversion Rates</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <RateCard label="Acceptance Rate" value={roi.acceptanceRate} good={0.35} bad={0.25} />
                <RateCard label="Reply Rate" value={roi.replyRate} good={0.20} bad={0.12} />
                <RateCard label="Meeting Rate" value={roi.meetingRate} good={0.15} bad={0.08} />
                <RateCard label="Cost Per Meeting" value={roi.costPerMeeting} good={500} bad={200} format="currency" />
              </div>
            </div>

            {/* ROI Calculator */}
            <div className="bg-white/[0.04] border border-accent-1/30 rounded-2xl p-6">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-5">ROI Calculator</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-xs font-black uppercase tracking-widest text-white/50">Avg Deal Value</label>
                      <span className="text-sm font-black text-white">${dealValue.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min={500}
                      max={50000}
                      step={500}
                      value={dealValue}
                      onChange={(e) => setDealValue(Number(e.target.value))}
                      className="w-full accent-pink-500"
                    />
                    <div className="flex justify-between text-[10px] text-white/25 font-bold">
                      <span>$500</span><span>$50k</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-xs font-black uppercase tracking-widest text-white/50">Meeting → Close Rate</label>
                      <span className="text-sm font-black text-white">{closeRate}%</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={60}
                      step={5}
                      value={closeRate}
                      onChange={(e) => setCloseRate(Number(e.target.value))}
                      className="w-full accent-pink-500"
                    />
                    <div className="flex justify-between text-[10px] text-white/25 font-bold">
                      <span>5%</span><span>60%</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-4">
                  <div className="bg-white/[0.05] rounded-2xl p-5 space-y-3">
                    {[
                      { label: 'Meetings Booked', value: roi.meetingsBooked, color: '#22c55e' },
                      { label: `Projected Closed (${closeRate}%)`, value: closedDeals, color: 'var(--accent-3)' },
                      { label: 'Projected Revenue', value: `$${projectedRevenue.toLocaleString()}`, color: 'var(--accent-1)' },
                      { label: 'Total Spend', value: `$${roi.totalSpend.toLocaleString()}`, color: 'rgba(255,255,255,0.4)' },
                    ].map((r) => (
                      <div key={r.label} className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white/50">{r.label}</span>
                        <span className="text-sm font-black" style={{ color: r.color }}>{r.value}</span>
                      </div>
                    ))}
                    <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-widest text-white/50">ROI Multiple</span>
                      {roiMultiple !== null ? (
                        <span
                          className="text-xl font-black"
                          style={{ color: roiMultiple >= 3 ? '#22c55e' : roiMultiple >= 1 ? '#f59e0b' : '#ef4444' }}
                        >
                          {roiMultiple.toFixed(1)}×
                        </span>
                      ) : (
                        <span className="text-white/25 font-black">—</span>
                      )}
                    </div>
                  </div>
                  {roiMultiple !== null && roiMultiple >= 1 && (
                    <p className="text-xs text-green-400 font-bold text-center">
                      For every $1 spent you get back ${roiMultiple.toFixed(1)} in projected revenue
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Activity Trend Sparklines */}
            {roi.trend.length > 1 && (
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Activity Trend (last 30 days)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { label: 'Connections Sent / day', data: connectionTrend, color: 'var(--accent-2)' },
                    { label: 'Meetings Booked / day', data: meetingTrend, color: '#22c55e' },
                  ].map((s) => (
                    <div key={s.label} className="space-y-2">
                      <p className="text-xs font-black uppercase tracking-widest text-white/40">{s.label}</p>
                      <div className="flex items-end gap-4">
                        <MiniSparkline data={s.data} color={s.color} />
                        <div className="text-right">
                          <p className="text-2xl font-black" style={{ color: s.color }}>
                            {s.data.reduce((a, b) => a + b, 0)}
                          </p>
                          <p className="text-[10px] text-white/30 font-bold">total</p>
                        </div>
                      </div>
                      {roi.trend.length > 0 && (
                        <p className="text-[10px] text-white/25 font-bold">
                          {roi.trend[0].date} → {roi.trend[roi.trend.length - 1].date}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
