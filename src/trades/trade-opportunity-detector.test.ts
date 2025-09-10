import { createTradeOpportunityDetector } from './trade-opportunity-detector';

const createMockRosterAnalyzer = (): {
  analyzeRoster: (playerIds: string[]) => {
    strengths: string[];
    weaknesses: string[];
    overallScore: number;
    positionScores: Record<string, number>;
  };
} => ({
  analyzeRoster: (
    playerIds: string[]
  ): {
    strengths: string[];
    weaknesses: string[];
    overallScore: number;
    positionScores: Record<string, number>;
  } => {
    if (playerIds.includes('rb_elite')) {
      return {
        strengths: ['RB'],
        weaknesses: ['WR'],
        overallScore: 75,
        positionScores: { RB: 90, WR: 40 }
      };
    }
    return {
      strengths: ['WR'],
      weaknesses: ['RB'],
      overallScore: 72,
      positionScores: { WR: 88, RB: 35 }
    };
  }
});

const createMockLeagueData = (): {
  getTeamRosters: () => Array<{ teamId: string; playerIds: string[] }>;
} => ({
  getTeamRosters: (): Array<{ teamId: string; playerIds: string[] }> => [
    { teamId: 'team_a', playerIds: ['rb_elite', 'wr_poor'] },
    { teamId: 'team_b', playerIds: ['wr_elite', 'rb_poor'] }
  ]
});

describe('Trade Opportunity Detector', () => {
  it('[TEST] identifies mutually beneficial trades between teams', () => {
    const mockRosterAnalyzer = createMockRosterAnalyzer();

    const mockLeagueData = createMockLeagueData();

    const detector = createTradeOpportunityDetector(mockRosterAnalyzer, mockLeagueData);
    const opportunities = detector.findTradeOpportunities('league_123');

    expect(opportunities).toHaveLength(1);
    expect(opportunities[0].teamA).toBe('team_a');
    expect(opportunities[0].teamB).toBe('team_b');
    expect(opportunities[0].mutualBenefit).toBeGreaterThan(0);
  });
});
