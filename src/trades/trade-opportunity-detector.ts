type RosterAnalyzer = {
  analyzeRoster: (playerIds: string[]) => {
    strengths: string[];
    weaknesses: string[];
    overallScore: number;
    positionScores: Record<string, number>;
  };
};

type LeagueData = {
  getTeamRosters: (leagueId: string) => Array<{ teamId: string; playerIds: string[] }>;
};

type TradeOpportunity = {
  teamA: string;
  teamB: string;
  mutualBenefit: number;
};

function analyzeTeamPair(
  teamA: { teamId: string; analysis: { strengths: string[]; weaknesses: string[] } },
  teamB: { teamId: string; analysis: { strengths: string[]; weaknesses: string[] } }
): { canTrade: boolean; mutualBenefit: number } {
  const aStrengths = new Set(teamA.analysis.strengths);
  const bWeaknesses = new Set(teamB.analysis.weaknesses);
  const bStrengths = new Set(teamB.analysis.strengths);
  const aWeaknesses = new Set(teamA.analysis.weaknesses);
  
  const aCanHelp = [...aStrengths].some(strength => bWeaknesses.has(strength));
  const bCanHelp = [...bStrengths].some(strength => aWeaknesses.has(strength));
  
  return { canTrade: aCanHelp && bCanHelp, mutualBenefit: 1 };
}

function createOpportunityFromTeams(
  teamA: { teamId: string; analysis: { strengths: string[]; weaknesses: string[] } },
  teamB: { teamId: string; analysis: { strengths: string[]; weaknesses: string[] } },
  mutualBenefit: number
): TradeOpportunity {
  return {
    teamA: teamA.teamId,
    teamB: teamB.teamId,
    mutualBenefit
  };
}

function checkTeamPairForTrade(
  teamA: { teamId: string; analysis: { strengths: string[]; weaknesses: string[] } },
  teamB: { teamId: string; analysis: { strengths: string[]; weaknesses: string[] } }
): TradeOpportunity | null {
  const result = analyzeTeamPair(teamA, teamB);
  
  if (!result.canTrade) return null;
  
  return createOpportunityFromTeams(teamA, teamB, result.mutualBenefit);
}

function generateTeamPairs(
  teamAnalyses: Array<{ teamId: string; analysis: { strengths: string[]; weaknesses: string[] } }>
): Array<[typeof teamAnalyses[0], typeof teamAnalyses[0]]> {
  const pairs: Array<[typeof teamAnalyses[0], typeof teamAnalyses[0]]> = [];
  
  for (let i = 0; i < teamAnalyses.length; i++) {
    for (let j = i + 1; j < teamAnalyses.length; j++) {
      pairs.push([teamAnalyses[i], teamAnalyses[j]]);
    }
  }
  
  return pairs;
}

function findOpportunitiesInTeams(
  teamAnalyses: Array<{ teamId: string; analysis: { strengths: string[]; weaknesses: string[] } }>
): TradeOpportunity[] {
  const pairs = generateTeamPairs(teamAnalyses);
  
  return pairs
    .map(([teamA, teamB]) => checkTeamPairForTrade(teamA, teamB))
    .filter((opportunity): opportunity is TradeOpportunity => opportunity !== null);
}

export function createTradeOpportunityDetector(
  rosterAnalyzer: RosterAnalyzer,
  leagueData: LeagueData
): {
  findTradeOpportunities: (leagueId: string) => TradeOpportunity[];
} {
  return {
    findTradeOpportunities: (leagueId: string): TradeOpportunity[] => {
      const rosters = leagueData.getTeamRosters(leagueId);
      const teamAnalyses = rosters.map(roster => ({
        teamId: roster.teamId,
        analysis: rosterAnalyzer.analyzeRoster(roster.playerIds)
      }));
      
      return findOpportunitiesInTeams(teamAnalyses);
    }
  };
}