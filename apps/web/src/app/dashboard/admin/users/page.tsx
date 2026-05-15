"use client";

import { useState, useEffect, useCallback } from 'react';
import { fetchAdminUsers, fetchAdminStats, updateUserStatus, updateUserRole, type APIUser, type AdminStats } from '@/lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<APIUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [{ users: data }, statsData] = await Promise.all([
        fetchAdminUsers({ role: roleFilter, status: statusFilter, search: searchTerm || undefined }),
        fetchAdminStats(),
      ]);
      setUsers(data);
      setStats(statsData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [roleFilter, statusFilter, searchTerm]);

  useEffect(() => { load(); }, [load]);

  const filteredUsers = users;

  const STATUS_STYLE: Record<string, { color: string; label: string }> = {
    active:    { color: 'var(--accent-2)', label: 'Active' },
    pending:   { color: 'var(--accent-3)', label: 'Pending' },
    suspended: { color: 'var(--accent-4)', label: 'Suspended' },
    banned:    { color: 'var(--accent-1)', label: 'Banned' },
  };

  const ROLE_STYLE: Record<string, { color: string; icon: string; label: string }> = {
    client:      { color: 'var(--accent-2)', icon: '🏢', label: 'Client' },
    rep:         { color: 'var(--accent-3)', icon: '👤', label: 'Rep' },
    admin:       { color: 'var(--accent-1)', icon: '👑', label: 'Admin' },
    super_admin: { color: 'var(--accent-1)', icon: '🔧', label: 'Super Admin' },
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    setActionLoading(userId + ':status');
    try {
      const updated = await updateUserStatus(userId, newStatus);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: updated.status } : u));
    } catch (e) {
      console.error('Status update failed:', e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(userId + ':role');
    try {
      const updated = await updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: updated.role } : u));
    } catch (e) {
      console.error('Role update failed:', e);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-10">
        <div className="max-w-5xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded-xl w-1/3" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-2xl" />)}
          </div>
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white/5 rounded-2xl" />)}
        </div>
      </div>
    );
  }

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

  const selectClass = "w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-accent-1/60 transition-colors";

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">User Management</h1>
            <p className="text-white/40 font-bold mt-1">Manage platform users and their permissions.</p>
          </div>
          <button className="text-xs font-black uppercase tracking-wide px-4 py-2 rounded-full border-2 border-white/20 text-white/50 hover:border-white/40 hover:text-white/70 transition-colors">
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total users',   value: stats?.totalUsers ?? users.length,                                    color: 'var(--accent-1)' },
            { label: 'Active',        value: users.filter(u => u.status.toLowerCase() === 'active').length,        color: 'var(--accent-2)' },
            { label: 'Pending',       value: users.filter(u => u.status.toLowerCase() === 'pending').length,       color: 'var(--accent-3)' },
            { label: 'Active Camps',  value: stats?.activeCampaigns ?? 0,                                          color: 'var(--accent-4)' },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
              <p className="text-[11px] font-black uppercase tracking-widest text-white/40 mb-2">{s.label}</p>
              <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, email, company…"
            className={selectClass + ' placeholder:text-white/25'}
          />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)} className={selectClass}>
            <option value="all">All Roles</option>
            <option value="client">Clients</option>
            <option value="rep">Reps</option>
            <option value="admin">Admins</option>
            <option value="super_admin">Super Admins</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className={selectClass}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>

        <p className="text-[11px] font-black uppercase tracking-widest text-white/30 mb-4">
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
        </p>

        {/* User cards */}
        <div className="space-y-3">
          {filteredUsers.map((user) => {
            const roleLow = user.role.toLowerCase();
            const statusLow = user.status.toLowerCase();
            const rs = ROLE_STYLE[roleLow] ?? ROLE_STYLE.client;
            const ss = STATUS_STYLE[statusLow] ?? STATUS_STYLE.active;
            const displayName = user.clientProfile?.companyName || user.email;
            return (
              <div
                key={user.id}
                className="border rounded-2xl p-5"
                style={{ borderColor: rs.color + '30', background: rs.color + '06' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span
                      className="mt-0.5 w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                      style={{ background: rs.color + '25', color: rs.color }}
                    >
                      {displayName[0].toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-black text-white">{displayName}</h3>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ color: rs.color, background: rs.color + '20' }}>
                          {rs.icon} {rs.label}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full border" style={{ color: ss.color, borderColor: ss.color + '50', background: ss.color + '12' }}>
                          {ss.label}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-white/40">{user.email}</p>
                      <p className="text-xs font-medium text-white/30 mt-0.5">
                        {[user.repProfile?.industry, `Joined ${new Date(user.createdAt).toLocaleDateString()}`].filter(Boolean).join(' · ')}
                      </p>

                      {/* Rep stats inline */}
                      {roleLow === 'rep' && user.repProfile && (
                        <div className="flex flex-wrap gap-4 mt-2">
                          <span className="text-[11px] font-bold text-white/45">{user.repProfile.linkedinFollowers.toLocaleString()} followers</span>
                          <span className="text-[11px] font-bold text-white/45">{Number(user.repProfile.rating).toFixed(1)} ⭐</span>
                          {user.repProfile.idVerified && <span className="text-[11px] font-bold text-accent-2">✅ ID Verified</span>}
                        </div>
                      )}
                      {roleLow === 'client' && user.clientProfile && (
                        <div className="flex flex-wrap gap-4 mt-2">
                          <span className="text-[11px] font-bold text-white/45">{user.clientProfile.plan} plan</span>
                          <span className="text-[11px] font-bold text-white/45">{user.clientProfile.planStatus}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    {statusLow === 'pending' && (
                      <button
                        disabled={actionLoading === user.id + ':status'}
                        onClick={() => handleStatusChange(user.id, 'active')}
                        className="text-[11px] font-black uppercase px-3 py-1.5 rounded-full border-2 transition-colors"
                        style={{ borderColor: 'var(--accent-2)', color: 'var(--accent-2)' }}
                      >
                        {actionLoading === user.id + ':status' ? '…' : 'Approve'}
                      </button>
                    )}
                    {statusLow === 'active' && (
                      <button
                        disabled={actionLoading === user.id + ':status'}
                        onClick={() => handleStatusChange(user.id, 'suspended')}
                        className="text-[11px] font-black uppercase px-3 py-1.5 rounded-full border-2 transition-colors"
                        style={{ borderColor: 'var(--accent-4)', color: 'var(--accent-4)' }}
                      >
                        {actionLoading === user.id + ':status' ? '…' : 'Suspend'}
                      </button>
                    )}
                    <select
                      value={roleLow}
                      disabled={actionLoading === user.id + ':role'}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="text-[11px] font-black uppercase bg-white/[0.04] border border-white/10 rounded-full px-3 py-1.5 text-white/60 focus:outline-none focus:border-accent-1/60 cursor-pointer"
                    >
                      <option value="client">Client</option>
                      <option value="rep">Rep</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-3xl">
            <p className="text-5xl mb-4">👥</p>
            <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">No users found</h3>
            <p className="text-sm font-medium text-white/40">Adjust your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}
