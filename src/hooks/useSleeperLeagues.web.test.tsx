import { renderHook, waitFor, act } from '@testing-library/react';

import { useSleeperLeagues } from './useSleeperLeagues';

describe('useSleeperLeagues', () => {
  it('should fetch Sleeper leagues when valid user ID provided', async () => {
    const { result } = renderHook(() => useSleeperLeagues());

    await act(async () => {
      await result.current.fetchLeagues('123456');
    });

    await waitFor(() => {
      expect(result.current.leagues).toHaveLength(2);
      expect(result.current.leagues[0]).toEqual({
        league_id: 'league1',
        name: 'Test League 1',
        season: '2024',
        status: 'in_season'
      });
    });
  });

  it('should handle error when fetching leagues fails', async () => {
    const { result } = renderHook(() => useSleeperLeagues());

    await act(async () => {
      await result.current.fetchLeagues('invalid');
    });

    await waitFor(() => {
      expect(result.current.leagues).toEqual([]);
      expect(result.current.error).toBe('Failed to fetch leagues');
    });
  });
});
