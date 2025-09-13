import { renderHook, waitFor, act } from '@testing-library/react';

import { useSleeperRoster } from './useSleeperRoster';

describe('useSleeperRoster', () => {
  it('should fetch Sleeper roster when valid league ID provided', async () => {
    const { result } = renderHook(() => useSleeperRoster());

    await act(async () => {
      await result.current.fetchRoster('league1', 'mockUserId');
    });

    await waitFor(() => {
      expect(result.current.roster).toHaveLength(2);
      expect(result.current.roster[0]).toMatchObject({
        player_id: 'player1',
        name: 'Test Player 1',
        position: 'QB',
        team: 'KC',
        matchup: 'KC vs TBD'
      });
      // Projected points should be a realistic number for QB
      expect(result.current.roster[0].projected_points).toBeGreaterThan(10);
      expect(result.current.roster[0].projected_points).toBeLessThan(40);
    });
  });

  it('should handle error when fetching roster fails', async () => {
    const { result } = renderHook(() => useSleeperRoster());

    await act(async () => {
      await result.current.fetchRoster('invalid', 'mockUserId');
    });

    await waitFor(() => {
      expect(result.current.roster).toEqual([]);
      expect(result.current.error).toBe('Failed to fetch roster');
    });
  });

  it('should show loading state during roster fetch', async () => {
    const { result } = renderHook(() => useSleeperRoster());

    act(() => {
      void result.current.fetchRoster('league1', 'mockUserId');
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});
