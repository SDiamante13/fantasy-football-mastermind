import { createRosterAnalyzer } from './roster-analyzer';

const createEliteRBEvaluator = (): {
  evaluatePlayer: () => { tier: 'elite'; position: 'RB'; value: number; consistency: number };
} => ({
  evaluatePlayer: (): { tier: 'elite'; position: 'RB'; value: number; consistency: number } => ({
    tier: 'elite' as const,
    position: 'RB' as const,
    value: 85,
    consistency: 92
  })
});

const testSinglePositionStrengths = (): void => {
  const mockPlayerEvaluator = createEliteRBEvaluator();
  const rosterAnalyzer = createRosterAnalyzer(mockPlayerEvaluator);
  const analysis = rosterAnalyzer.analyzeRoster(['player_123']);

  expect(analysis.strengths).toContain('RB');
  expect(analysis.weaknesses).toHaveLength(0);
  expect(analysis.overallScore).toBeGreaterThan(80);
  expect(analysis.positionScores.RB).toBeGreaterThan(80);
};

const createMixedEvaluator = (): {
  evaluatePlayer: (playerId: string) => { tier: 'elite' | 'poor'; position: 'RB' | 'WR'; value: number; consistency: number };
} => ({
  evaluatePlayer: (playerId: string): { tier: 'elite' | 'poor'; position: 'RB' | 'WR'; value: number; consistency: number } => {
    if (playerId === 'elite_rb') {
      return { tier: 'elite' as const, position: 'RB' as const, value: 90, consistency: 85 };
    }
    return { tier: 'poor' as const, position: 'WR' as const, value: 35, consistency: 40 };
  }
});

const testMultiplePositionWeaknesses = (): void => {
  const mockPlayerEvaluator = createMixedEvaluator();
  const rosterAnalyzer = createRosterAnalyzer(mockPlayerEvaluator);
  const analysis = rosterAnalyzer.analyzeRoster(['elite_rb', 'poor_wr']);

  expect(analysis.strengths).toContain('RB');
  expect(analysis.weaknesses).toContain('WR');
  expect(analysis.positionScores.RB).toBeGreaterThan(80);
  expect(analysis.positionScores.WR).toBeLessThan(50);
};

describe('Roster Analyzer', () => {
  it('[TEST] identifies team roster strengths and weaknesses by position', testSinglePositionStrengths);
  it('[TEST] analyzes multiple positions and identifies weaknesses', testMultiplePositionWeaknesses);
});