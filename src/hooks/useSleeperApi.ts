import { useState, useEffect } from 'react';

import { SleeperApiService } from '../services/SleeperApiService';
import { League, User, Roster, Player } from '../sleeper/types';

type UseSleeperUserReturn = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

export function useSleeperUser(username: string): UseSleeperUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    const fetchUser = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const sleeperService = new SleeperApiService();
        const userData = await sleeperService.getUserByUsername(username);
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };

    void fetchUser();
  }, [username]);

  return { user, loading, error };
}

type UseUserLeaguesReturn = {
  leagues: League[];
  loading: boolean;
  error: string | null;
};

export function useUserLeagues(userId: string | null, season = '2024'): UseUserLeaguesReturn {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchLeagues = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const sleeperService = new SleeperApiService();
        const leaguesData = await sleeperService.getUserLeagues(userId, season);
        setLeagues(leaguesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch leagues');
      } finally {
        setLoading(false);
      }
    };

    void fetchLeagues();
  }, [userId, season]);

  return { leagues, loading, error };
}

type UseLeagueDataReturn = {
  league: League | null;
  rosters: Roster[];
  users: User[];
  loading: boolean;
  error: string | null;
};

const fetchAllLeagueData = async (leagueId: string): Promise<[League, Roster[], User[]]> => {
  const sleeperService = new SleeperApiService();
  return Promise.all([
    sleeperService.getLeague(leagueId),
    sleeperService.getLeagueRosters(leagueId),
    sleeperService.getLeagueUsers(leagueId)
  ]);
};

type LeagueDataSetters = {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLeague: (league: League) => void;
  setRosters: (rosters: Roster[]) => void;
  setUsers: (users: User[]) => void;
};

const createLeagueDataFetcher =
  (setters: LeagueDataSetters) =>
  async (leagueId: string): Promise<void> => {
    const { setLoading, setError, setLeague, setRosters, setUsers } = setters;
    setLoading(true);
    setError(null);
    try {
      const [leagueData, rostersData, usersData] = await fetchAllLeagueData(leagueId);
      setLeague(leagueData);
      setRosters(rostersData);
      setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch league data');
    } finally {
      setLoading(false);
    }
  };

export function useLeagueData(leagueId: string | null): UseLeagueDataReturn {
  const [league, setLeague] = useState<League | null>(null);
  const [rosters, setRosters] = useState<Roster[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!leagueId) return;

    const fetchLeagueData = createLeagueDataFetcher({
      setLoading,
      setError,
      setLeague,
      setRosters,
      setUsers
    });

    void fetchLeagueData(leagueId);
  }, [leagueId]);

  return { league, rosters, users, loading, error };
}

type UseAllPlayersReturn = {
  players: Record<string, Player>;
  loading: boolean;
  error: string | null;
};

export function useAllPlayers(): UseAllPlayersReturn {
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const sleeperService = new SleeperApiService();
        const playersData = await sleeperService.getAllPlayers();
        setPlayers(playersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch players');
      } finally {
        setLoading(false);
      }
    };

    void fetchPlayers();
  }, []);

  return { players, loading, error };
}
