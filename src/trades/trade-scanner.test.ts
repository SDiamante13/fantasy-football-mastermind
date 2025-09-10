import { createTradeScanner } from './trade-scanner';

type MockServices = {
  tradeOpportunityDetector: { findTradeOpportunities: () => Array<{ teamA: string; teamB: string; mutualBenefit: number }> };
  tradeValueCalculator: { assessTrade: () => { teamAValueDiff: number; teamBValueDiff: number; fairness: 'fair'; totalValue: number } };
  rosterAnalyzer: { analyzeRoster: (playerIds: string[]) => { strengths: string[]; weaknesses: string[]; overallScore: number; positionScores: Record<string, number> } };
};

const createMockServices = (): MockServices => ({
  tradeOpportunityDetector: {
    findTradeOpportunities: (): Array<{ teamA: string; teamB: string; mutualBenefit: number }> => [
      { teamA: 'team_strong_rb', teamB: 'team_strong_wr', mutualBenefit: 1 }
    ]
  },
  tradeValueCalculator: {
    assessTrade: (): { teamAValueDiff: number; teamBValueDiff: number; fairness: 'fair'; totalValue: number } => ({
      teamAValueDiff: 3,
      teamBValueDiff: -3,
      fairness: 'fair' as const,
      totalValue: 165
    })
  },
  rosterAnalyzer: {
    analyzeRoster: (playerIds: string[]): { strengths: string[]; weaknesses: string[]; overallScore: number; positionScores: Record<string, number> } => {
      if (playerIds.includes('strong_rb')) {
        return { strengths: ['RB'], weaknesses: ['WR'], overallScore: 78, positionScores: { RB: 92, WR: 45 } };
      }
      return { strengths: ['WR'], weaknesses: ['RB'], overallScore: 76, positionScores: { WR: 88, RB: 42 } };
    }
  }
});

describe('Trade Scanner', () => {
  it('[TEST] provides comprehensive trade opportunity analysis for league', () => {
    const mockServices = createMockServices();

    const scanner = createTradeScanner(mockServices);
    const results = scanner.scanForTrades('league_456');

    expect(results.opportunities).toHaveLength(1);
    expect(results.opportunities[0].recommended).toBe(true);
    expect(results.opportunities[0].confidence).toBe('high');
    expect(results.totalOpportunities).toBe(1);
  });
});