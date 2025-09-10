type PlayerData = {
  getPlayerStats: (playerId: string) => {
    rosterPercentage: number;
    targetShare: number;
    recentPoints: number;
  };
  getPositionContext: (position: string) => { positionScarcity: number; waiversDepth: number };
};

type ValueFactors = {
  rosterPercentage: number;
  targetShare: number;
  recentPoints: number;
  positionScarcity: number;
  waiversDepth: number;
};

type ValueAssessment = {
  tier: 'high' | 'medium' | 'low';
  score: number;
  factors: ValueFactors;
  confidence: 'high' | 'medium' | 'low';
};

function calculateValueScore(
  stats: { rosterPercentage: number; targetShare: number; recentPoints: number },
  context: { positionScarcity: number; waiversDepth: number }
): number {
  const rosterScore = Math.min(stats.rosterPercentage * 1.5, 100);
  const targetScore = Math.min(stats.targetShare * 3, 100);
  const pointsScore = Math.min(stats.recentPoints * 5, 100);
  const scarcityScore = Math.min(context.positionScarcity * 8, 100);

  return rosterScore * 0.3 + targetScore * 0.25 + pointsScore * 0.25 + scarcityScore * 0.2;
}

function determineTier(score: number): 'high' | 'medium' | 'low' {
  if (score >= 75) return 'high';
  if (score >= 45) return 'medium';
  return 'low';
}

function determineConfidence(waiversDepth: number): 'high' | 'medium' | 'low' {
  return waiversDepth > 10 ? 'high' : 'medium';
}

export function createPlayerValueAssessor(playerData: PlayerData): {
  assessValue: (playerId: string, position: string) => ValueAssessment;
} {
  return {
    assessValue: (playerId: string, position: string): ValueAssessment => {
      const stats = playerData.getPlayerStats(playerId);
      const context = playerData.getPositionContext(position);

      const factors: ValueFactors = {
        rosterPercentage: stats.rosterPercentage,
        targetShare: stats.targetShare,
        recentPoints: stats.recentPoints,
        positionScarcity: context.positionScarcity,
        waiversDepth: context.waiversDepth
      };

      const score = calculateValueScore(stats, context);
      const tier = determineTier(score);
      const confidence = determineConfidence(context.waiversDepth);

      return { tier, score, factors, confidence };
    }
  };
}
