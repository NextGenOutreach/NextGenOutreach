"use client";

import { useState, useEffect } from 'react';
import { fetchAdminEarnings, payEarning, type AdminEarning } from '@/lib/api';

export default function AdminEarningsPage() {
  const [earnings, setEarnings] = useState<AdminEarning[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    fetchAdminEarnings({ page: 1 })
      .then(({ earnings: data, total: t }) => { setEarnings(data); setTotal(t); })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handlePay = async (id: string) => {
    setActionLoading(id);
    try {
      await payEarning(id);
      setEarnings(prev => prev.map(e => e.id === id ? { ...e, status: 'paid' } : e));
    } catch (err) {
      alert('Failed to mark as paid');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-10">
        <div className="max-w-5xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded-xl w-1/3" />
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-white/5 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="flex flex-col gap-4">
          <p className="text-xs font-black uppercase tracking-[0.4em] text-accent-5">Admin / Financials</p>
          <h1 className="text-5xl font-black uppercase headline-shadow">Earnings Audit</h1>
          <p className="text-lg text-white/60 max-w-2xl">
            Review and approve platform-wide rep earnings and pending payouts.
          </p>
        </header>

        <div className="max-section border-accent-5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-4 border-white/10 bg-white/5">
                  {["Rep", "Campaign", "Client", "Amount", "Period", "Status", "Action"].map((head, i) => (
                    <th key={head} className={`p-6 text-xs font-black uppercase tracking-widest text-accent-${(i % 5) + 1}`}>
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {earnings.map((earning) => (
                  <tr 
                    key={earning.id} 
                    className="group border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-6">
                      <p className="font-black text-white">{earning.rep.user.email.split('@')[0]}</p>
                      <p className="text-[10px] text-white/40 font-bold uppercase">{earning.rep.user.email}</p>
                    </td>
                    <td className="p-6 text-sm font-bold text-white/80">{earning.campaign.name}</td>
                    <td className="p-6 text-sm font-bold text-white/60">{earning.client.companyName || 'Unknown'}</td>
                    <td className="p-6">
                      <span className="text-lg font-black text-accent-3">${Number(earning.amountUsd).toFixed(2)}</span>
                    </td>
                    <td className="p-6 text-xs font-bold text-white/30 uppercase">
                      {new Date(earning.periodStart).toLocaleDateString()} - {new Date(earning.periodEnd).toLocaleDateString()}
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full border-2 text-[10px] font-black uppercase tracking-widest ${
                        earning.status === 'paid' ? 'border-accent-2 text-accent-2 bg-accent-2/10' : 'border-accent-4 text-accent-4 bg-accent-4/10'
                      }`}>
                        {earning.status}
                      </span>
                    </td>
                    <td className="p-6">
                      {earning.status !== 'paid' && (
                        <button
                          disabled={actionLoading === earning.id}
                          onClick={() => handlePay(earning.id)}
                          className="text-[10px] font-black uppercase px-3 py-1.5 rounded-full border-2 border-accent-2 text-accent-2 hover:bg-accent-2/10 transition-all"
                        >
                          {actionLoading === earning.id ? '…' : 'Mark Paid'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {earnings.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-3xl">
            <p className="text-white/30 font-bold uppercase tracking-widest">No earning records found</p>
          </div>
        )}
      </div>
    </div>
  );
}
