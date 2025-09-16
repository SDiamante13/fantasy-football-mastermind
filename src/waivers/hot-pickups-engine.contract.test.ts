import { SleeperApiService } from '../services/SleeperApiService';

import { HotPickupsEngine } from './hot-pickups-engine';
import { FantasyProsApiService } from './fantasy-pros-api';
import { HotPickupsRequest, HotPickup, ScoreBreakdown, TeamAnalysisResult } from './types';

const createBaseRequest = (): HotPickupsRequest => ({
  leagueId: 'test_league_123',
  rosterId: 1,
  teamAnalysis: 'need_rb2' as const,
  strategy: 'balanced' as const
});

const createRequestWithOverrides = (overrides: Partial<HotPickupsRequest>): HotPickupsRequest => ({
  ...createBaseRequest(),
  ...overrides
});

const assertValidPickupData = (pickup: HotPickup): void => {
  expect(pickup).toHaveProperty('player_id');
  expect(pickup).toHaveProperty('player_name');
  expect(pickup).toHaveProperty('position');
  expect(pickup).toHaveProperty('total_score');
  expect(pickup).toHaveProperty('score_breakdown');
  expect(pickup).toHaveProperty('recommendation_reason');
  expect(pickup).toHaveProperty('faab_suggestion');
};

const assertValidScoreBreakdown = (breakdown: ScoreBreakdown): void => {
  expect(breakdown).toHaveProperty('opportunity_score');
  expect(breakdown).toHaveProperty('performance_score');
  expect(breakdown).toHaveProperty('matchup_score');
  expect(breakdown).toHaveProperty('team_fit_bonus');
  expect(breakdown).toHaveProperty('trending_bonus');

  Object.values(breakdown).forEach((score: number) => {
    expect(typeof score).toBe('number');
  });
};

const assertValidTeamAnalysis = (analysis: TeamAnalysisResult): void => {
  expect(analysis).toHaveProperty('overall_health');
  expect(analysis).toHaveProperty('positional_needs');
  expect(analysis).toHaveProperty('immediate_vs_longterm');

  expect(['healthy', 'need_rb2', 'need_wr2', 'need_flex', 'multiple_holes']).toContain(
    analysis.overall_health
  );
  expect(Array.isArray(analysis.positional_needs)).toBe(true);
  expect(['immediate', 'longterm', 'mixed']).toContain(analysis.immediate_vs_longterm);
};

const setupEngine = (): HotPickupsEngine => {
  const sleeperApi = new SleeperApiService();
  const fantasyProsApi = new FantasyProsApiService();
  return new HotPickupsEngine({ sleeperApi, fantasyProsApi });
};

describe('getHotPickups - Basic Properties', () => {
  const engine = setupEngine();

  it('should return valid array of hot pickups', async () => {
    const request = createBaseRequest();
    const hotPickups = await engine.getHotPickups(request);

    expect(Array.isArray(hotPickups)).toBe(true);
    expect(hotPickups.length).toBeGreaterThan(0);
  });

  it('should return pickups with required properties', async () => {
    const request = createBaseRequest();
    const hotPickups = await engine.getHotPickups(request);
    const pickup = hotPickups[0];

    assertValidPickupData(pickup);
  });

  it('should include complete score breakdown', async () => {
    const request = createBaseRequest();
    const hotPickups = await engine.getHotPickups(request);
    const pickup = hotPickups[0];

    assertValidScoreBreakdown(pickup.score_breakdown);
  });
});

describe('getHotPickups - Positional Targeting', () => {
  const engine = setupEngine();

  it('should prioritize RB when team needs RB2', async () => {
    const needRb2Request = createRequestWithOverrides({ teamAnalysis: 'need_rb2' });
    const rbPickups = await engine.getHotPickups(needRb2Request);
    const topRbPickup = rbPickups[0];

    expect(topRbPickup.position).toBe('RB');
  });

  it('should prioritize WR when team needs WR2', async () => {
    const needWr2Request = createRequestWithOverrides({ teamAnalysis: 'need_wr2' });
    const wrPickups = await engine.getHotPickups(needWr2Request);
    const topWrPickup = wrPickups[0];

    expect(topWrPickup.position).toBe('WR');
  });
});

describe('getHotPickups - Strategy Variations', () => {
  const engine = setupEngine();

  it('should show league-winning upside players for healthy teams', async () => {
    const healthyTeamRequest = createRequestWithOverrides({
      teamAnalysis: 'healthy',
      strategy: 'aggressive'
    });

    const pickups = await engine.getHotPickups(healthyTeamRequest);
    const topPickup = pickups[0];

    expect(topPickup.recommendation_reason).toMatch(/upside|breakout|league.winning/i);
    expect(topPickup.score_breakdown.trending_bonus).toBeGreaterThan(0);
  });
});

describe('getTeamAnalysis', () => {
  const engine = setupEngine();

  it('should analyze team positional strength', async () => {
    const analysis = await engine.getTeamAnalysis('test_league_123', 1);

    assertValidTeamAnalysis(analysis);
  });
});