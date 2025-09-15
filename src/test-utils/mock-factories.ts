/**
 * Creates a mock service with predictable return values
 */
type ServiceMethod = (...args: unknown[]) => unknown;

export const createMockService = <
  T extends Record<string, ServiceMethod>
>(serviceMethods: { [K in keyof T]: ReturnType<T[K]> }): T => {
  const mock = {} as T;

  for (const [methodName, returnValue] of Object.entries(serviceMethods)) {
    mock[methodName as keyof T] = (() => returnValue) as unknown as T[keyof T];
  }

  return mock;
};

/**
 * Common mock data builders for consistent test data
 */
export const mockData = {
  player: {
    basic: (): { player_id: string; full_name: string; position: string; team: string; active: boolean } => ({
      player_id: 'test-player-1',
      full_name: 'Test Player',
      position: 'QB',
      team: 'TEST',
      active: true
    }),

    withStats: (overrides?: Record<string, unknown>): Record<string, unknown> => ({
      ...mockData.player.basic(),
      years_exp: 5,
      injury_status: 'Healthy',
      ...overrides
    })
  },

  user: {
    basic: (username = 'testuser'): { user_id: string; username: string; display_name: string } => ({
      user_id: 'test-user-id',
      username,
      display_name: username
    })
  },

  league: {
    basic: (): { league_id: string; name: string; season: string; status: string } => ({
      league_id: 'test-league-1',
      name: 'Test League',
      season: '2025',
      status: 'in_season'
    })
  },

  tradeOpportunity: {
    basic: (): { teamA: string; teamB: string; mutualBenefit: number } => ({
      teamA: 'team_strong_rb',
      teamB: 'team_strong_wr',
      mutualBenefit: 1
    })
  },

  tradeAssessment: {
    fair: (): { teamAValueDiff: number; teamBValueDiff: number; fairness: 'fair'; totalValue: number } => ({
      teamAValueDiff: 3,
      teamBValueDiff: -3,
      fairness: 'fair' as const,
      totalValue: 165
    })
  },

  rosterAnalysis: {
    rbStrong: (): { strengths: string[]; weaknesses: string[]; overallScore: number; positionScores: Record<string, number> } => ({
      strengths: ['RB'],
      weaknesses: ['WR'],
      overallScore: 78,
      positionScores: { RB: 92, WR: 45 }
    }),

    wrStrong: (): { strengths: string[]; weaknesses: string[]; overallScore: number; positionScores: Record<string, number> } => ({
      strengths: ['WR'],
      weaknesses: ['RB'],
      overallScore: 76,
      positionScores: { WR: 88, RB: 42 }
    })
  },

  faabAnalysis: {
    biddingData: (): { averageWinningBid: number; bidRange: { min: number; max: number }; sampleSize: number } => ({
      averageWinningBid: 28,
      bidRange: { min: 15, max: 45 },
      sampleSize: 6
    }),

    playerValue: (): { tier: 'medium'; score: number; confidence: 'high'; factors: Record<string, number> } => ({
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

    budget: (): { totalBudget: number; spent: number; remaining: number; percentageSpent: number; weeksRemaining: number } => ({
      totalBudget: 200,
      spent: 65,
      remaining: 135,
      percentageSpent: 33,
      weeksRemaining: 9
    }),

    bidRecommendation: (): { recommendedBid: number; winProbability: number; strategy: 'balanced'; confidence: 'high'; reasoning: string } => ({
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
  tradeOpportunityDetector: (): ReturnType<typeof createMockService> =>
    createMockService({
      findTradeOpportunities: [mockData.tradeOpportunity.basic()]
    }),

  tradeValueCalculator: (): ReturnType<typeof createMockService> =>
    createMockService({
      assessTrade: mockData.tradeAssessment.fair()
    }),

  rosterAnalyzer: (): ReturnType<typeof createMockService> =>
    createMockService({
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
  biddingAnalyzer: (): ReturnType<typeof createMockService> =>
    createMockService({
      analyzeSimilarPlayers: mockData.faabAnalysis.biddingData()
    }),

  playerValueAssessor: (): ReturnType<typeof createMockService> =>
    createMockService({
      assessValue: mockData.faabAnalysis.playerValue()
    }),

  budgetTracker: (): ReturnType<typeof createMockService> =>
    createMockService({
      getBudgetStatus: mockData.faabAnalysis.budget()
    }),

  bidCalculator: (): ReturnType<typeof createMockService> =>
    createMockService({
      calculateOptimalBid: mockData.faabAnalysis.bidRecommendation()
    })
};

/**
 * Generic test helper for service tests
 */
export const testService = <TService, TMocks>(
  createService: (mocks: TMocks) => TService,
  createMocks: () => TMocks,
  testCases: {
    description: string;
    act: (service: TService) => unknown;
    expect: (result: unknown) => void;
  }[]
): void => {
  testCases.forEach(({ description, act, expect: expectResult }) => {
    it(description, () => {
      const mocks = createMocks();
      const service = createService(mocks);
      const result = act(service);
      expectResult(result);
    });
  });
};
