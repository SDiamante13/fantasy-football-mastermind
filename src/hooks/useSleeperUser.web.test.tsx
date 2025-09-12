import { renderHook, waitFor, act } from '@testing-library/react';

import { useSleeperUser } from './useSleeperUser';

describe('useSleeperUser', () => {
  it('should fetch Sleeper user data when valid username provided', async () => {
    const { result } = renderHook(() => useSleeperUser());
    
    await act(async () => {
      await result.current.fetchUser('testuser');
    });
    
    await waitFor(() => {
      expect(result.current.user).toEqual({
        user_id: '123456',
        username: 'testuser',
        display_name: 'Test User',
        avatar: 'test_avatar'
      });
    });
  });

  it('should handle invalid username gracefully with error message', async () => {
    const { result } = renderHook(() => useSleeperUser());
    
    await act(async () => {
      await result.current.fetchUser('invaliduser');
    });
    
    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe('User not found');
    });
  });
});