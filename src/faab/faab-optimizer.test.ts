import { createFAABOptimizer } from './faab-optimizer';

describe('FAAB Optimizer', () => {
  it('provides comprehensive bid recommendations integrating all services', () => {
    const mockServices = {
      biddingAnalyzer: {
        analyzeSimilarPlayers: () => ({
          averageWinningBid: 28,
          bidRange: { min: 15, max: 45 },
          sampleSize: 6
        })
      },
      playerValueAssessor: {
        assessValue: () => ({
          tier: 'medium' as const,
          score: 68,
          confidence: 'high' as const,
          factors: { rosterPercentage: 42, targetShare: 20, recentPoints: 14, positionScarcity: 7, waiversDepth: 18 }
        })
      },
      budgetTracker: {
        getBudgetStatus: () => ({
          totalBudget: 200,
          spent: 65,
          remaining: 135,
          percentageSpent: 33,
          weeksRemaining: 9
        })
      },
      bidCalculator: {
        calculateOptimalBid: () => ({
          recommendedBid: 34,
          winProbability: 0.74,
          strategy: 'balanced' as const,
          confidence: 'high' as const,
          reasoning: 'Optimal bid based on comprehensive analysis'
        })
      }
    };

    const optimizer = createFAABOptimizer(mockServices);
    const recommendation = optimizer.getOptimalBid({
      playerId: 'rb_handcuff_123',
      position: 'RB',
      userId: 'user456',
      leagueId: 'league789'
    });

    expect(recommendation.recommendedBid).toBe(34);
    expect(recommendation.winProbability).toBe(0.74);
    expect(recommendation.strategy).toBe('balanced');
    expect(recommendation.playerValue.tier).toBe('medium');
    expect(recommendation.budgetImpact.remaining).toBe(135);
    expect(recommendation.confidence).toBe('high');
  });
});