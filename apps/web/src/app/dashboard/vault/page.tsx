"use client";

import { DashboardLayout } from "@/components/DashboardLayout";

const mockLeads = [
  { id: "L-902", name: "Sarah Chen", company: "Aether AI", role: "CTO", status: "Interested", rep: "Rep Alpha", date: "2h ago" },
  { id: "L-844", name: "Marcus Thorne", company: "NeoBank", role: "VP Engineering", status: "Meeting Booked", rep: "Rep Gamma", date: "5h ago" },
  { id: "L-721", name: "Elena Rossi", company: "CloudScale", role: "Founder", status: "Nurturing", rep: "Rep Beta", date: "1d ago" },
  { id: "L-609", name: "David Wu", company: "SwiftLogic", role: "Head of Growth", status: "Interested", rep: "Rep Alpha", date: "2d ago" },
  { id: "L-552", name: "Jasmine Kaur", company: "BrightFuture", role: "COO", status: "Replied", rep: "Rep Delta", date: "3d ago" },
];

const statusStyles: Record<string, string> = {
  "Interested": "border-accent-2 text-accent-2 bg-accent-2/10",
  "Meeting Booked": "border-accent-3 text-accent-3 bg-accent-3/10 shadow-[0_0_10px_#ffe600]",
  "Nurturing": "border-accent-5 text-accent-5 bg-accent-5/10",
  "Replied": "border-accent-1 text-accent-1 bg-accent-1/10",
};

export default function LeadVaultPage() {
  return (
    <DashboardLayout>
      <div className="space-y-10">
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
                {mockLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className="group border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="p-6 text-xs font-bold font-mono text-white/40">{lead.id}</td>
                    <td className="p-6">
                      <p className="font-black uppercase tracking-tight text-white group-hover:text-accent-2 transition-colors">
                        {lead.name}
                      </p>
                      <p className="text-xs text-white/40 font-bold uppercase">{lead.role}</p>
                    </td>
                    <td className="p-6 text-sm font-bold text-white/80">{lead.company}</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full border-2 text-[10px] font-black uppercase tracking-widest ${statusStyles[lead.status] || "border-white/20 text-white/40"}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-accent-5 border border-white/20" />
                        <span className="text-xs font-black uppercase text-white/70">{lead.rep}</span>
                      </div>
                    </td>
                    <td className="p-6 text-xs font-bold text-white/30 uppercase">{lead.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap gap-4">
          <button className="max-button text-xs py-2">Export Data (CSV)</button>
          <button className="rounded-full border-4 border-accent-2 px-6 py-2 text-xs font-black uppercase tracking-widest hover:bg-accent-2 hover:text-background transition-all">
            Sync CRM
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
