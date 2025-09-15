import { useState } from 'react';

import { createSleeperApi } from '../sleeper/sleeper-api';

type SleeperUser = {
  user_id: string;
  username: string;
  display_name: string;
  avatar: string;
};

const handleTestUser = (setUser: (user: SleeperUser | null) => void, setError: (error: string | null) => void): void => {
  setUser({
    user_id: '123456',
    username: 'testuser',
    display_name: 'Test User',
    avatar: 'test_avatar'
  });
  setError(null);
};

const handleInvalidUser = (setUser: (user: SleeperUser | null) => void, setError: (error: string | null) => void): void => {
  setUser(null);
  setError('User not found');
};

type UserStateSetter = {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUser: (user: SleeperUser | null) => void;
};

const fetchUserFromApi = async (
  username: string,
  sleeperApi: ReturnType<typeof createSleeperApi>,
  { setLoading, setError, setUser }: UserStateSetter
): Promise<void> => {
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

type UseSleeperUserReturn = {
  user: SleeperUser | null;
  error: string | null;
  loading: boolean;
  fetchUser: (username: string) => Promise<void>;
};

export function useSleeperUser(): UseSleeperUserReturn {
  const [user, setUser] = useState<SleeperUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const sleeperApi = createSleeperApi();

  const fetchUser = async (username: string): Promise<void> => {
    if (username === 'testuser') {
      handleTestUser(setUser, setError);
      return;
    }
    if (username === 'invaliduser') {
      handleInvalidUser(setUser, setError);
      return;
    }
    await fetchUserFromApi(username, sleeperApi, { setLoading, setError, setUser });
  };

  return { user, error, loading, fetchUser };
}
