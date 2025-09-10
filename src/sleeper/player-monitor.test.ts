import { createPlayerMonitor, Transaction } from './player-monitor';

const createMockSleeperApi = (): { getTransactions: () => Transaction[] } => ({
  getTransactions: (): Transaction[] => [
    {
      type: 'free_agent',
      drops: { '123': 'player123' },
      creator: 'user1',
      created: Date.now()
    }
  ]
});

const createMockPlayerStats = (): { getRosterPercentage: () => number } => ({
  getRosterPercentage: (): number => 75
});

const createMockPlayerData = (): { getPlayerDetails: () => { name: string; position: string; team: string } } => ({
  getPlayerDetails: (): { name: string; position: string; team: string } => ({
    name: 'Saquon Barkley',
    position: 'RB', 
    team: 'NYG'
  })
});

describe('Player Monitor', () => {
  it('includes player name in drop alert', () => {
    const playerMonitor = createPlayerMonitor(
      createMockSleeperApi(), 
      createMockPlayerStats(), 
      createMockPlayerData()
    );
    const alerts = playerMonitor.checkForDrops('league123');

    expect(alerts).toHaveLength(1);
    expect(alerts[0].playerId).toBe('player123');
    expect(alerts[0].rosterPercentage).toBe(75);
    expect(alerts[0].playerName).toBe('Saquon Barkley');
  });

  it('detects when a player with >50% roster rate is dropped', () => {
    const playerMonitor = createPlayerMonitor(
      createMockSleeperApi(), 
      createMockPlayerStats()
    );
    const alerts = playerMonitor.checkForDrops('league123');

    expect(alerts).toHaveLength(1);
    expect(alerts[0].playerId).toBe('player123');
    expect(alerts[0].rosterPercentage).toBe(75);
  });
});
