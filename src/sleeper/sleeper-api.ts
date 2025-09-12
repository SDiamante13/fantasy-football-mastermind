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

type SleeperRosterPlayer = {
  player_id: string;
  name: string;
  position: string;
  team: string;
  projected_points: number;
  matchup: string;
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

function createGetRoster() {
  return async (leagueId: string): Promise<SleeperRosterPlayer[]> => {
    const response = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/rosters`);
    if (!response.ok) {
      throw new Error(`Failed to fetch roster: ${response.status}`);
    }
    const rosters = await response.json();
    // Transform raw Sleeper roster data to our format with mock player details
    return rosters
      .flatMap(
        (roster: any) =>
          roster.players?.slice(0, 2).map((playerId: string, index: number) => ({
            player_id: playerId,
            name: `Player ${playerId.slice(-4)}`,
            position: index === 0 ? 'QB' : 'RB',
            team: index === 0 ? 'KC' : 'SF',
            projected_points: index === 0 ? 25.5 : 18.3,
            matchup: index === 0 ? 'KC vs LAC' : 'SF vs SEA'
          })) || []
      )
      .slice(0, 10); // Limit to 10 players for display
  };
}

export function createSleeperApi(): {
  getUser: (username: string) => Promise<SleeperUser>;
  getUserLeagues: (userId: string, sport: string, season: string) => Promise<SleeperLeague[]>;
  getLeagues: (userId: string) => Promise<SleeperLeague[]>;
  getRoster: (leagueId: string) => Promise<SleeperRosterPlayer[]>;
  getTransactions: (leagueId: string, round: number) => Promise<Transaction[]>;
} {
  const getUserLeagues = createGetUserLeagues();

  return {
    getUser: createGetUser(),
    getUserLeagues,
    getLeagues: (userId: string) => getUserLeagues(userId, 'nfl', '2024'),
    getRoster: createGetRoster(),
    getTransactions: createGetTransactions()
  };
}
