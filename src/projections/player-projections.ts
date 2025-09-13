type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';

interface PlayerProjectionService {
  getWeeklyProjection(playerId: string, position: Position, team: string): Promise<number>;
  getSeasonProjection(playerId: string, position: Position, team: string): Promise<number>;
}

const POSITION_BASELINES: Record<Position, { weekly: [number, number], season: [number, number] }> = {
  QB: { weekly: [18, 28], season: [300, 450] },
  RB: { weekly: [12, 22], season: [200, 350] },
  WR: { weekly: [10, 20], season: [160, 320] },
  TE: { weekly: [8, 16], season: [120, 250] },
  K: { weekly: [7, 12], season: [120, 200] },
  DEF: { weekly: [8, 15], season: [140, 240] }
};

const ELITE_PLAYERS: Record<string, { multiplier: number }> = {
  '4046': { multiplier: 1.2 }, // Lamar Jackson
  '4988': { multiplier: 1.25 }, // Christian McCaffrey
  '5859': { multiplier: 1.15 }, // Cooper Kupp
  '5848': { multiplier: 1.2 } // Travis Kelce
};

const ELITE_TEAMS = new Set([
  'SF', 'KC', 'BUF', 'BAL', 'PHI', 'MIA', 'DAL', 'GB'
]);

function calculateWeeklyProjection(playerId: string, position: Position, team: string): number {
  const baseline = POSITION_BASELINES[position];
  if (!baseline) {
    return 5; // Default for unknown positions
  }

  const [min, max] = baseline.weekly;
  let baseProjection = min + Math.random() * (max - min);

  // Apply elite player multiplier
  const playerData = ELITE_PLAYERS[playerId];
  if (playerData) {
    baseProjection *= playerData.multiplier;
  } else if (playerId === 'unknown' || (playerId !== 'DEF' && position !== 'K' && position !== 'DEF' && !ELITE_PLAYERS[playerId])) {
    // Unknown/bench players get much lower projections (but not K/DEF)
    baseProjection *= 0.4;
  }

  // Apply team quality adjustment
  if (ELITE_TEAMS.has(team)) {
    baseProjection *= 1.1;
  } else if (team === 'FA') {
    baseProjection *= 0.6; // Free agents get lower projections
  }

  // Add some variance but keep realistic
  const variance = 0.9 + Math.random() * 0.2; // 0.9 to 1.1 multiplier
  baseProjection *= variance;

  return Math.round(Math.max(1, baseProjection)); // Ensure minimum of 1 point
}

function calculateSeasonProjection(playerId: string, position: Position, team: string): number {
  const baseline = POSITION_BASELINES[position];
  if (!baseline) {
    return 80; // Default for unknown positions
  }

  const [min, max] = baseline.season;
  let baseProjection = min + Math.random() * (max - min);

  // Apply elite player multiplier
  const playerData = ELITE_PLAYERS[playerId];
  if (playerData) {
    baseProjection *= playerData.multiplier;
  }

  // Apply team quality adjustment
  if (ELITE_TEAMS.has(team)) {
    baseProjection *= 1.08;
  } else if (team === 'FA') {
    baseProjection *= 0.7; // Free agents get much lower season projections
  }

  return Math.round(baseProjection);
}

function createPlayerProjectionService(): PlayerProjectionService {
  return {
    async getWeeklyProjection(playerId: string, position: Position, team: string): Promise<number> {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 10));

      return calculateWeeklyProjection(playerId, position, team);
    },

    async getSeasonProjection(playerId: string, position: Position, team: string): Promise<number> {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 10));

      return calculateSeasonProjection(playerId, position, team);
    }
  };
}

export { createPlayerProjectionService };
export type { PlayerProjectionService, Position };