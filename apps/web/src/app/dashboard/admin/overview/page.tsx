import Link from 'next/link';

const STATS = [
  { label: 'Total reps', value: 127, color: 'var(--accent-1)' },
  { label: 'Total clients', value: 43, color: 'var(--accent-2)' },
  { label: 'Active campaigns', value: 89, color: 'var(--accent-3)' },
  { label: 'Monthly revenue', value: '$12,500', color: 'var(--accent-4)' },
];

const PENDING_VERIFICATIONS = [
  { name: 'Mike Chen', niche: 'SaaS', submitted: '2h ago' },
  { name: 'Aisha Patel', niche: 'FinTech', submitted: '5h ago' },
  { name: 'Jordan Williams', niche: 'E-commerce', submitted: 'Yesterday' },
];

const SYSTEM_STATUS = [
  { label: 'API Server', status: 'Online', ok: true },
  { label: 'Database', status: 'Connected', ok: true },
  { label: 'Redis Cache', status: 'Active', ok: true },
  { label: 'Task Queue', status: 'Processing', ok: null },
  { label: 'Browser Sessions', status: '12 Active', ok: null },
];

const ACTIVITY = [
  { label: 'New rep registration: Sarah Johnson (Marketing)', color: 'var(--accent-2)', time: '1h ago' },
  { label: 'Payment processed: TechCorp subscription renewed ($150)', color: 'var(--accent-4)', time: '3h ago' },
  { label: 'ID verification submitted: Mike Chen', color: 'var(--accent-3)', time: '5h ago' },
  { label: 'Campaign completed: SaaS Startup — 89 connections', color: 'var(--accent-1)', time: 'Yesterday' },
  { label: 'New client registered: Velocity Brands', color: 'var(--accent-5)', time: 'Yesterday' },
];

const QUICK_ACTIONS = [
  { label: 'Manage Users', href: '/dashboard/admin/users', accent: 'var(--accent-1)' },
  { label: 'Review Verifications', href: '/dashboard/vault', accent: 'var(--accent-3)', badge: PENDING_VERIFICATIONS.length },
  { label: 'Monitor Campaigns', href: '/dashboard/missions', accent: 'var(--accent-2)' },
  { label: 'Billing Management', href: '/dashboard/agents', accent: 'var(--accent-4)' },
];

export default function AdminOverviewPage() {
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

        {/* Pending verifications alert */}
        {PENDING_VERIFICATIONS.length > 0 && (
          <div className="mb-6 border-2 border-dashed border-accent-3/60 rounded-2xl p-4 bg-accent-3/[0.04]">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">🪪</span>
                <p className="text-sm font-black text-accent-3 uppercase tracking-wide">
                  {PENDING_VERIFICATIONS.length} Verification{PENDING_VERIFICATIONS.length !== 1 ? 's' : ''} Awaiting Review
                </p>
              </div>
              <Link href="/dashboard/vault" className="text-xs font-black uppercase tracking-wide text-accent-3 hover:underline">
                View all →
              </Link>
            </div>
            <div className="space-y-2">
              {PENDING_VERIFICATIONS.map((v, i) => (
                <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-white/[0.06] last:border-none">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-accent-3/20 flex items-center justify-center text-xs font-black text-accent-3">
                      {v.name[0]}
                    </span>
                    <div>
                      <p className="text-sm font-black text-white">{v.name}</p>
                      <p className="text-xs text-white/40 font-medium">{v.niche}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-white/30">{v.submitted}</span>
                    <Link href="/dashboard/vault" className="text-[11px] font-black uppercase px-3 py-1 rounded-full border border-accent-3/40 text-accent-3 hover:bg-accent-3/10 transition-colors">
                      Review
                    </Link>
                  </div>
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
                  <div className="flex items-center gap-2">
                    {a.badge !== undefined && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: a.accent + '30', color: a.accent }}>
                        {a.badge}
                      </span>
                    )}
                    <span className="text-white/30 group-hover:text-white/60 transition-colors">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* System status */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-black uppercase tracking-widest text-white/50 mb-4">System Status</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SYSTEM_STATUS.map((s) => (
                <div key={s.label} className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                  <span className="text-sm font-bold text-white/60">{s.label}</span>
                  <span
                    className="text-[11px] font-black px-2 py-0.5 rounded-full border"
                    style={{
                      color: s.ok === true ? 'var(--accent-2)' : s.ok === false ? 'var(--accent-4)' : 'rgba(255,255,255,0.4)',
                      borderColor: s.ok === true ? 'rgba(0,245,212,0.3)' : s.ok === false ? 'rgba(255,107,53,0.3)' : 'rgba(255,255,255,0.1)',
                      background: s.ok === true ? 'rgba(0,245,212,0.08)' : s.ok === false ? 'rgba(255,107,53,0.08)' : 'rgba(255,255,255,0.04)',
                    }}
                  >
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-white/50 mb-4">Recent Platform Activity</h2>
          <div className="space-y-1">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-3 py-2.5 border-b border-white/[0.05] last:border-none">
                <span className="mt-1.5 shrink-0 w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
                <p className="text-sm font-medium text-white/60 flex-1 leading-snug">{a.label}</p>
                <span className="shrink-0 text-[11px] font-bold text-white/25">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
