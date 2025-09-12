import { createSleeperApi } from '../sleeper/sleeper-api';

describe('Sleeper API Contract', () => {
  const sleeperApi = createSleeperApi();

  it('should fetch real user data from Sleeper API', async () => {
    const user = await sleeperApi.getUser('sleeperuser');
    
    expect(user).toHaveProperty('user_id');
    expect(user).toHaveProperty('username');
    expect(user).toHaveProperty('display_name');
    expect(user).toHaveProperty('avatar');
    expect(typeof user.user_id).toBe('string');
    expect(typeof user.username).toBe('string');
  });

  it('should handle invalid username from Sleeper API', async () => {
    await expect(sleeperApi.getUser('nonexistentuser123456789')).rejects.toThrow();
  });
});