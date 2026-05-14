"use client";

import { MetricCard } from "@/components/MetricCard";

const mockAgents = [
  { name: "Rep Alpha", niche: "SaaS / Fintech", acceptance: "42%", replies: "12%", status: "Active", missions: 4, color: "var(--accent-1)" },
  { name: "Rep Beta", niche: "E-commerce", acceptance: "38%", replies: "9%", status: "Active", missions: 2, color: "var(--accent-2)" },
  { name: "Rep Gamma", niche: "Professional Services", acceptance: "51%", replies: "15%", status: "Warning", missions: 5, color: "var(--accent-3)" },
  { name: "Rep Delta", niche: "HealthTech", acceptance: "29%", replies: "4%", status: "Inactive", missions: 0, color: "var(--accent-4)" },
];

export default function RepIntelligencePage() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="flex flex-col gap-4">
          <p className="text-xs font-black uppercase tracking-[0.4em] text-accent-5">Resource / Rep_Intelligence</p>
          <h1 className="text-5xl font-black uppercase headline-shadow">Tactical Squadron</h1>
          <p className="text-lg text-white/60 max-w-2xl">
            Monitor performance across your network of human-led outreach operators. 
          </p>
        </header>

        {/* Global Rep Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard label="Squad Strength" value="12 Reps" trend="↑ 1" accentColor="var(--accent-1)" />
          <MetricCard label="Avg Acceptance" value="38.4%" trend="↑ 2.1%" accentColor="var(--accent-2)" />
          <MetricCard label="Avg Reply Rate" value="11.2%" trend="↓ 0.5%" accentColor="var(--accent-4)" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {mockAgents.map((agent, i) => (
            <div 
              key={agent.name} 
              className="max-section p-8"
              style={{ 
                borderColor: agent.color,
                transform: i % 2 === 0 ? "rotate(0.5deg)" : "rotate(-0.5deg)",
              }}
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter mb-1 text-white">{agent.name}</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40">{agent.niche}</p>
                </div>
                <span className={`px-4 py-1 rounded-full border-2 text-[10px] font-black uppercase tracking-widest ${
                  agent.status === "Active" ? "border-accent-2 text-accent-2 bg-accent-2/10" : 
                  agent.status === "Warning" ? "border-accent-3 text-accent-3 bg-accent-3/10" : 
                  "border-white/20 text-white/20"
                }`}>
                  {agent.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white/5 border-2 border-dashed border-white/10 p-4 rounded-xl text-center">
                  <p className="text-[10px] font-black uppercase text-white/40 mb-1">Acceptance</p>
                  <p className="text-xl font-black text-white">{agent.acceptance}</p>
                </div>
                <div className="bg-white/5 border-2 border-dashed border-white/10 p-4 rounded-xl text-center">
                  <p className="text-[10px] font-black uppercase text-white/40 mb-1">Replies</p>
                  <p className="text-xl font-black text-white">{agent.replies}</p>
                </div>
                <div className="bg-white/5 border-2 border-dashed border-white/10 p-4 rounded-xl text-center">
                  <p className="text-[10px] font-black uppercase text-white/40 mb-1">Missions</p>
                  <p className="text-xl font-black text-white">{agent.missions}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 max-button py-2 text-xs">Mission Brief</button>
                <button className="px-6 py-2 rounded-full border-4 border-white/10 text-xs font-black uppercase hover:border-white/40 transition-all">Profile</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
