import { League, User, Roster, Player, TrendingPlayer } from '../sleeper/types';

const SLEEPER_BASE_URL = 'https://api.sleeper.app/v1';

export class SleeperApiService {
  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const response = await fetch(`${SLEEPER_BASE_URL}/user/${username}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json() as Promise<User>;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error(
        `Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getUserLeagues(userId: string, season: string): Promise<League[]> {
    try {
      const response = await fetch(`${SLEEPER_BASE_URL}/user/${userId}/leagues/nfl/${season}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json() as Promise<League[]>;
    } catch (error) {
      console.error('Error fetching user leagues:', error);
      throw new Error(
        `Failed to fetch leagues: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getLeagueRosters(leagueId: string): Promise<Roster[]> {
    try {
      const response = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/rosters`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json() as Promise<Roster[]>;
    } catch (error) {
      console.error('Error fetching league rosters:', error);
      throw new Error(
        `Failed to fetch rosters: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getAllPlayers(): Promise<Record<string, Player>> {
    try {
      const response = await fetch(`${SLEEPER_BASE_URL}/players/nfl`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json() as Promise<Record<string, Player>>;
    } catch (error) {
      console.error('Error fetching all players:', error);
      throw new Error(
        `Failed to fetch players: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getLeagueUsers(leagueId: string): Promise<User[]> {
    try {
      const response = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/users`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json() as Promise<User[]>;
    } catch (error) {
      console.error('Error fetching league users:', error);
      throw new Error(
        `Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getLeague(leagueId: string): Promise<League> {
    try {
      const response = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json() as Promise<League>;
    } catch (error) {
      console.error('Error fetching league:', error);
      throw new Error(
        `Failed to fetch league: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getTrendingAdds(): Promise<TrendingPlayer[]> {
    try {
      const response = await fetch(`${SLEEPER_BASE_URL}/players/nfl/trending/add`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json() as Promise<TrendingPlayer[]>;
    } catch (error) {
      console.error('Error fetching trending adds:', error);
      throw new Error(
        `Failed to fetch trending adds: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getTrendingDrops(): Promise<TrendingPlayer[]> {
    try {
      const response = await fetch(`${SLEEPER_BASE_URL}/players/nfl/trending/drop`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json() as Promise<TrendingPlayer[]>;
    } catch (error) {
      console.error('Error fetching trending drops:', error);
      throw new Error(
        `Failed to fetch trending drops: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
