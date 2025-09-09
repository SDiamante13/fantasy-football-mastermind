export type Transaction = {
  type: string;
  drops?: Record<string, string>;
  creator: string;
  created: number;
};

type SleeperApi = {
  getTransactions: (leagueId: string, round: number) => Transaction[];
};

type PlayerStats = {
  getRosterPercentage: (playerId: string) => number;
};

type DropAlert = {
  playerId: string;
  rosterPercentage: number;
};

function isHighValueDrop(playerId: string, playerStats: PlayerStats): DropAlert | null {
  const rosterPercentage = playerStats.getRosterPercentage(playerId);
  if (rosterPercentage > 50) {
    return { playerId, rosterPercentage };
  }
  return null;
}

function processTransaction(transaction: Transaction, playerStats: PlayerStats): DropAlert[] {
  if (transaction.type !== 'free_agent' || !transaction.drops) {
    return [];
  }

  const alerts: DropAlert[] = [];
  for (const playerId of Object.values(transaction.drops)) {
    const alert = isHighValueDrop(playerId, playerStats);
    if (alert) {
      alerts.push(alert);
    }
  }
  return alerts;
}

export function createPlayerMonitor(
  sleeperApi: SleeperApi,
  playerStats: PlayerStats
): {
  checkForDrops: (leagueId: string) => DropAlert[];
} {
  return {
    checkForDrops: (leagueId: string): DropAlert[] => {
      const transactions = sleeperApi.getTransactions(leagueId, 1);
      const alerts: DropAlert[] = [];

      for (const transaction of transactions) {
        alerts.push(...processTransaction(transaction, playerStats));
      }

      return alerts;
    }
  };
}
