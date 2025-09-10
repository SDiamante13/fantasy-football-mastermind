import { createBidCalculator } from './bid-calculator';

describe('Bid Calculator', () => {
  it('calculates optimal bid based on player value and historical patterns', () => {
    const mockData = {
      playerValue: { tier: 'medium' as const, score: 65, confidence: 'high' as const },
      biddingPattern: { averageWinningBid: 32, bidRange: { min: 18, max: 48 }, sampleSize: 8 },
      budget: { remaining: 120, percentageSpent: 35, weeksRemaining: 10 },
      leagueContext: { activeManagers: 10, competitionLevel: 'high' as const }
    };

    const calculator = createBidCalculator();
    const recommendation = calculator.calculateOptimalBid(mockData);

    expect(recommendation.recommendedBid).toBeGreaterThan(25);
    expect(recommendation.recommendedBid).toBeLessThan(50);
    expect(recommendation.winProbability).toBeGreaterThan(0.6);
    expect(recommendation.strategy).toBe('balanced');
    expect(recommendation.confidence).toBe('high');
    expect(recommendation.reasoning).toContain('medium-tier player');
  });
});
