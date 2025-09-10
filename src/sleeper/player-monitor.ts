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

type PlayerData = {
  getPlayerDetails: (playerId: string) => { name: string; position: string; team: string };
};

type DropAlert = {
  playerId: string;
  rosterPercentage: number;
  playerName?: string;
};

function isHighValueDrop(playerId: string, playerStats: PlayerStats, playerData?: PlayerData): DropAlert | null {
  const rosterPercentage = playerStats.getRosterPercentage(playerId);
  if (rosterPercentage > 50) {
    const alert: DropAlert = { playerId, rosterPercentage };
    if (playerData) {
      const details = playerData.getPlayerDetails(playerId);
      alert.playerName = details.name;
    }
    return alert;
  }
  return null;
}

function processTransaction(transaction: Transaction, playerStats: PlayerStats, playerData?: PlayerData): DropAlert[] {
  if (transaction.type !== 'free_agent' || !transaction.drops) {
    return [];
  }

  const alerts: DropAlert[] = [];
  for (const playerId of Object.values(transaction.drops)) {
    const alert = isHighValueDrop(playerId, playerStats, playerData);
    if (alert) {
      alerts.push(alert);
    }
  }
  return alerts;
}

export function createPlayerMonitor(
  sleeperApi: SleeperApi,
  playerStats: PlayerStats,
  playerData?: PlayerData
): {
  checkForDrops: (leagueId: string) => DropAlert[];
} {
  return {
    checkForDrops: (leagueId: string): DropAlert[] => {
      const transactions = sleeperApi.getTransactions(leagueId, 1);
      const alerts: DropAlert[] = [];

      for (const transaction of transactions) {
        alerts.push(...processTransaction(transaction, playerStats, playerData));
      }

      return alerts;
    }
  };
}
