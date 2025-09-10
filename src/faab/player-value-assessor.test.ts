import { createPlayerValueAssessor } from './player-value-assessor';

const createMockPlayerData = (): {
  getPlayerStats: () => {
    rosterPercentage: number;
    targetShare: number;
    recentPoints: number;
  };
  getPositionContext: () => { positionScarcity: number; waiversDepth: number };
} => ({
  getPlayerStats: (): {
    rosterPercentage: number;
    targetShare: number;
    recentPoints: number;
  } => ({
    rosterPercentage: 45,
    targetShare: 18,
    recentPoints: 12.5
  }),
  getPositionContext: (): { positionScarcity: number; waiversDepth: number } => ({
    positionScarcity: 8.5,
    waiversDepth: 15
  })
});

describe('Player Value Assessor', () => {
  it('categorizes players by value tier based on multiple factors', () => {
    const assessor = createPlayerValueAssessor(createMockPlayerData());
    const assessment = assessor.assessValue('player_123', 'RB');

    expect(assessment.tier).toBe('medium');
    expect(assessment.score).toBeGreaterThan(60);
    expect(assessment.factors.rosterPercentage).toBe(45);
    expect(assessment.factors.positionScarcity).toBe(8.5);
    expect(assessment.confidence).toBe('high');
  });
});
