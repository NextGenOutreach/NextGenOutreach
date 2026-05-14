"use client";

import { useState, useEffect } from 'react';

export default function ClientOverviewPage() {
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    connectionsSent: 0,
    meetingsBooked: 0,
    pipelineValue: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch real dashboard data from API
    const fetchDashboardData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          activeCampaigns: 3,
          connectionsSent: 127,
          meetingsBooked: 8,
          pipelineValue: 240000
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
          <h1 className="text-3xl font-bold text-white">Client Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your outreach overview.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold text-white">{stats.activeCampaigns}</p>
              </div>
              <div className="p-3 bg-accent-1/20 rounded-lg">
                <div className="w-6 h-6 bg-accent-1 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Connections Sent</p>
                <p className="text-2xl font-bold text-white">{stats.connectionsSent}</p>
              </div>
              <div className="p-3 bg-accent-2/20 rounded-lg">
                <div className="w-6 h-6 bg-accent-2 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Meetings Booked</p>
                <p className="text-2xl font-bold text-white">{stats.meetingsBooked}</p>
              </div>
              <div className="p-3 bg-accent-3/20 rounded-lg">
                <div className="w-6 h-6 bg-accent-3 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pipeline Value</p>
                <p className="text-2xl font-bold text-white">${stats.pipelineValue.toLocaleString()}</p>
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
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-muted rounded-lg hover:bg-accent-1/20 transition-colors">
                <span className="text-white">Create New Campaign</span>
              </button>
              <button className="w-full text-left px-4 py-3 bg-muted rounded-lg hover:bg-accent-1/20 transition-colors">
                <span className="text-white">Browse Rep Marketplace</span>
              </button>
              <button className="w-full text-left px-4 py-3 bg-muted rounded-lg hover:bg-accent-1/20 transition-colors">
                <span className="text-white">View Analytics</span>
              </button>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Campaign "Tech Outreach" launched</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">15 new connections sent</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Meeting scheduled with prospect</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
