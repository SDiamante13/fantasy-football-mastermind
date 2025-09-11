/**
 * Creates a mock service with predictable return values
 */
export const createMockService = <T extends Record<string, (...args: any[]) => any>>(
  serviceMethods: { [K in keyof T]: ReturnType<T[K]> }
): T => {
  const mock = {} as T;
  
  for (const [methodName, returnValue] of Object.entries(serviceMethods)) {
    mock[methodName as keyof T] = (() => returnValue) as T[keyof T];
  }
  
  return mock;
};

/**
 * Common mock data builders for consistent test data
 */
export const mockData = {
  player: {
    basic: () => ({
      player_id: 'test-player-1',
      full_name: 'Test Player',
      position: 'QB',
      team: 'TEST',
      active: true
    }),
    
    withStats: (overrides?: Partial<any>) => ({
      ...mockData.player.basic(),
      years_exp: 5,
      injury_status: 'Healthy',
      ...overrides
    })
  },
  
  user: {
    basic: (username = 'testuser') => ({
      user_id: 'test-user-id',
      username,
      display_name: username
    })
  },
  
  league: {
    basic: () => ({
      league_id: 'test-league-1',
      name: 'Test League',
      season: '2025',
      status: 'in_season'
    })
  },
  
  tradeOpportunity: {
    basic: () => ({
      teamA: 'team_strong_rb',
      teamB: 'team_strong_wr',
      mutualBenefit: 1
    })
  },
  
  tradeAssessment: {
    fair: () => ({
      teamAValueDiff: 3,
      teamBValueDiff: -3,
      fairness: 'fair' as const,
      totalValue: 165
    })
  },
  
  rosterAnalysis: {
    rbStrong: () => ({
      strengths: ['RB'],
      weaknesses: ['WR'],
      overallScore: 78,
      positionScores: { RB: 92, WR: 45 }
    }),
    
    wrStrong: () => ({
      strengths: ['WR'],
      weaknesses: ['RB'],
      overallScore: 76,
      positionScores: { WR: 88, RB: 42 }
    })
  },
  
  faabAnalysis: {
    biddingData: () => ({
      averageWinningBid: 28,
      bidRange: { min: 15, max: 45 },
      sampleSize: 6
    }),
    
    playerValue: () => ({
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
    }),
    
    budget: () => ({
      totalBudget: 200,
      spent: 65,
      remaining: 135,
      percentageSpent: 33,
      weeksRemaining: 9
    }),
    
    bidRecommendation: () => ({
      recommendedBid: 34,
      winProbability: 0.74,
      strategy: 'balanced' as const,
      confidence: 'high' as const,
      reasoning: 'Optimal bid based on comprehensive analysis'
    })
  }
};

/**
 * Trade service mock factories
 */
export const tradeServiceMocks = {
  tradeOpportunityDetector: () => createMockService({
    findTradeOpportunities: [mockData.tradeOpportunity.basic()]
  }),
  
  tradeValueCalculator: () => createMockService({
    assessTrade: mockData.tradeAssessment.fair()
  }),
  
  rosterAnalyzer: () => createMockService({
    analyzeRoster: (playerIds: string[]) => {
      if (playerIds.includes('strong_rb')) {
        return mockData.rosterAnalysis.rbStrong();
      }
      return mockData.rosterAnalysis.wrStrong();
    }
  })
};

/**
 * FAAB service mock factories  
 */
export const faabServiceMocks = {
  biddingAnalyzer: () => createMockService({
    analyzeSimilarPlayers: mockData.faabAnalysis.biddingData()
  }),
  
  playerValueAssessor: () => createMockService({
    assessValue: mockData.faabAnalysis.playerValue()
  }),
  
  budgetTracker: () => createMockService({
    getBudgetStatus: mockData.faabAnalysis.budget()
  }),
  
  bidCalculator: () => createMockService({
    calculateOptimalBid: mockData.faabAnalysis.bidRecommendation()
  })
};

import { Services as FaabServices } from '../faab/faab-optimizer';
import { Services as TradeServices } from '../trades/trade-scanner';



/**
 * Generic test helper for service tests
 */
export const testService = <TService, TMocks>(
  createService: (mocks: TMocks) => TService,
  createMocks: () => TMocks,
  testCases: {
    description: string;
    act: (service: TService) => any;
    expect: (result: any) => void;
  }[]
) => {
  testCases.forEach(({ description, act, expect: expectResult }) => {
    it(description, () => {
      const mocks = createMocks();
      const service = createService(mocks);
      const result = act(service);
      expectResult(result);
    });
  });
};