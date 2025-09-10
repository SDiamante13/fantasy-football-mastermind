type BiddingAnalyzer = {
  analyzeSimilarPlayers: (criteria: { position: string; tier: string; value: string }) => {
    averageWinningBid: number;
    bidRange: { min: number; max: number };
    sampleSize: number;
  };
};

type PlayerValueAssessor = {
  assessValue: (playerId: string, position: string) => {
    tier: 'high' | 'medium' | 'low';
    score: number;
    confidence: 'high' | 'medium' | 'low';
    factors: { rosterPercentage: number; targetShare: number; recentPoints: number; positionScarcity: number; waiversDepth: number };
  };
};

type BudgetTracker = {
  getBudgetStatus: (userId: string, leagueId: string) => {
    totalBudget: number;
    spent: number;
    remaining: number;
    percentageSpent: number;
    weeksRemaining: number;
  };
};

type BidCalculator = {
  calculateOptimalBid: (data: any) => {
    recommendedBid: number;
    winProbability: number;
    strategy: 'conservative' | 'balanced' | 'aggressive';
    confidence: 'high' | 'medium' | 'low';
    reasoning: string;
  };
};

type Services = {
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

export function createFAABOptimizer(services: Services): {
  getOptimalBid: (request: OptimizationRequest) => OptimizationResult;
} {
  return {
    getOptimalBid: (request: OptimizationRequest): OptimizationResult => {
      // Step 1: Assess player value
      const playerValue = services.playerValueAssessor.assessValue(request.playerId, request.position);
      
      // Step 2: Analyze bidding patterns for similar players
      const biddingPattern = services.biddingAnalyzer.analyzeSimilarPlayers({
        position: request.position,
        tier: playerValue.tier,
        value: playerValue.tier
      });
      
      // Step 3: Get current budget status
      const budget = services.budgetTracker.getBudgetStatus(request.userId, request.leagueId);
      
      // Step 4: Calculate optimal bid using all data
      const bidRecommendation = services.bidCalculator.calculateOptimalBid({
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
      });
      
      // Step 5: Calculate budget impact
      const budgetImpact = {
        remaining: budget.remaining,
        percentageUsed: Math.round((bidRecommendation.recommendedBid / budget.totalBudget) * 100)
      };
      
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
  };
}