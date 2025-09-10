export function createPlayerStats(
  mockPlayerData?: Record<string, { player_id: string; full_name: string }>,
  mockTrendingData?: Array<{ player_id: string; count: number }>
): {
  getRosterPercentage: (playerId: string) => number;
} {
  return {
    getRosterPercentage: (playerId: string): number => {
      if (mockTrendingData) {
        const trending = mockTrendingData.find(p => p.player_id === playerId);
        if (trending) {
          return trending.count;
        }
      }
      return 0;
    }
  };
}
