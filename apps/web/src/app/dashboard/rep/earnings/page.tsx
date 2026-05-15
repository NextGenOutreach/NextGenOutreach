"use client";

import { useState, useEffect, useCallback } from 'react';
import { fetchRepEarnings, type APIEarning, type APIMonthlyEarning } from '@/lib/api';

export default function RepEarningsPage() {
  const [earnings, setEarnings] = useState<APIEarning[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<APIMonthlyEarning[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'pending' | 'paid'>('all');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { earnings: rows, monthly } = await fetchRepEarnings();
      setEarnings(rows);
      setMonthlyStats(monthly);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load earnings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredEarnings = earnings.filter(e => {
    if (selectedPeriod === 'all') return true;
    const s = e.status.toLowerCase();
    if (selectedPeriod === 'pending') return s === 'pending' || s === 'processing';
    return s === selectedPeriod;
  });

  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
  const pendingEarnings = earnings.filter(e => e.status.toLowerCase() === 'pending' || e.status.toLowerCase() === 'processing')
    .reduce((sum, e) => sum + e.amount, 0);
  const paidEarnings = earnings.filter(e => e.status.toLowerCase() === 'paid')
    .reduce((sum, e) => sum + e.amount, 0);

  const STATUS_STYLE: Record<string, { color: string; label: string }> = {
    paid:       { color: 'var(--accent-4)', label: 'Paid' },
    pending:    { color: 'var(--accent-3)', label: 'Pending' },
    processing: { color: 'var(--accent-2)', label: 'Processing' },
    failed:     { color: 'var(--accent-1)', label: 'Failed' },
  };

  const METHOD_ICON: Record<string, string> = {
    bank_transfer: '🏦',
    paypal: '💳',
    crypto: '₿',
  };

  const maxEarnings = Math.max(...monthlyStats.map(s => s.earnings), 1);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-10">
        <div className="max-w-4xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded-xl w-1/3" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-2xl" />)}
          </div>
          <div className="h-48 bg-white/5 rounded-2xl" />
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">Earnings</h1>
            <p className="text-white/40 font-bold mt-1">Your income and payment history.</p>
          </div>
          <button className="text-xs font-black uppercase tracking-wide px-4 py-2 rounded-full border-2 border-accent-4 text-accent-4 hover:bg-accent-4/10 transition-colors">
            Withdraw Funds
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total earnings', value: `$${totalEarnings.toLocaleString()}`, color: 'var(--accent-4)' },
            { label: 'Pending',        value: `$${pendingEarnings.toLocaleString()}`, color: 'var(--accent-3)' },
            { label: 'Paid out',       value: `$${paidEarnings.toLocaleString()}`,   color: 'var(--accent-2)' },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
              <p className="text-[11px] font-black uppercase tracking-widest text-white/40 mb-2">{s.label}</p>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Monthly chart */}
        <div className="border border-white/10 rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white/50 mb-5">Monthly Earnings</h2>
          <div className="space-y-4">
            {monthlyStats.map((stat, i) => {
              const barColor = ['var(--accent-1)','var(--accent-2)','var(--accent-3)','var(--accent-4)'][i % 4];
              return (
                <div key={stat.month}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-white/60">
                      {new Date(stat.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] text-white/35">{stat.campaigns} campaign{stat.campaigns !== 1 ? 's' : ''}</span>
                      <span className="text-sm font-black" style={{ color: barColor }}>${Number(stat.earnings).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${(stat.earnings / maxEarnings) * 100}%`, backgroundColor: barColor }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-5">
          {(['all', 'pending', 'paid'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wide border-2 transition-colors capitalize"
              style={{
                borderColor: selectedPeriod === p ? 'var(--accent-4)' : 'rgba(255,255,255,0.1)',
                color: selectedPeriod === p ? 'var(--accent-4)' : 'rgba(255,255,255,0.4)',
                background: selectedPeriod === p ? 'rgba(255,107,53,0.08)' : 'transparent',
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Earnings list */}
        <div className="space-y-3">
          {filteredEarnings.map((earning) => {
            const ss = STATUS_STYLE[earning.status.toLowerCase()] ?? STATUS_STYLE.pending;
            return (
              <div
                key={earning.id}
                className="border rounded-2xl p-5 flex items-center gap-4"
                style={{ borderColor: ss.color + '30', background: ss.color + '05' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-sm font-black text-white">{earning.campaignName}</h3>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full border" style={{ color: ss.color, borderColor: ss.color + '50', background: ss.color + '15' }}>
                      {ss.label}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-white/45">
                    {earning.clientName} · {new Date(earning.periodStart).toLocaleDateString()} – {new Date(earning.periodEnd).toLocaleDateString()}
                    {earning.paidAt ? ` · Paid ${new Date(earning.paidAt).toLocaleDateString()}` : ''}
                  </p>
                  {earning.notes && <p className="text-xs italic text-white/30 mt-1">{earning.notes}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-black" style={{ color: ss.color }}>${Number(earning.amount).toLocaleString()}</p>
                  <p className="text-[11px] font-bold text-white/30">{earning.currency}</p>
                </div>
              </div>
            );
          })}
        </div>

        {filteredEarnings.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-3xl">
            <p className="text-5xl mb-4">💰</p>
            <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">No earnings found</h3>
            <p className="text-sm font-medium text-white/40">
              {selectedPeriod === 'all' ? "No income recorded yet." : `No ${selectedPeriod} earnings.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
