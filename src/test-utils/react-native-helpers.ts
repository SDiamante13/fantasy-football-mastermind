import { screen, waitFor, act } from '@testing-library/react-native';
import { userEvent } from '@testing-library/react-native';

import { Player, User, League } from '../sleeper/types';

type TestElement = ReturnType<typeof screen.getByText>;

/**
 * Creates a userEvent instance for consistent user interactions
 */
export const setupUser = (): ReturnType<typeof userEvent.setup> => userEvent.setup();

/**
 * Helper for common expectations that an element is visible/present
 */
export const expectVisible = (element: TestElement): void => {
  expect(element).toBeTruthy();
};

/**
 * Wraps user interactions in act() for proper React state updates
 */
export const performUserAction = async (action: () => Promise<void>): Promise<void> => {
  await (act as (callback: () => Promise<void>) => Promise<void>)(async () => {
    await action();
  });
};

/**
 * Types and interacts with a text input element
 */
export const typeInField = async (
  user: ReturnType<typeof setupUser>,
  element: TestElement,
  text: string
): Promise<void> => {
  await performUserAction(async () => {
    await user.type(element, text);
  });
};

/**
 * Clicks/presses a button or touchable element
 */
export const pressElement = async (user: ReturnType<typeof setupUser>, element: TestElement): Promise<void> => {
  await performUserAction(async () => {
    await user.press(element);
  });
};

/**
 * Waits for an element to appear and validates it's visible
 */
export const waitForElementToAppear = async (
  getElementFn: () => TestElement,
  options?: { timeout?: number }
): Promise<void> => {
  await waitFor(() => {
    expectVisible(getElementFn());
  }, options);
};

const createDefaultPlayer = (): Player => ({
  player_id: 'test-player-1',
  full_name: 'Test Player',
  position: 'QB',
  team: 'TEST',
  active: true,
  first_name: 'Test',
  last_name: 'Player'
});

const createTestUser = (username: string): User => ({
  user_id: 'test-user-id',
  username,
  display_name: username,
  avatar: ''
});

type MockOverrides = {
  players?: Record<string, Player>;
  user?: User | null;
  leagues?: League[];
  loading?: boolean;
  error?: string | null;
};

/**
 * Common mock for Sleeper API hooks with default test data
 */
export const createSleeperApiMocks = (overrides?: MockOverrides): {
  useAllPlayers: () => { players: Record<string, Player>; loading: boolean; error: string | null };
  useSleeperUser: (submittedUsername: string) => { user: User | null; loading: boolean; error: string | null };
  useUserLeagues: () => { leagues: League[]; loading: boolean; error: string | null };
} => ({
  useAllPlayers: () => ({
    players: overrides?.players || { 'test-player-1': createDefaultPlayer() },
    loading: overrides?.loading || false,
    error: overrides?.error || null
  }),
  useSleeperUser: (submittedUsername: string) => ({
    user: submittedUsername ? createTestUser(submittedUsername) : null,
    loading: overrides?.loading || false,
    error: overrides?.error || null
  }),
  useUserLeagues: () => ({
    leagues: overrides?.leagues || [],
    loading: overrides?.loading || false,
    error: overrides?.error || null
  })
});

// Note: For mocking hooks, use jest.mock() directly in test files
// since Jest doesn't allow jest.mock() calls in helper functions

// Re-export commonly used testing library functions for convenience
export { render, screen, waitFor, act } from '@testing-library/react-native';

export { userEvent } from '@testing-library/react-native';
