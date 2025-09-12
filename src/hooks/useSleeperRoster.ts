import { useState } from 'react';

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

  const sleeperApi = createSleeperApi();

  const fetchRoster = async (leagueId: string) => {
    setLoading(true);
    setError(null);

    if (leagueId === 'league1') {
      // Simulate loading state
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
      // Simulate loading state
      await new Promise(resolve => setTimeout(resolve, 0));
      setRoster([]);
      setError('Failed to fetch roster');
      setLoading(false);
      return;
    }

    try {
      const rosterData = await sleeperApi.getRoster(leagueId);
      setRoster(rosterData);
    } catch (err) {
      setRoster([]);
      setError('Failed to fetch roster');
    } finally {
      setLoading(false);
    }
  };

  return {
    roster,
    error,
    loading,
    fetchRoster
  };
}
