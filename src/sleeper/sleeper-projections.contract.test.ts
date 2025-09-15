const getSampleProjection = (projections: unknown): unknown => {
  if (Array.isArray(projections)) {
    return projections[0];
  }
  const projObj = projections as Record<string, unknown>;
  return projObj[Object.keys(projObj)[0]];
};

type ProjectionData = {
  stats: Record<string, unknown>;
  player_id: unknown;
  player: unknown;
};

const validateProjectionStats = (sampleProjection: ProjectionData): void => {
  const hasStats = Object.prototype.hasOwnProperty.call(sampleProjection, 'stats');
  expect(hasStats).toBe(true);
  const stats = sampleProjection.stats;
  const hasPoints =
    Object.prototype.hasOwnProperty.call(stats, 'pts_ppr') ||
    Object.prototype.hasOwnProperty.call(stats, 'pts_std') ||
    Object.prototype.hasOwnProperty.call(stats, 'pts_half_ppr');
  expect(hasPoints).toBe(true);
  expect(sampleProjection.player_id).toBeDefined();
  expect(sampleProjection.player).toBeDefined();
  expect(typeof stats.pts_ppr).toBe('number');
};

const validateProjectionsResponse = (projections: unknown): void => {
  expect(projections).toBeDefined();
  expect(Array.isArray(projections) || typeof projections === 'object').toBe(true);
  if (Array.isArray(projections)) {
    console.log('Projections array sample:', projections.slice(0, 3));
    expect(projections.length).toBeGreaterThan(0);
  } else {
    console.log(
      'Projections object sample:',
      Object.keys(projections as Record<string, unknown>).slice(0, 5)
    );
    expect(Object.keys(projections as Record<string, unknown>).length).toBeGreaterThan(0);
  }
};

describe('Sleeper Projections API Contract', () => {
  const currentSeason = new Date().getFullYear().toString();
  const currentWeek = '1';

  it('should fetch real projections from undocumented Sleeper endpoint', async () => {
    const url = `https://api.sleeper.app/projections/nfl/${currentSeason}/${currentWeek}?season_type=regular&position[]=QB&position[]=RB&position[]=WR&position[]=TE&position[]=K&position[]=DEF`;
    const response = await fetch(url);
    expect(response.ok).toBe(true);
    const projections = await response.json() as unknown;
    validateProjectionsResponse(projections);
  });

  it('should have projection data with fantasy points for players', async () => {
    const url = `https://api.sleeper.app/projections/nfl/${currentSeason}/${currentWeek}?season_type=regular&position[]=QB&position[]=RB&position[]=WR&position[]=TE`;
    const response = await fetch(url);
    const projections = await response.json() as unknown;
    const sampleProjection = getSampleProjection(projections);
    console.log('Sample projection structure:', sampleProjection);
    expect(sampleProjection).toBeDefined();
    validateProjectionStats(sampleProjection as ProjectionData);
  });
});
