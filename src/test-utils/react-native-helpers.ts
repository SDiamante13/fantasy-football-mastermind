import React from 'react';
import { render, screen, waitFor, act, RenderAPI } from '@testing-library/react-native';
import { userEvent } from '@testing-library/react-native';

/**
 * Creates a userEvent instance for consistent user interactions
 */
export const setupUser = () => userEvent.setup();

/**
 * Helper for common expectations that an element is visible/present
 */
export const expectVisible = (element: any) => expect(element).toBeTruthy();

/**
 * Wraps user interactions in act() for proper React state updates
 */
export const performUserAction = async (action: () => Promise<void>) => {
  await act(async () => {
    await action();
  });
};

/**
 * Types and interacts with a text input element
 */
export const typeInField = async (
  user: ReturnType<typeof setupUser>, 
  element: any, 
  text: string
) => {
  await performUserAction(async () => {
    await user.type(element, text);
  });
};

/**
 * Clicks/presses a button or touchable element
 */
export const pressElement = async (
  user: ReturnType<typeof setupUser>, 
  element: any
) => {
  await performUserAction(async () => {
    await user.press(element);
  });
};

/**
 * Waits for an element to appear and validates it's visible
 */
export const waitForElementToAppear = async (
  getElementFn: () => any,
  options?: { timeout?: number }
) => {
  await waitFor(() => {
    expectVisible(getElementFn());
  }, options);
};

/**
 * Common mock for Sleeper API hooks with default test data
 */
export const createSleeperApiMocks = (overrides?: {
  players?: any;
  user?: any;
  leagues?: any;
  loading?: boolean;
  error?: string | null;
}) => ({
  useAllPlayers: () => ({
    players: overrides?.players || { 
      'test-player-1': { 
        player_id: 'test-player-1', 
        full_name: 'Test Player', 
        position: 'QB', 
        team: 'TEST', 
        active: true 
      }
    },
    loading: overrides?.loading || false,
    error: overrides?.error || null
  }),
  useSleeperUser: (submittedUsername: string) => ({ 
    user: submittedUsername ? { 
      user_id: 'test-user-id', 
      username: submittedUsername, 
      display_name: submittedUsername 
    } : null, 
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
export {
  render,
  screen,
  waitFor,
  act
} from '@testing-library/react-native';

export { userEvent } from '@testing-library/react-native';