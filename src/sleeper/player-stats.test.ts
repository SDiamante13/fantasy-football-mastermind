import { createPlayerStats } from './player-stats';

describe('Player Stats', () => {
  it('returns 0 for unknown player ID', () => {
    const playerStats = createPlayerStats();
    const rosterPercentage = playerStats.getRosterPercentage('unknown_player');

    expect(rosterPercentage).toBe(0);
  });

  it('returns roster percentage for known player ID', () => {
    const mockPlayerData = {
      '1426': { player_id: '1426', full_name: 'Saquon Barkley' }
    };
    const mockTrendingData = [{ player_id: '1426', count: 75 }];

    const playerStats = createPlayerStats(mockPlayerData, mockTrendingData);
    const rosterPercentage = playerStats.getRosterPercentage('1426');

    expect(rosterPercentage).toBe(75);
  });

  it('gets roster percentage for a player', () => {
    const playerStats = createPlayerStats();
    const rosterPercentage = playerStats.getRosterPercentage('1426');

    expect(typeof rosterPercentage).toBe('number');
    expect(rosterPercentage).toBeGreaterThanOrEqual(0);
    expect(rosterPercentage).toBeLessThanOrEqual(100);
  });
});
