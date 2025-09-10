type PlayerData = {
  getPlayerStatus: (playerId: string) => { status: string; injury_status: string };
};

type InjuryAlert = {
  playerId: string;
  injuryStatus: string;
  severity: string;
};

export function createInjuryDetector(playerData: PlayerData): {
  checkForInjuries: (playerIds: string[]) => InjuryAlert[];
} {
  return {
    checkForInjuries: (playerIds: string[]): InjuryAlert[] => {
      const alerts: InjuryAlert[] = [];

      for (const playerId of playerIds) {
        const status = playerData.getPlayerStatus(playerId);
        if (status.injury_status === 'Out') {
          alerts.push({
            playerId,
            injuryStatus: status.injury_status,
            severity: 'high'
          });
        }
      }

      return alerts;
    }
  };
}
