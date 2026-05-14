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

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500/20 text-green-400';
      case 'busy': return 'bg-yellow-500/20 text-yellow-400';
      case 'offline': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStarRating = (rating: number) => {
    return '⭐'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '⭐' : '');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-muted rounded-lg p-6">
                  <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
                  <div className="h-8 bg-muted rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Rep Marketplace</h1>
          <p className="text-muted-foreground">Find and hire vetted LinkedIn outreach professionals</p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg p-6 border border-accent-3/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reps, skills..."
                className="w-full px-3 py-2 bg-muted border border-accent-3 rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-1"
              />
            </div>

            {/* Industry Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Industry</label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full px-3 py-2 bg-muted border border-accent-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-1"
              >
                <option value="all">All Industries</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="E-commerce">E-commerce</option>
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 bg-muted border border-accent-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-1"
              >
                <option value="all">All Locations</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Spain">Spain</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 bg-muted border border-accent-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-1"
              >
                <option value="rating">Rating</option>
                <option value="followers">Followers</option>
                <option value="price">Price (Low to High)</option>
                <option value="experience">Experience</option>
              </select>
            </div>
          </div>

          {/* Price Range */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-white mb-2">
              Hourly Rate: ${priceRange[0]} - ${priceRange[1]}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="200"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Found {filteredReps.length} rep{filteredReps.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Rep Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReps.map((rep) => (
            <div key={rep.id} className="bg-card rounded-lg p-6 border border-accent-3/20">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{rep.avatar}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{rep.name}</h3>
                    <p className="text-sm text-muted-foreground">{rep.industry} • {rep.location}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(rep.availabilityStatus)}`}>
                  {rep.availabilityStatus}
                </span>
              </div>

              {/* Rating and Reviews */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-yellow-400">{getStarRating(rep.rating)}</span>
                  <span className="text-sm text-white">{rep.rating}</span>
                </div>
                <p className="text-xs text-muted-foreground">{rep.totalReviews} reviews</p>
              </div>

              {/* Bio */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{rep.bio}</p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-lg font-bold text-white">{rep.linkedinFollowers.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">LinkedIn Followers</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">${rep.hourlyRate}/hr</div>
                  <div className="text-xs text-muted-foreground">Hourly Rate</div>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {rep.skills.slice(0, 3).map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-accent-1/20 text-accent-1 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                  {rep.skills.length > 3 && (
                    <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                      +{rep.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                <span>📧 {rep.responseTime}</span>
                <span>🌍 {rep.languages.join(', ')}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-accent-1 text-white rounded-lg hover:bg-accent-2 transition-colors">
                  Hire Now
                </button>
                <button className="px-4 py-2 bg-muted text-white rounded-lg hover:bg-accent-1/20 transition-colors">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredReps.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No reps found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search terms to find the perfect rep for your campaign.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
