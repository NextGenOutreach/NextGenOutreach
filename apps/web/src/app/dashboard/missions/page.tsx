"use client";

import { DashboardLayout } from "@/components/DashboardLayout";

const mockMissions = [
  { id: "M-101", title: "SaaS Outreach v2", rep: "Rep Alpha", progress: 65, status: "Active", accent: "var(--accent-1)" },
  { id: "M-102", title: "Fintech Growth Batch", rep: "Rep Gamma", progress: 40, status: "Active", accent: "var(--accent-2)" },
  { id: "M-103", title: "Scale Up Campaign", rep: "Rep Alpha", progress: 90, status: "Concluding", accent: "var(--accent-3)" },
  { id: "M-104", title: "Experimental Reach", rep: "Rep Beta", progress: 15, status: "Paused", accent: "var(--accent-5)" },
];

export default function MissionsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-12">
        <header className="flex flex-col gap-4">
          <p className="text-xs font-black uppercase tracking-[0.4em] text-accent-2">Resource / Mission_Control</p>
          <h1 className="text-5xl font-black uppercase headline-shadow">Live Deployments</h1>
          <p className="text-lg text-white/60 max-w-2xl">
            Track active missions, performance progress, and human-led operator status.
          </p>
        </header>

        <div className="grid gap-10">
          {mockMissions.map((mission, i) => (
            <div 
              key={mission.id} 
              className="max-section border-accent-3 p-8 flex flex-col md:flex-row gap-8 items-center"
              style={{ transform: i % 2 === 0 ? "rotate(0.3deg)" : "rotate(-0.3deg)" }}
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{mission.id}</span>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black uppercase ${
                    mission.status === "Active" ? "border-accent-2 text-accent-2" : "border-white/20 text-white/20"
                  }`}>
                    {mission.status}
                  </span>
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tight">{mission.title}</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-white/40">Operator: <span className="text-white">{mission.rep}</span></p>
              </div>

              <div className="w-full md:w-1/3 space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Mission Progress</span>
                  <span className="text-xl font-black text-white">{mission.progress}%</span>
                </div>
                <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden border-2 border-white/5">
                  <div 
                    className="h-full bg-accent-2 shadow-[0_0_10px_#00f5d4] transition-all duration-1000" 
                    style={{ width: `${mission.progress}%`, backgroundColor: mission.accent }}
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
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
