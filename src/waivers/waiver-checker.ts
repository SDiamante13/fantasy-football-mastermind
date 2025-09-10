type SleeperApi = {
  getLeagueRosters: (leagueId: string) => Array<{ players: string[] }>;
};

export function createWaiverChecker(sleeperApi: SleeperApi): {
  checkAvailability: (playerIds: string[], leagueId: string) => string[];
} {
  return {
    checkAvailability: (playerIds: string[], leagueId: string): string[] => {
      const rosters = sleeperApi.getLeagueRosters(leagueId);
      const rosteredPlayers = new Set<string>();

      for (const roster of rosters) {
        for (const playerId of roster.players) {
          rosteredPlayers.add(playerId);
        }
      }

      return playerIds.filter(playerId => !rosteredPlayers.has(playerId));
    }
  };
}
