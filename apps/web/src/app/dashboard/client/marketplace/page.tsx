"use client";

import { useState, useEffect, useCallback } from 'react';
import { fetchReps, type APIRep } from '@/lib/api';

export default function ClientMarketplacePage() {
  const [reps, setReps] = useState<APIRep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'followers' | 'rate'>('rating');
  const [maxRate, setMaxRate] = useState(200);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { reps: data } = await fetchReps({ industry: selectedIndustry, country: selectedLocation, sort: sortBy });
      setReps(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load marketplace');
    } finally {
      setIsLoading(false);
    }
  }, [selectedIndustry, selectedLocation, sortBy]);

  useEffect(() => { load(); }, [load]);

  const filteredReps = reps.filter(rep => {
    const matchesSearch = !searchTerm ||
      (rep.industry ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rep.bio ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rep.locationCountry ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRate = !rep.hourlyRateUsd || Number(rep.hourlyRateUsd) <= maxRate;
    return matchesSearch && matchesRate;
  });

  const AVAIL: Record<string, { color: string; label: string }> = {
    available: { color: 'var(--accent-2)', label: 'Available' },
    busy:      { color: 'var(--accent-3)', label: 'Busy' },
    offline:   { color: 'rgba(255,255,255,0.25)', label: 'Offline' },
  };

  const inputClass = "w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-accent-1/60 transition-colors";

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-white/60 font-bold mb-4">{error}</p>
          <button onClick={load} className="px-4 py-2 rounded-full border-2 border-accent-1 text-accent-1 text-xs font-black uppercase">Retry</button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-10">
        <div className="max-w-5xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded-xl w-1/3" />
          <div className="h-16 bg-white/5 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-56 bg-white/5 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Rep Marketplace</h1>
          <p className="text-white/40 font-bold mt-1">Find and hire vetted LinkedIn outreach professionals.</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reps, skills…"
            className={inputClass + ' placeholder:text-white/25'}
          />
          <select value={selectedIndustry} onChange={(e) => setSelectedIndustry(e.target.value)} className={inputClass}>
            <option value="all">All Industries</option>
            <option value="Technology">Technology</option>
            <option value="Finance">Finance</option>
            <option value="Healthcare">Healthcare</option>
            <option value="E-commerce">E-commerce</option>
          </select>
          <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className={inputClass}>
            <option value="all">All Locations</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Spain">Spain</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className={inputClass}>
            <option value="rating">Sort: Rating</option>
            <option value="followers">Sort: Followers</option>
            <option value="rate">Sort: Rate ↓</option>
          </select>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <label className="text-xs font-bold text-white/40 whitespace-nowrap">Max rate: <span className="text-accent-3">${maxRate}/hr</span></label>
          <input type="range" min="0" max="200" value={maxRate}
            onChange={(e) => setMaxRate(parseInt(e.target.value))}
            className="flex-1 accent-accent-3" />
        </div>

        <p className="text-[11px] font-black uppercase tracking-widest text-white/30 mb-4">
          {filteredReps.length} rep{filteredReps.length !== 1 ? 's' : ''}
        </p>

        {/* Rep cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReps.map((rep) => {
            const av = AVAIL[rep.availabilityStatus] ?? AVAIL.offline;
            const location = [rep.locationCity, rep.locationCountry].filter(Boolean).join(', ') || 'Location unknown';
            return (
              <div key={rep.id} className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">👤</span>
                    <div>
                      <h3 className="text-sm font-black text-white">{rep.industry ?? 'Outreach Rep'}</h3>
                      <p className="text-xs font-medium text-white/45">{location}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0" style={{ color: av.color, borderColor: av.color + '50', background: av.color + '15' }}>
                    {av.label}
                  </span>
                </div>

                {rep.bio && <p className="text-xs font-medium text-white/50 leading-relaxed line-clamp-2">{rep.bio}</p>}

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/[0.04] rounded-xl p-2.5">
                    <p className="text-[10px] font-black uppercase text-white/35 mb-0.5">Rating</p>
                    <p className="text-sm font-black text-accent-3">{Number(rep.rating).toFixed(1)} ⭐</p>
                  </div>
                  <div className="bg-white/[0.04] rounded-xl p-2.5">
                    <p className="text-[10px] font-black uppercase text-white/35 mb-0.5">Followers</p>
                    <p className="text-sm font-black text-accent-2">{rep.linkedinFollowers >= 1000 ? `${(rep.linkedinFollowers / 1000).toFixed(0)}k` : rep.linkedinFollowers}</p>
                  </div>
                  <div className="bg-white/[0.04] rounded-xl p-2.5">
                    <p className="text-[10px] font-black uppercase text-white/35 mb-0.5">Rate</p>
                    <p className="text-sm font-black text-accent-4">{rep.hourlyRateUsd ? `$${Number(rep.hourlyRateUsd)}/hr` : 'TBD'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-white/30">
                  <span>👥 Max {rep.maxClients} clients</span>
                  <span>❤️ {rep.totalReviews} reviews</span>
                </div>

                <div className="flex gap-2">
                  <button
                    className="flex-1 text-[11px] font-black uppercase py-2 rounded-full text-background transition-opacity hover:opacity-90"
                    style={{ background: 'var(--accent-1)' }}
                  >
                    Hire Now
                  </button>
                  <button className="px-4 py-2 rounded-full text-[11px] font-black uppercase border-2 border-white/15 text-white/50 hover:border-white/30 transition-colors">
                    Profile
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredReps.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-3xl">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">No reps found</h3>
            <p className="text-sm font-medium text-white/40">Adjust your filters to find the right match.</p>
          </div>
        )}
      </div>
    </div>
  );
}
