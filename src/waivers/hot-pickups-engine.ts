import { SleeperApiService } from '../services/SleeperApiService';

import { FantasyProsApiService } from './fantasy-pros-api';
import {
  HotPickup,
  HotPickupsRequest,
  TeamAnalysisResult,
  ScoreBreakdown,
  Position,
  TeamAnalysis,
  PlayerRanking,
  PlayerProjection,
  TrendingPlayer
} from './types';

interface HotPickupsEngineServices {
  sleeperApi: SleeperApiService;
  fantasyProsApi: FantasyProsApiService;
}

export class HotPickupsEngine {
  constructor(private services: HotPickupsEngineServices) {}

  async getHotPickups(request: HotPickupsRequest): Promise<HotPickup[]> {
    const [availablePlayers, rankings, projections, trending] = await Promise.all([
      this.getAvailablePlayers(request.leagueId),
      this.services.fantasyProsApi.getConsensusRankings('HALF_PPR'),
      this.getRelevantProjections(request.teamAnalysis),
      this.services.fantasyProsApi.getTrendingPlayers('up')
    ]);

    const scoredPlayers = availablePlayers.map(player =>
      this.scorePlayer(player, request, rankings, projections, trending)
    );

    return this.sortAndFilterPickups(scoredPlayers);
  }

  async getTeamAnalysis(leagueId: string, rosterId: number): Promise<TeamAnalysisResult> {
    const roster = await this.services.sleeperApi.getLeagueRosters(leagueId);
    const userRoster = roster.find(r => r.roster_id === rosterId);

    if (!userRoster) {
      throw new Error(`Roster ${rosterId} not found in league ${leagueId}`);
    }

    const positionCounts = this.analyzePositionStrength();
    const overallHealth = this.determineOverallHealth(positionCounts);
    const positionalNeeds = this.identifyPositionalNeeds(positionCounts);

    return {
      overall_health: overallHealth,
      positional_needs: positionalNeeds,
      immediate_vs_longterm: overallHealth === 'healthy' ? 'longterm' : 'immediate'
    };
  }

  private async getAvailablePlayers(leagueId: string): Promise<{ player_id: string; player_name: string; position: Position; team: string }[]> {
    // Mock implementation - in real app would check rosters and return unrostered players
    return [
      { player_id: '123', player_name: 'Jordan Mason', position: 'RB', team: 'SF' },
      { player_id: '456', player_name: 'Darnell Mooney', position: 'WR', team: 'ATL' },
      { player_id: '789', player_name: 'Jaylen Wright', position: 'RB', team: 'MIA' }
    ];
  }

  private async getRelevantProjections(teamAnalysis: TeamAnalysis): Promise<PlayerProjection[]> {
    const positions = teamAnalysis === 'need_rb2' ? ['RB'] :
                     teamAnalysis === 'need_wr2' ? ['WR'] :
                     ['RB', 'WR'];

    const projections = await Promise.all(
      positions.map(pos => this.services.fantasyProsApi.getPlayerProjections(pos as Position, 'HALF_PPR'))
    );

    return projections.flat();
  }

  private scorePlayer(
    player: { player_id: string; player_name: string; position: Position; team: string },
    request: HotPickupsRequest,
    rankings: PlayerRanking[],
    projections: PlayerProjection[],
    trending: TrendingPlayer[]
  ): HotPickup {
    const ranking = rankings.find(r => r.player_id === player.player_id);
    const projection = projections.find(p => p.player_id === player.player_id);
    const trend = trending.find(t => t.player_id === player.player_id);

    const scoreBreakdown = this.calculateScoreBreakdown(
      player, request, ranking, projection
    );

    const totalScore = Object.values(scoreBreakdown).reduce((sum, score) => sum + score, 0);

    return {
      player_id: player.player_id,
      player_name: player.player_name,
      position: player.position,
      total_score: totalScore,
      score_breakdown: scoreBreakdown,
      recommendation_reason: this.generateRecommendationReason(player, request, scoreBreakdown),
      faab_suggestion: this.calculateFaabSuggestion(totalScore, request.strategy)
    };
  }

  private calculateScoreBreakdown(
    player: { player_id: string; player_name: string; position: Position; team: string },
    request: HotPickupsRequest,
    ranking: PlayerRanking | undefined,
    projection: PlayerProjection | undefined
  ): ScoreBreakdown {
    const opportunityScore = projection?.opportunity_score || this.estimateOpportunityScore(player);
    const performanceScore = ranking ? Math.max(0, 100 - ranking.rank) : 50;
    const matchupScore = this.calculateMatchupScore();
    const teamFitBonus = this.calculateTeamFitBonus(player, request.teamAnalysis);
    const trendingBonus = 0; // Will be calculated separately from trending data

    return {
      opportunity_score: opportunityScore,
      performance_score: performanceScore,
      matchup_score: matchupScore,
      team_fit_bonus: teamFitBonus,
      trending_bonus: trendingBonus
    };
  }

  private estimateOpportunityScore(player: { position: Position }): number {
    // Mock calculation - in real app would use snap %, target share, etc.
    const baseScore = player.position === 'RB' ? 70 : 60;
    return baseScore + Math.random() * 30;
  }

  private calculateMatchupScore(): number {
    // Mock calculation - in real app would analyze upcoming matchups
    return 50 + Math.random() * 40;
  }

  private calculateTeamFitBonus(player: { position: Position }, teamAnalysis: TeamAnalysis): number {
    if (teamAnalysis === 'healthy') return 0;

    const positionMatch = (teamAnalysis === 'need_rb2' && player.position === 'RB') ||
                         (teamAnalysis === 'need_wr2' && player.position === 'WR');

    return positionMatch ? 25 : 0;
  }

  private generateRecommendationReason(player: { position: Position }, request: HotPickupsRequest, breakdown: ScoreBreakdown): string {
    if (request.teamAnalysis === 'healthy') {
      return 'League-winning upside play with strong opportunity metrics';
    }

    if (breakdown.team_fit_bonus > 0) {
      return `Addresses team weakness at ${player.position} with immediate impact potential`;
    }

    return 'Strong opportunity-based pickup with favorable upcoming matchups';
  }

  private calculateFaabSuggestion(totalScore: number, strategy: string): number {
    const basePercentage = strategy === 'safe' ? 0.05 :
                          strategy === 'aggressive' ? 0.20 :
                          0.12;

    const scoreMultiplier = Math.max(0.5, Math.min(2.0, totalScore / 100));
    return Math.round((basePercentage * scoreMultiplier) * 100);
  }

  private sortAndFilterPickups(pickups: HotPickup[]): HotPickup[] {
    return pickups
      .sort((a, b) => b.total_score - a.total_score)
      .slice(0, 15); // Return top 15 pickups
  }

  private analyzePositionStrength(): Record<Position, number> {
    // Mock implementation - in real app would analyze roster composition
    return {
      QB: 1,
      RB: 2,
      WR: 3,
      TE: 1,
      K: 1,
      DST: 1
    };
  }

  private determineOverallHealth(positionCounts: Record<Position, number>): TeamAnalysis {
    if (positionCounts.RB < 3) return 'need_rb2';
    if (positionCounts.WR < 4) return 'need_wr2';
    return 'healthy';
  }

  private identifyPositionalNeeds(positionCounts: Record<Position, number>): Position[] {
    const needs: Position[] = [];

    if (positionCounts.RB < 3) needs.push('RB');
    if (positionCounts.WR < 4) needs.push('WR');
    if (positionCounts.TE < 2) needs.push('TE');

    return needs;
  }
}