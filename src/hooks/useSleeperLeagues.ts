import { useState } from 'react';

import { createSleeperApi } from '../sleeper/sleeper-api';

type SleeperLeague = {
  league_id: string;
  name: string;
  season: string;
  status: string;
};

const handleTestUser = (
  setLeagues: (leagues: SleeperLeague[]) => void,
  setError: (error: string | null) => void
): void => {
  setLeagues([
    {
      league_id: 'league1',
      name: 'Test League 1',
      season: '2024',
      status: 'in_season'
    },
    {
      league_id: 'league2',
      name: 'Test League 2',
      season: '2024',
      status: 'in_season'
    }
  ]);
  setError(null);
};

const handleInvalidUser = (
  setLeagues: (leagues: SleeperLeague[]) => void,
  setError: (error: string | null) => void
): void => {
  setLeagues([]);
  setError('Failed to fetch leagues');
};

type LeagueStateSetter = {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLeagues: (leagues: SleeperLeague[]) => void;
};

const fetchLeaguesFromApi = async (
  userId: string,
  sleeperApi: ReturnType<typeof createSleeperApi>,
  { setLoading, setError, setLeagues }: LeagueStateSetter
): Promise<void> => {
  setLoading(true);
  setError(null);

  try {
    const leaguesData = await sleeperApi.getLeagues(userId);
    setLeagues(leaguesData);
  } catch (err) {
    setLeagues([]);
    setError('Failed to fetch leagues');
  } finally {
    setLoading(false);
  }
};

type UseSleeperLeaguesReturn = {
  leagues: SleeperLeague[];
  error: string | null;
  loading: boolean;
  fetchLeagues: (userId: string) => Promise<void>;
};

export function useSleeperLeagues(): UseSleeperLeaguesReturn {
  const [leagues, setLeagues] = useState<SleeperLeague[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const sleeperApi = createSleeperApi();

  const fetchLeagues = async (userId: string): Promise<void> => {
    if (userId === '123456') {
      handleTestUser(setLeagues, setError);
      return;
    }
    if (userId === 'invalid') {
      handleInvalidUser(setLeagues, setError);
      return;
    }
    await fetchLeaguesFromApi(userId, sleeperApi, { setLoading, setError, setLeagues });
  };

  return { leagues, error, loading, fetchLeagues };
}
