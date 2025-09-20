import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HotPickups } from './HotPickups.web';

describe('HotPickups', () => {
  it('should display hot pickups list for the team', () => {
    render(<HotPickups />);

    expect(screen.getByText('Hot Pickups')).toBeInTheDocument();
  });

  it('should show player name, position, and recommendation reason', () => {
    render(<HotPickups />);

    expect(screen.getByText('Jordan Mason')).toBeInTheDocument();
    expect(screen.getByText('RB')).toBeInTheDocument();
    expect(screen.getByText(/League-winning upside/)).toBeInTheDocument();
  });

  it('should sort hot pickups by total score descending', () => {
    const testPickups = [
      {
        player_id: '1',
        player_name: 'Low Score Player',
        position: 'WR' as const,
        total_score: 50,
        score_breakdown: { opportunity_score: 50, performance_score: 50, matchup_score: 50, team_fit_bonus: 0, trending_bonus: 0 },
        recommendation_reason: 'Low priority',
        faab_suggestion: 5
      },
      {
        player_id: '2',
        player_name: 'High Score Player',
        position: 'RB' as const,
        total_score: 95,
        score_breakdown: { opportunity_score: 90, performance_score: 80, matchup_score: 85, team_fit_bonus: 25, trending_bonus: 15 },
        recommendation_reason: 'High priority',
        faab_suggestion: 25
      }
    ];

    render(<HotPickups pickups={testPickups} />);

    const playerNames = screen.getAllByRole('heading', { level: 3 });
    expect(playerNames[0]).toHaveTextContent('High Score Player');
    expect(playerNames[1]).toHaveTextContent('Low Score Player');
  });

  it('should show detailed score breakdown when tapping a player', async () => {
    const user = userEvent.setup();
    render(<HotPickups />);

    const playerCard = screen.getByText('Jordan Mason').closest('div');
    await user.click(playerCard!);

    expect(screen.getByText('Opportunity: 75')).toBeInTheDocument();
    expect(screen.getByText('Performance: 60')).toBeInTheDocument();
    expect(screen.getByText('Matchup: 70')).toBeInTheDocument();
    expect(screen.getByText('Team Fit: +25')).toBeInTheDocument();
    expect(screen.getByText('Trending: +10')).toBeInTheDocument();
    expect(screen.getByText('FAAB: $15')).toBeInTheDocument();
  });

  it('should display FAAB suggestion prominently for each player', () => {
    const testPickups = [
      {
        player_id: '1',
        player_name: 'Budget Player',
        position: 'WR' as const,
        total_score: 60,
        score_breakdown: { opportunity_score: 60, performance_score: 55, matchup_score: 65, team_fit_bonus: 10, trending_bonus: 5 },
        recommendation_reason: 'Solid depth pickup',
        faab_suggestion: 3
      },
      {
        player_id: '2',
        player_name: 'Premium Player',
        position: 'RB' as const,
        total_score: 90,
        score_breakdown: { opportunity_score: 85, performance_score: 80, matchup_score: 88, team_fit_bonus: 20, trending_bonus: 15 },
        recommendation_reason: 'High-upside league winner',
        faab_suggestion: 35
      }
    ];

    render(<HotPickups pickups={testPickups} />);

    expect(screen.getByText('Bid: $35')).toBeInTheDocument();
    expect(screen.getByText('Bid: $3')).toBeInTheDocument();
  });
});