import { useState, useCallback, useMemo } from 'react';

import { createSleeperApi } from '../sleeper/sleeper-api';

type SleeperRosterPlayer = {
  player_id: string;
  name: string;
  position: string;
  team: string;
  projected_points: number;
  matchup: string;
};

const createMockRoster = (): SleeperRosterPlayer[] => [
  {
    player_id: 'player1',
    name: 'Test Player 1',
    position: 'QB',
    team: 'KC',
    projected_points: 25.5,
    matchup: 'KC vs LAC'
  },
  {
    player_id: 'player2',
    name: 'Test Player 2',
    position: 'RB',
    team: 'SF',
    projected_points: 18.3,
    matchup: 'SF vs SEA'
  }
];

const handleMockLeague = async (
  setRoster: (roster: SleeperRosterPlayer[]) => void,
  setError: (error: string | null) => void,
  setLoading: (loading: boolean) => void
): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 0));
  setRoster(createMockRoster());
  setError(null);
  setLoading(false);
};

const handleInvalidLeague = async (
  setRoster: (roster: SleeperRosterPlayer[]) => void,
  setError: (error: string | null) => void,
  setLoading: (loading: boolean) => void
): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 0));
  setRoster([]);
  setError('Failed to fetch roster');
  setLoading(false);
};

type RosterStateSetter = {
  setRoster: (roster: SleeperRosterPlayer[]) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
};

const fetchRealRoster = async (
  leagueId: string,
  userId: string,
  sleeperApi: ReturnType<typeof createSleeperApi>,
  { setRoster, setError, setLoading }: RosterStateSetter
): Promise<void> => {
  try {
    const rosterData = await sleeperApi.getRoster(leagueId, userId);
    setRoster(rosterData);
    setError(null);
  } catch (err) {
    setRoster([]);
    setError(err instanceof Error ? err.message : 'Failed to fetch roster');
  } finally {
    setLoading(false);
  }
};

type UseSleeperRosterReturn = {
  roster: SleeperRosterPlayer[];
  error: string | null;
  loading: boolean;
  fetchRoster: (leagueId: string, userId: string) => Promise<void>;
};

const createFetchRoster = (
  sleeperApi: ReturnType<typeof createSleeperApi>,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  setRoster: (roster: SleeperRosterPlayer[]) => void
) => async (leagueId: string, userId: string): Promise<void> => {
  setLoading(true);
  setError(null);
  if (leagueId === 'league1') {
    await handleMockLeague(setRoster, setError, setLoading);
    return;
  }
  if (leagueId === 'invalid') {
    await handleInvalidLeague(setRoster, setError, setLoading);
    return;
  }
  await fetchRealRoster(leagueId, userId, sleeperApi, { setRoster, setError, setLoading });
};

export function useSleeperRoster(): UseSleeperRosterReturn {
  const [roster, setRoster] = useState<SleeperRosterPlayer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const sleeperApi = useMemo(() => createSleeperApi(), []);

  const fetchRoster = useCallback(
    createFetchRoster(sleeperApi, setLoading, setError, setRoster),
    [sleeperApi]
  );

  return { roster, error, loading, fetchRoster };
}
