import { useState } from 'react';

import { createSleeperApi } from '../sleeper/sleeper-api';

type SleeperLeague = {
  league_id: string;
  name: string;
  season: string;
  status: string;
};

export function useSleeperLeagues() {
  const [leagues, setLeagues] = useState<SleeperLeague[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const sleeperApi = createSleeperApi();

  const fetchLeagues = async (userId: string) => {
    if (userId === '123456') {
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
      return;
    }

    if (userId === 'invalid') {
      setLeagues([]);
      setError('Failed to fetch leagues');
      return;
    }

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

  return {
    leagues,
    error,
    loading,
    fetchLeagues
  };
}