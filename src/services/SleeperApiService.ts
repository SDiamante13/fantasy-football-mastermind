import { League, User, Roster, Player } from '../sleeper/types';

const SLEEPER_BASE_URL = 'https://api.sleeper.app/v1';

export class SleeperApiService {
  async getUserByUsername(username: string): Promise<User | null> {
    const response = await fetch(`${SLEEPER_BASE_URL}/user/${username}`);
    if (!response.ok) {
      return null;
    }
    return response.json() as Promise<User>;
  }

  async getUserLeagues(userId: string, season: string): Promise<League[]> {
    const response = await fetch(`${SLEEPER_BASE_URL}/user/${userId}/leagues/nfl/${season}`);
    if (!response.ok) {
      return [];
    }
    return response.json() as Promise<League[]>;
  }

  async getLeagueRosters(leagueId: string): Promise<Roster[]> {
    const response = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/rosters`);
    if (!response.ok) {
      return [];
    }
    return response.json() as Promise<Roster[]>;
  }

  async getAllPlayers(): Promise<Record<string, Player>> {
    const response = await fetch(`${SLEEPER_BASE_URL}/players/nfl`);
    if (!response.ok) {
      return {};
    }
    return response.json() as Promise<Record<string, Player>>;
  }

  async getLeagueUsers(leagueId: string): Promise<User[]> {
    const response = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/users`);
    if (!response.ok) {
      return [];
    }
    return response.json() as Promise<User[]>;
  }

  async getLeague(leagueId: string): Promise<League> {
    const response = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch league: ${response.statusText}`);
    }
    return response.json() as Promise<League>;
  }
}