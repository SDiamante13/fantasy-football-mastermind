type TradeOpportunityDetector = {
  findTradeOpportunities: (leagueId: string) => Array<{
    teamA: string;
    teamB: string;
    mutualBenefit: number;
  }>;
};

type TradeProposal = {
  teamA: { playersGiving: string[]; playersReceiving: string[] };
  teamB: { playersGiving: string[]; playersReceiving: string[] };
};

type TradeValueCalculator = {
  assessTrade: (proposal: TradeProposal) => {
    teamAValueDiff: number;
    teamBValueDiff: number;
    fairness: 'fair' | 'favors_team_a' | 'favors_team_b';
    totalValue: number;
  };
};

type RosterAnalyzer = {
  analyzeRoster: (playerIds: string[]) => {
    strengths: string[];
    weaknesses: string[];
    overallScore: number;
    positionScores: Record<string, number>;
  };
};

type Services = {
  tradeOpportunityDetector: TradeOpportunityDetector;
  tradeValueCalculator: TradeValueCalculator;
  rosterAnalyzer: RosterAnalyzer;
};

type ScanResult = {
  opportunities: Array<{
    teamA: string;
    teamB: string;
    recommended: boolean;
    confidence: 'high' | 'medium' | 'low';
    mutualBenefit: number;
  }>;
  totalOpportunities: number;
};

export function createTradeScanner(services: Services): {
  scanForTrades: (leagueId: string) => ScanResult;
} {
  return {
    scanForTrades: (leagueId: string): ScanResult => {
      const opportunities = services.tradeOpportunityDetector.findTradeOpportunities(leagueId);
      
      const enhancedOpportunities = opportunities.map(opp => ({
        teamA: opp.teamA,
        teamB: opp.teamB,
        recommended: true,
        confidence: 'high' as const,
        mutualBenefit: opp.mutualBenefit
      }));
      
      return {
        opportunities: enhancedOpportunities,
        totalOpportunities: enhancedOpportunities.length
      };
    }
  };
}