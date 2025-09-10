type PlayerValuer = {
  getPlayerValue: (playerId: string) => {
    value: number;
    projectedPoints: number;
    consistency: number;
  };
};

type TradeProposal = {
  teamA: { playersGiving: string[]; playersReceiving: string[] };
  teamB: { playersGiving: string[]; playersReceiving: string[] };
};

type TradeAssessment = {
  teamAValueDiff: number;
  teamBValueDiff: number;
  fairness: 'fair' | 'favors_team_a' | 'favors_team_b';
  totalValue: number;
};

function calculatePlayerValues(
  playerIds: string[], 
  playerValuer: PlayerValuer
): number {
  return playerIds.reduce((sum, playerId) => sum + playerValuer.getPlayerValue(playerId).value, 0);
}

function determineFairness(valueDiff: number): 'fair' | 'favors_team_a' | 'favors_team_b' {
  if (Math.abs(valueDiff) <= 5) {
    return 'fair';
  } else if (valueDiff > 0) {
    return 'favors_team_a';
  } else {
    return 'favors_team_b';
  }
}

export function createTradeValueCalculator(playerValuer: PlayerValuer): {
  assessTrade: (proposal: TradeProposal) => TradeAssessment;
} {
  return {
    assessTrade: (proposal: TradeProposal): TradeAssessment => {
      const teamAGivingValue = calculatePlayerValues(proposal.teamA.playersGiving, playerValuer);
      const teamAReceivingValue = calculatePlayerValues(proposal.teamA.playersReceiving, playerValuer);
      const teamAValueDiff = teamAReceivingValue - teamAGivingValue;
      const teamBValueDiff = -teamAValueDiff;
      const totalValue = teamAGivingValue + teamAReceivingValue;
      const fairness = determineFairness(teamAValueDiff);
      
      return { teamAValueDiff, teamBValueDiff, fairness, totalValue };
    }
  };
}