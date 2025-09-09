import { createPlayerStats } from './player-stats';

describe('Player Stats', () => {
  it('gets roster percentage for a player', () => {
    const playerStats = createPlayerStats();
    const rosterPercentage = playerStats.getRosterPercentage('1426');

    expect(typeof rosterPercentage).toBe('number');
    expect(rosterPercentage).toBeGreaterThanOrEqual(0);
    expect(rosterPercentage).toBeLessThanOrEqual(100);
  });
});
