// React Native Testing Helpers
export {
  setupUser,
  expectVisible,
  performUserAction,
  typeInField,
  pressElement,
  waitForElementToAppear,
  createSleeperApiMocks,
  // Re-exported testing library functions
  render,
  screen,
  waitFor,
  act,
  userEvent
} from './react-native-helpers';

// Mock Service Factories
export {
  createMockService,
  mockData,
  tradeServiceMocks,
  faabServiceMocks,
  testService
} from './mock-factories';

// Common test patterns and utilities
export const commonExpectations = {
  toBeDefined: (value: unknown): void => expect(value).toBeDefined(),
  toHaveLength: (array: unknown[], length: number): void => expect(array).toHaveLength(length),
  toBe: (actual: unknown, expected: unknown): void => expect(actual).toBe(expected),
  toEqual: (actual: unknown, expected: unknown): void => expect(actual).toEqual(expected)
};

// Common test data generators
export const generateTestId = (prefix = 'test'): string =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const createTestUser = (
  username?: string
): { user_id: string; username: string; display_name: string } => ({
  user_id: generateTestId('user'),
  username: username || 'testuser',
  display_name: username || 'testuser'
});

export const createTestLeague = (
  name?: string
): { league_id: string; name: string; season: string; status: string } => ({
  league_id: generateTestId('league'),
  name: name || 'Test League',
  season: '2025',
  status: 'in_season'
});
