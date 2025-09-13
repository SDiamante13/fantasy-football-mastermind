import { createPlayerProjectionService } from './player-projections';

describe('Player Projection Service', () => {
  const projectionService = createPlayerProjectionService();

  describe('getWeeklyProjection', () => {
    it('should return QB projection for Lamar Jackson', async () => {
      const projection = await projectionService.getWeeklyProjection('4046', 'QB', 'BAL');

      expect(projection).toBeGreaterThan(15);
      expect(projection).toBeLessThan(40);
      expect(Number.isInteger(projection)).toBe(true);
    });

    it('should return RB projection for Christian McCaffrey', async () => {
      const projection = await projectionService.getWeeklyProjection('4988', 'RB', 'SF');

      expect(projection).toBeGreaterThan(10);
      expect(projection).toBeLessThan(30);
      expect(Number.isInteger(projection)).toBe(true);
    });

    it('should return WR projection for Cooper Kupp', async () => {
      const projection = await projectionService.getWeeklyProjection('5859', 'WR', 'LAR');

      expect(projection).toBeGreaterThan(8);
      expect(projection).toBeLessThan(25);
      expect(Number.isInteger(projection)).toBe(true);
    });

    it('should return TE projection for Travis Kelce', async () => {
      const projection = await projectionService.getWeeklyProjection('5848', 'TE', 'KC');

      expect(projection).toBeGreaterThan(6);
      expect(projection).toBeLessThanOrEqual(25);
      expect(Number.isInteger(projection)).toBe(true);
    });

    it('should return lower projection for bench players', async () => {
      const projection = await projectionService.getWeeklyProjection('unknown', 'WR', 'FA');

      expect(projection).toBeGreaterThan(0);
      expect(projection).toBeLessThan(8);
      expect(Number.isInteger(projection)).toBe(true);
    });

    it('should handle kicker projections', async () => {
      const projection = await projectionService.getWeeklyProjection('123', 'K', 'KC');

      expect(projection).toBeGreaterThan(5);
      expect(projection).toBeLessThan(15);
      expect(Number.isInteger(projection)).toBe(true);
    });

    it('should handle defense projections', async () => {
      const projection = await projectionService.getWeeklyProjection('DEF', 'DEF', 'SF');

      expect(projection).toBeGreaterThan(5);
      expect(projection).toBeLessThan(20);
      expect(Number.isInteger(projection)).toBe(true);
    });
  });

  describe('getSeasonProjection', () => {
    it('should return season-long projection for elite QB', async () => {
      const seasonProjection = await projectionService.getSeasonProjection('4046', 'QB', 'BAL');

      expect(seasonProjection).toBeGreaterThan(300);
      expect(seasonProjection).toBeLessThan(550);
    });

    it('should return season-long projection for RB1', async () => {
      const seasonProjection = await projectionService.getSeasonProjection('4988', 'RB', 'SF');

      expect(seasonProjection).toBeGreaterThan(250);
      expect(seasonProjection).toBeLessThan(500);
    });
  });
});