"use client";

import { useState, useEffect } from 'react';
import { fetchAdminLeads, type AdminLead } from '@/lib/api';

const ACTIVITY_STYLES: Record<string, string> = {
  CONNECTION_ACCEPTED: 'border-accent-2 text-accent-2 bg-accent-2/10',
  MEETING_BOOKED: 'border-accent-3 text-accent-3 bg-accent-3/10',
  DM_REPLIED: 'border-accent-1 text-accent-1 bg-accent-1/10',
  CONNECTION_SENT: 'border-accent-5 text-accent-5 bg-accent-5/10',
  DM_SENT: 'border-white/20 text-white/40 bg-white/5',
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function LeadVaultPage() {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchAdminLeads({ page: 1 })
      .then(({ leads: data, total: t }) => { setLeads(data); setTotal(t); })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

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
          <p className="text-xs font-black uppercase tracking-[0.4em] text-accent-1">Resource / Lead_Vault</p>
          <h1 className="text-5xl font-black uppercase headline-shadow">Prospect Intelligence</h1>
          <p className="text-lg text-white/60 max-w-2xl">
            Real-time synchronization of all prospects engaged by your ID-verified rep squad.
          </p>
        </header>

        <div className="max-section border-accent-2 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-4 border-white/10 bg-white/5">
                  {["ID", "Prospect", "Company", "Status", "Source Rep", "Detected"].map((head, i) => (
                    <th key={head} className={`p-6 text-xs font-black uppercase tracking-widest text-accent-${(i % 5) + 1}`}>
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className="group border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="p-6 text-xs font-bold font-mono text-white/40">{lead.id.slice(-6)}</td>
                    <td className="p-6">
                      <p className="font-black uppercase tracking-tight text-white group-hover:text-accent-2 transition-colors">
                        {lead.prospectName || 'Unknown Prospect'}
                      </p>
                      <p className="text-xs text-white/40 font-bold uppercase truncate max-w-[200px]">{lead.prospectUrl || 'No URL'}</p>
                    </td>
                    <td className="p-6 text-sm font-bold text-white/80">{lead.campaign.name}</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full border-2 text-[10px] font-black uppercase tracking-widest ${ACTIVITY_STYLES[lead.activityType] || "border-white/20 text-white/40"}`}>
                        {lead.activityType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-accent-5 border border-white/20" />
                        <span className="text-xs font-black uppercase text-white/70">{lead.campaign.rep?.user.email.split('@')[0] || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="p-6 text-xs font-bold text-white/30 uppercase">{timeAgo(lead.occurredAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap gap-4">
          <button className="text-xs font-black uppercase tracking-widest px-6 py-2 rounded-full border-2 border-accent-1 text-accent-1 hover:bg-accent-1/10 transition-colors">Export CSV</button>
          <button className="text-xs font-black uppercase tracking-widest px-6 py-2 rounded-full border-2 border-accent-2 text-accent-2 hover:bg-accent-2/10 transition-colors">
            Sync CRM
          </button>
        </div>
      </div>
    </div>
  );
}
