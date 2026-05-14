import { RepProfile, ClientPreferences } from '@nextgenoutreach/types';

export function scoreRep(rep: RepProfile, prefs: ClientPreferences): number {
  let score = 0;

  // Industry match: 30 points
  if (rep.industry?.toLowerCase() === prefs.targetIndustry?.toLowerCase()) score += 30;

  // Location match: 20 points
  if (rep.locationCountry === prefs.targetCountry) score += 20;
  else if (sameRegion(rep.locationCountry, prefs.targetCountry))   score += 10;

  // Follower fit: 20 points
  if (prefs.followerRange) {
    const mid = (prefs.followerRange.min + prefs.followerRange.max) / 2;
    const followers = rep.linkedinFollowers ?? 0;
    if (mid > 0) {
      const diff = Math.abs(followers - mid) / mid;
      score += Math.max(0, 20 - diff * 20);
    } else if (followers === 0) {
      score += 20;
    }
  }

  // Availability: 15 points
  if (rep.availabilityStatus === 'available') score += 15;

  // Rating: 15 points
  score += (rep.rating / 5) * 15;

  return Math.round(score);
}

export function sameRegion(country1?: string, country2?: string): boolean {
  if (!country1 || !country2) return false;
  
  const southernAfrica = ['ZA', 'BW', 'ZW', 'NA', 'SZ', 'LS', 'MW'];
  const eastAfrica = ['KE', 'UG', 'TZ', 'RW', 'BI', 'SS'];
  const westAfrica = ['NG', 'GH', 'CI', 'SN', 'BF', 'ML', 'NE', 'TD'];
  const northAfrica = ['EG', 'LY', 'TN', 'DZ', 'MA', 'SD'];

  const getRegion = (country: string) => {
    if (southernAfrica.includes(country)) return 'southern';
    if (eastAfrica.includes(country)) return 'east';
    if (westAfrica.includes(country)) return 'west';
    if (northAfrica.includes(country)) return 'north';
    return 'other';
  };

  return getRegion(country1) === getRegion(country2);
}

export interface RepMatchScore {
  repId: string;
  score: number;
  breakdown: {
    industry: number;
    location: number;
    followers: number;
    availability: number;
    rating: number;
  };
}

export function calculateMatchScore(rep: RepProfile, prefs: ClientPreferences): RepMatchScore {
  let industry = 0;
  let location = 0;
  let followers = 0;
  let availability = 0;
  let rating = 0;

  // Industry match: 30 points
  if (rep.industry?.toLowerCase() === prefs.targetIndustry?.toLowerCase()) {
    industry = 30;
  }

  // Location match: 20 points
  if (rep.locationCountry === prefs.targetCountry) {
    location = 20;
  } else if (sameRegion(rep.locationCountry, prefs.targetCountry)) {
    location = 10;
  }

  // Follower fit: 20 points
  if (prefs.followerRange) {
    const mid = (prefs.followerRange.min + prefs.followerRange.max) / 2;
    const followerCount = rep.linkedinFollowers ?? 0;
    if (mid > 0) {
      const diff = Math.abs(followerCount - mid) / mid;
      followers = Math.max(0, 20 - diff * 20);
    } else if (followerCount === 0) {
      followers = 20;
    }
  }

  // Availability: 15 points
  if (rep.availabilityStatus === 'available') {
    availability = 15;
  }

  // Rating: 15 points
  rating = (rep.rating / 5) * 15;

  const totalScore = industry + location + followers + availability + rating;

  return {
    repId: rep.id,
    score: totalScore,
    breakdown: {
      industry,
      location,
      followers,
      availability,
      rating
    }
  };
}
