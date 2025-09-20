import { SleeperApiService } from '../services/SleeperApiService';

import { FantasyProsApiService } from './fantasy-pros-api';
import {
  BidRecommendation,
  FaabBidRequest,
  MarketValue,
  Strategy,
  TeamNeed,
  ValueTier,
  Position,
  PlayerRanking,
  RiskAssessment
} from './types';

interface FaabOptimizerServices {
  sleeperApi: SleeperApiService;
  fantasyProsApi: FantasyProsApiService;
}

export class FaabOptimizer {
  constructor(private services: FaabOptimizerServices) {}

  async getOptimalBid(request: FaabBidRequest): Promise<BidRecommendation> {
    const [marketValue, playerRanking, leagueContext] = await Promise.all([
      this.getMarketValue(request.playerId),
      this.getPlayerRanking(request.playerId),
      this.getLeagueContext()
    ]);

    const baseBidPercentage = this.calculateBaseBidPercentage(marketValue, playerRanking);
    const strategyMultiplier = this.getStrategyMultiplier(request.strategy);
    const needMultiplier = this.getTeamNeedMultiplier(request.teamNeed);
    const budgetAdjustment = this.getBudgetAdjustment(request.remainingBudget);

    const adjustedPercentage =
      baseBidPercentage * strategyMultiplier * needMultiplier * budgetAdjustment;
    const suggestedBid = Math.round(request.remainingBudget * adjustedPercentage);

    const bidRange = this.calculateBidRange(suggestedBid, request.strategy);
    const confidence = this.calculateConfidence(marketValue, leagueContext);
    const reasoning = this.generateReasoning(request, marketValue, suggestedBid);
    const riskAssessment = this.assessRisk(request.strategy, adjustedPercentage);

    return {
      suggested_bid: Math.min(suggestedBid, request.remainingBudget),
      bid_range: bidRange,
      confidence_level: confidence,
      reasoning,
      risk_assessment: riskAssessment
    };
  }

  async getMarketValue(playerId: string): Promise<MarketValue> {
    try {
      const rankings = await this.services.fantasyProsApi.getConsensusRankings('HALF_PPR');
      const projection = this.getPlayerProjections(playerId);
      const playerRanking = rankings.find(r => r.player_id === playerId);

      if (!playerRanking) {
        return this.createUnrankedPlayerValue(projection);
      }

      return this.createRankedPlayerValue(playerRanking, projection);
    } catch (error) {
      console.error('Error getting market value:', error);
      return this.createDefaultMarketValue();
    }
  }

  private createUnrankedPlayerValue(projection: { projected_points: number }): MarketValue {
    return {
      estimated_value: 2,
      value_tier: 'deep_stash' as ValueTier,
      position_rank: 999,
      ros_projection: projection.projected_points || 50
    };
  }

  private createRankedPlayerValue(
    playerRanking: PlayerRanking,
    projection: { projected_points: number }
  ): MarketValue {
    const valueTier = this.determineValueTier(playerRanking.position, playerRanking.rank);
    const estimatedValue = this.calculateEstimatedValue(playerRanking.rank, valueTier);

    return {
      estimated_value: estimatedValue,
      value_tier: valueTier,
      position_rank: playerRanking.rank,
      ros_projection: projection.projected_points || 0
    };
  }

  private createDefaultMarketValue(): MarketValue {
    return {
      estimated_value: 5,
      value_tier: 'deep_stash' as ValueTier,
      position_rank: 999,
      ros_projection: 50
    };
  }

  private async getPlayerRanking(playerId: string): Promise<PlayerRanking | undefined> {
    const rankings = await this.services.fantasyProsApi.getConsensusRankings('HALF_PPR');
    return rankings.find(r => r.player_id === playerId);
  }

  private getPlayerProjections(playerId: string): {
    player_id: string;
    projected_points: number;
    games_remaining: number;
    opportunity_score: number;
  } {
    // Mock implementation - in real app would fetch specific player projection
    return {
      player_id: playerId,
      projected_points: 80 + Math.random() * 100,
      games_remaining: 13,
      opportunity_score: 60 + Math.random() * 40
    };
  }

