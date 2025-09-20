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
  Strategy
} from './types';

interface HotPickupsEngineServices {
  sleeperApi: SleeperApiService;
  fantasyProsApi: FantasyProsApiService;
}

export class HotPickupsEngine {
  constructor(private services: HotPickupsEngineServices) {}

  async getHotPickups(request: HotPickupsRequest): Promise<HotPickup[]> {
    try {
      const [rankings, projections] = await Promise.all([
        this.services.fantasyProsApi.getConsensusRankings('HALF_PPR').catch(() => this.getMockRankings()),
        this.getRelevantProjections(request.teamAnalysis).catch(() => this.getMockProjections())
      ]);

      const availablePlayers = this.getAvailablePlayers();

      const scoredPlayers = availablePlayers.map(player =>
        this.scorePlayer(player, request, rankings, projections)
      );

      return this.sortAndFilterPickups(scoredPlayers);
    } catch (error) {
      console.warn('Hot pickups API error, using fallback data:', error);
      return this.getFallbackHotPickups(request);
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
      { player_id: '789', player_name: 'Jaylen Wright', position: 'RB', team: 'MIA' }
    ];
  }

  private async getRelevantProjections(teamAnalysis: TeamAnalysis): Promise<PlayerProjection[]> {
    const positions =
      teamAnalysis === 'need_rb2' ? ['RB'] : teamAnalysis === 'need_wr2' ? ['WR'] : ['RB', 'WR'];

    const projections = await Promise.all(
      positions.map(pos =>
        this.services.fantasyProsApi.getPlayerProjections(pos as Position, 'HALF_PPR')
      )
    );

    return projections.flat();
  }

  private scorePlayer(
    player: { player_id: string; player_name: string; position: Position; team: string },
    request: HotPickupsRequest,
    rankings: PlayerRanking[],
    projections: PlayerProjection[]
  ): HotPickup {
    const ranking = rankings.find(r => r.player_id === player.player_id);
    const projection = projections.find(p => p.player_id === player.player_id);

    const scoreBreakdown = this.calculateScoreBreakdown(player, request, ranking, projection);
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

  private getMockRankings(): PlayerRanking[] {
    return [
      { player_id: 'player_rb_1', player_name: 'Tyler Allgeier', position: 'RB', team: 'ATL', rank: 45, tier: 3 },
      { player_id: 'player_wr_1', player_name: 'Rome Odunze', position: 'WR', team: 'CHI', rank: 38, tier: 3 },
      { player_id: 'player_rb_2', player_name: 'Justice Hill', position: 'RB', team: 'BAL', rank: 52, tier: 4 },
      { player_id: 'player_wr_2', player_name: 'Jordan Whittington', position: 'WR', team: 'LAR', rank: 68, tier: 4 },
      { player_id: 'player_te_1', player_name: 'Cade Otton', position: 'TE', team: 'TB', rank: 28, tier: 2 }
    ];
  }

  private getMockProjections(): PlayerProjection[] {
    return [
      { player_id: 'player_rb_1', projected_points: 12.5, games_remaining: 16, opportunity_score: 75 },
      { player_id: 'player_wr_1', projected_points: 14.2, games_remaining: 16, opportunity_score: 68 },
      { player_id: 'player_rb_2', projected_points: 9.8, games_remaining: 16, opportunity_score: 62 },
      { player_id: 'player_wr_2', projected_points: 8.1, games_remaining: 16, opportunity_score: 58 },
      { player_id: 'player_te_1', projected_points: 11.3, games_remaining: 16, opportunity_score: 71 }
    ];
  }

  private getFallbackHotPickups(request: HotPickupsRequest): HotPickup[] {
    return [
      {
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
      },
      {
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
      },
      {
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
      }
    ];
  }
}
