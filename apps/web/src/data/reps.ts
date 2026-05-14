export type RepAvailability = "available" | "limited" | "unavailable";
export type RepTier = "growth_commander" | "vanguard" | "scout" | "recruit";

export interface RepProfile {
  id: string;
  name: string;
  tagline: string;
  niche: string;
  location: string;
  linkedinUrl: string;
  linkedinFollowers: number;
  acceptanceRate: number;
  replyRate: number;
  rating: number;
  reviewCount: number;
  tier: RepTier;
  monthlyRate: number;
  availability: RepAvailability;
  languages: string[];
  verified: boolean;
}

export const FEATURED_REPS: RepProfile[] = [
  {
    id: "rep-01",
    name: "Thabo Nkosi",
    tagline: "B2B SaaS specialist with 3 years enterprise outreach experience",
    niche: "SaaS",
    location: "Johannesburg, ZA",
    linkedinUrl: "https://linkedin.com/in/thabo-nkosi-sdr",
    linkedinFollowers: 4800,
    acceptanceRate: 0.96,
    replyRate: 0.44,
    rating: 4.9,
    reviewCount: 31,
    tier: "growth_commander",
    monthlyRate: 220,
    availability: "available",
    languages: ["English", "Zulu", "Afrikaans"],
    verified: true,
  },
  {
    id: "rep-02",
    name: "Amara Osei",
    tagline: "FinTech & banking outreach across EMEA markets",
    niche: "FinTech",
    location: "Lagos, NG",
    linkedinUrl: "https://linkedin.com/in/amara-osei-outreach",
    linkedinFollowers: 6200,
    acceptanceRate: 0.91,
    replyRate: 0.39,
    rating: 4.7,
    reviewCount: 24,
    tier: "vanguard",
    monthlyRate: 180,
    availability: "available",
    languages: ["English", "French"],
    verified: true,
  },
  {
    id: "rep-03",
    name: "Zanele Dube",
    tagline: "Recruitment & HR tech outreach for growing teams",
    niche: "HR Tech",
    location: "Cape Town, ZA",
    linkedinUrl: "https://linkedin.com/in/zanele-dube-hr",
    linkedinFollowers: 3400,
    acceptanceRate: 0.93,
    replyRate: 0.41,
    rating: 4.8,
    reviewCount: 19,
    tier: "vanguard",
    monthlyRate: 160,
    availability: "available",
    languages: ["English", "Xhosa"],
    verified: true,
  },
  {
    id: "rep-04",
    name: "Sipho Mahlangu",
    tagline: "E-commerce & retail brand partnerships across Africa",
    niche: "E-commerce",
    location: "Durban, ZA",
    linkedinUrl: "https://linkedin.com/in/sipho-mahlangu-ecom",
    linkedinFollowers: 2900,
    acceptanceRate: 0.88,
    replyRate: 0.36,
    rating: 4.5,
    reviewCount: 14,
    tier: "scout",
    monthlyRate: 130,
    availability: "limited",
    languages: ["English", "Zulu"],
    verified: true,
  },
  {
    id: "rep-05",
    name: "Fatima Al-Hassan",
    tagline: "Consulting & professional services outreach specialist",
    niche: "Consulting",
    location: "Nairobi, KE",
    linkedinUrl: "https://linkedin.com/in/fatima-alhassan-consulting",
    linkedinFollowers: 5100,
    acceptanceRate: 0.94,
    replyRate: 0.47,
    rating: 4.9,
    reviewCount: 28,
    tier: "growth_commander",
    monthlyRate: 240,
    availability: "available",
    languages: ["English", "Arabic", "Swahili"],
    verified: true,
  },
  {
    id: "rep-06",
    name: "Kwame Asante",
    tagline: "AgriTech & sustainability startups across West Africa",
    niche: "AgriTech",
    location: "Accra, GH",
    linkedinUrl: "https://linkedin.com/in/kwame-asante-agritech",
    linkedinFollowers: 2200,
    acceptanceRate: 0.87,
    replyRate: 0.38,
    rating: 4.4,
    reviewCount: 11,
    tier: "scout",
    monthlyRate: 120,
    availability: "available",
    languages: ["English", "Twi"],
    verified: true,
  },
  {
    id: "rep-07",
    name: "Lerato Molefe",
    tagline: "Cybersecurity & IT services for enterprise decision-makers",
    niche: "Cybersecurity",
    location: "Pretoria, ZA",
    linkedinUrl: "https://linkedin.com/in/lerato-molefe-cyber",
    linkedinFollowers: 4100,
    acceptanceRate: 0.92,
    replyRate: 0.43,
    rating: 4.7,
    reviewCount: 22,
    tier: "vanguard",
    monthlyRate: 200,
    availability: "limited",
    languages: ["English", "Sotho", "Afrikaans"],
    verified: true,
  },
  {
    id: "rep-08",
    name: "Chidi Eze",
    tagline: "Logistics & supply chain outreach for B2B operators",
    niche: "Logistics",
    location: "Port Harcourt, NG",
    linkedinUrl: "https://linkedin.com/in/chidi-eze-logistics",
    linkedinFollowers: 1800,
    acceptanceRate: 0.85,
    replyRate: 0.34,
    rating: 4.3,
    reviewCount: 9,
    tier: "recruit",
    monthlyRate: 100,
    availability: "available",
    languages: ["English", "Igbo"],
    verified: true,
  },
];

export const NICHES = [...new Set(FEATURED_REPS.map((r) => r.niche))].sort();
