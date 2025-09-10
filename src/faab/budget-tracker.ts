type BudgetData = {
  getUserTransactions: (
    userId: string,
    leagueId: string
  ) => Array<{ amount: number; weekNumber: number; playerId: string }>;
  getLeagueSettings: (leagueId: string) => { totalFAABBudget: number; currentWeek: number };
};

type BudgetStatus = {
  totalBudget: number;
  spent: number;
  remaining: number;
  percentageSpent: number;
  weeksRemaining: number;
};

export function createBudgetTracker(budgetData: BudgetData): {
  getBudgetStatus: (userId: string, leagueId: string) => BudgetStatus;
} {
  return {
    getBudgetStatus: (userId: string, leagueId: string): BudgetStatus => {
      const transactions = budgetData.getUserTransactions(userId, leagueId);
      const settings = budgetData.getLeagueSettings(leagueId);

      const totalBudget = settings.totalFAABBudget;
      const spent = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
      const remaining = totalBudget - spent;
      const percentageSpent = Math.round((spent / totalBudget) * 100);

      // Assume 17-week regular season + playoffs
      const totalWeeks = 17;
      const weeksRemaining = Math.max(totalWeeks - settings.currentWeek, 0);

      return {
        totalBudget,
        spent,
        remaining,
        percentageSpent,
        weeksRemaining
      };
    }
  };
}
