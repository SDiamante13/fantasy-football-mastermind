describe('Sleeper Projections API Contract', () => {
  const currentSeason = new Date().getFullYear().toString();
  const currentWeek = '1'; // Start with week 1 for testing

  it('should fetch real projections from undocumented Sleeper endpoint', async () => {
    const url = `https://api.sleeper.app/projections/nfl/${currentSeason}/${currentWeek}?season_type=regular&position[]=QB&position[]=RB&position[]=WR&position[]=TE&position[]=K&position[]=DEF`;

    const response = await fetch(url);
    expect(response.ok).toBe(true);

    const projections = await response.json();
    expect(projections).toBeDefined();
    expect(Array.isArray(projections) || typeof projections === 'object').toBe(true);

    // Log first few entries to understand the data structure
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
  });

  it('should have projection data with fantasy points for players', async () => {
    const url = `https://api.sleeper.app/projections/nfl/${currentSeason}/${currentWeek}?season_type=regular&position[]=QB&position[]=RB&position[]=WR&position[]=TE`;

    const response = await fetch(url);
    const projections = await response.json();

    // Find any projection entry to examine structure
    let sampleProjection: unknown;
    if (Array.isArray(projections)) {
      sampleProjection = projections[0];
    } else {
      const projObj = projections as Record<string, unknown>;
      sampleProjection = projObj[Object.keys(projObj)[0]];
    }

    console.log('Sample projection structure:', sampleProjection);

    // Basic validation that we have projection data
    expect(sampleProjection).toBeDefined();

    // Look for projection stats fields (nested in stats object)
    const hasStats = Object.prototype.hasOwnProperty.call(sampleProjection, 'stats');
    expect(hasStats).toBe(true);

    const stats = sampleProjection.stats;
    const hasPoints =
      Object.prototype.hasOwnProperty.call(stats, 'pts_ppr') ||
      Object.prototype.hasOwnProperty.call(stats, 'pts_std') ||
      Object.prototype.hasOwnProperty.call(stats, 'pts_half_ppr');

    expect(hasPoints).toBe(true);

    // Verify we have a player_id and basic structure
    expect(sampleProjection.player_id).toBeDefined();
    expect(sampleProjection.player).toBeDefined();
    expect(typeof stats.pts_ppr).toBe('number');
  });
});
