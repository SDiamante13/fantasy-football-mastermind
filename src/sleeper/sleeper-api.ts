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

type Transaction = {
  type: string;
  drops?: Record<string, string>;
  creator: string;
  created: number;
};

function createGetUser() {
  return async (username: string): Promise<SleeperUser> => {
    const response = await fetch(`${SLEEPER_BASE_URL}/user/${username}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.status}`);
    }
    return response.json() as Promise<SleeperUser>;
  };
}

function createGetUserLeagues() {
  return async (userId: string, sport: string, season: string): Promise<SleeperLeague[]> => {
    const response = await fetch(`${SLEEPER_BASE_URL}/user/${userId}/leagues/${sport}/${season}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch leagues: ${response.status}`);
    }
    return response.json() as Promise<SleeperLeague[]>;
  };
}

function createGetTransactions() {
  return async (leagueId: string, round: number): Promise<Transaction[]> => {
    const response = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/transactions/${round}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.status}`);
    }
    return response.json() as Promise<Transaction[]>;
  };
}

export function createSleeperApi(): {
  getUser: (username: string) => Promise<SleeperUser>;
  getUserLeagues: (userId: string, sport: string, season: string) => Promise<SleeperLeague[]>;
  getLeagues: (userId: string) => Promise<SleeperLeague[]>;
  getTransactions: (leagueId: string, round: number) => Promise<Transaction[]>;
} {
  const getUserLeagues = createGetUserLeagues();

  return {
    getUser: createGetUser(),
    getUserLeagues,
    getLeagues: (userId: string) => getUserLeagues(userId, 'nfl', '2024'),
    getTransactions: createGetTransactions()
  };
}
