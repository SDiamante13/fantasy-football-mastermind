export function createPlayerStats(): {
  getRosterPercentage: (playerId: string) => number;
} {
  return {
    getRosterPercentage: (): number => {
      return 0;
    }
  };
}
