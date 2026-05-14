"use client";

import { useState, useEffect } from 'react';

interface Earning {
  id: string;
  campaignId: string;
  campaignName: string;
  clientName: string;
  amount: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  paidAt?: string;
  paymentMethod?: string;
  notes?: string;
}

interface MonthlyStats {
  month: string;
  earnings: number;
  campaigns: number;
  hoursWorked: number;
}

export default function RepEarningsPage() {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'pending' | 'paid'>('all');

  useEffect(() => {
    // TODO: Fetch real earnings data from API
    const fetchEarnings = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setEarnings([
          {
            id: '1',
            campaignId: '1',
            campaignName: 'Tech SaaS Outreach',
            clientName: 'TechCorp Inc.',
            amount: 850.00,
            currency: 'USD',
            periodStart: '2024-01-01',
            periodEnd: '2024-01-31',
            status: 'paid',
            paidAt: '2024-02-05',
            paymentMethod: 'bank_transfer'
          },
          {
            id: '2',
            campaignId: '2',
            campaignName: 'Finance Companies',
            clientName: 'FinanceHub',
            amount: 600.00,
            currency: 'USD',
            periodStart: '2024-01-01',
            periodEnd: '2024-01-31',
            status: 'paid',
            paidAt: '2024-02-05',
            paymentMethod: 'bank_transfer'
          },
          {
            id: '3',
            campaignId: '1',
            campaignName: 'Tech SaaS Outreach',
            clientName: 'TechCorp Inc.',
            amount: 850.00,
            currency: 'USD',
            periodStart: '2024-02-01',
            periodEnd: '2024-02-29',
            status: 'pending',
            notes: 'Payment processing - expected by March 5th'
          },
          {
            id: '4',
            campaignId: '3',
            campaignName: 'Healthcare Startups',
            clientName: 'MediTech Solutions',
            amount: 475.00,
            currency: 'USD',
            periodStart: '2024-02-01',
            periodEnd: '2024-02-29',
            status: 'processing'
          }
        ]);

        setMonthlyStats([
          { month: '2024-01', earnings: 1450.00, campaigns: 2, hoursWorked: 120 },
          { month: '2024-02', earnings: 1325.00, campaigns: 2, hoursWorked: 110 },
          { month: '2023-12', earnings: 980.00, campaigns: 1, hoursWorked: 85 },
          { month: '2023-11', earnings: 1200.00, campaigns: 2, hoursWorked: 100 }
        ]);
      } catch (error) {
        console.error('Failed to fetch earnings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  const filteredEarnings = earnings.filter(earning => {
    if (selectedPeriod === 'all') return true;
    return earning.status === selectedPeriod;
  });

  const totalEarnings = filteredEarnings.reduce((sum, earning) => sum + earning.amount, 0);
  const pendingEarnings = filteredEarnings.filter(e => e.status === 'pending' || e.status === 'processing')
    .reduce((sum, earning) => sum + earning.amount, 0);
  const paidEarnings = filteredEarnings.filter(e => e.status === 'paid')
    .reduce((sum, earning) => sum + earning.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-400 border-green-500';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      case 'processing': return 'bg-blue-500/20 text-blue-400 border-blue-500';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const getPaymentMethodIcon = (method?: string) => {
    switch (method) {
      case 'bank_transfer': return '🏦';
      case 'paypal': return '💳';
      case 'crypto': return '₿';
      default: return '💰';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-muted rounded-lg p-6">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              ))}
            </div>
            <div className="space-y-6">
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
            <h1 className="text-3xl font-bold text-white">Earnings</h1>
            <p className="text-muted-foreground">Track your income and payment history</p>
          </div>
          <button className="px-6 py-3 bg-accent-1 text-white rounded-lg hover:bg-accent-2 transition-colors">
            Withdraw Funds
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold text-white">${totalEarnings.toLocaleString()}</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">${pendingEarnings.toLocaleString()}</p>
              </div>
              <div className="text-3xl">⏳</div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold text-green-400">${paidEarnings.toLocaleString()}</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
        </div>

        {/* Monthly Chart */}
        <div className="bg-card rounded-lg p-6 border border-accent-3/20 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Monthly Earnings</h2>
          <div className="space-y-4">
            {monthlyStats.map((stat) => (
              <div key={stat.month} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">
                      {new Date(stat.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <span className="text-sm font-bold text-white">${stat.earnings.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-accent-1 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(stat.earnings / 2000) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{stat.campaigns} campaigns</span>
                    <span>{stat.hoursWorked} hours</span>
                    <span>${(stat.earnings / stat.hoursWorked).toFixed(2)}/hr</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8">
          {(['all', 'pending', 'paid'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedPeriod(status)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                selectedPeriod === status
                  ? 'bg-accent-1 text-white'
                  : 'bg-muted text-muted-foreground hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Earnings List */}
        <div className="space-y-6">
          {filteredEarnings.map((earning) => (
            <div key={earning.id} className="bg-card rounded-lg p-6 border border-accent-3/20">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{earning.campaignName}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(earning.status)}`}>
                      {earning.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Client: {earning.clientName}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>📅 {new Date(earning.periodStart).toLocaleDateString()} - {new Date(earning.periodEnd).toLocaleDateString()}</span>
                    <span>💵 {earning.currency}</span>
                    {earning.paidAt && (
                      <span>✅ Paid on {new Date(earning.paidAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  {earning.paymentMethod && (
                    <div className="flex items-center gap-2 mt-2">
                      <span>{getPaymentMethodIcon(earning.paymentMethod)}</span>
                      <span className="text-sm text-muted-foreground">
                        {earning.paymentMethod.replace('_', ' ').charAt(0).toUpperCase() + earning.paymentMethod.slice(1)}
                      </span>
                    </div>
                  )}
                  {earning.notes && (
                    <p className="text-sm text-muted-foreground mt-2 italic">{earning.notes}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">${earning.amount.toLocaleString()}</div>
                  {earning.status === 'pending' && (
                    <button className="mt-2 px-4 py-2 bg-muted text-white rounded-lg hover:bg-accent-1/20 transition-colors text-sm">
                      View Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEarnings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-white mb-2">No earnings found</h3>
            <p className="text-muted-foreground">
              {selectedPeriod === 'all' 
                ? "You haven't earned any income yet."
                : `No ${selectedPeriod} earnings found.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
