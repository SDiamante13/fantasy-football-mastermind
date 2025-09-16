import { SleeperApiService } from '../services/SleeperApiService';

import { HotPickupsEngine } from './hot-pickups-engine';
import { FantasyProsApiService } from './fantasy-pros-api';

describe('Hot Pickups Engine Contract Tests', () => {
  const sleeperApi = new SleeperApiService();
  const fantasyProsApi = new FantasyProsApiService();
  const engine = new HotPickupsEngine({ sleeperApi, fantasyProsApi });

  describe('getHotPickups', () => {
    it('should return team-specific hot pickups with multi-factor scores', async () => {
      const request = {
        leagueId: 'test_league_123',
        rosterId: 1,
        teamAnalysis: 'need_rb2' as const,
        strategy: 'balanced' as const
      };

      const hotPickups = await engine.getHotPickups(request);

      expect(Array.isArray(hotPickups)).toBe(true);
      expect(hotPickups.length).toBeGreaterThan(0);

      const pickup = hotPickups[0];
      expect(pickup).toHaveProperty('player_id');
      expect(pickup).toHaveProperty('player_name');
      expect(pickup).toHaveProperty('position');
      expect(pickup).toHaveProperty('total_score');
      expect(pickup).toHaveProperty('score_breakdown');
      expect(pickup).toHaveProperty('recommendation_reason');
      expect(pickup).toHaveProperty('faab_suggestion');

      // Score breakdown should include all factors
      const breakdown = pickup.score_breakdown;
      expect(breakdown).toHaveProperty('opportunity_score');
      expect(breakdown).toHaveProperty('performance_score');
      expect(breakdown).toHaveProperty('matchup_score');
      expect(breakdown).toHaveProperty('team_fit_bonus');
      expect(breakdown).toHaveProperty('trending_bonus');

      // All scores should be numbers
      Object.values(breakdown).forEach(score => {
        expect(typeof score).toBe('number');
      });
    });

    it('should prioritize positional needs when team analysis indicates weakness', async () => {
      const needRb2Request = {
        leagueId: 'test_league_123',
        rosterId: 1,
        teamAnalysis: 'need_rb2' as const,
        strategy: 'balanced' as const
      };

      const needWr2Request = {
        leagueId: 'test_league_123',
        rosterId: 1,
        teamAnalysis: 'need_wr2' as const,
        strategy: 'balanced' as const
      };

      const rbPickups = await engine.getHotPickups(needRb2Request);
      const wrPickups = await engine.getHotPickups(needWr2Request);

      // Should prioritize RBs for RB-needy team
      const topRbPickup = rbPickups[0];
      expect(topRbPickup.position).toBe('RB');

      // Should prioritize WRs for WR-needy team
      const topWrPickup = wrPickups[0];
      expect(topWrPickup.position).toBe('WR');
    });

    it('should show league-winning upside players for healthy teams', async () => {
      const healthyTeamRequest = {
        leagueId: 'test_league_123',
        rosterId: 1,
        teamAnalysis: 'healthy' as const,
        strategy: 'aggressive' as const
      };

      const pickups = await engine.getHotPickups(healthyTeamRequest);
      const topPickup = pickups[0];

      expect(topPickup.recommendation_reason).toMatch(/upside|breakout|league.winning/i);
      expect(topPickup.score_breakdown.trending_bonus).toBeGreaterThan(0);
    });
  });

  describe('getTeamAnalysis', () => {
    it('should analyze team positional strength', async () => {
      const analysis = await engine.getTeamAnalysis('test_league_123', 1);

      expect(analysis).toHaveProperty('overall_health');
      expect(analysis).toHaveProperty('positional_needs');
      expect(analysis).toHaveProperty('immediate_vs_longterm');

      expect(['healthy', 'need_rb2', 'need_wr2', 'need_flex', 'multiple_holes']).toContain(
        analysis.overall_health
      );

      expect(Array.isArray(analysis.positional_needs)).toBe(true);
      expect(['immediate', 'longterm', 'mixed']).toContain(analysis.immediate_vs_longterm);
    });
  });
});