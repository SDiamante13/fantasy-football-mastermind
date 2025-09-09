import { createPlayerMonitor, Transaction } from './player-monitor';

describe('Player Monitor', () => {
  it('detects when a player with >50% roster rate is dropped', () => {
    const mockSleeperApi = {
      getTransactions: (): Transaction[] => [
        {
          type: 'free_agent',
          drops: { '123': 'player123' },
          creator: 'user1',
          created: Date.now()
        }
      ]
    };

    const mockPlayerStats = {
      getRosterPercentage: (): number => 75
    };

    const playerMonitor = createPlayerMonitor(mockSleeperApi, mockPlayerStats);
    const alerts = playerMonitor.checkForDrops('league123');

    expect(alerts).toHaveLength(1);
    expect(alerts[0].playerId).toBe('player123');
    expect(alerts[0].rosterPercentage).toBe(75);
  });
});
