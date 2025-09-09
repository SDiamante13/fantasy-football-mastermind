import { createSleeperApi } from './sleeper-api';

describe('Sleeper API Integration', () => {
  it('fetches real user data for gaspjr', async () => {
    const sleeperApi = createSleeperApi();
    const user = await sleeperApi.getUser('gaspjr');

    expect(user.user_id).toBeDefined();
    expect(user.username).toBe('gaspjr');
    expect(user.display_name).toBeDefined();
  });

  it('fetches real leagues for gaspjr', async () => {
    const sleeperApi = createSleeperApi();
    const user = await sleeperApi.getUser('gaspjr');
    const leagues = await sleeperApi.getUserLeagues(user.user_id, 'nfl', '2025');

    expect(leagues).toHaveLength(2);
    expect(leagues[0].league_id).toBeDefined();
  });
});
