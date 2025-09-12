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
        console.error('useSleeperUser error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
        setUser(null);
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

export function useUserLeagues(userId: string | null, season = '2025'): UseUserLeaguesReturn {
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
        console.error('useUserLeagues error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch leagues');
        setLeagues([]);
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
      console.error('useLeagueData error:', err);
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
    let isMounted = true;

    const fetchPlayers = async (): Promise<void> => {
      if (!isMounted) return;

      setLoading(true);
      setError(null);

      try {
        const sleeperService = new SleeperApiService();
        const playersData = await sleeperService.getAllPlayers();

        console.log('✅ Players loaded:', Object.keys(playersData).length, 'players');

        if (isMounted && playersData) {
          setPlayers(prevPlayers => ({ ...playersData }));
          console.log('✅ Players state updated, new count:', Object.keys(playersData).length);
        }
      } catch (err) {
        console.error('🚨 useAllPlayers error:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch players');
          setPlayers({});
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchPlayers();

    return () => {
      isMounted = false;
    };
  }, []);

  return { players, loading, error };
}
