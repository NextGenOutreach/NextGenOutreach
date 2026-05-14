"use client";

import { useState, useEffect } from 'react';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    totalReps: 127,
    totalClients: 43,
    activeCampaigns: 89,
    monthlyRevenue: 12500
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch real admin dashboard data from API
    const fetchDashboardData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          totalReps: 127,
          totalClients: 43,
          activeCampaigns: 89,
          monthlyRevenue: 12500
        });
      } catch (error) {
        console.error('Failed to fetch admin dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-muted rounded-lg p-6">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-muted rounded"></div>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and management</p>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reps</p>
                <p className="text-2xl font-bold text-white">{stats.totalReps}</p>
              </div>
              <div className="p-3 bg-accent-1/20 rounded-lg">
                <div className="w-6 h-6 bg-accent-1 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold text-white">{stats.totalClients}</p>
              </div>
              <div className="p-3 bg-accent-2/20 rounded-lg">
                <div className="w-6 h-6 bg-accent-2 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold text-white">{stats.activeCampaigns}</p>
              </div>
              <div className="p-3 bg-accent-3/20 rounded-lg">
                <div className="w-6 h-6 bg-accent-3 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-white">${stats.monthlyRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-accent-4/20 rounded-lg">
                <div className="w-6 h-6 bg-accent-4 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-muted rounded-lg hover:bg-accent-1/20 transition-colors">
                <span className="text-white">Manage Users</span>
              </button>
              <button className="w-full text-left px-4 py-3 bg-muted rounded-lg hover:bg-accent-1/20 transition-colors">
                <span className="text-white">Review Rep Verifications</span>
              </button>
              <button className="w-full text-left px-4 py-3 bg-muted rounded-lg hover:bg-accent-1/20 transition-colors">
                <span className="text-white">Monitor Campaigns</span>
              </button>
              <button className="w-full text-left px-4 py-3 bg-muted rounded-lg hover:bg-accent-1/20 transition-colors">
                <span className="text-white">View Analytics</span>
              </button>
              <button className="w-full text-left px-4 py-3 bg-muted rounded-lg hover:bg-accent-1/20 transition-colors">
                <span className="text-white">Billing Management</span>
              </button>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <h2 className="text-xl font-semibold text-white mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">API Server</span>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database</span>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Redis Cache</span>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Browser Sessions</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">12 Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Task Queue</span>
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">Processing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-card rounded-lg p-6 border border-accent-3/20">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Platform Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">New rep registration: Sarah Johnson (Marketing)</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">Payment processed: TechCorp subscription renewed</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">ID verification pending: Mike Chen (Sales Rep)</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">Campaign completed: SaaS Startup outreach</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
