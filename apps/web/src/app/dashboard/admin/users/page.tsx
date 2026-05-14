"use client";

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: 'client' | 'rep' | 'admin' | 'super_admin';
  status: 'pending' | 'active' | 'suspended' | 'banned';
  createdAt: string;
  lastLoginAt?: string;
  profile?: {
    name?: string;
    companyName?: string;
    industry?: string;
    location?: string;
    linkedinFollowers?: number;
    rating?: number;
    totalReviews?: number;
  };
  stats?: {
    totalCampaigns?: number;
    totalEarnings?: number;
    activeCampaigns?: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'client' | 'rep' | 'admin' | 'super_admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'suspended' | 'banned'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    // TODO: Fetch real users data from API
    const fetchUsers = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setUsers([
          {
            id: '1',
            email: 'sarah.johnson@example.com',
            role: 'rep',
            status: 'active',
            createdAt: '2024-01-15',
            lastLoginAt: '2024-05-13T10:30:00Z',
            profile: {
              name: 'Sarah Johnson',
              industry: 'Technology',
              location: 'United States',
              linkedinFollowers: 15000,
              rating: 4.9,
              totalReviews: 127
            },
            stats: {
              totalCampaigns: 12,
              totalEarnings: 8500,
              activeCampaigns: 2
            }
          },
          {
            id: '2',
            email: 'mike.chen@example.com',
            role: 'rep',
            status: 'active',
            createdAt: '2024-01-20',
            lastLoginAt: '2024-05-13T09:15:00Z',
            profile: {
              name: 'Mike Chen',
              industry: 'Finance',
              location: 'United Kingdom',
              linkedinFollowers: 12000,
              rating: 4.8,
              totalReviews: 95
            },
            stats: {
              totalCampaigns: 8,
              totalEarnings: 6200,
              activeCampaigns: 1
            }
          },
          {
            id: '3',
            email: 'techcorp@example.com',
            role: 'client',
            status: 'active',
            createdAt: '2024-01-10',
            lastLoginAt: '2024-05-13T08:45:00Z',
            profile: {
              companyName: 'TechCorp Inc.',
              industry: 'Technology',
              location: 'United States'
            },
            stats: {
              totalCampaigns: 5,
              activeCampaigns: 2
            }
          },
          {
            id: '4',
            email: 'finance.hub@example.com',
            role: 'client',
            status: 'active',
            createdAt: '2024-01-25',
            lastLoginAt: '2024-05-12T16:20:00Z',
            profile: {
              companyName: 'FinanceHub',
              industry: 'Finance',
              location: 'United Kingdom'
            },
            stats: {
              totalCampaigns: 3,
              activeCampaigns: 1
            }
          },
          {
            id: '5',
            email: 'new.rep@example.com',
            role: 'rep',
            status: 'pending',
            createdAt: '2024-05-13',
            profile: {
              name: 'Alex Rodriguez',
              industry: 'E-commerce',
              location: 'Spain',
              linkedinFollowers: 20000
            }
          }
        ]);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.profile?.name && user.profile.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (user.profile?.companyName && user.profile.companyName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

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

  const handleStatusChange = (userId: string, newStatus: User['status']) => {
    // TODO: Implement status change API call
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const handleRoleChange = (userId: string, newRole: User['role']) => {
    // TODO: Implement role change API call
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
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
            { label: 'Total users',        value: users.length,                                  color: 'var(--accent-1)' },
            { label: 'Active',             value: users.filter(u => u.status === 'active').length,  color: 'var(--accent-2)' },
            { label: 'Pending',            value: users.filter(u => u.status === 'pending').length, color: 'var(--accent-3)' },
            { label: 'Reps',               value: users.filter(u => u.role === 'rep').length,       color: 'var(--accent-4)' },
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
            const rs = ROLE_STYLE[user.role] ?? ROLE_STYLE.client;
            const ss = STATUS_STYLE[user.status] ?? STATUS_STYLE.active;
            const displayName = user.profile?.name || user.profile?.companyName || user.email;
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
                        {[user.profile?.location, user.profile?.industry, `Joined ${new Date(user.createdAt).toLocaleDateString()}`].filter(Boolean).join(' · ')}
                        {user.lastLoginAt ? ` · Last seen ${new Date(user.lastLoginAt).toLocaleString()}` : ''}
                      </p>

                      {/* Rep stats inline */}
                      {user.role === 'rep' && (
                        <div className="flex flex-wrap gap-4 mt-2">
                          {user.profile?.linkedinFollowers && <span className="text-[11px] font-bold text-white/45">{user.profile.linkedinFollowers.toLocaleString()} followers</span>}
                          {user.profile?.rating && <span className="text-[11px] font-bold text-white/45">{user.profile.rating} ⭐ ({user.profile.totalReviews} reviews)</span>}
                          {user.stats?.totalEarnings && <span className="text-[11px] font-bold" style={{ color: 'var(--accent-4)' }}>${user.stats.totalEarnings.toLocaleString()} earned</span>}
                          {user.stats?.totalCampaigns && <span className="text-[11px] font-bold text-white/45">{user.stats.totalCampaigns} campaigns</span>}
                        </div>
                      )}
                      {user.role === 'client' && user.stats && (
                        <div className="flex flex-wrap gap-4 mt-2">
                          <span className="text-[11px] font-bold text-white/45">{user.stats.totalCampaigns || 0} total campaigns</span>
                          <span className="text-[11px] font-bold" style={{ color: 'var(--accent-2)' }}>{user.stats.activeCampaigns || 0} active</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    {user.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(user.id, 'active')}
                        className="text-[11px] font-black uppercase px-3 py-1.5 rounded-full border-2 transition-colors"
                        style={{ borderColor: 'var(--accent-2)', color: 'var(--accent-2)' }}
                      >
                        Approve
                      </button>
                    )}
                    {user.status === 'active' && (
                      <button
                        onClick={() => handleStatusChange(user.id, 'suspended')}
                        className="text-[11px] font-black uppercase px-3 py-1.5 rounded-full border-2 transition-colors"
                        style={{ borderColor: 'var(--accent-4)', color: 'var(--accent-4)' }}
                      >
                        Suspend
                      </button>
                    )}
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
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
