import { SleeperApiService } from '../services/SleeperApiService';

import { HotPickupsEngine } from './hot-pickups-engine';

describe('HotPickupsEngine', () => {
  it('should generate hot pickups using real waiver wire activity', async () => {
    const sleeperApi = new SleeperApiService();
    const engine = new HotPickupsEngine({ sleeperApi });

    const request = {
      leagueId: 'test_league',
      rosterId: 1,
      teamAnalysis: 'need_flex' as const,
      strategy: 'balanced' as const
    };

    const hotPickups = await engine.getHotPickups(request);

    expect(Array.isArray(hotPickups)).toBe(true);
    expect(hotPickups.length).toBeGreaterThan(0);
    expect(hotPickups[0]).toHaveProperty('player_name');
    expect(hotPickups[0]).toHaveProperty('total_score');
    expect(hotPickups[0].total_score).toBeGreaterThan(0);
  });

  it('should prioritize players with high add activity', async () => {
    const mockSleeperApi = {
      getTrendingAdds: jest.fn().mockResolvedValue([
        { player_id: 'high_add_player', count: 500 },
        { player_id: 'low_add_player', count: 50 }
      ]),
      getAllPlayers: jest.fn().mockResolvedValue({
        'high_add_player': {
          player_id: 'high_add_player',
          full_name: 'Hot Pickup Player',
          position: 'WR',
          team: 'LAC',
          active: true
        },
        'low_add_player': {
          player_id: 'low_add_player',
          full_name: 'Mild Pickup Player',
          position: 'RB',
          team: 'DEN',
          active: true
        }
      })
    } as unknown as SleeperApiService;

    const engine = new HotPickupsEngine({ sleeperApi: mockSleeperApi });

    const request = {
      leagueId: 'test_league',
      rosterId: 1,
      teamAnalysis: 'healthy' as const,
      strategy: 'balanced' as const
    };

    const hotPickups = await engine.getHotPickups(request);

    const highAddPlayer = hotPickups.find(p => p.player_id === 'high_add_player');
    const lowAddPlayer = hotPickups.find(p => p.player_id === 'low_add_player');

    expect(highAddPlayer?.total_score).toBeGreaterThan(lowAddPlayer?.total_score || 0);
  });

  it('should work end-to-end without external ranking dependencies', async () => {
    const sleeperApi = new SleeperApiService();
    const engine = new HotPickupsEngine({ sleeperApi });

    const request = {
      leagueId: 'test_league',
      rosterId: 1,
      teamAnalysis: 'healthy' as const,
      strategy: 'balanced' as const
    };

    const hotPickups = await engine.getHotPickups(request);

    expect(Array.isArray(hotPickups)).toBe(true);
    expect(hotPickups.length).toBeGreaterThan(0);

    const firstPickup = hotPickups[0];
    expect(firstPickup).toHaveProperty('player_name');
    expect(firstPickup).toHaveProperty('total_score');
    expect(firstPickup).toHaveProperty('score_breakdown');
    expect(firstPickup.score_breakdown).toHaveProperty('opportunity_score');
    expect(firstPickup.score_breakdown).toHaveProperty('performance_score');
    expect(typeof firstPickup.total_score).toBe('number');
  });
});