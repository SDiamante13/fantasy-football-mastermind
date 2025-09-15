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

type TestElement = ReturnType<typeof screen.getByText>;

// Mock the hooks to avoid actual API calls and skeleton animations
jest.mock('./hooks/useSleeperApi', () => mockSleeperApi);

const renderHomeScreenAndVerifyElements = (): void => {
  render(<HomeScreen />);

  expectVisible(screen.getByRole('header', { name: /Fantasy Football Mastermind/i }));
  expectVisible(screen.getByText('Welcome to your fantasy football command center'));
  expectVisible(screen.getByRole('header', { name: /Features/i }));
};

const enterUsernameAndLoadLeagues = async (user: ReturnType<typeof setupUser>): Promise<void> => {
  const usernameInput = screen.getByPlaceholderText('Enter your Sleeper username') as TestElement;
  const loadButton = screen.getByRole('button', { name: /Load leagues/i }) as TestElement;

  await typeInField(user, usernameInput, 'testuser');
  await pressElement(user, loadButton);

  await waitForElementToAppear(() => screen.getByText('testuser (@testuser)') as TestElement);
};

const searchPlayersAndFilter = async (user: ReturnType<typeof setupUser>): Promise<void> => {
  expectVisible(screen.getByRole('header', { name: /Player Analysis/i }));

  const searchInput = screen.getByRole('search', { name: /Search players/i }) as TestElement;
  await typeInField(user, searchInput, 'Test');

  expectVisible(screen.getByText('Test Player'));

  const qbFilterButton = screen.getByRole('button', { name: /Filter by QB/i }) as TestElement;
  expectVisible(qbFilterButton);

  await pressElement(user, qbFilterButton);
  expectVisible(qbFilterButton);
};

describe('Fantasy Football App', () => {
  it('displays the home screen with welcome message', (): void => {
    renderHomeScreenAndVerifyElements();
  });

  it('allows user to enter username and see their leagues', async (): Promise<void> => {
    const user = setupUser();
    render(<LeaguesScreen />);

    await enterUsernameAndLoadLeagues(user);
  });

  it('allows user to search and filter players by position', async (): Promise<void> => {
    const user = setupUser();
    render(<PlayersScreen />);

    await searchPlayersAndFilter(user);
  });
});