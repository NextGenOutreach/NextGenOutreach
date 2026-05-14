import React from 'react';
import { MaxCard } from './ui/MaxCard';
import { MaxButton } from './ui/MaxButton';

const accents = ["var(--accent-1)", "var(--accent-2)", "var(--accent-3)", "var(--accent-4)", "var(--accent-5)"];

// Mock data for SDRs aligned with Prisma Rep model
const mockSDRs = [
  {
    id: 'rep-1',
    username: 'Alice Smith',
    niche: 'SaaS',
    acceptanceRate: 0.95,
    replyRate: 0.92,
    clientRating: 4.8,
    tier: 'vanguard',
    hourlyRate: 5000, // In cents
    linkedinUrl: 'https://linkedin.com/in/alice',
  },
  {
    id: 'rep-2',
    username: 'Bob Johnson',
    niche: 'FinTech',
    acceptanceRate: 0.88,
    replyRate: 0.85,
    clientRating: 4.2,
    tier: 'scout',
    hourlyRate: 4500, // In cents
    linkedinUrl: 'https://linkedin.com/in/bob',
  },
  {
    id: 'rep-3',
    username: 'Charlie Brown',
    niche: 'E-commerce',
    acceptanceRate: 0.98,
    replyRate: 0.96,
    clientRating: 4.9,
    tier: 'growth_commander',
    hourlyRate: 7500, // In cents
    linkedinUrl: 'https://linkedin.com/in/charlie',
  },
  {
    id: 'rep-4',
    username: 'Diana Prince',
    niche: 'SaaS',
    acceptanceRate: 0.90,
    replyRate: 0.88,
    clientRating: 4.5,
    tier: 'vanguard',
    hourlyRate: 5500, // In cents
    linkedinUrl: 'https://linkedin.com/in/diana',
  },
];

interface CampaignFormData {
  target: string;
  industry: string;
  offer: string;
  limits: string;
}

interface SDRMarketplaceProps {
  currentBrief?: CampaignFormData | null;
}

const calculateRepRank = (sdr: typeof mockSDRs[0]) => {
  return sdr.acceptanceRate * sdr.replyRate * sdr.clientRating;
};

const getTierLabel = (tier: string) => {
  switch (tier) {
    case 'growth_commander': return 'Growth Commander';
    case 'vanguard': return 'Vanguard';
    case 'scout': return 'Scout';
    default: return 'Recruit';
  }
};

export const SDRMarketplace: React.FC<SDRMarketplaceProps> = ({ currentBrief }) => {
  let filteredSDRs = mockSDRs;

  if (currentBrief && currentBrief.industry) {
    filteredSDRs = mockSDRs.filter(sdr => 
      sdr.niche.toLowerCase() === currentBrief.industry.toLowerCase()
    );
  }

  const sortedAndFilteredSDRs = [...filteredSDRs].sort((a, b) => {
    const rankA = calculateRepRank(a);
    const rankB = calculateRepRank(b);
    return rankB - rankA;
  });

  return (
    <div className="max-section border-accent-2 p-8 md:p-10 relative overflow-hidden">
      <div className="absolute inset-0 pattern-dots text-accent-2/5 opacity-30" />
      <div className="relative z-10">
        <h2 className="text-4xl font-black uppercase headline-shadow mb-4">
          {currentBrief ? `Verified Reps: ${currentBrief.industry}` : 'SDR Marketplace'}
        </h2>
        <p className="text-lg text-white/85 mb-10 max-w-2xl font-bold">
          {currentBrief 
            ? `Discover top-performing outreach professionals matched to your ${currentBrief.industry} campaign needs.`
            : 'Browse our directory of ID-verified LinkedIn professionals ready to scale your pipeline safely.'
          }
        </p>
        
        {sortedAndFilteredSDRs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {sortedAndFilteredSDRs.map((sdr, idx) => (
              <MaxCard 
                key={sdr.id} 
                accentColor={accents[idx % accents.length]}
                shadowColor={accents[(idx + 1) % accents.length]}
                dashed={idx % 2 === 0}
                className="flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white">{sdr.username}</h3>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border-2 ${sdr.tier === 'growth_commander' ? 'border-accent-1 text-accent-1 shadow-[0_0_10px_rgba(255,58,242,0.3)]' : 'border-white/40 text-white/40'}`}>
                      {getTierLabel(sdr.tier)}
                    </span>
                  </div>
                  <div className="space-y-3 mb-8">
                    <p className="text-xs font-black uppercase tracking-widest text-white/60">Niche: <span className="text-accent-2">{sdr.niche}</span></p>
                    <p className="text-xs font-black uppercase tracking-widest text-white/60">Rating: <span className="text-accent-3">{sdr.clientRating.toFixed(1)} / 5.0</span></p>
                    <p className="text-xs font-black uppercase tracking-widest text-white/60">Rate: <span className="text-accent-5">${(sdr.hourlyRate / 100).toFixed(2)}/hr</span></p>
                    <p className="text-xs font-black uppercase tracking-widest text-white/60">Success: <span className="text-accent-1">{(sdr.acceptanceRate * 100).toFixed(0)}%</span></p>
                  </div>
                </div>
                <MaxButton fullWidth size="sm" href={sdr.linkedinUrl} target="_blank">
                  View LinkedIn
                </MaxButton>
              </MaxCard>
            ))}
          </div>
        ) : (
          <MaxCard dashed accentColor="rgba(255,255,255,0.2)" className="text-center py-24">
            <p className="text-xl font-black uppercase tracking-widest text-white/40">
              {currentBrief 
                ? `No reps found for "${currentBrief.industry}"` 
                : 'No SDRs available at the moment.'
              }
            </p>
          </MaxCard>
        )}
      </div>
    </div>
  );
};
