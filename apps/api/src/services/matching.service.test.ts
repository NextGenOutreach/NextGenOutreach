import { describe, it, expect } from 'vitest';
import { scoreRep, calculateMatchScore } from './matching.service';

describe('Matching Service', () => {
  const mockRep: any = {
    id: 'rep_1',
    industry: 'Technology',
    locationCountry: 'ZA',
    linkedinFollowers: 5000,
    availabilityStatus: 'available',
    rating: 4.5,
  };

  const mockPrefs: any = {
    targetIndustry: 'Technology',
    targetCountry: 'ZA',
    followerRange: { min: 1000, max: 10000 },
  };

  it('should calculate a high match score for perfect matches', () => {
    const result = calculateMatchScore(mockRep, mockPrefs);
    expect(result.score).toBeGreaterThan(80);
    expect(result.breakdown.industry).toBe(30);
    expect(result.breakdown.location).toBe(20);
  });

  it('should lower score for industry mismatch', () => {
    const result = calculateMatchScore(mockRep, { ...mockPrefs, targetIndustry: 'Healthcare' });
    expect(result.breakdown.industry).toBe(0);
  });

  it('should give partial points for same region', () => {
    const result = calculateMatchScore(mockRep, { ...mockPrefs, targetCountry: 'KE' }); // Kenya is east, ZA is southern
    expect(result.breakdown.location).toBe(0);
    
    const result2 = calculateMatchScore(mockRep, { ...mockPrefs, targetCountry: 'NA' }); // Namibia is southern
    expect(result2.breakdown.location).toBe(10);
  });
});