  private getLeagueContext(): {
    competition_level: 'low' | 'medium' | 'high';
    avg_faab_spend: number;
    active_managers: number;
  } {
    // Mock implementation - in real app would analyze league competition level
    return {
      competition_level: 'medium' as const,
      avg_faab_spend: 12,
      active_managers: 10
    };
  }

  private calculateBaseBidPercentage(
    marketValue: MarketValue,
    playerRanking: PlayerRanking | undefined
  ): number {
    if (!playerRanking) return 0.02; // Unranked players get minimal base bid

    const position = playerRanking.position;
    const rank = playerRanking.rank;

    // Position-specific base percentages
    const basePercentages = {
      RB: this.getRbBaseBid(rank),
      WR: this.getWrBaseBid(rank),
      TE: this.getTeBaseBid(rank),
      QB: 0.05, // QBs rarely worth significant FAAB
      K: 0.01,
      DST: 0.02
    };

    return basePercentages[position] || 0.02;
  }

  private getRbBaseBid(rank: number): number {
    if (rank <= 12) return 0.25; // RB1 tier
    if (rank <= 24) return 0.15; // RB2 tier
    if (rank <= 36) return 0.08; // RB3 tier
    return 0.03; // Handcuff/dart throw
  }

  private getWrBaseBid(rank: number): number {
    if (rank <= 12) return 0.2; // WR1 tier
    if (rank <= 24) return 0.12; // WR2 tier
    if (rank <= 36) return 0.06; // WR3 tier
    if (rank <= 48) return 0.03; // WR4 tier
    return 0.01; // Deep stash
  }

  private getTeBaseBid(rank: number): number {
    if (rank <= 6) return 0.08; // TE1 tier
    if (rank <= 12) return 0.04; // TE2 tier
    return 0.01; // Streaming TE
  }

  private getStrategyMultiplier(strategy: Strategy): number {
    switch (strategy) {
      case 'safe':
        return 0.7;
      case 'balanced':
        return 1.0;
      case 'aggressive':
        return 1.5;
      default:
        return 1.0;
    }
  }

  private getTeamNeedMultiplier(teamNeed: TeamNeed): number {
    switch (teamNeed) {
      case 'low':
        return 0.8;
      case 'medium':
        return 1.0;
      case 'high':
        return 1.3;
      default:
        return 1.0;
    }
  }

  private getBudgetAdjustment(remainingBudget: number): number {
    // Be more conservative with low budgets
    if (remainingBudget < 30) return 0.6;
    if (remainingBudget < 60) return 0.8;
    if (remainingBudget > 150) return 1.2;
    return 1.0;
  }

  private calculateBidRange(
    suggestedBid: number,
    strategy: Strategy
  ): { min: number; max: number } {
    const variance = strategy === 'safe' ? 0.2 : strategy === 'aggressive' ? 0.4 : 0.3;

    return {
      min: Math.max(1, Math.round(suggestedBid * (1 - variance))),
      max: Math.round(suggestedBid * (1 + variance))
    };
  }

  private calculateConfidence(
    marketValue: MarketValue,
    leagueContext: {
      competition_level: 'low' | 'medium' | 'high';
      avg_faab_spend: number;
      active_managers: number;
    }
  ): number {
    let confidence = 70; // Base confidence

    confidence += this.getPlayerValueConfidenceBonus(marketValue);
    confidence += this.getLeagueContextConfidenceAdjustment(leagueContext);

    return Math.max(30, Math.min(95, confidence));
  }

  private getPlayerValueConfidenceBonus(marketValue: MarketValue): number {
    let bonus = 0;
    if (marketValue.position_rank <= 24) bonus += 15;
    if (marketValue.position_rank <= 12) bonus += 10;
    if (marketValue.value_tier === 'deep_stash') bonus -= 20;
    return bonus;
  }

