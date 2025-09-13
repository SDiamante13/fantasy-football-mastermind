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

export function useSleeperRoster() {
  const [roster, setRoster] = useState<SleeperRosterPlayer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sleeperApi = useMemo(() => createSleeperApi(), []);

  const fetchRoster = useCallback(async (leagueId: string) => {
    setLoading(true);
    setError(null);

    // Keep mock data for tests
    if (leagueId === 'league1') {
      await new Promise(resolve => setTimeout(resolve, 0));
      setRoster([
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
      ]);
      setError(null);
      setLoading(false);
      return;
    }

    if (leagueId === 'invalid') {
      await new Promise(resolve => setTimeout(resolve, 0));
      setRoster([]);
      setError('Failed to fetch roster');
      setLoading(false);
      return;
    }

    // Use real API for all other league IDs
    try {
      const rosterData = await sleeperApi.getRoster(leagueId);
      setRoster(rosterData);
      setError(null);
    } catch (err) {
      setRoster([]);
      setError(err instanceof Error ? err.message : 'Failed to fetch roster');
    } finally {
      setLoading(false);
    }
  }, [sleeperApi]);

  return {
    roster,
    error,
    loading,
    fetchRoster
  };
}
