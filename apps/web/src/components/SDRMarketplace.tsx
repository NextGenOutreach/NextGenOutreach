"use client";

import React, { useState, useMemo } from 'react';
import { MaxCard } from './ui/MaxCard';
import { MaxButton } from './ui/MaxButton';
import { FEATURED_REPS, NICHES, type RepProfile, type RepAvailability } from '@/data/reps';

const accents = ["var(--accent-1)", "var(--accent-2)", "var(--accent-3)", "var(--accent-4)", "var(--accent-5)"];

const TIER_LABEL: Record<string, string> = {
  growth_commander: "Growth Commander",
  vanguard: "Vanguard",
  scout: "Scout",
  recruit: "Recruit",
};

const AVAILABILITY_LABEL: Record<RepAvailability, string> = {
  available: "Available",
  limited: "Limited slots",
  unavailable: "Unavailable",
};

const AVAILABILITY_COLOR: Record<RepAvailability, string> = {
  available: "var(--accent-2)",
  limited: "var(--accent-5)",
  unavailable: "rgba(255,255,255,0.3)",
};

function RepCard({ rep, idx }: { rep: RepProfile; idx: number }) {
  return (
    <MaxCard
      accentColor={accents[idx % accents.length]}
      shadowColor={accents[(idx + 1) % accents.length]}
      dashed={idx % 2 === 0}
      className="flex flex-col justify-between gap-6"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-black uppercase tracking-tight text-white leading-tight">{rep.name}</h3>
              {rep.verified && (
                <span className="text-accent-2 text-sm" title="ID Verified">✓</span>
              )}
            </div>
            <p className="text-xs font-bold text-white/50 leading-snug">{rep.tagline}</p>
          </div>
          <span
            className="shrink-0 text-[9px] font-black uppercase tracking-[0.15em] px-2 py-1 rounded-full border whitespace-nowrap"
            style={{
              borderColor: rep.tier === "growth_commander" ? "var(--accent-1)" : "rgba(255,255,255,0.25)",
              color: rep.tier === "growth_commander" ? "var(--accent-1)" : "rgba(255,255,255,0.4)",
            }}
          >
            {TIER_LABEL[rep.tier]}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-5">
          <span
            className="inline-block w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: AVAILABILITY_COLOR[rep.availability] }}
          />
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: AVAILABILITY_COLOR[rep.availability] }}>
            {AVAILABILITY_LABEL[rep.availability]}
          </span>
          <span className="text-white/20 text-xs">·</span>
          <span className="text-[10px] font-bold text-white/40">{rep.location}</span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-5">
          <Stat label="Niche" value={rep.niche} color="var(--accent-2)" />
          <Stat label="Rating" value={`${rep.rating.toFixed(1)} ★ (${rep.reviewCount})`} color="var(--accent-3)" />
          <Stat label="Connect rate" value={`${(rep.acceptanceRate * 100).toFixed(0)}%`} color="var(--accent-1)" />
          <Stat label="Reply rate" value={`${(rep.replyRate * 100).toFixed(0)}%`} color="var(--accent-4)" />
          <Stat label="Followers" value={rep.linkedinFollowers >= 1000 ? `${(rep.linkedinFollowers / 1000).toFixed(1)}k` : String(rep.linkedinFollowers)} color="var(--accent-5)" />
          <Stat label="From" value={`$${rep.monthlyRate}/mo`} color="var(--accent-2)" />
        </div>

        <p className="text-[10px] font-bold text-white/35 tracking-wide">
          {rep.languages.join(" · ")}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <MaxButton
          fullWidth
          size="sm"
          href={`/contact?rep=${rep.id}&name=${encodeURIComponent(rep.name)}`}
        >
          Request This Rep →
        </MaxButton>
        <MaxButton fullWidth size="sm" variant="ghost" href={rep.linkedinUrl} target="_blank">
          View LinkedIn Profile
        </MaxButton>
      </div>
    </MaxCard>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
      {label}: <span style={{ color }}>{value}</span>
    </p>
  );
}

interface SDRMarketplaceProps {
  prefilterNiche?: string;
}

export const SDRMarketplace: React.FC<SDRMarketplaceProps> = ({ prefilterNiche }) => {
  const [nicheFilter, setNicheFilter] = useState(prefilterNiche ?? "all");
  const [availFilter, setAvailFilter] = useState<"all" | RepAvailability>("all");
  const [sortBy, setSortBy] = useState<"rating" | "rate" | "followers">("rating");

  const filtered = useMemo(() => {
    let reps = [...FEATURED_REPS];
    if (nicheFilter !== "all") reps = reps.filter((r) => r.niche === nicheFilter);
    if (availFilter !== "all") reps = reps.filter((r) => r.availability === availFilter);
    reps.sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "rate") return a.monthlyRate - b.monthlyRate;
      return b.linkedinFollowers - a.linkedinFollowers;
    });
    return reps;
  }, [nicheFilter, availFilter, sortBy]);

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-4 mb-10 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-accent-4">Niche</label>
          <select
            value={nicheFilter}
            onChange={(e) => setNicheFilter(e.target.value)}
            className="rounded-full border-2 border-accent-4 bg-background px-4 py-2 text-sm font-bold text-white focus:outline-dashed min-w-[160px]"
          >
            <option value="all">All niches</option>
            {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-accent-2">Availability</label>
          <select
            value={availFilter}
            onChange={(e) => setAvailFilter(e.target.value as "all" | RepAvailability)}
            className="rounded-full border-2 border-accent-2 bg-background px-4 py-2 text-sm font-bold text-white focus:outline-dashed min-w-[160px]"
          >
            <option value="all">Any availability</option>
            <option value="available">Available now</option>
            <option value="limited">Limited slots</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-accent-3">Sort by</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-full border-2 border-accent-3 bg-background px-4 py-2 text-sm font-bold text-white focus:outline-dashed min-w-[160px]"
          >
            <option value="rating">Top rated</option>
            <option value="rate">Lowest rate</option>
            <option value="followers">Most followers</option>
          </select>
        </div>

        <p className="text-sm font-black text-white/40 ml-auto self-end pb-1">
          {filtered.length} rep{filtered.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((rep, idx) => (
            <RepCard key={rep.id} rep={rep} idx={idx} />
          ))}
        </div>
      ) : (
        <MaxCard dashed accentColor="rgba(255,255,255,0.2)" className="text-center py-24">
          <p className="text-xl font-black uppercase tracking-widest text-white/40">
            No reps match those filters
          </p>
          <button
            onClick={() => { setNicheFilter("all"); setAvailFilter("all"); }}
            className="mt-4 text-sm font-bold text-accent-1 hover:underline"
          >
            Clear filters
          </button>
        </MaxCard>
      )}
    </div>
  );
};
