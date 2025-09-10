import { createBudgetTracker } from './budget-tracker';

describe('Budget Tracker', () => {
  it('tracks remaining FAAB budget for user', () => {
    const mockBudgetData = {
      getUserTransactions: (): Array<{ amount: number; weekNumber: number; playerId: string }> => [
        { amount: 25, weekNumber: 3, playerId: 'player1' },
        { amount: 15, weekNumber: 5, playerId: 'player2' },
        { amount: 8, weekNumber: 7, playerId: 'player3' }
      ],
      getLeagueSettings: (): { totalFAABBudget: number; currentWeek: number } => ({
        totalFAABBudget: 200,
        currentWeek: 8
      })
    };

    const tracker = createBudgetTracker(mockBudgetData);
    const budget = tracker.getBudgetStatus('user123', 'league456');

    expect(budget.totalBudget).toBe(200);
    expect(budget.spent).toBe(48);
    expect(budget.remaining).toBe(152);
    expect(budget.percentageSpent).toBe(24);
    expect(budget.weeksRemaining).toBeGreaterThan(8);
  });
});