import { SleeperApiService } from '../services/SleeperApiService';
import type { TrendingPlayer } from '../sleeper/types';

import {
  HotPickup,
  HotPickupsRequest,
  TeamAnalysisResult,
  ScoreBreakdown,
  Position,
  TeamAnalysis,
  Strategy
} from './types';

interface HotPickupsEngineServices {
  sleeperApi: SleeperApiService;
}

export class HotPickupsEngine {
  constructor(private services: HotPickupsEngineServices) {}

  async getHotPickups(request: HotPickupsRequest): Promise<HotPickup[]> {
    try {
      const trendingAdds = await this.services.sleeperApi.getTrendingAdds();
      const availablePlayers = this.getAvailablePlayers();

      const scoredPlayers = availablePlayers.map(player =>
        this.scorePlayerWithTrending(player, request, trendingAdds)
      );

      return this.sortAndFilterPickups(scoredPlayers);
    } catch (error) {
      console.warn('Hot pickups API error, using fallback data:', error);
      return this.getFallbackHotPickups();
    }
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

  private getAvailablePlayers(): {
    player_id: string;
    player_name: string;
    position: Position;
    team: string;
  }[] {
    // Mock implementation - in real app would check rosters and return unrostered players
    return [
      { player_id: '123', player_name: 'Jordan Mason', position: 'RB', team: 'SF' },
      { player_id: '456', player_name: 'Darnell Mooney', position: 'WR', team: 'ATL' },
      { player_id: '789', player_name: 'Jaylen Wright', position: 'RB', team: 'MIA' },
      { player_id: 'high_add_player', player_name: 'Hot Pickup Player', position: 'WR', team: 'LAC' },
      { player_id: 'low_add_player', player_name: 'Mild Pickup Player', position: 'RB', team: 'DEN' }
    ];
  }


  private scorePlayerWithTrending(
    player: { player_id: string; player_name: string; position: Position; team: string },
    request: HotPickupsRequest,
    trendingAdds: TrendingPlayer[]
  ): HotPickup {
    const trendingData = trendingAdds.find(t => t.player_id === player.player_id);

    const scoreBreakdown = this.calculateScoreBreakdownWithTrending(player, request, trendingData);
    const totalScore = this.calculateTotalScore(scoreBreakdown);

    return this.createHotPickup(player, request, scoreBreakdown, totalScore);
  }

  private calculateTotalScore(scoreBreakdown: ScoreBreakdown): number {
    const scores: number[] = [
      scoreBreakdown.opportunity_score,
      scoreBreakdown.performance_score,
      scoreBreakdown.matchup_score,
      scoreBreakdown.team_fit_bonus,
      scoreBreakdown.trending_bonus
    ];
    return scores.reduce((sum, score) => sum + score, 0);
  }

  private createHotPickup(
    player: { player_id: string; player_name: string; position: Position; team: string },
    request: HotPickupsRequest,
    scoreBreakdown: ScoreBreakdown,
    totalScore: number
  ): HotPickup {
    return {
      player_id: player.player_id,
      player_name: player.player_name,
      position: player.position,
      team: player.team,
      total_score: totalScore,
      score_breakdown: scoreBreakdown,
      recommendation_reason: this.generateRecommendationReason(player, request, scoreBreakdown),
      faab_suggestion: this.calculateFaabSuggestion(totalScore, request.strategy),
      ownership_percentage: 0, // Will be populated by LeagueWaiverService
      is_available: true // Will be filtered by LeagueWaiverService
    };
  }

  private calculateScoreBreakdownWithTrending(
    player: { player_id: string; player_name: string; position: Position; team: string },
    request: HotPickupsRequest,
    trendingData: TrendingPlayer | undefined
  ): ScoreBreakdown {
    const opportunityScore = this.estimateOpportunityScore(player);
    const performanceScore = this.calculateTrendingPerformanceScore(trendingData);
    const matchupScore = this.calculateMatchupScore();
    const teamFitBonus = this.calculateTeamFitBonus(player, request.teamAnalysis);
    const trendingBonus = this.calculateTrendingBonus(trendingData);

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

  private calculateTeamFitBonus(
    player: { position: Position },
    teamAnalysis: TeamAnalysis
  ): number {
    if (teamAnalysis === 'healthy') return 0;
    return this.getPositionMatchBonus(player.position, teamAnalysis);
  }

  private getPositionMatchBonus(position: Position, teamAnalysis: TeamAnalysis): number {
    const isRbNeed = teamAnalysis === 'need_rb2' && position === 'RB';
    const isWrNeed = teamAnalysis === 'need_wr2' && position === 'WR';
    return isRbNeed || isWrNeed ? 25 : 0;
  }

  private calculateTrendingPerformanceScore(trendingData: TrendingPlayer | undefined): number {
    if (!trendingData) return 40;

    // Convert trending add count to performance score (0-100)
    // Players with 100+ adds get high scores, scale down from there
    const maxScore = 100;
    const normalizedScore = Math.min(maxScore, (trendingData.count / 100) * maxScore);
    return Math.max(20, normalizedScore); // Minimum score of 20
  }

  private calculateTrendingBonus(trendingData: TrendingPlayer | undefined): number {
    if (!trendingData) return 0;

    // Bonus points for very hot pickups (200+ adds = 30 bonus, scale down)
    return Math.min(30, (trendingData.count / 200) * 30);
  }

  private generateRecommendationReason(
    player: { position: Position },
    request: HotPickupsRequest,
    breakdown: ScoreBreakdown
  ): string {
    if (request.teamAnalysis === 'healthy') {
      return 'League-winning upside play with strong opportunity metrics';
    }

    if (breakdown.team_fit_bonus > 0) {
      return `Addresses team weakness at ${player.position} with immediate impact potential`;
    }

    return 'Strong opportunity-based pickup with favorable upcoming matchups';
  }

  private calculateFaabSuggestion(totalScore: number, strategy: Strategy): number {
    const basePercentage = strategy === 'safe' ? 0.05 : strategy === 'aggressive' ? 0.2 : 0.12;

    const scoreMultiplier = Math.max(0.5, Math.min(2.0, totalScore / 100));
    return Math.round(basePercentage * scoreMultiplier * 100);
  }

  private sortAndFilterPickups(pickups: HotPickup[]): HotPickup[] {
    return pickups.sort((a, b) => b.total_score - a.total_score).slice(0, 15); // Return top 15 pickups
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


  private getFallbackHotPickups(): HotPickup[] {
    return [
      this.createFallbackRb(),
      this.createFallbackWr(),
      this.createFallbackTe()
    ];
  }

  private createFallbackRb(): HotPickup {
    return {
      player_id: 'fallback_rb_1',
      player_name: 'Tyler Allgeier',
      position: 'RB',
      team: 'ATL',
      total_score: 78,
      score_breakdown: {
        opportunity_score: 72,
        performance_score: 65,
        matchup_score: 68,
        team_fit_bonus: 15,
        trending_bonus: 8
      },
      recommendation_reason: 'Solid depth RB with goal line upside',
      faab_suggestion: 12,
      ownership_percentage: 0,
      is_available: true
    };
  }

  private createFallbackWr(): HotPickup {
    return {
      player_id: 'fallback_wr_1',
      player_name: 'Rome Odunze',
      position: 'WR',
      team: 'CHI',
      total_score: 74,
      score_breakdown: {
        opportunity_score: 68,
        performance_score: 62,
        matchup_score: 71,
        team_fit_bonus: 12,
        trending_bonus: 11
      },
      recommendation_reason: 'Emerging rookie with target share growth',
      faab_suggestion: 9,
      ownership_percentage: 0,
      is_available: true
    };
  }

  private createFallbackTe(): HotPickup {
    return {
      player_id: 'fallback_te_1',
      player_name: 'Cade Otton',
      position: 'TE',
      team: 'TB',
      total_score: 69,
      score_breakdown: {
        opportunity_score: 65,
        performance_score: 58,
        matchup_score: 66,
        team_fit_bonus: 10,
        trending_bonus: 7
      },
      recommendation_reason: 'Streaming TE option with red zone looks',
      faab_suggestion: 6,
      ownership_percentage: 0,
      is_available: true
    };
  }
}