  private getLeagueContextConfidenceAdjustment(leagueContext: {
    competition_level: 'low' | 'medium' | 'high';
  }): number {
    if (leagueContext.competition_level === 'high') return -10;
    if (leagueContext.competition_level === 'low') return 10;
    return 0;
  }

  private generateReasoning(
    request: FaabBidRequest,
    marketValue: MarketValue,
    suggestedBid: number
  ): string {
    const bidPercentage = Math.round((suggestedBid / request.remainingBudget) * 100);
    const position = this.getPositionFromValueTier(marketValue.value_tier);

    let reasoning = `Bidding ${bidPercentage}% of budget (${suggestedBid}) for ${marketValue.value_tier} ${position}. `;
    reasoning += this.getTeamNeedReasoning(request.teamNeed);
    reasoning += this.getStrategyReasoning(request.strategy);
    reasoning += this.getBudgetConstraintReasoning(request.remainingBudget);

    return reasoning;
  }

  private getPositionFromValueTier(valueTier: ValueTier): string {
    if (valueTier.includes('rb')) return 'RB';
    if (valueTier.includes('wr')) return 'WR';
    return 'TE';
  }

  private getTeamNeedReasoning(teamNeed: TeamNeed): string {
    if (teamNeed === 'high') return 'High team need justifies aggressive bid. ';
    if (teamNeed === 'low') return 'Depth/upside play allows conservative approach. ';
    return '';
  }

  private getStrategyReasoning(strategy: Strategy): string {
    if (strategy === 'aggressive')
      return 'Aggressive strategy prioritizes winning player over budget preservation.';
    if (strategy === 'safe') return 'Conservative bid preserves budget for future opportunities.';
    return 'Balanced approach weighs value against remaining budget.';
  }

  private getBudgetConstraintReasoning(remainingBudget: number): string {
    return remainingBudget < 50 ? ' Limited budget requires careful spending.' : '';
  }

  private assessRisk(strategy: Strategy, bidPercentage: number): RiskAssessment {
    if (strategy === 'safe' || bidPercentage < 0.1) return 'low' as const;
    if (strategy === 'aggressive' || bidPercentage > 0.2) return 'high' as const;
    return 'medium' as const;
  }

  private determineValueTier(position: Position, rank: number): ValueTier {
    switch (position) {
      case 'RB':
        return this.getRbValueTier(rank);
      case 'WR':
        return this.getWrValueTier(rank);
      case 'TE':
        return this.getTeValueTier(rank);
      default:
        return 'deep_stash';
    }
  }

  private getRbValueTier(rank: number): ValueTier {
    if (rank <= 12) return 'rb1';
    if (rank <= 24) return 'rb2';
    if (rank <= 36) return 'rb3';
    if (rank <= 48) return 'handcuff';
    return 'deep_stash';
  }

  private getWrValueTier(rank: number): ValueTier {
    if (rank <= 12) return 'wr1';
    if (rank <= 24) return 'wr2';
    if (rank <= 36) return 'wr3';
    if (rank <= 48) return 'wr4';
    return 'dart_throw';
  }

  private getTeValueTier(rank: number): ValueTier {
    if (rank <= 6) return 'te1';
    if (rank <= 12) return 'te2';
    return 'streaming';
  }

  private calculateEstimatedValue(rank: number, tier: ValueTier): number {
    // Estimated percentage of total FAAB budget this player is worth
    const tierValues: Record<ValueTier, number> = {
      high_end_rb1: 35,
      rb1: 25,
      rb2: 15,
      rb3: 8,
      handcuff: 3,
      deep_stash: 2,
      high_end_wr1: 30,
      wr1: 20,
      wr2: 12,
      wr3: 6,
      wr4: 3,
      dart_throw: 1,
      te1: 8,
      te2: 4,
      streaming: 1
    };

    return tierValues[tier] || 2;
  }
}
