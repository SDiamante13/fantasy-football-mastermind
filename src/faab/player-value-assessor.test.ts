import { createPlayerValueAssessor } from './player-value-assessor';

describe('Player Value Assessor', () => {
  it('categorizes players by value tier based on multiple factors', () => {
    const mockPlayerData = {
      getPlayerStats: (): { rosterPercentage: number; targetShare: number; recentPoints: number } => ({
        rosterPercentage: 45,
        targetShare: 18,
        recentPoints: 12.5
      }),
      getPositionContext: (): { positionScarcity: number; waiversDepth: number } => ({
        positionScarcity: 8.5,
        waiversDepth: 15
      })
    };

    const assessor = createPlayerValueAssessor(mockPlayerData);
    const assessment = assessor.assessValue('player_123', 'RB');

    expect(assessment.tier).toBe('medium');
    expect(assessment.score).toBeGreaterThan(60);
    expect(assessment.factors.rosterPercentage).toBe(45);
    expect(assessment.factors.positionScarcity).toBe(8.5);
    expect(assessment.confidence).toBe('high');
  });
});