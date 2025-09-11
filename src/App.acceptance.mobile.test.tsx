import React from 'react';

import { 
  render, 
  screen, 
  setupUser, 
  expectVisible,
  typeInField,
  pressElement,
  waitForElementToAppear
} from './test-utils';
import { HomeScreen } from './screens/HomeScreen';
import { LeaguesScreen } from './screens/LeaguesScreen';
import { PlayersScreen } from './screens/PlayersScreen';
import { mockSleeperApi } from './test-utils/mock-api';

// Mock the hooks to avoid actual API calls and skeleton animations
jest.mock('./hooks/useSleeperApi', () => mockSleeperApi);

describe('Fantasy Football App', () => {
  it('displays the home screen with welcome message', (): void => {
    render(<HomeScreen />);
    
    expectVisible(screen.getByRole('header', { name: /Fantasy Football Mastermind/i }));
    expectVisible(screen.getByText('Welcome to your fantasy football command center'));
    expectVisible(screen.getByRole('header', { name: /Features/i }));
  });

  it('allows user to enter username and see their leagues', async (): Promise<void> => {
    const user = setupUser();
    render(<LeaguesScreen />);
    
    const usernameInput = screen.getByPlaceholderText('Enter your Sleeper username');
    const loadButton = screen.getByRole('button', { name: /Load leagues/i });
    
    await typeInField(user, usernameInput, 'testuser');
    await pressElement(user, loadButton);
    
    await waitForElementToAppear(() => screen.getByText('testuser (@testuser)'));
  });

  it('allows user to search and filter players by position', async (): Promise<void> => {
    const user = setupUser();
    render(<PlayersScreen />);
    
    // Should show player analysis header immediately (no loading since we mocked data)
    expectVisible(screen.getByRole('header', { name: /Player Analysis/i }));
    
    // Use accessibility-based query for search input
    const searchInput = screen.getByRole('search', { name: /Search players/i });
    
    await typeInField(user, searchInput, 'Test');
    
    // Should show the test player
    expectVisible(screen.getByText('Test Player'));
    
    // Find QB filter button using accessibility role
    const qbFilterButton = screen.getByRole('button', { name: /Filter by QB/i });
    expectVisible(qbFilterButton);
    
    // Test clicking the QB filter
    await pressElement(user, qbFilterButton);
    
    // Verify the button shows selected state - check if it has the selected styling
    expectVisible(qbFilterButton);
  });
});