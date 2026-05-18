"use client";

import { useState, useEffect, useCallback } from 'react';
import { auth } from '@/lib/firebase';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

type AbResult = {
  campaignId: string;
  campaignName: string;
  messageTemplates: Record<string, string> | null;
  sent: number;
  replied: number;
  booked: number;
  replyRate: number;
  bookingRate: number;
};

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="h-1.5 rounded-full bg-white/[0.07] overflow-hidden flex-1">
      <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function RateBadge({ value, good, bad }: { value: number; good: number; bad: number }) {
  const color = value >= good ? '#22c55e' : value >= bad ? '#f59e0b' : '#ef4444';
  return (
    <span
      className="text-xs font-black px-2 py-0.5 rounded-full"
      style={{ background: color + '20', color }}
    >
      {(value * 100).toFixed(1)}%
    </span>
  );
}

export default function MessageAbPage() {
  const [results, setResults] = useState<AbResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const authHeaders = useCallback(async () => {
    const token = await auth?.currentUser?.getIdToken();
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  }, []);

  useEffect(() => {
    (async () => {
      const headers = await authHeaders();
      const res = await fetch(`${API}/api/v1/analytics/message-ab`, { headers });
      if (res.ok) {
        const d = await res.json();
        setResults(
          (d.data ?? []).sort((a: AbResult, b: AbResult) => b.replyRate - a.replyRate)
        );
      }
      setLoading(false);
    })();
  }, [authHeaders]);

  const maxReplyRate = Math.max(...results.map((r) => r.replyRate), 0.01);

  return (
    <div className="min-h-screen bg-background p-5 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">Message A/B Performance</h1>
          <p className="text-white/40 font-bold text-sm mt-0.5">
            Compare reply and booking rates across campaigns — best performers ranked first
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-accent-1 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : results.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl">
            <p className="text-4xl mb-3">📨</p>
            <p className="text-sm font-bold text-white/30">No message data yet — campaigns need active prospects</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((r, i) => {
              const isOpen = expanded === r.campaignId;
              const templates = r.messageTemplates as Record<string, string> | null;

              return (
                <div
                  key={r.campaignId}
                  className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden"
                >
                  {/* Row */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : r.campaignId)}
                    className="w-full px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors text-left"
                  >
                    {/* Rank */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                      style={{
                        background: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'rgba(255,255,255,0.08)',
                        color: i <= 2 ? '#000' : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {i + 1}
                    </div>

                    {/* Campaign name */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white truncate">{r.campaignName}</p>
                      <p className="text-[10px] text-white/30 font-bold mt-0.5">
                        {r.sent} sent · {r.replied} replied · {r.booked} booked
                      </p>
                    </div>

                    {/* Reply rate bar + badge */}
                    <div className="hidden md:flex items-center gap-3 w-36 shrink-0">
                      <Bar value={r.replyRate} max={maxReplyRate} color="var(--accent-2)" />
                      <RateBadge value={r.replyRate} good={0.2} bad={0.12} />
                    </div>

                    {/* Booking rate */}
                    <div className="shrink-0">
                      <RateBadge value={r.bookingRate} good={0.15} bad={0.08} />
                      <p className="text-[10px] text-white/30 font-bold text-right mt-0.5">book rate</p>
                    </div>

                    <span className="text-white/30 text-sm shrink-0">{isOpen ? '▲' : '▼'}</span>
                  </button>

                  {/* Expanded — message templates */}
                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-white/[0.06] pt-4 space-y-3">
                      {templates && Object.keys(templates).length > 0 ? (
                        Object.entries(templates).map(([step, text]) => (
                          <div key={step} className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/35">{step}</p>
                            <div className="bg-white/[0.05] rounded-xl px-4 py-3 text-xs text-white/70 font-medium leading-relaxed whitespace-pre-wrap">
                              {text}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-white/25 font-bold">No message templates stored for this campaign</p>
                      )}

                      {/* Stats detail */}
                      <div className="grid grid-cols-3 gap-3 pt-2">
                        {[
                          { label: 'Sent', value: r.sent, color: 'rgba(255,255,255,0.5)' },
                          { label: 'Reply rate', value: `${(r.replyRate * 100).toFixed(1)}%`, color: r.replyRate >= 0.2 ? '#22c55e' : r.replyRate >= 0.12 ? '#f59e0b' : '#ef4444' },
                          { label: 'Booking rate', value: `${(r.bookingRate * 100).toFixed(1)}%`, color: r.bookingRate >= 0.15 ? '#22c55e' : r.bookingRate >= 0.08 ? '#f59e0b' : '#ef4444' },
                        ].map((s) => (
                          <div key={s.label} className="bg-white/[0.04] rounded-xl p-3 text-center">
                            <p className="text-sm font-black" style={{ color: s.color }}>{s.value}</p>
                            <p className="text-[10px] text-white/30 font-bold mt-0.5 uppercase tracking-widest">{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Benchmarks */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Industry Benchmarks</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            {[
              { label: 'Connection rate', good: '≥35%', avg: '25–34%', weak: '<25%' },
              { label: 'Reply rate', good: '≥20%', avg: '12–19%', weak: '<12%' },
              { label: 'Booking rate', good: '≥15%', avg: '8–14%', weak: '<8%' },
              { label: 'Cost/meeting', good: '<$200', avg: '$200–500', weak: '>$500' },
            ].map((b) => (
              <div key={b.label} className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{b.label}</p>
                <p className="text-[10px] font-bold text-green-400">{b.good}</p>
                <p className="text-[10px] font-bold text-amber-400">{b.avg}</p>
                <p className="text-[10px] font-bold text-red-400">{b.weak}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
