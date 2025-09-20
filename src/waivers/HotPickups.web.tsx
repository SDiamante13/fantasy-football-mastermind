import React, { useState } from 'react';
import { HotPickup } from './types';

interface HotPickupsProps {
  pickups?: HotPickup[];
}

const mockPickups: HotPickup[] = [
  {
    player_id: '123',
    player_name: 'Jordan Mason',
    position: 'RB',
    total_score: 85,
    score_breakdown: {
      opportunity_score: 75,
      performance_score: 60,
      matchup_score: 70,
      team_fit_bonus: 25,
      trending_bonus: 10
    },
    recommendation_reason: 'League-winning upside play with strong opportunity metrics',
    faab_suggestion: 15
  }
];

export const HotPickups: React.FC<HotPickupsProps> = ({ pickups = mockPickups }) => {
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);
  const sortedPickups = [...pickups].sort((a, b) => b.total_score - a.total_score);

  const handlePlayerClick = (playerId: string): void => {
    setExpandedPlayerId(expandedPlayerId === playerId ? null : playerId);
  };

  return (
    <div>
      <h2>Hot Pickups</h2>
      {sortedPickups.map(pickup => (
        <div key={pickup.player_id} onClick={() => handlePlayerClick(pickup.player_id)}>
          <h3>{pickup.player_name}</h3>
          <span>{pickup.position}</span>
          <p>{pickup.recommendation_reason}</p>
          <div>Bid: ${pickup.faab_suggestion}</div>
          {expandedPlayerId === pickup.player_id && (
            <div>
              <div>Opportunity: {pickup.score_breakdown.opportunity_score}</div>
              <div>Performance: {pickup.score_breakdown.performance_score}</div>
              <div>Matchup: {pickup.score_breakdown.matchup_score}</div>
              <div>Team Fit: +{pickup.score_breakdown.team_fit_bonus}</div>
              <div>Trending: +{pickup.score_breakdown.trending_bonus}</div>
              <div>FAAB: ${pickup.faab_suggestion}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};