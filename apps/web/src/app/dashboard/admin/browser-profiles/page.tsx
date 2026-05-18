"use client";

import { useState, useEffect, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

type BrowserProfile = {
  id: string;
  provider: string;
  externalProfileId: string | null;
  linkedinAccountEmail: string | null;
  sessionStatus: string;
  warmupDay: number;
  lastLaunched: string | null;
  notes: string | null;
  rep: { user: { email: string } };
  proxy: { ipAddress: string; country: string; status: string } | null;
};

type Proxy = { id: string; ipAddress: string; country: string; status: string };

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: '#22c55e',
  IDLE: 'rgba(255,255,255,0.3)',
  LAUNCHING: '#f59e0b',
  CLOSED: 'rgba(255,255,255,0.2)',
  ERROR: '#ef4444',
};

async function getToken() {
  const { getAuth } = await import('firebase/auth');
  return getAuth().currentUser?.getIdToken();
}

export default function BrowserProfilesAdminPage() {
  const [profiles, setProfiles] = useState<BrowserProfile[]>([]);
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [loading, setLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    repId: '', campaignId: '', provider: 'gologin', proxyId: '', linkedinAccountEmail: '', notes: '',
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const authHeaders = useCallback(async () => {
    const token = await getToken();
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  }, []);

  const fetchAll = useCallback(async () => {
    const headers = await authHeaders();
    const [pRes, proxRes] = await Promise.all([
      fetch(`${API}/api/v1/browser-profiles`, { headers }),
      fetch(`${API}/api/v1/proxies/available`, { headers }),
    ]);
    if (pRes.ok) { const d = await pRes.json(); setProfiles(d.data ?? []); }
    if (proxRes.ok) { const d = await proxRes.json(); setProxies(d.data ?? []); }
    setLoading(false);
  }, [authHeaders]);

  useEffect(() => { fetchAll(); }, []);

  const checkHealth = async (profileId: string) => {
    setHealthLoading(profileId);
    const headers = await authHeaders();
    const res = await fetch(`${API}/api/v1/browser-profiles/${profileId}/health`, { headers });
    if (res.ok) fetchAll();
    setHealthLoading(null);
  };

  const createProfile = async () => {
    setCreating(true);
    setError('');
    const headers = await authHeaders();
    const res = await fetch(`${API}/api/v1/browser-profiles`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...form,
        proxyId: form.proxyId || undefined,
        campaignId: form.campaignId || undefined,
      }),
    });
    if (res.ok) {
      setShowCreate(false);
      setForm({ repId: '', campaignId: '', provider: 'gologin', proxyId: '', linkedinAccountEmail: '', notes: '' });
      fetchAll();
    } else {
      const d = await res.json();
      setError(d.error?.message ?? 'Failed to create profile');
    }
    setCreating(false);
  };

  return (
    <div className="min-h-screen bg-background p-5 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">Browser Profiles</h1>
            <p className="text-white/40 font-bold text-sm mt-0.5">Manage anti-detect browser profiles per rep</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 rounded-xl font-black uppercase tracking-wide text-sm text-white transition-all"
            style={{ background: 'var(--accent-1)' }}
          >
            + Provision Profile
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Profiles', value: profiles.length, color: 'var(--accent-1)' },
            { label: 'Active', value: profiles.filter((p) => p.sessionStatus === 'ACTIVE').length, color: '#22c55e' },
            { label: 'Error', value: profiles.filter((p) => p.sessionStatus === 'ERROR').length, color: '#ef4444' },
            { label: 'Idle', value: profiles.filter((p) => p.sessionStatus === 'IDLE').length, color: 'rgba(255,255,255,0.4)' },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.04] border border-white/10 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{s.label}</p>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-accent-1 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : profiles.length === 0 ? (
            <div className="py-16 text-center text-white/25 font-bold text-sm">No browser profiles yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.07]">
                    {['Rep', 'Provider', 'LinkedIn Account', 'Proxy', 'Warm-up Day', 'Status', 'Last Launched', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/35">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {profiles.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-xs font-bold text-white/70">{p.rep?.user?.email ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-white/[0.08] text-white/60">
                          {p.provider}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-white/50 font-medium">{p.linkedinAccountEmail ?? '—'}</td>
                      <td className="px-4 py-3">
                        {p.proxy ? (
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-white/70">{p.proxy.ipAddress}</p>
                            <p className="text-[10px] text-white/35 uppercase">{p.proxy.country}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-400 font-bold">No proxy</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-black px-2 py-1 rounded-full"
                          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
                        >
                          Day {p.warmupDay}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full"
                          style={{ background: (STATUS_COLOR[p.sessionStatus] ?? 'rgba(255,255,255,0.1)') + '20', color: STATUS_COLOR[p.sessionStatus] ?? 'rgba(255,255,255,0.4)' }}
                        >
                          {p.sessionStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-white/35 font-medium">
                        {p.lastLaunched ? new Date(p.lastLaunched).toLocaleString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => checkHealth(p.id)}
                          disabled={healthLoading === p.id || !p.externalProfileId}
                          className="text-[10px] font-black uppercase tracking-wide px-3 py-1.5 rounded-full border border-accent-2/40 text-accent-2 hover:bg-accent-2/10 transition-colors disabled:opacity-40"
                        >
                          {healthLoading === p.id ? '…' : 'Health'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Provision Browser Profile</h3>

              {error && <p className="text-xs font-bold text-red-400 bg-red-400/10 rounded-xl p-3">{error}</p>}

              {[
                { label: 'Rep ID', key: 'repId', placeholder: 'cuid of the rep profile' },
                { label: 'Campaign ID (optional)', key: 'campaignId', placeholder: 'Link to a campaign' },
                { label: 'LinkedIn Account Email', key: 'linkedinAccountEmail', placeholder: 'rep@example.com' },
                { label: 'Notes', key: 'notes', placeholder: 'Optional notes' },
              ].map(({ label, key, placeholder }) => (
                <div key={key} className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">{label}</label>
                  <input
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:outline-none placeholder:text-white/20"
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Provider</label>
                  <select
                    value={form.provider}
                    onChange={(e) => setForm((p) => ({ ...p, provider: e.target.value }))}
                    className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:outline-none"
                  >
                    <option value="gologin" className="bg-gray-900">GoLogin</option>
                    <option value="bitbrowser" className="bg-gray-900">BitBrowser</option>
                    <option value="adspower" className="bg-gray-900">AdsPower</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Proxy</label>
                  <select
                    value={form.proxyId}
                    onChange={(e) => setForm((p) => ({ ...p, proxyId: e.target.value }))}
                    className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:outline-none"
                  >
                    <option value="" className="bg-gray-900">No proxy</option>
                    {proxies.map((px) => (
                      <option key={px.id} value={px.id} className="bg-gray-900">
                        {px.ipAddress} ({px.country})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-black uppercase text-white/50 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createProfile}
                  disabled={creating || !form.repId}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase text-white transition-all disabled:opacity-50"
                  style={{ background: 'var(--accent-1)' }}
                >
                  {creating ? 'Provisioning…' : 'Provision'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
