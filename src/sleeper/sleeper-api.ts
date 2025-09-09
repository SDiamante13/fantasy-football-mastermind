const SLEEPER_BASE_URL = 'https://api.sleeper.app/v1';

type SleeperUser = {
  user_id: string;
  username: string;
  display_name: string;
  avatar: string;
};

type SleeperLeague = {
  league_id: string;
  name: string;
  season: string;
  status: string;
};

export function createSleeperApi(): {
  getUser: (username: string) => Promise<SleeperUser>;
  getUserLeagues: (userId: string, sport: string, season: string) => Promise<SleeperLeague[]>;
} {
  return {
    getUser: async (username: string): Promise<SleeperUser> => {
      const response = await fetch(`${SLEEPER_BASE_URL}/user/${username}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.status}`);
      }
      return response.json() as Promise<SleeperUser>;
    },

    getUserLeagues: async (
      userId: string,
      sport: string,
      season: string
    ): Promise<SleeperLeague[]> => {
      const response = await fetch(`${SLEEPER_BASE_URL}/user/${userId}/leagues/${sport}/${season}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch leagues: ${response.status}`);
      }
      return response.json() as Promise<SleeperLeague[]>;
    }
  };
}
