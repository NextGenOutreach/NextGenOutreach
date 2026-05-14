"use client";

import { useState } from "react";

function SliderInput({
  label, value, min, max, step, format, color, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  format: (v: number) => string; color: string; onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-black uppercase tracking-widest text-white/55">{label}</span>
        <span className="text-sm font-black" style={{ color }}>{format(value)}</span>
      </div>
      <div className="relative h-2 rounded-full bg-white/10">
        <div className="absolute top-0 left-0 h-2 rounded-full transition-all duration-150" style={{ width: `${pct}%`, backgroundColor: color }} />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-white/25">{format(min)}</span>
        <span className="text-[10px] text-white/25">{format(max)}</span>
      </div>
    </div>
  );
}

const TIER_RATE: Record<string, number> = {
  recruit: 100,
  scout: 135,
  vanguard: 180,
  growth_commander: 240,
};

const TIER_LABEL: Record<string, string> = {
  recruit: "Recruit",
  scout: "Scout",
  vanguard: "Vanguard",
  growth_commander: "Growth Commander",
};

export function EarningsCalculator() {
  const [connsPerDay, setConnsPerDay] = useState(15);
  const [missions, setMissions] = useState(3);
  const [tier, setTier] = useState("scout");

  const ratePerMission = TIER_RATE[tier];
  const monthlyBase = missions * ratePerMission;
  const connsPerMonth = connsPerDay * 30 * missions;
  const bonusEstimate = Math.round(connsPerMonth * 0.004 * 10) * 10;
  const totalEstimate = monthlyBase + bonusEstimate;

  return (
    <div className="bg-background/60 border-4 border-accent-3 rounded-3xl p-8 md:p-10">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">💸</span>
        <h3 className="text-2xl font-black uppercase tracking-tight text-accent-3">Earnings Calculator</h3>
      </div>
      <p className="text-sm font-bold text-white/50 mb-8">
        Slide to see your projected monthly income based on your activity level.
      </p>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-7">
          <SliderInput
            label="Connections sent / day (per mission)"
            value={connsPerDay} min={5} max={50} step={1}
            format={(v) => `${v}/day`} color="var(--accent-3)"
            onChange={setConnsPerDay}
          />
          <SliderInput
            label="Active missions (clients)"
            value={missions} min={1} max={8} step={1}
            format={(v) => `${v} mission${v !== 1 ? "s" : ""}`} color="var(--accent-1)"
            onChange={setMissions}
          />

          <div>
            <span className="text-xs font-black uppercase tracking-widest text-white/55 block mb-3">Your tier</span>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(TIER_RATE).map((t) => (
                <button
                  key={t}
                  onClick={() => setTier(t)}
                  className="px-3 py-2 rounded-xl border-2 text-xs font-black uppercase tracking-wide transition-all"
                  style={{
                    borderColor: tier === t ? "var(--accent-3)" : "rgba(255,255,255,0.15)",
                    color: tier === t ? "var(--accent-3)" : "rgba(255,255,255,0.4)",
                    background: tier === t ? "rgba(0,245,212,0.08)" : "transparent",
                  }}
                >
                  {TIER_LABEL[t]}
                  <span className="block text-[10px] font-bold normal-case tracking-normal opacity-70 mt-0.5">
                    ${TIER_RATE[t]}/mission
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <div className="space-y-3">
            <ResultRow label="Base pay" value={`$${monthlyBase.toLocaleString()}/mo`} color="var(--accent-2)" />
            <ResultRow label="Connections sent / month" value={connsPerMonth.toLocaleString()} color="var(--accent-4)" />
            <ResultRow label="Performance bonus (est.)" value={`+$${bonusEstimate.toLocaleString()}`} color="var(--accent-5)" />
          </div>

          <div className="mt-6 bg-background/80 border-4 border-dashed border-accent-1 rounded-2xl p-6 text-center">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-accent-3 mb-2">
              Estimated Monthly Earnings
            </p>
            <p className="text-5xl font-black grad-text headline-shadow">
              ${totalEstimate.toLocaleString()}
            </p>
            <p className="text-xs font-bold text-white/35 mt-2">
              {missions} mission{missions !== 1 ? "s" : ""} · {TIER_LABEL[tier]} tier · {connsPerDay * 30} connections/mo
            </p>
          </div>

          <a
            href="https://wa.me/27606865738?text=Hi%2C%20I%27m%20interested%20in%20becoming%20a%20NextGenOutreach%20rep"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-3 w-full rounded-full border-4 border-green-500 bg-green-500/10 py-3 px-6 text-sm font-black uppercase tracking-wide text-green-400 hover:bg-green-500/20 transition-colors"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function ResultRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/10">
      <span className="text-xs font-bold text-white/50">{label}</span>
      <span className="text-sm font-black" style={{ color }}>{value}</span>
    </div>
  );
}
