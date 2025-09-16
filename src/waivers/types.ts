export type ScoringFormat = 'PPR' | 'HALF_PPR' | 'STANDARD';

export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DST';

export type TeamAnalysis = 'healthy' | 'need_rb2' | 'need_wr2' | 'need_flex' | 'multiple_holes';

export type Strategy = 'safe' | 'balanced' | 'aggressive';

export type TeamNeed = 'low' | 'medium' | 'high';

export type TrendDirection = 'up' | 'down' | 'stable';

export type RiskAssessment = 'low' | 'medium' | 'high';

export type ValueTier =
  | 'high_end_rb1' | 'rb1' | 'rb2' | 'rb3' | 'handcuff' | 'deep_stash'
  | 'high_end_wr1' | 'wr1' | 'wr2' | 'wr3' | 'wr4' | 'dart_throw'
  | 'te1' | 'te2' | 'streaming';

export interface PlayerRanking {
  player_id: string;
  player_name: string;
  position: Position;
  team: string;
  rank: number;
  tier: number;
}

export interface PlayerProjection {
  player_id: string;
  projected_points: number;
  games_remaining: number;
  opportunity_score: number;
}

export interface TrendingPlayer {
  player_id: string;
  trend_direction: TrendDirection;
  rank_change: number;
}

export interface ScoreBreakdown {
  opportunity_score: number;
  performance_score: number;
  matchup_score: number;
  team_fit_bonus: number;
  trending_bonus: number;
}

export interface HotPickup {
  player_id: string;
  player_name: string;
  position: Position;
  total_score: number;
  score_breakdown: ScoreBreakdown;
  recommendation_reason: string;
  faab_suggestion: number;
}

export interface HotPickupsRequest {
  leagueId: string;
  rosterId: number;
  teamAnalysis: TeamAnalysis;
  strategy: Strategy;
}

export interface TeamAnalysisResult {
  overall_health: TeamAnalysis;
  positional_needs: Position[];
  immediate_vs_longterm: 'immediate' | 'longterm' | 'mixed';
}

export interface BidRange {
  min: number;
  max: number;
}

export interface BidRecommendation {
  suggested_bid: number;
  bid_range: BidRange;
  confidence_level: number;
  reasoning: string;
  risk_assessment: RiskAssessment;
}

export interface FaabBidRequest {
  playerId: string;
  leagueId: string;
  rosterId: number;
  remainingBudget: number;
  strategy: Strategy;
  teamNeed: TeamNeed;
}

export interface MarketValue {
  estimated_value: number;
  value_tier: ValueTier;
  position_rank: number;
  ros_projection: number;
}