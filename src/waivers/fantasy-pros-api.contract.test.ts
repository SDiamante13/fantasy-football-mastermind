import { FantasyProsApiService } from './fantasy-pros-api';

describe('FantasyPros API Contract Tests', () => {
  const apiService = new FantasyProsApiService();

  describe('getConsensusRankings', () => {
    it('should return player rankings with required fields', async () => {
      const rankings = await apiService.getConsensusRankings('HALF_PPR');

      expect(Array.isArray(rankings)).toBe(true);
      expect(rankings.length).toBeGreaterThan(0);

      const player = rankings[0];
      expect(player).toHaveProperty('player_id');
      expect(player).toHaveProperty('player_name');
      expect(player).toHaveProperty('position');
      expect(player).toHaveProperty('team');
      expect(player).toHaveProperty('rank');
      expect(player).toHaveProperty('tier');
      expect(typeof player.rank).toBe('number');
      expect(typeof player.tier).toBe('number');
    });

    it('should handle different scoring formats', async () => {
      const halfPprRankings = await apiService.getConsensusRankings('HALF_PPR');
      const pprRankings = await apiService.getConsensusRankings('PPR');

      expect(halfPprRankings).toBeDefined();
      expect(pprRankings).toBeDefined();
      // Rankings should be different between formats
      expect(halfPprRankings[0].rank).not.toBe(pprRankings[0].rank);
    });
  });

  describe('getPlayerProjections', () => {
    it('should return ROS projections for specified position', async () => {
      const rbProjections = await apiService.getPlayerProjections('RB', 'HALF_PPR');

      expect(Array.isArray(rbProjections)).toBe(true);
      expect(rbProjections.length).toBeGreaterThan(0);

      const projection = rbProjections[0];
      expect(projection).toHaveProperty('player_id');
      expect(projection).toHaveProperty('projected_points');
      expect(projection).toHaveProperty('games_remaining');
      expect(projection).toHaveProperty('opportunity_score');
      expect(typeof projection.projected_points).toBe('number');
    });
  });

  describe('getTrendingPlayers', () => {
    it('should return trending up players with trend data', async () => {
      const trending = await apiService.getTrendingPlayers('up');

      expect(Array.isArray(trending)).toBe(true);
      expect(trending.length).toBeGreaterThan(0);

      const player = trending[0];
      expect(player).toHaveProperty('player_id');
      expect(player).toHaveProperty('trend_direction');
      expect(player).toHaveProperty('rank_change');
      expect(player.trend_direction).toBe('up');
      expect(typeof player.rank_change).toBe('number');
    });
  });
});