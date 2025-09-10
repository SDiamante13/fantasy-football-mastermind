type PlayerValue = {
  tier: 'high' | 'medium' | 'low';
  score: number;
  confidence: 'high' | 'medium' | 'low';
};

type BiddingPattern = {
  averageWinningBid: number;
  bidRange: { min: number; max: number };
  sampleSize: number;
};

type Budget = {
  remaining: number;
  percentageSpent: number;
  weeksRemaining: number;
};

type LeagueContext = {
  activeManagers: number;
  competitionLevel: 'high' | 'medium' | 'low';
};

type BidData = {
  playerValue: PlayerValue;
  biddingPattern: BiddingPattern;
  budget: Budget;
  leagueContext: LeagueContext;
};

type BidRecommendation = {
  recommendedBid: number;
  winProbability: number;
  strategy: 'conservative' | 'balanced' | 'aggressive';
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
};

function calculateBaseBid(biddingPattern: BiddingPattern, playerValue: PlayerValue, leagueContext: LeagueContext): number {
  let baseBid = biddingPattern.averageWinningBid;
  
  const valueMultiplier = playerValue.tier === 'high' ? 1.3 : 
                         playerValue.tier === 'medium' ? 1.1 : 0.9;
  baseBid *= valueMultiplier;
  
  const competitionMultiplier = leagueContext.competitionLevel === 'high' ? 1.2 : 
                               leagueContext.competitionLevel === 'medium' ? 1.1 : 1.0;
  baseBid *= competitionMultiplier;
  
  return baseBid;
}

function calculateWinProbability(recommendedBid: number, bidRange: { min: number; max: number }): number {
  const bidPosition = (recommendedBid - bidRange.min) / (bidRange.max - bidRange.min);
  return Math.max(0.3, Math.min(0.95, 0.5 + bidPosition * 0.4));
}

function determineStrategy(recommendedBid: number, remainingBudget: number): 'conservative' | 'balanced' | 'aggressive' {
  const budgetRatio = recommendedBid / remainingBudget;
  return budgetRatio < 0.2 ? 'conservative' :
         budgetRatio < 0.4 ? 'balanced' : 'aggressive';
}

function determineConfidence(sampleSize: number, playerConfidence: 'high' | 'medium' | 'low'): 'high' | 'medium' | 'low' {
  return sampleSize >= 5 && playerConfidence === 'high' ? 'high' : 'medium';
}

export function createBidCalculator(): {
  calculateOptimalBid: (data: BidData) => BidRecommendation;
} {
  return {
    calculateOptimalBid: (data: BidData): BidRecommendation => {
      const baseBid = calculateBaseBid(data.biddingPattern, data.playerValue, data.leagueContext);
      const maxAffordableBid = Math.min(data.budget.remaining * 0.4, baseBid);
      const recommendedBid = Math.round(Math.min(baseBid, maxAffordableBid));
      
      const winProbability = calculateWinProbability(recommendedBid, data.biddingPattern.bidRange);
      const strategy = determineStrategy(recommendedBid, data.budget.remaining);
      const confidence = determineConfidence(data.biddingPattern.sampleSize, data.playerValue.confidence);
      const reasoning = `Recommended for ${data.playerValue.tier}-tier player based on ${data.biddingPattern.sampleSize} similar transactions`;
      
      return {
        recommendedBid,
        winProbability: Math.round(winProbability * 100) / 100,
        strategy,
        confidence,
        reasoning
      };
    }
  };
}