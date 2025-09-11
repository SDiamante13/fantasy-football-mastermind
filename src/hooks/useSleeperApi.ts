import { useState, useEffect } from 'react';

import { SleeperApiService } from '../services/SleeperApiService';
import { League, User, Roster, Player } from '../sleeper/types';

export function useSleeperUser(username: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    const fetchUser = async () => {
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

    fetchUser();
  }, [username]);

  return { user, loading, error };
}

export function useUserLeagues(userId: string | null, season = '2024') {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchLeagues = async () => {
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

    fetchLeagues();
  }, [userId, season]);

  return { leagues, loading, error };
}

export function useLeagueData(leagueId: string | null) {
  const [league, setLeague] = useState<League | null>(null);
  const [rosters, setRosters] = useState<Roster[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!leagueId) return;

    const fetchLeagueData = async () => {
      setLoading(true);
      setError(null);
      try {
        const sleeperService = new SleeperApiService();
        const [leagueData, rostersData, usersData] = await Promise.all([
          sleeperService.getLeague(leagueId),
          sleeperService.getLeagueRosters(leagueId),
          sleeperService.getLeagueUsers(leagueId),
        ]);
        setLeague(leagueData);
        setRosters(rostersData);
        setUsers(usersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch league data');
      } finally {
        setLoading(false);
      }
    };

    fetchLeagueData();
  }, [leagueId]);

  return { league, rosters, users, loading, error };
}

export function useAllPlayers() {
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
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

    fetchPlayers();
  }, []);

  return { players, loading, error };
}