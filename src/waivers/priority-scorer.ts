type PlayerInfo = { team: string; position: string; name: string };
type OpportunityMetrics = { touches_per_game: number; red_zone_looks: number };

type PlayerData = {
  getPlayerInfo: (playerId: string) => PlayerInfo;
  getTargetShare: (playerId: string) => number;
  getOpportunityMetrics: (playerId: string) => OpportunityMetrics;
};

type InjuredStarter = {
  playerId: string;
  team: string;
  position: string;
  injurySeverity: string;
};

type ScoreRequest = {
  playerId: string;
  injuredStarter: InjuredStarter;
};

type ScoreBreakdown = {
  handcuff_bonus: number;
  opportunity_score: number;
  injury_severity_bonus: number;
};

type PriorityScore = {
  total: number;
  breakdown: ScoreBreakdown;
};

function calculateHandcuffBonus(player: PlayerInfo, injuredStarter: InjuredStarter): number {
  if (player.team === injuredStarter.team && player.position === injuredStarter.position) {
    return 40;
  }
  return 0;
}

function calculateOpportunityScore(targetShare: number, opportunities: OpportunityMetrics): number {
  return Math.min(
    (targetShare + opportunities.touches_per_game + opportunities.red_zone_looks * 2), 
    35
  );
}

function calculateInjurySeverityBonus(injurySeverity: string): number {
  return injurySeverity === 'high' ? 10 : 0;
}

export function createPriorityScorer(playerData: PlayerData): {
  calculateScore: (request: ScoreRequest) => PriorityScore;
} {
  return {
    calculateScore: (request: ScoreRequest): PriorityScore => {
      const player = playerData.getPlayerInfo(request.playerId);
      const targetShare = playerData.getTargetShare(request.playerId);
      const opportunities = playerData.getOpportunityMetrics(request.playerId);
      
      const breakdown: ScoreBreakdown = {
        handcuff_bonus: calculateHandcuffBonus(player, request.injuredStarter),
        opportunity_score: calculateOpportunityScore(targetShare, opportunities),
        injury_severity_bonus: calculateInjurySeverityBonus(request.injuredStarter.injurySeverity)
      };
      
      const total = breakdown.handcuff_bonus + breakdown.opportunity_score + breakdown.injury_severity_bonus;
      
      return { total, breakdown };
    }
  };
}