"use client";

import { useState, useEffect } from 'react';
import { fetchCampaigns, type APICampaign } from '@/lib/api';

export default function MissionsPage() {
  const [campaigns, setCampaigns] = useState<APICampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns()
      .then(({ campaigns: data }) => setCampaigns(data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-10">
        <div className="max-w-5xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded-xl w-1/3" />
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="flex flex-col gap-4">
          <p className="text-xs font-black uppercase tracking-[0.4em] text-accent-2">Resource / Mission_Control</p>
          <h1 className="text-5xl font-black uppercase headline-shadow">Live Deployments</h1>
          <p className="text-lg text-white/60 max-w-2xl">
            Track active missions, performance progress, and human-led operator status.
          </p>
        </header>

        <div className="grid gap-10">
          {campaigns.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-3xl">
              <p className="text-white/30 font-bold uppercase tracking-widest">No active missions found</p>
            </div>
          ) : (
            campaigns.map((mission, i) => {
              const progress = Math.min(100, Math.round((mission._count.activities / (mission.dailyLimit * 30)) * 100));
              return (
                <div 
                  key={mission.id} 
                  className="max-section border-accent-3 p-8 flex flex-col md:flex-row gap-8 items-center"
                  style={{ transform: i % 2 === 0 ? "rotate(0.3deg)" : "rotate(-0.3deg)" }}
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{mission.id.slice(-6)}</span>
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black uppercase ${
                        mission.status === "ACTIVE" ? "border-accent-2 text-accent-2" : "border-white/20 text-white/20"
                      }`}>
                        {mission.status}
                      </span>
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tight">{mission.name}</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/40">Operator: <span className="text-white">{mission.rep?.id ? 'Human Agent' : 'Unassigned'}</span></p>
                  </div>

                  <div className="w-full md:w-1/3 space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Target Progress</span>
                      <span className="text-xl font-black text-white">{progress}%</span>
                    </div>
                    <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden border-2 border-white/5">
                      <div 
                        className="h-full bg-accent-2 shadow-[0_0_10px_#00f5d4] transition-all duration-1000" 
                        style={{ width: `${progress}%`, backgroundColor: `var(--accent-${(i % 5) + 1})` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button className="max-button py-2 px-6 text-xs">Audit Logs</button>
                    <button className="p-3 rounded-full border-4 border-white/10 hover:border-accent-4 transition-all group">
                      <div className="w-2 h-2 rounded-full bg-white group-hover:bg-accent-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
