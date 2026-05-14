"use client";

import { useState, useEffect } from 'react';

interface Rep {
  id: string;
  name: string;
  avatar: string;
  industry: string;
  location: string;
  linkedinFollowers: number;
  rating: number;
  totalReviews: number;
  hourlyRate: number;
  availabilityStatus: 'available' | 'busy' | 'offline';
  bio: string;
  skills: string[];
  responseTime: string;
  languages: string[];
  completedCampaigns: number;
}

export default function ClientMarketplacePage() {
  const [reps, setReps] = useState<Rep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'followers' | 'price' | 'experience'>('rating');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);

  useEffect(() => {
    // TODO: Fetch real marketplace data from API
    const fetchReps = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setReps([
          {
            id: '1',
            name: 'Sarah Johnson',
            avatar: '👩‍💼',
            industry: 'Technology',
            location: 'United States',
            linkedinFollowers: 15000,
            rating: 4.9,
            totalReviews: 127,
            hourlyRate: 85,
            availabilityStatus: 'available',
            bio: 'Senior SDR with 5+ years experience in B2B tech sales. Specialized in SaaS and enterprise software.',
            skills: ['Lead Generation', 'Cold Outreach', 'Sales Strategy', 'CRM'],
            responseTime: '< 1 hour',
            languages: ['English', 'Spanish'],
            completedCampaigns: 89
          },
          {
            id: '2',
            name: 'Mike Chen',
            avatar: '👨‍💼',
            industry: 'Finance',
            location: 'United Kingdom',
            linkedinFollowers: 12000,
            rating: 4.8,
            totalReviews: 95,
            hourlyRate: 75,
            availabilityStatus: 'available',
            bio: 'Experienced financial services rep with deep understanding of fintech and banking sectors.',
            skills: ['Financial Sales', 'Relationship Management', 'Compliance', 'Risk Assessment'],
            responseTime: '< 2 hours',
            languages: ['English', 'Mandarin'],
            completedCampaigns: 67
          },
          {
            id: '3',
            name: 'Emily Davis',
            avatar: '👩‍💼',
            industry: 'Healthcare',
            location: 'Canada',
            linkedinFollowers: 8500,
            rating: 4.7,
            totalReviews: 73,
            hourlyRate: 95,
            availabilityStatus: 'busy',
            bio: 'Healthcare industry specialist with background in medical devices and pharma sales.',
            skills: ['Medical Sales', 'Healthcare Compliance', 'B2B Healthcare', 'Product Knowledge'],
            responseTime: '< 3 hours',
            languages: ['English', 'French'],
            completedCampaigns: 54
          },
          {
            id: '4',
            name: 'Alex Rodriguez',
            avatar: '👨‍💼',
            industry: 'E-commerce',
            location: 'Spain',
            linkedinFollowers: 20000,
            rating: 4.9,
            totalReviews: 142,
            hourlyRate: 80,
            availabilityStatus: 'available',
            bio: 'E-commerce and retail specialist with proven track record in D2C and B2B sales.',
            skills: ['E-commerce Sales', 'Digital Marketing', 'Customer Acquisition', 'Analytics'],
            responseTime: '< 1 hour',
            languages: ['English', 'Spanish', 'Portuguese'],
            completedCampaigns: 112
          }
        ]);
      } catch (error) {
        console.error('Failed to fetch reps:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReps();
  }, []);

  const filteredReps = reps.filter(rep => {
    const matchesSearch = rep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rep.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rep.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesIndustry = selectedIndustry === 'all' || rep.industry === selectedIndustry;
    const matchesLocation = selectedLocation === 'all' || rep.location === selectedLocation;
    const matchesPrice = rep.hourlyRate >= priceRange[0] && rep.hourlyRate <= priceRange[1];
    
    return matchesSearch && matchesIndustry && matchesLocation && matchesPrice;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'followers':
        return b.linkedinFollowers - a.linkedinFollowers;
      case 'price':
        return a.hourlyRate - b.hourlyRate;
      case 'experience':
        return b.completedCampaigns - a.completedCampaigns;
      default:
        return 0;
    }
  });

  const AVAIL: Record<string, { color: string; label: string }> = {
    available: { color: 'var(--accent-2)', label: 'Available' },
    busy:      { color: 'var(--accent-3)', label: 'Busy' },
    offline:   { color: 'rgba(255,255,255,0.25)', label: 'Offline' },
  };

  const inputClass = "w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-accent-1/60 transition-colors";

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
            <option value="price">Sort: Price ↓</option>
            <option value="experience">Sort: Experience</option>
          </select>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <label className="text-xs font-bold text-white/40 whitespace-nowrap">Max rate: <span className="text-accent-3">${priceRange[1]}/hr</span></label>
          <input type="range" min="0" max="200" value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="flex-1 accent-accent-3" />
        </div>

        <p className="text-[11px] font-black uppercase tracking-widest text-white/30 mb-4">
          {filteredReps.length} rep{filteredReps.length !== 1 ? 's' : ''}
        </p>

        {/* Rep cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReps.map((rep) => {
            const av = AVAIL[rep.availabilityStatus] ?? AVAIL.offline;
            return (
              <div key={rep.id} className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{rep.avatar}</span>
                    <div>
                      <h3 className="text-sm font-black text-white">{rep.name}</h3>
                      <p className="text-xs font-medium text-white/45">{rep.industry} · {rep.location}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0" style={{ color: av.color, borderColor: av.color + '50', background: av.color + '15' }}>
                    {av.label}
                  </span>
                </div>

                <p className="text-xs font-medium text-white/50 leading-relaxed line-clamp-2">{rep.bio}</p>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/[0.04] rounded-xl p-2.5">
                    <p className="text-[10px] font-black uppercase text-white/35 mb-0.5">Rating</p>
                    <p className="text-sm font-black text-accent-3">{rep.rating} ⭐</p>
                  </div>
                  <div className="bg-white/[0.04] rounded-xl p-2.5">
                    <p className="text-[10px] font-black uppercase text-white/35 mb-0.5">Followers</p>
                    <p className="text-sm font-black text-accent-2">{(rep.linkedinFollowers / 1000).toFixed(0)}k</p>
                  </div>
                  <div className="bg-white/[0.04] rounded-xl p-2.5">
                    <p className="text-[10px] font-black uppercase text-white/35 mb-0.5">Rate</p>
                    <p className="text-sm font-black text-accent-4">${rep.hourlyRate}/hr</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {rep.skills.slice(0, 3).map((skill, i) => (
                    <span key={i} className="text-[10px] font-black px-2 py-0.5 rounded-full bg-accent-1/10 text-accent-1 border border-accent-1/20">{skill}</span>
                  ))}
                  {rep.skills.length > 3 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/30">+{rep.skills.length - 3}</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-white/30">
                  <span>⚡ {rep.responseTime} reply</span>
                  <span>🌍 {rep.languages.join(', ')}</span>
                  <span>{rep.completedCampaigns} campaigns</span>
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
