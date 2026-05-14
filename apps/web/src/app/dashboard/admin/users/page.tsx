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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      case 'suspended': return 'bg-orange-500/20 text-orange-400 border-orange-500';
      case 'banned': return 'bg-red-500/20 text-red-400 border-red-500';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-500/20 text-purple-400';
      case 'super_admin': return 'bg-red-500/20 text-red-400';
      case 'client': return 'bg-blue-500/20 text-blue-400';
      case 'rep': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return '👑';
      case 'super_admin': return '🔧';
      case 'client': return '🏢';
      case 'rep': return '👤';
      default: return '👥';
    }
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
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-muted rounded-lg p-6">
                  <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-muted-foreground">Manage platform users and their permissions</p>
          </div>
          <button className="px-6 py-3 bg-accent-1 text-white rounded-lg hover:bg-accent-2 transition-colors">
            Export Users
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-white">{users.length}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-green-400">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Verification</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {users.filter(u => u.status === 'pending').length}
                </p>
              </div>
              <div className="text-3xl">⏳</div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reps</p>
                <p className="text-2xl font-bold text-blue-400">
                  {users.filter(u => u.role === 'rep').length}
                </p>
              </div>
              <div className="text-3xl">👤</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg p-6 border border-accent-3/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Search Users</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by email, name, or company..."
                className="w-full px-3 py-2 bg-muted border border-accent-3 rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-1"
              />
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="w-full px-3 py-2 bg-muted border border-accent-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-1"
              >
                <option value="all">All Roles</option>
                <option value="client">Clients</option>
                <option value="rep">Reps</option>
                <option value="admin">Admins</option>
                <option value="super_admin">Super Admins</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 bg-muted border border-accent-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-1"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Users List */}
        <div className="space-y-6">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-card rounded-lg p-6 border border-accent-3/20">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{getRoleIcon(user.role)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {user.profile?.name || user.profile?.companyName || user.email}
                      </h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </div>

                  {/* Profile Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Location</p>
                      <p className="text-sm text-white">{user.profile?.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Industry</p>
                      <p className="text-sm text-white">{user.profile?.industry || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Joined</p>
                      <p className="text-sm text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Rep-specific stats */}
                  {user.role === 'rep' && user.profile && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">LinkedIn Followers</p>
                        <p className="text-sm text-white">{user.profile.linkedinFollowers?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Rating</p>
                        <p className="text-sm text-white">{user.profile.rating ? `${user.profile.rating} ⭐` : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total Campaigns</p>
                        <p className="text-sm text-white">{user.stats?.totalCampaigns || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total Earnings</p>
                        <p className="text-sm text-white">${user.stats?.totalEarnings?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                  )}

                  {/* Client-specific stats */}
                  {user.role === 'client' && user.stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total Campaigns</p>
                        <p className="text-sm text-white">{user.stats.totalCampaigns || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Active Campaigns</p>
                        <p className="text-sm text-white">{user.stats.activeCampaigns || 0}</p>
                      </div>
                    </div>
                  )}

                  {/* Last Login */}
                  {user.lastLoginAt && (
                    <div className="text-sm text-muted-foreground">
                      Last login: {new Date(user.lastLoginAt).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-muted text-white rounded-lg hover:bg-accent-1/20 transition-colors">
                    View Details
                  </button>
                  {user.status === 'pending' && (
                    <button 
                      onClick={() => handleStatusChange(user.id, 'active')}
                      className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      Approve
                    </button>
                  )}
                  {user.status === 'active' && (
                    <button 
                      onClick={() => handleStatusChange(user.id, 'suspended')}
                      className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors"
                    >
                      Suspend
                    </button>
                  )}
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                    className="px-4 py-2 bg-muted text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-1"
                  >
                    <option value="client">Client</option>
                    <option value="rep">Rep</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-white mb-2">No users found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search terms to find users.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
