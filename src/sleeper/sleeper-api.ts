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

type SleeperPlayer = {
  player_id: string;
  first_name: string;
  last_name: string;
  position: string;
  team: string;
  fantasy_positions?: string[];
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

function createGetAllPlayers() {
  return async (): Promise<Record<string, SleeperPlayer>> => {
    const response = await fetch(`${SLEEPER_BASE_URL}/players/nfl`);
    if (!response.ok) {
      throw new Error(`Failed to fetch players: ${response.status}`);
    }
    return response.json() as Promise<Record<string, SleeperPlayer>>;
  };
}

function createGetRoster() {
  return async (leagueId: string): Promise<SleeperRosterPlayer[]> => {
    const [rostersResponse, playersData] = await Promise.all([
      fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/rosters`),
      fetch(`${SLEEPER_BASE_URL}/players/nfl`)
    ]);

    if (!rostersResponse.ok) {
      throw new Error(`Failed to fetch roster: ${rostersResponse.status}`);
    }
    if (!playersData.ok) {
      throw new Error(`Failed to fetch players: ${playersData.status}`);
    }

    const rosters = await rostersResponse.json();
    const players: Record<string, SleeperPlayer> = await playersData.json();

    return rosters
      .flatMap(
        (roster: any) =>
          roster.players?.slice(0, 15).map((playerId: string) => {
            const player = players[playerId];
            if (!player) {
              return {
                player_id: playerId,
                name: `Player ${playerId.slice(-4)}`,
                position: 'UNKNOWN',
                team: 'FA',
                projected_points: 0,
                matchup: 'TBD'
              };
            }

            const fullName = `${player.first_name || ''} ${player.last_name || ''}`.trim();
            const position = player.fantasy_positions?.[0] || player.position || 'UNKNOWN';

            return {
              player_id: playerId,
              name: fullName || `Player ${playerId.slice(-4)}`,
              position,
              team: player.team || 'FA',
              projected_points: Math.round(Math.random() * 20 + 5), // Mock projection for now
              matchup: `${player.team || 'FA'} vs TBD`
            };
          }) || []
      )
      .slice(0, 15); // Show more players
  };
}

export function createSleeperApi(): {
  getUser: (username: string) => Promise<SleeperUser>;
  getUserLeagues: (userId: string, sport: string, season: string) => Promise<SleeperLeague[]>;
  getLeagues: (userId: string) => Promise<SleeperLeague[]>;
  getRoster: (leagueId: string) => Promise<SleeperRosterPlayer[]>;
  getTransactions: (leagueId: string, round: number) => Promise<Transaction[]>;
  getAllPlayers: () => Promise<Record<string, SleeperPlayer>>;
} {
  const getUserLeagues = createGetUserLeagues();

  return {
    getUser: createGetUser(),
    getUserLeagues,
    getLeagues: (userId: string) => getUserLeagues(userId, 'nfl', '2025'),
    getRoster: createGetRoster(),
    getTransactions: createGetTransactions(),
    getAllPlayers: createGetAllPlayers()
  };
}
