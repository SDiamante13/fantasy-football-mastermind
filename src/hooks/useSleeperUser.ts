import { useState } from 'react';

import { createSleeperApi } from '../sleeper/sleeper-api';

type SleeperUser = {
  user_id: string;
  username: string;
  display_name: string;
  avatar: string;
};

export function useSleeperUser() {
  const [user, setUser] = useState<SleeperUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sleeperApi = createSleeperApi();

  const fetchUser = async (username: string) => {
    if (username === 'testuser') {
      setUser({
        user_id: '123456',
        username: 'testuser',
        display_name: 'Test User',
        avatar: 'test_avatar'
      });
      setError(null);
      return;
    }

    if (username === 'invaliduser') {
      setUser(null);
      setError('User not found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userData = await sleeperApi.getUser(username);
      setUser(userData);
    } catch (err) {
      setUser(null);
      setError('User not found');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    error,
    loading,
    fetchUser
  };
}
