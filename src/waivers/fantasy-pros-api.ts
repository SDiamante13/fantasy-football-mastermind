import {
  PlayerRanking,
  PlayerProjection,
  TrendingPlayer,
  ScoringFormat,
  Position,
  TrendDirection
} from './types';

export class FantasyProsApiService {
  private readonly baseUrl = 'https://api.fantasypros.com/public/v2';

  async getConsensusRankings(scoringFormat: ScoringFormat): Promise<PlayerRanking[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/rankings/consensus?format=${scoringFormat.toLowerCase()}`
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json() as Promise<PlayerRanking[]>;
    } catch (error) {
      console.error('Error fetching consensus rankings:', error);
      throw new Error(
        `Failed to fetch rankings: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getPlayerProjections(
    position: Position,
    scoringFormat: ScoringFormat
  ): Promise<PlayerProjection[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/projections/ros?position=${position}&format=${scoringFormat.toLowerCase()}`
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json() as Promise<PlayerProjection[]>;
    } catch (error) {
      console.error('Error fetching player projections:', error);
      throw new Error(
        `Failed to fetch projections: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getTrendingPlayers(direction: TrendDirection): Promise<TrendingPlayer[]> {
    try {
      const response = await fetch(`${this.baseUrl}/trends?direction=${direction}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json() as Promise<TrendingPlayer[]>;
    } catch (error) {
      console.error('Error fetching trending players:', error);
      throw new Error(
        `Failed to fetch trends: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
