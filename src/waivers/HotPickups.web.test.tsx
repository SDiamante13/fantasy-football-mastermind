import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { HotPickups } from './HotPickups.web';
import type { HotPickup } from './types';

const createTestPickup = (overrides: Partial<HotPickup>): HotPickup => ({
  player_id: '1',
  player_name: 'Test Player',
  position: 'WR',
  team: 'LAC',
  total_score: 60,
  score_breakdown: {
    opportunity_score: 60,
    performance_score: 55,
    matchup_score: 65,
    team_fit_bonus: 10,
    trending_bonus: 5
  },
  recommendation_reason: 'Test reason',
  faab_suggestion: 10,
  ownership_percentage: 25,
  is_available: true,
  ...overrides
});

const createSortingTestPickups = (): HotPickup[] => [
  createTestPickup({
    player_id: '1',
    player_name: 'Low Score Player',
    position: 'WR',
    total_score: 50,
    score_breakdown: {
      opportunity_score: 50,
      performance_score: 50,
      matchup_score: 50,
      team_fit_bonus: 0,
      trending_bonus: 0
    },
    recommendation_reason: 'Low priority',
    faab_suggestion: 5
  }),
  createTestPickup({
    player_id: '2',
    player_name: 'High Score Player',
    position: 'RB',
    total_score: 95,
    score_breakdown: {
      opportunity_score: 90,
      performance_score: 80,
      matchup_score: 85,
      team_fit_bonus: 25,
      trending_bonus: 15
    },
    recommendation_reason: 'High priority',
    faab_suggestion: 25
  })
];

const createFaabTestPickups = (): HotPickup[] => [
  createTestPickup({
    player_id: '1',
    player_name: 'Budget Player',
    faab_suggestion: 3
  }),
  createTestPickup({
    player_id: '2',
    player_name: 'Premium Player',
    position: 'RB',
    total_score: 90,
    faab_suggestion: 35
  })
];

const testBasicDisplay = (): void => {
  render(<HotPickups />);
  expect(screen.getByText('🔥 Hot Pickups')).toBeInTheDocument();
};

const testPlayerInfo = (): void => {
  render(<HotPickups />);
  expect(screen.getByText('Jaylen Warren')).toBeInTheDocument();
  expect(screen.getByText('RB')).toBeInTheDocument();
  expect(screen.getByText('PIT')).toBeInTheDocument();
  expect(screen.getByText('45% owned')).toBeInTheDocument();
  expect(screen.getByText(/Handcuff with standalone/)).toBeInTheDocument();
};

const testSorting = (): void => {
  render(<HotPickups pickups={createSortingTestPickups()} />);
  const playerNames = screen.getAllByRole('heading', { level: 3 });
  expect(playerNames[0]).toHaveTextContent('High Score Player');
  expect(playerNames[1]).toHaveTextContent('Low Score Player');
};

const testScoreBreakdown = async (): Promise<void> => {
  const user = userEvent.setup();
  render(<HotPickups />);

  const playerCard = screen.getByText('Jaylen Warren').closest('div');
  await user.click(playerCard!);

  expect(screen.getByText('Opportunity: 75')).toBeInTheDocument();
  expect(screen.getByText('Performance: 60')).toBeInTheDocument();
  expect(screen.getByText('Matchup: 70')).toBeInTheDocument();
  expect(screen.getByText('Team Fit: +25')).toBeInTheDocument();
  expect(screen.getByText('Trending: +10')).toBeInTheDocument();
  expect(screen.getByText('FAAB: $15')).toBeInTheDocument();
};

const testFaabDisplay = (): void => {
  render(<HotPickups pickups={createFaabTestPickups()} />);
  expect(screen.getByText('Bid: $35')).toBeInTheDocument();
  expect(screen.getByText('Bid: $3')).toBeInTheDocument();
};

const testOwnershipDisplay = (): void => {
  const testPickups = [
    createTestPickup({
      player_id: '1',
      player_name: 'Low Owned Player',
      ownership_percentage: 15,
      is_available: true
    }),
    createTestPickup({
      player_id: '2',
      player_name: 'Unavailable Player',
      ownership_percentage: 95,
      is_available: false
    })
  ];

  render(<HotPickups pickups={testPickups} />);

  expect(screen.getByText('Low Owned Player')).toBeInTheDocument();
  expect(screen.getByText('15% owned')).toBeInTheDocument();
  expect(screen.queryByText('Unavailable Player')).not.toBeInTheDocument();
};

describe('HotPickups', () => {
  it('should display hot pickups list for the team', testBasicDisplay);
  it('should show player name, position, and recommendation reason', testPlayerInfo);
  it('should sort hot pickups by total score descending', testSorting);
  it('should show detailed score breakdown when tapping a player', testScoreBreakdown);
  it('should display FAAB suggestion prominently for each player', testFaabDisplay);
  it('should show ownership percentage and filter unavailable players', testOwnershipDisplay);
});
