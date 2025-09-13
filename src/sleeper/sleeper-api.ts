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

type SleeperProjection = {
  player_id: string;
  stats: {
    pts_ppr: number;
    pts_half_ppr: number;
    pts_std: number;
  };
  player: {
    first_name: string;
    last_name: string;
    position: string;
    team: string;
  };
  week: number;
  season: string;
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

function createGetProjections() {
  return async (season: string, week: number): Promise<Record<string, SleeperProjection>> => {
    const url = `https://api.sleeper.app/projections/nfl/${season}/${week}?season_type=regular&position[]=QB&position[]=RB&position[]=WR&position[]=TE&position[]=K&position[]=DEF`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch projections: ${response.status}`);
    }

    const projectionsArray = await response.json();

    // Convert array to keyed object by player_id for easier lookup
    const projectionsMap: Record<string, SleeperProjection> = {};
    projectionsArray.forEach((proj: SleeperProjection) => {
      if (proj.player_id) {
        projectionsMap[proj.player_id] = proj;
      }
    });

    return projectionsMap;
  };
}

function createGetRoster() {
  return async (
    leagueId: string,
    userId: string,
    week: number = 1
  ): Promise<SleeperRosterPlayer[]> => {
    const currentSeason = new Date().getFullYear().toString();

    const [rostersResponse, playersData, projectionsData] = await Promise.all([
      fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/rosters`),
      fetch(`${SLEEPER_BASE_URL}/players/nfl`),
      createGetProjections()(currentSeason, week)
    ]);

    if (!rostersResponse.ok) {
      throw new Error(`Failed to fetch roster: ${rostersResponse.status}`);
    }
    if (!playersData.ok) {
      throw new Error(`Failed to fetch players: ${playersData.status}`);
    }

    const rosters = await rostersResponse.json();
    const players: Record<string, SleeperPlayer> = await playersData.json();
    const projections = projectionsData;

    // Find the specific roster for this user
    const userRoster = rosters.find((roster: any) => roster.owner_id === userId);

    if (!userRoster || !userRoster.players) {
      return [];
    }

    // Process only the user's players with real Sleeper projections
    return userRoster.players.map((playerId: string) => {
      const player = players[playerId];
      const projection = projections[playerId];

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
      const team = player.team || 'FA';

      // Use real Sleeper projections or fallback to 0
      let projectedPoints = 0;
      if (projection?.stats) {
        // Default to PPR scoring, fallback to standard
        projectedPoints = Math.round(projection.stats.pts_ppr || projection.stats.pts_std || 0);
      }

      return {
        player_id: playerId,
        name: fullName || `Player ${playerId.slice(-4)}`,
        position,
        team,
        projected_points: projectedPoints,
        matchup: `${team} vs TBD`
      };
    });
  };
}

export function createSleeperApi(): {
  getUser: (username: string) => Promise<SleeperUser>;
  getUserLeagues: (userId: string, sport: string, season: string) => Promise<SleeperLeague[]>;
  getLeagues: (userId: string) => Promise<SleeperLeague[]>;
  getRoster: (leagueId: string, userId: string, week?: number) => Promise<SleeperRosterPlayer[]>;
  getProjections: (season: string, week: number) => Promise<Record<string, SleeperProjection>>;
  getTransactions: (leagueId: string, round: number) => Promise<Transaction[]>;
  getAllPlayers: () => Promise<Record<string, SleeperPlayer>>;
} {
  const getUserLeagues = createGetUserLeagues();

  return {
    getUser: createGetUser(),
    getUserLeagues,
    getLeagues: (userId: string) =>
      getUserLeagues(userId, 'nfl', new Date().getFullYear().toString()),
    getRoster: createGetRoster(),
    getProjections: createGetProjections(),
    getTransactions: createGetTransactions(),
    getAllPlayers: createGetAllPlayers()
  };
}
