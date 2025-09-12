import { renderHook, waitFor, act } from '@testing-library/react';

import { useSleeperRoster } from './useSleeperRoster';

describe('useSleeperRoster', () => {
  it('should fetch Sleeper roster when valid league ID provided', async () => {
    const { result } = renderHook(() => useSleeperRoster());

    await act(async () => {
      await result.current.fetchRoster('league1');
    });

    await waitFor(() => {
      expect(result.current.roster).toHaveLength(2);
      expect(result.current.roster[0]).toEqual({
        player_id: 'player1',
        name: 'Test Player 1',
        position: 'QB',
        team: 'KC',
        projected_points: 25.5,
        matchup: 'KC vs LAC'
      });
    });
  });

  it('should handle error when fetching roster fails', async () => {
    const { result } = renderHook(() => useSleeperRoster());

    await act(async () => {
      await result.current.fetchRoster('invalid');
    });

    await waitFor(() => {
      expect(result.current.roster).toEqual([]);
      expect(result.current.error).toBe('Failed to fetch roster');
    });
  });

  it('should show loading state during roster fetch', async () => {
    const { result } = renderHook(() => useSleeperRoster());

    act(() => {
      void result.current.fetchRoster('league1');
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});
