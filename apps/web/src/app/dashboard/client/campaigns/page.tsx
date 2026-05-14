"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  type: 'connections' | 'dms' | 'posts' | 'mixed';
  repName?: string;
  connectionsSent: number;
  connectionsAccepted: number;
  meetingsBooked: number;
  startDate: string;
  endDate?: string;
  dailyLimit: number;
}

export default function ClientCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'completed'>('all');

  useEffect(() => {
    // TODO: Fetch real campaign data from API
    const fetchCampaigns = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setCampaigns([
          {
            id: '1',
            name: 'Tech SaaS Outreach',
            status: 'active',
            type: 'mixed',
            repName: 'Sarah Johnson',
            connectionsSent: 127,
            connectionsAccepted: 45,
            meetingsBooked: 8,
            startDate: '2024-01-15',
            dailyLimit: 40
          },
          {
            id: '2',
            name: 'Finance Companies',
            status: 'active',
            type: 'connections',
            repName: 'Mike Chen',
            connectionsSent: 89,
            connectionsAccepted: 32,
            meetingsBooked: 5,
            startDate: '2024-01-20',
            dailyLimit: 30
          },
          {
            id: '3',
            name: 'Healthcare Startups',
            status: 'draft',
            type: 'dms',
            connectionsSent: 0,
            connectionsAccepted: 0,
            meetingsBooked: 0,
            startDate: new Date().toISOString().split('T')[0],
            dailyLimit: 25
          },
          {
            id: '4',
            name: 'E-commerce Leads',
            status: 'completed',
            type: 'connections',
            repName: 'Emily Davis',
            connectionsSent: 234,
            connectionsAccepted: 89,
            meetingsBooked: 15,
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            dailyLimit: 50
          }
        ]);
      } catch (error) {
        console.error('Failed to fetch campaigns:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter(campaign => {
    if (filter === 'all') return true;
    return campaign.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500';
      case 'draft': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      case 'paused': return 'bg-orange-500/20 text-orange-400 border-orange-500';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'connections': return '🤝';
      case 'dms': return '💬';
      case 'posts': return '📝';
      case 'mixed': return '🔄';
      default: return '📊';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 gap-6">
              {[...Array(4)].map((_, i) => (
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
            <h1 className="text-3xl font-bold text-white">Campaigns</h1>
            <p className="text-muted-foreground">Manage your LinkedIn outreach campaigns</p>
          </div>
          <Link 
            href="/dashboard/client/campaigns/create"
            className="px-6 py-3 bg-accent-1 text-white rounded-lg hover:bg-accent-2 transition-colors"
          >
            Create Campaign
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8">
          {(['all', 'active', 'draft', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                filter === status
                  ? 'bg-accent-1 text-white'
                  : 'bg-muted text-muted-foreground hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Campaigns List */}
        <div className="space-y-6">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="bg-card rounded-lg p-6 border border-accent-3/20">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{campaign.name}</h3>
                    <span className="text-2xl">{getTypeIcon(campaign.type)}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>
                  {campaign.repName && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Assigned to: <span className="text-white">{campaign.repName}</span>
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Started: {new Date(campaign.startDate).toLocaleDateString()}</span>
                    {campaign.endDate && (
                      <span>Ended: {new Date(campaign.endDate).toLocaleDateString()}</span>
                    )}
                    <span>Daily Limit: {campaign.dailyLimit}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link 
                    href={`/dashboard/client/campaigns/${campaign.id}`}
                    className="px-4 py-2 bg-muted text-white rounded-lg hover:bg-accent-1/20 transition-colors"
                  >
                    View Details
                  </Link>
                  {campaign.status === 'active' && (
                    <button className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors">
                      Pause
                    </button>
                  )}
                  {campaign.status === 'paused' && (
                    <button className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">
                      Resume
                    </button>
                  )}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{campaign.connectionsSent}</div>
                  <div className="text-sm text-muted-foreground">Connections Sent</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-accent-2">{campaign.connectionsAccepted}</div>
                  <div className="text-sm text-muted-foreground">Connections Accepted</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-accent-1">{campaign.meetingsBooked}</div>
                  <div className="text-sm text-muted-foreground">Meetings Booked</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-accent-3">
                    {campaign.connectionsSent > 0 
                      ? Math.round((campaign.connectionsAccepted / campaign.connectionsSent) * 100)
                      : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Acceptance Rate</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">No campaigns found</h3>
            <p className="text-muted-foreground mb-6">
              {filter === 'all' 
                ? "You haven't created any campaigns yet."
                : `No ${filter} campaigns found.`
              }
            </p>
            {filter === 'all' && (
              <Link 
                href="/dashboard/client/campaigns/create"
                className="px-6 py-3 bg-accent-1 text-white rounded-lg hover:bg-accent-2 transition-colors"
              >
                Create Your First Campaign
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
