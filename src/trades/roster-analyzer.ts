type PlayerEvaluator = {
  evaluatePlayer: (playerId: string) => {
    tier: 'elite' | 'good' | 'decent' | 'poor';
    position: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';
    value: number;
    consistency: number;
  };
};

type RosterAnalysis = {
  strengths: string[];
  weaknesses: string[];
  overallScore: number;
  positionScores: Record<string, number>;
};

function aggregatePlayersByPosition(
  playerIds: string[],
  playerEvaluator: PlayerEvaluator
): Record<string, number[]> {
  const positionScores: Record<string, number[]> = {};
  
  playerIds.forEach(playerId => {
    const player = playerEvaluator.evaluatePlayer(playerId);
    if (!positionScores[player.position]) {
      positionScores[player.position] = [];
    }
    positionScores[player.position].push(player.value);
  });
  
  return positionScores;
}

function categorizePositions(
  positionScores: Record<string, number>
): { strengths: string[]; weaknesses: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  Object.entries(positionScores).forEach(([position, avgScore]) => {
    if (avgScore >= 70) {
      strengths.push(position);
    } else if (avgScore < 50) {
      weaknesses.push(position);
    }
  });
  
  return { strengths, weaknesses };
}

function analyzePositions(
  playerIds: string[],
  playerEvaluator: PlayerEvaluator
): { positionScores: Record<string, number>; strengths: string[]; weaknesses: string[] } {
  const aggregatedScores = aggregatePlayersByPosition(playerIds, playerEvaluator);
  const finalPositionScores: Record<string, number> = {};
  
  Object.entries(aggregatedScores).forEach(([position, scores]) => {
    finalPositionScores[position] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  });
  
  const categories = categorizePositions(finalPositionScores);
  
  return { positionScores: finalPositionScores, ...categories };
}

export function createRosterAnalyzer(playerEvaluator: PlayerEvaluator): {
  analyzeRoster: (playerIds: string[]) => RosterAnalysis;
} {
  return {
    analyzeRoster: (playerIds: string[]): RosterAnalysis => {
      const analysis = analyzePositions(playerIds, playerEvaluator);
      const overallScore = Object.values(analysis.positionScores)
        .reduce((sum, score) => sum + score, 0) / Object.values(analysis.positionScores).length;
      
      return {
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        overallScore,
        positionScores: analysis.positionScores
      };
    }
  };
}