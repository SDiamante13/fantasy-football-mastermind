import { commonExpectations } from '../test-utils';

import { createFAABOptimizer } from './faab-optimizer';

type MockServices = {
  biddingAnalyzer: {
    analyzeSimilarPlayers: () => {
      averageWinningBid: number;
      bidRange: { min: number; max: number };
      sampleSize: number;
    };
  };
  playerValueAssessor: {
    assessValue: () => {
      tier: 'medium';
      score: number;
      confidence: 'high';
      factors: {
        rosterPercentage: number;
        targetShare: number;
        recentPoints: number;
        positionScarcity: number;
        waiversDepth: number;
      };
    };
  };
  budgetTracker: {
    getBudgetStatus: () => {
      totalBudget: number;
      spent: number;
      remaining: number;
      percentageSpent: number;
      weeksRemaining: number;
    };
  };
  bidCalculator: {
    calculateOptimalBid: () => {
      recommendedBid: number;
      winProbability: number;
      strategy: 'balanced';
      confidence: 'high';
      reasoning: string;
    };
  };
};

const createMockBiddingAnalyzer = (): MockServices['biddingAnalyzer'] => ({
  analyzeSimilarPlayers: (): {
    averageWinningBid: number;
    bidRange: { min: number; max: number };
    sampleSize: number;
  } => ({
    averageWinningBid: 28,
    bidRange: { min: 15, max: 45 },
    sampleSize: 6
  })
});

const createMockPlayerValueAssessor = (): MockServices['playerValueAssessor'] => ({
  assessValue: (): {
    tier: 'medium';
    score: number;
    confidence: 'high';
    factors: {
      rosterPercentage: number;
      targetShare: number;
      recentPoints: number;
      positionScarcity: number;
      waiversDepth: number;
    };
  } => ({
    tier: 'medium' as const,
    score: 68,
    confidence: 'high' as const,
    factors: {
      rosterPercentage: 42,
      targetShare: 20,
      recentPoints: 14,
      positionScarcity: 7,
      waiversDepth: 18
    }
  })
});

const createMockBudgetTracker = (): MockServices['budgetTracker'] => ({
  getBudgetStatus: (): {
    totalBudget: number;
    spent: number;
    remaining: number;
    percentageSpent: number;
    weeksRemaining: number;
  } => ({
    totalBudget: 200,
    spent: 65,
    remaining: 135,
    percentageSpent: 33,
    weeksRemaining: 9
  })
});

const createMockBidCalculator = (): MockServices['bidCalculator'] => ({
  calculateOptimalBid: (): {
    recommendedBid: number;
    winProbability: number;
    strategy: 'balanced';
    confidence: 'high';
    reasoning: string;
  } => ({
    recommendedBid: 34,
    winProbability: 0.74,
    strategy: 'balanced' as const,
    confidence: 'high' as const,
    reasoning: 'Optimal bid based on comprehensive analysis'
  })
});



describe('FAAB Optimizer', () => {
  it('provides comprehensive bid recommendations integrating all services', () => {
    const mockServices = {
      biddingAnalyzer: createMockBiddingAnalyzer(),
      playerValueAssessor: createMockPlayerValueAssessor(),
      budgetTracker: createMockBudgetTracker(),
      bidCalculator: createMockBidCalculator(),
    };
    const optimizer = createFAABOptimizer(mockServices);
    
    const recommendation = optimizer.getOptimalBid({
      playerId: 'rb_handcuff_123',
      position: 'RB',
      userId: 'user456',
      leagueId: 'league789'
    });

    commonExpectations.toBe(recommendation.recommendedBid, 34);
    commonExpectations.toBe(recommendation.winProbability, 0.74);
    commonExpectations.toBe(recommendation.strategy, 'balanced');
    commonExpectations.toBe(recommendation.playerValue.tier, 'medium');
    commonExpectations.toBe(recommendation.budgetImpact.remaining, 135);
    commonExpectations.toBe(recommendation.confidence, 'high');
  });
});
