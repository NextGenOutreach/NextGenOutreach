"use client";

import { useState, useEffect, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

type Proxy = {
  id: string;
  provider: string;
  ipAddress: string;
  host: string;
  port: number;
  country: string;
  status: 'ACTIVE' | 'DEAD' | 'FLAGGED' | 'UNASSIGNED';
  lastChecked: string | null;
  browserProfiles: Array<{ id: string; linkedinAccountEmail: string | null }>;
};

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: '#22c55e',
  UNASSIGNED: '#3b82f6',
  FLAGGED: '#f59e0b',
  DEAD: '#ef4444',
};

async function getToken() {
  const { getAuth } = await import('firebase/auth');
  return getAuth().currentUser?.getIdToken();
}

export default function ProxiesAdminPage() {
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ provider: 'iproyal', ipAddress: '', host: '', port: '', username: '', password: '', country: '' });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const authHeaders = useCallback(async () => {
    const token = await getToken();
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  }, []);

  const fetchProxies = useCallback(async () => {
    const headers = await authHeaders();
    const res = await fetch(`${API}/api/v1/proxies`, { headers });
    if (res.ok) { const d = await res.json(); setProxies(d.data ?? []); }
    setLoading(false);
  }, [authHeaders]);

  useEffect(() => { fetchProxies(); }, []);

  const addProxy = async () => {
    setAdding(true);
    setError('');
    const headers = await authHeaders();
    const res = await fetch(`${API}/api/v1/proxies`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...form, port: parseInt(form.port) }),
    });
    if (res.ok) {
      setShowAdd(false);
      setForm({ provider: 'iproyal', ipAddress: '', host: '', port: '', username: '', password: '', country: '' });
      fetchProxies();
    } else {
      const d = await res.json();
      setError(d.error?.message ?? 'Failed to add proxy');
    }
    setAdding(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const headers = await authHeaders();
    await fetch(`${API}/api/v1/proxies/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });
    fetchProxies();
  };

  const filtered = filterStatus === 'all' ? proxies : proxies.filter((p) => p.status === filterStatus);

  const stats = {
    total: proxies.length,
    active: proxies.filter((p) => p.status === 'ACTIVE').length,
    dead: proxies.filter((p) => p.status === 'DEAD').length,
    unassigned: proxies.filter((p) => p.status === 'UNASSIGNED').length,
  };

  return (
    <div className="min-h-screen bg-background p-5 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">Proxy Pool</h1>
            <p className="text-white/40 font-bold text-sm mt-0.5">
              Residential proxies — one per LinkedIn account, enforced at platform level
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="px-5 py-2.5 rounded-xl font-black uppercase tracking-wide text-sm text-white"
            style={{ background: 'var(--accent-1)' }}
          >
            + Add Proxy
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'var(--accent-1)' },
            { label: 'Active', value: stats.active, color: '#22c55e' },
            { label: 'Unassigned', value: stats.unassigned, color: '#3b82f6' },
            { label: 'Dead', value: stats.dead, color: '#ef4444' },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.04] border border-white/10 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{s.label}</p>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all', 'ACTIVE', 'UNASSIGNED', 'FLAGGED', 'DEAD'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border"
              style={{
                borderColor: filterStatus === s ? (STATUS_COLOR[s] ?? 'var(--accent-1)') : 'rgba(255,255,255,0.1)',
                background: filterStatus === s ? (STATUS_COLOR[s] ?? 'var(--accent-1)') + '20' : 'transparent',
                color: filterStatus === s ? (STATUS_COLOR[s] ?? 'var(--accent-1)') : 'rgba(255,255,255,0.35)',
              }}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-accent-1 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-14 text-center text-white/25 font-bold text-sm">No proxies</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.07]">
                    {['Provider', 'IP Address', 'Host:Port', 'Country', 'Assigned To', 'Status', 'Last Checked', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/35">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-xs font-bold text-white/70 uppercase">{p.provider}</td>
                      <td className="px-4 py-3 text-xs font-mono text-white/70">{p.ipAddress}</td>
                      <td className="px-4 py-3 text-xs font-mono text-white/50">{p.host}:{p.port}</td>
                      <td className="px-4 py-3 text-xs font-bold text-white/60 uppercase">{p.country}</td>
                      <td className="px-4 py-3 text-xs text-white/40">
                        {p.browserProfiles.length > 0
                          ? p.browserProfiles.map((bp) => bp.linkedinAccountEmail ?? 'Profile').join(', ')
                          : <span className="text-blue-400">Unassigned</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full"
                          style={{ background: STATUS_COLOR[p.status] + '20', color: STATUS_COLOR[p.status] }}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-white/30">
                        {p.lastChecked ? new Date(p.lastChecked).toLocaleString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {p.status !== 'ACTIVE' && (
                            <button
                              onClick={() => updateStatus(p.id, 'ACTIVE')}
                              className="text-[10px] font-black px-2 py-1 rounded-full border border-green-500/40 text-green-400 hover:bg-green-500/10 transition-colors"
                            >
                              Activate
                            </button>
                          )}
                          {p.status !== 'FLAGGED' && (
                            <button
                              onClick={() => updateStatus(p.id, 'FLAGGED')}
                              className="text-[10px] font-black px-2 py-1 rounded-full border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 transition-colors"
                            >
                              Flag
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Add Proxy</h3>
              {error && <p className="text-xs font-bold text-red-400 bg-red-400/10 rounded-xl p-3">{error}</p>}

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'IP Address', key: 'ipAddress', placeholder: '123.45.67.89', full: true },
                  { label: 'Host', key: 'host', placeholder: 'proxy.provider.com', full: false },
                  { label: 'Port', key: 'port', placeholder: '3128', full: false },
                  { label: 'Username', key: 'username', placeholder: 'user', full: false },
                  { label: 'Password', key: 'password', placeholder: 'pass', full: false },
                  { label: 'Country (ISO)', key: 'country', placeholder: 'US', full: false },
                ].map(({ label, key, placeholder, full }) => (
                  <div key={key} className={`space-y-1 ${full ? 'col-span-2' : ''}`}>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">{label}</label>
                    <input
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-medium focus:outline-none placeholder:text-white/20"
                    />
                  </div>
                ))}
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Provider</label>
                  <input
                    value={form.provider}
                    onChange={(e) => setForm((p) => ({ ...p, provider: e.target.value }))}
                    placeholder="iproyal / brightdata / oxylabs"
                    className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-medium focus:outline-none placeholder:text-white/20"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-black uppercase text-white/50 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addProxy}
                  disabled={adding || !form.ipAddress || !form.host || !form.port || !form.country}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase text-white transition-all disabled:opacity-50"
                  style={{ background: 'var(--accent-1)' }}
                >
                  {adding ? 'Adding…' : 'Add Proxy'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
