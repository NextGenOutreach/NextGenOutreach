"use client";

import { useState, useEffect } from 'react';
import { fetchAdminLeads, type AdminLead, fetchRepProfile, APIRepProfile, updateRepProfile, uploadIdDocument, syncCRM } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import MaxCard from '@/components/ui/MaxCard';
import MaxButton from '@/components/ui/MaxButton';

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
  const { user } = useAuth();
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [profile, setProfile] = useState<APIRepProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!user) return;

    if (user.role === 'rep') {
      fetchRepProfile()
        .then(setProfile)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      fetchAdminLeads({ page: 1 })
        .then(({ leads: data, total: t }) => { setLeads(data); setTotal(t); })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [user]);

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadIdDocument(file);
      // Reload profile to show pending status
      const data = await fetchRepProfile();
      setProfile(data);
      alert('ID document uploaded successfully and pending review.');
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSyncCRM = async () => {
    setIsSyncing(true);
    try {
      const res = await syncCRM();
      alert(res.message);
    } catch (err: any) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
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

  if (user?.role === 'rep') {
    return (
      <div className="min-h-screen bg-background p-6 md:p-10">
        <div className="max-w-4xl mx-auto space-y-10">
          <header className="flex flex-col gap-4">
            <p className="text-xs font-black uppercase tracking-[0.4em] text-accent-3">Security / Verification</p>
            <h1 className="text-5xl font-black uppercase headline-shadow">Identity Vault</h1>
            <p className="text-lg text-white/60 max-w-2xl">
              Securely manage your identity documents and verification status.
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-8">
            <MaxCard className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-tight text-white">ID Verification</h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  profile?.idVerified ? 'bg-green-500/20 text-green-500' : 'bg-accent-3/20 text-accent-3'
                }`}>
                  {profile?.idVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
              
              <p className="text-sm font-medium text-white/50 leading-relaxed">
                To protect our clients and maintain marketplace integrity, all reps must verify their identity. Upload a clear photo of your National ID or Passport.
              </p>

              {!profile?.idVerified && (
                <div className="pt-4">
                  <label className="block">
                    <span className="sr-only">Choose ID photo</span>
                    <input 
                      type="file" 
                      onChange={handleIdUpload}
                      disabled={isUploading}
                      className="block w-full text-sm text-white/50
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-xs file:font-black file:uppercase file:tracking-widest
                        file:bg-accent-3 file:text-white
                        hover:file:bg-accent-3/80
                        cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </label>
                  {isUploading && (
                    <p className="text-[10px] font-black uppercase tracking-widest text-accent-3 mt-3 animate-pulse">
                      Uploading document...
                    </p>
                  )}
                </div>
              )}

              {profile?.idVerified && (
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <span className="text-xl">✅</span>
                  <div>
                    <p className="text-xs font-black text-green-500 uppercase">Verification Complete</p>
                    <p className="text-[10px] font-bold text-white/40 mt-0.5">Your identity has been confirmed by our compliance team.</p>
                  </div>
                </div>
              )}
            </MaxCard>

            <MaxCard className="p-8 space-y-6 border-dashed border-accent-1/30 bg-accent-1/[0.02]">
              <h3 className="text-xl font-black uppercase tracking-tight text-accent-1">Why Verify?</h3>
              <ul className="space-y-4">
                {[
                  { icon: '🎯', title: 'Better Matching', body: 'Verified reps are prioritized in client searches.' },
                  { icon: '💸', title: 'Unlock Payouts', body: 'ID verification is required to receive earnings.' },
                  { icon: '🛡️', title: 'Account Safety', body: 'Protects your profile from unauthorized access.' },
                ].map((item) => (
                  <li key={item.title} className="flex gap-4">
                    <span className="text-xl shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-sm font-black text-white uppercase tracking-tight">{item.title}</p>
                      <p className="text-xs font-medium text-white/40 mt-0.5 leading-relaxed">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </MaxCard>
          </div>
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
          <button 
            onClick={handleSyncCRM}
            disabled={isSyncing}
            className="text-xs font-black uppercase tracking-widest px-6 py-2 rounded-full border-2 border-accent-2 text-accent-2 hover:bg-accent-2/10 transition-colors disabled:opacity-50"
          >
            {isSyncing ? 'Syncing...' : 'Sync CRM'}
          </button>
        </div>
      </div>
    </div>
  );
}
