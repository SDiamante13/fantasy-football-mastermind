type PlayerData = {
  getPlayerInfo: (playerId: string) => { position: string; team: string; name: string };
  getTeamPlayers: (team: string) => string[];
};

type BackupPlayer = {
  playerId: string;
  position: string;
  team: string;
  name: string;
};

export function createBackupFinder(playerData: PlayerData): {
  findBackups: (injuredPlayerId: string) => BackupPlayer[];
} {
  return {
    findBackups: (injuredPlayerId: string): BackupPlayer[] => {
      const injuredPlayer = playerData.getPlayerInfo(injuredPlayerId);
      const teamPlayers = playerData.getTeamPlayers(injuredPlayer.team);
      const backups: BackupPlayer[] = [];

      for (const playerId of teamPlayers) {
        if (playerId === injuredPlayerId) continue;

        const player = playerData.getPlayerInfo(playerId);
        if (player.position === injuredPlayer.position) {
          backups.push({
            playerId,
            position: player.position,
            team: player.team,
            name: player.name
          });
        }
      }

      return backups;
    }
  };
}
