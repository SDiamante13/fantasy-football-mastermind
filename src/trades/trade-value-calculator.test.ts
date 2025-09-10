import { createTradeValueCalculator } from './trade-value-calculator';

describe('Trade Value Calculator', () => {
  it('[TEST] calculates trade value differential between proposed players', () => {
    const mockPlayerValuer = {
      getPlayerValue: (
        playerId: string
      ): { value: number; projectedPoints: number; consistency: number } => {
        if (playerId === 'elite_rb') {
          return { value: 85, projectedPoints: 18.5, consistency: 92 };
        }
        return { value: 72, projectedPoints: 14.2, consistency: 78 };
      }
    };

    const calculator = createTradeValueCalculator(mockPlayerValuer);
    const assessment = calculator.assessTrade({
      teamA: { playersGiving: ['elite_rb'], playersReceiving: ['good_wr'] },
      teamB: { playersGiving: ['good_wr'], playersReceiving: ['elite_rb'] }
    });

    expect(assessment.teamAValueDiff).toBeLessThan(0);
    expect(assessment.teamBValueDiff).toBeGreaterThan(0);
    expect(assessment.fairness).toBe('favors_team_b');
    expect(assessment.totalValue).toBeGreaterThan(150);
  });
});
