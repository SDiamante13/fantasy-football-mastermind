import { SleeperPlayer, SleeperRosterPlayer } from './types';

interface ProjectionData {
  stats?: {
    pts_ppr?: number;
    pts_std?: number;
  };
}

interface RosterData {
  owner_id: string;
  players: string[];
}

const fetchResponses = async (
  leagueId: string,
  week: number,
  currentSeason: string
): Promise<[Response, Response, Response]> => {
  const SLEEPER_BASE_URL = 'https://api.sleeper.app/v1';

  return Promise.all([
    fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/rosters`),
    fetch(`${SLEEPER_BASE_URL}/players/nfl`),
    fetch(`https://api.sleeper.app/projections/nfl/${currentSeason}/${week}?season_type=regular&position[]=QB&position[]=RB&position[]=WR&position[]=TE&position[]=K&position[]=DEF&position[]=FLEX`)
  ]);
};

const validateResponses = (
  rostersResponse: Response,
  playersData: Response,
  projectionsResponse: Response
): void => {
  if (!rostersResponse.ok) {
    throw new Error(`Failed to fetch roster: ${rostersResponse.status}`);
  }
  if (!playersData.ok) {
    throw new Error(`Failed to fetch players: ${playersData.status}`);
  }
  if (!projectionsResponse.ok) {
    throw new Error(`Failed to fetch projections: ${projectionsResponse.status}`);
  }
};

export const fetchRosterData = async (
  leagueId: string,
  week: number,
  currentSeason: string
): Promise<{
  rosters: RosterData[];
  players: Record<string, SleeperPlayer>;
  projections: Record<string, ProjectionData>;
}> => {
  const [rostersResponse, playersData, projectionsResponse] = await fetchResponses(
    leagueId,
    week,
    currentSeason
  );

  validateResponses(rostersResponse, playersData, projectionsResponse);

  const rosters = await rostersResponse.json() as RosterData[];
  const players = await playersData.json() as Record<string, SleeperPlayer>;
  const projections = await projectionsResponse.json() as Record<string, ProjectionData>;

  return { rosters, players, projections };
};

export const findUserRoster = (rosters: RosterData[], userId: string): RosterData | undefined => {
  return rosters.find((roster: RosterData) => roster.owner_id === userId);
};

export const createUnknownPlayer = (playerId: string): SleeperRosterPlayer => ({
  player_id: playerId,
  name: `Player ${playerId.slice(-4)}`,
  position: 'UNKNOWN',
  team: 'FA',
  projected_points: 0,
  matchup: 'TBD'
});

const getPlayerName = (player: SleeperPlayer): string => {
  const firstName = player.first_name || '';
  const lastName = player.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || 'Unknown Player';
};

const getPlayerPosition = (player: SleeperPlayer): string => {
  if (player.fantasy_positions && player.fantasy_positions[0]) {
    return player.fantasy_positions[0];
  }
  return player.position || 'UNKNOWN';
};

const getProjectedPoints = (projection?: ProjectionData): number => {
  if (!projection?.stats) return 0;
  const points = projection.stats.pts_ppr || projection.stats.pts_std || 0;
  return Math.round(points);
};

export const createRosterPlayer = (
  playerId: string,
  player: SleeperPlayer,
  projection?: ProjectionData
): SleeperRosterPlayer => {
  const team = player.team || 'FA';

  return {
    player_id: playerId,
    name: getPlayerName(player),
    position: getPlayerPosition(player),
    team,
    projected_points: getProjectedPoints(projection),
    matchup: team !== 'FA' ? `${team} vs TBD` : 'No Game'
  };
};

export const processRosterPlayers = (
  playerIds: string[],
  players: Record<string, SleeperPlayer>,
  projections: Record<string, ProjectionData>
): SleeperRosterPlayer[] => {
  return playerIds.map(playerId => {
    const player = players[playerId];

    if (!player) {
      return createUnknownPlayer(playerId);
    }

    return createRosterPlayer(playerId, player, projections[playerId]);
  });
};