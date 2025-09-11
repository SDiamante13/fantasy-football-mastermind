type BiddingAnalyzer = {
  analyzeSimilarPlayers: (criteria: { position: string; tier: string; value: string }) => {
    averageWinningBid: number;
    bidRange: { min: number; max: number };
    sampleSize: number;
  };
};

type PlayerValueAssessor = {
  assessValue: (
    playerId: string,
    position: string
  ) => {
    tier: 'high' | 'medium' | 'low';
    score: number;
    confidence: 'high' | 'medium' | 'low';
    factors: {
      rosterPercentage: number;
      targetShare: number;
      recentPoints: number;
      positionScarcity: number;
      waiversDepth: number;
    };
  };
};

type BudgetTracker = {
  getBudgetStatus: (
    userId: string,
    leagueId: string
  ) => {
    totalBudget: number;
    spent: number;
    remaining: number;
    percentageSpent: number;
    weeksRemaining: number;
  };
};

type BidCalculationData = {
  playerValue: {
    tier: 'high' | 'medium' | 'low';
    score: number;
    confidence: 'high' | 'medium' | 'low';
  };
  biddingPattern: {
    averageWinningBid: number;
    bidRange: { min: number; max: number };
    sampleSize: number;
  };
  budget: {
    totalBudget: number;
    spent: number;
    remaining: number;
    percentageSpent: number;
    weeksRemaining: number;
  };
  leagueContext: { activeManagers: number; competitionLevel: 'high' | 'medium' | 'low' };
};

type BidCalculator = {
  calculateOptimalBid: (data: BidCalculationData) => {
    recommendedBid: number;
    winProbability: number;
    strategy: 'conservative' | 'balanced' | 'aggressive';
    confidence: 'high' | 'medium' | 'low';
    reasoning: string;
  };
};

export type Services = {
  biddingAnalyzer: BiddingAnalyzer;
  playerValueAssessor: PlayerValueAssessor;
  budgetTracker: BudgetTracker;
  bidCalculator: BidCalculator;
};

type OptimizationRequest = {
  playerId: string;
  position: string;
  userId: string;
  leagueId: string;
};

type OptimizationResult = {
  recommendedBid: number;
  winProbability: number;
  strategy: 'conservative' | 'balanced' | 'aggressive';
  playerValue: { tier: 'high' | 'medium' | 'low'; score: number };
  budgetImpact: { remaining: number; percentageUsed: number };
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
};

type PlayerValueData = {
  tier: 'high' | 'medium' | 'low';
  score: number;
  confidence: 'high' | 'medium' | 'low';
};

type BiddingPatternData = {
  averageWinningBid: number;
  bidRange: { min: number; max: number };
  sampleSize: number;
};

type BudgetData = {
  totalBudget: number;
  spent: number;
  remaining: number;
  percentageSpent: number;
  weeksRemaining: number;
};

function createBidCalculationData(
  playerValue: PlayerValueData,
  biddingPattern: BiddingPatternData,
  budget: BudgetData
): BidCalculationData {
  return {
    playerValue: {
      tier: playerValue.tier,
      score: playerValue.score,
      confidence: playerValue.confidence
    },
    biddingPattern,
    budget,
    leagueContext: {
      activeManagers: 10,
      competitionLevel: 'high' as const
    }
  };
}

function calculateBudgetImpact(
  recommendedBid: number,
  budget: { totalBudget: number; remaining: number }
): { remaining: number; percentageUsed: number } {
  return {
    remaining: budget.remaining,
    percentageUsed: Math.round((recommendedBid / budget.totalBudget) * 100)
  };
}

function processOptimizationRequest(
  services: Services,
  request: OptimizationRequest
): OptimizationResult {
  const playerValue = services.playerValueAssessor.assessValue(request.playerId, request.position);
  const biddingPattern = services.biddingAnalyzer.analyzeSimilarPlayers({
    position: request.position,
    tier: playerValue.tier,
    value: playerValue.tier
  });
  const budget = services.budgetTracker.getBudgetStatus(request.userId, request.leagueId);
  const bidCalculationData = createBidCalculationData(playerValue, biddingPattern, budget);
  const bidRecommendation = services.bidCalculator.calculateOptimalBid(bidCalculationData);
  const budgetImpact = calculateBudgetImpact(bidRecommendation.recommendedBid, budget);

  return {
    recommendedBid: bidRecommendation.recommendedBid,
    winProbability: bidRecommendation.winProbability,
    strategy: bidRecommendation.strategy,
    playerValue: { tier: playerValue.tier, score: playerValue.score },
    budgetImpact,
    confidence: bidRecommendation.confidence,
    reasoning: bidRecommendation.reasoning
  };
}

export function createFAABOptimizer(services: Services): {
  getOptimalBid: (request: OptimizationRequest) => OptimizationResult;
} {
  return {
    getOptimalBid: (request: OptimizationRequest): OptimizationResult => {
      return processOptimizationRequest(services, request);
    }
  };
}
