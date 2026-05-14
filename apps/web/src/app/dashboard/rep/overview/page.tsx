"use client";

import { useState, useEffect } from 'react';

export default function RepOverviewPage() {
  const [stats, setStats] = useState({
    activeClients: 2,
    tasksDueToday: 15,
    connectionsThisWeek: 68,
    earningsThisMonth: 1250
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch real dashboard data from API
    const fetchDashboardData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          activeClients: 2,
          tasksDueToday: 15,
          connectionsThisWeek: 68,
          earningsThisMonth: 1250
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
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
          <h1 className="text-3xl font-bold text-white">Rep Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your outreach overview.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Clients</p>
                <p className="text-2xl font-bold text-white">{stats.activeClients}</p>
              </div>
              <div className="p-3 bg-accent-1/20 rounded-lg">
                <div className="w-6 h-6 bg-accent-1 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasks Due Today</p>
                <p className="text-2xl font-bold text-white">{stats.tasksDueToday}</p>
              </div>
              <div className="p-3 bg-accent-2/20 rounded-lg">
                <div className="w-6 h-6 bg-accent-2 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Connections This Week</p>
                <p className="text-2xl font-bold text-white">{stats.connectionsThisWeek}</p>
              </div>
              <div className="p-3 bg-accent-3/20 rounded-lg">
                <div className="w-6 h-6 bg-accent-3 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Earnings This Month</p>
                <p className="text-2xl font-bold text-white">${stats.earningsThisMonth.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-accent-4/20 rounded-lg">
                <div className="w-6 h-6 bg-accent-4 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <h2 className="text-xl font-semibold text-white mb-4">Today's Tasks</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <span className="text-white">TechCorp Campaign</span>
                  <p className="text-sm text-muted-foreground">Send 15 connection requests</p>
                </div>
                <button className="px-3 py-1 bg-accent-1 text-white rounded hover:bg-accent-2">
                  Start
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <span className="text-white">SaaS Startup</span>
                  <p className="text-sm text-muted-foreground">Follow up on 8 DMs</p>
                </div>
                <button className="px-3 py-1 bg-accent-1 text-white rounded hover:bg-accent-2">
                  Start
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <span className="text-white">Finance Client</span>
                  <p className="text-sm text-muted-foreground">Post LinkedIn content</p>
                </div>
                <button className="px-3 py-1 bg-accent-1 text-white rounded hover:bg-accent-2">
                  Start
                </button>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Completed 12 connection requests</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Received 5 connection acceptances</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">New campaign assignment received</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Earnings payment processed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Browser Session Status */}
        <div className="mt-8 bg-card rounded-lg p-6 border border-accent-3/20">
          <h2 className="text-xl font-semibold text-white mb-4">Browser Session</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Secure Browser Environment</p>
              <p className="text-sm text-muted-foreground">Ready for LinkedIn outreach tasks</p>
            </div>
            <button className="px-4 py-2 bg-accent-1 text-white rounded-lg hover:bg-accent-2">
              Launch Browser
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
