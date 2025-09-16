import { FantasyProsApiService } from './fantasy-pros-api';
import { PlayerRanking, PlayerProjection, TrendingPlayer } from './types';

const assertValidPlayerData = (player: PlayerRanking): void => {
  expect(player).toHaveProperty('player_id');
  expect(player).toHaveProperty('player_name');
  expect(player).toHaveProperty('position');
  expect(player).toHaveProperty('team');
  expect(player).toHaveProperty('rank');
  expect(player).toHaveProperty('tier');
  expect(typeof player.rank).toBe('number');
  expect(typeof player.tier).toBe('number');
};

const assertValidProjectionData = (projection: PlayerProjection): void => {
  expect(projection).toHaveProperty('player_id');
  expect(projection).toHaveProperty('projected_points');
  expect(projection).toHaveProperty('games_remaining');
  expect(projection).toHaveProperty('opportunity_score');
  expect(typeof projection.projected_points).toBe('number');
};

const assertValidTrendingData = (player: TrendingPlayer, direction: string): void => {
  expect(player).toHaveProperty('player_id');
  expect(player).toHaveProperty('trend_direction');
  expect(player).toHaveProperty('rank_change');
  expect(player.trend_direction).toBe(direction);
  expect(typeof player.rank_change).toBe('number');
};

const setupApiService = (): FantasyProsApiService => new FantasyProsApiService();

describe('getConsensusRankings', () => {
  const apiService = setupApiService();

  it('should return valid array of rankings', async () => {
    const rankings = await apiService.getConsensusRankings('HALF_PPR');

    expect(Array.isArray(rankings)).toBe(true);
    expect(rankings.length).toBeGreaterThan(0);
  });

  it('should return player rankings with required fields', async () => {
    const rankings = await apiService.getConsensusRankings('HALF_PPR');
    const player = rankings[0];

    assertValidPlayerData(player);
  });
});

describe('getConsensusRankings - Scoring Formats', () => {
  const apiService = setupApiService();

  it('should handle different scoring formats', async () => {
    const halfPprRankings = await apiService.getConsensusRankings('HALF_PPR');
    const pprRankings = await apiService.getConsensusRankings('PPR');

    expect(halfPprRankings).toBeDefined();
    expect(pprRankings).toBeDefined();
    expect(halfPprRankings[0].rank).not.toBe(pprRankings[0].rank);
  });
});

describe('getPlayerProjections', () => {
  const apiService = setupApiService();

  it('should return valid array of projections', async () => {
    const rbProjections = await apiService.getPlayerProjections('RB', 'HALF_PPR');

    expect(Array.isArray(rbProjections)).toBe(true);
    expect(rbProjections.length).toBeGreaterThan(0);
  });

  it('should return projections with required fields', async () => {
    const rbProjections = await apiService.getPlayerProjections('RB', 'HALF_PPR');
    const projection = rbProjections[0];

    assertValidProjectionData(projection);
  });
});

describe('getTrendingPlayers', () => {
  const apiService = setupApiService();

  it('should return valid array of trending players', async () => {
    const trending = await apiService.getTrendingPlayers('up');

    expect(Array.isArray(trending)).toBe(true);
    expect(trending.length).toBeGreaterThan(0);
  });

  it('should return trending players with required trend data', async () => {
    const trending = await apiService.getTrendingPlayers('up');
    const player = trending[0];

    assertValidTrendingData(player, 'up');
  });
});