import { SleeperApiService } from './SleeperApiService';

describe('SleeperApiService', () => {
  it('should fetch trending player additions from API', async () => {
    const service = new SleeperApiService();
    const trendingAdds = await service.getTrendingAdds();

    expect(Array.isArray(trendingAdds)).toBe(true);
    expect(trendingAdds.length).toBeGreaterThan(0);
    expect(trendingAdds[0]).toHaveProperty('player_id');
    expect(trendingAdds[0]).toHaveProperty('count');
  });

  it('should fetch trending player drops from API', async () => {
    const service = new SleeperApiService();
    const trendingDrops = await service.getTrendingDrops();

    expect(Array.isArray(trendingDrops)).toBe(true);
    expect(trendingDrops.length).toBeGreaterThan(0);
    expect(trendingDrops[0]).toHaveProperty('player_id');
    expect(trendingDrops[0]).toHaveProperty('count');
  });
});