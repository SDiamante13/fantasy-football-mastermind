import { createBackupFinder } from './backup-finder';

describe('Backup Finder', () => {
  it('identifies backup players for injured starter', () => {
    const mockPlayerData = {
      getPlayerInfo: (playerId: string): { position: string; team: string; name: string } => {
        if (playerId === 'saquon_123') {
          return { position: 'RB', team: 'NYG', name: 'Saquon Barkley' };
        }
        if (playerId === 'jones_456') {
          return { position: 'QB', team: 'NYG', name: 'Daniel Jones' };
        }
        return { position: 'RB', team: 'NYG', name: 'Matt Breida' };
      },
      getTeamPlayers: (): string[] => ['saquon_123', 'jones_456', 'breida_789']
    };

    const backupFinder = createBackupFinder(mockPlayerData);
    const backups = backupFinder.findBackups('saquon_123');

    expect(backups).toHaveLength(1);
    expect(backups[0].playerId).toBe('breida_789');
    expect(backups[0].position).toBe('RB');
    expect(backups[0].team).toBe('NYG');
  });
});