import type { SleeperApiService } from '../services/SleeperApiService';
import type { League, Roster, Player } from '../sleeper/types';
import type { HotPickup, HotPickupsRequest } from './types';
import type { HotPickupsEngine } from './hot-pickups-engine';

export interface LeagueWaiverData {
  availablePlayers: Player[];
  rosteredPlayerIds: Set<string>;
  ownershipData: Map<string, number>;
  league: League;
  rosters: Roster[];
}

export class LeagueWaiverService {
  constructor(
    private sleeperApi: SleeperApiService,
    private hotPickupsEngine: HotPickupsEngine
  ) {}

  async getLeagueWaiverData(leagueId: string): Promise<LeagueWaiverData> {
    const [league, rosters, allPlayers] = await Promise.all([
      this.sleeperApi.getLeague(leagueId),
      this.sleeperApi.getLeagueRosters(leagueId),
      this.sleeperApi.getAllPlayers()
    ]);

    const rosteredPlayerIds = this.extractRosteredPlayers(rosters);
    const ownershipData = this.calculateOwnershipPercentages(rosters, league.total_rosters);
    const availablePlayers = this.filterAvailablePlayers(allPlayers, rosteredPlayerIds);

    return {
      availablePlayers,
      rosteredPlayerIds,
      ownershipData,
      league,
      rosters
    };
  }

  async getAvailableHotPickups(request: HotPickupsRequest): Promise<HotPickup[]> {
    const waiverData = await this.getLeagueWaiverData(request.leagueId);
    const basePickups = await this.hotPickupsEngine.getHotPickups(request);

    return basePickups
      .map(pickup => this.enhancePickupWithLeagueData(pickup, waiverData))
      .filter(pickup => pickup.is_available)
      .sort((a, b) => {
        // Prioritize lower ownership and higher scores
        const ownershipWeight = (100 - a.ownership_percentage) * 0.3;
        const scoreWeight = a.total_score * 0.7;
        const aValue = ownershipWeight + scoreWeight;

        const bOwnershipWeight = (100 - b.ownership_percentage) * 0.3;
        const bScoreWeight = b.total_score * 0.7;
        const bValue = bOwnershipWeight + bScoreWeight;

        return bValue - aValue;
      });
  }

  private extractRosteredPlayers(rosters: Roster[]): Set<string> {
    const rosteredPlayerIds = new Set<string>();

    rosters.forEach(roster => {
      roster.players?.forEach(playerId => {
        rosteredPlayerIds.add(playerId);
      });
    });

    return rosteredPlayerIds;
  }

  private calculateOwnershipPercentages(rosters: Roster[], totalRosters: number): Map<string, number> {
    const playerCounts = new Map<string, number>();

    rosters.forEach(roster => {
      roster.players?.forEach(playerId => {
        playerCounts.set(playerId, (playerCounts.get(playerId) || 0) + 1);
      });
    });

    const ownershipData = new Map<string, number>();
    playerCounts.forEach((count, playerId) => {
      const percentage = Math.round((count / totalRosters) * 100);
      ownershipData.set(playerId, percentage);
    });

    return ownershipData;
  }

  private filterAvailablePlayers(
    allPlayers: Record<string, Player>,
    rosteredPlayerIds: Set<string>
  ): Player[] {
    return Object.values(allPlayers).filter(player =>
      player.active &&
      player.team &&
      !rosteredPlayerIds.has(player.player_id)
    );
  }

  private enhancePickupWithLeagueData(pickup: HotPickup, waiverData: LeagueWaiverData): HotPickup {
    const ownershipPercentage = waiverData.ownershipData.get(pickup.player_id) || 0;
    const isAvailable = !waiverData.rosteredPlayerIds.has(pickup.player_id);

    return {
      ...pickup,
      ownership_percentage: ownershipPercentage,
      is_available: isAvailable
    };
  }

  async getUserRosterInLeague(leagueId: string, userId: string): Promise<Roster | null> {
    const rosters = await this.sleeperApi.getLeagueRosters(leagueId);
    return rosters.find(roster => roster.owner_id === userId) || null;
  }

  async getUserLeagues(userId: string, season = '2025'): Promise<League[]> {
    return this.sleeperApi.getUserLeagues(userId, season);
  }
}