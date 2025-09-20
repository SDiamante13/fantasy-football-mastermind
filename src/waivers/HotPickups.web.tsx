import React, { useState } from 'react';

import { HotPickup } from './types';

interface HotPickupsProps {
  pickups?: HotPickup[];
}

const mockPickups: HotPickup[] = [
  {
    player_id: '123',
    player_name: 'Jaylen Warren',
    position: 'RB',
    team: 'PIT',
    total_score: 85,
    score_breakdown: {
      opportunity_score: 75,
      performance_score: 60,
      matchup_score: 70,
      team_fit_bonus: 25,
      trending_bonus: 10
    },
    recommendation_reason: 'Handcuff with standalone value and injury upside',
    faab_suggestion: 15,
    ownership_percentage: 45,
    is_available: true
  },
  {
    player_id: '124',
    player_name: 'Quentin Johnston',
    position: 'WR',
    team: 'LAC',
    total_score: 78,
    score_breakdown: {
      opportunity_score: 70,
      performance_score: 55,
      matchup_score: 75,
      team_fit_bonus: 20,
      trending_bonus: 15
    },
    recommendation_reason: 'Emerging target share with red zone opportunities',
    faab_suggestion: 8,
    ownership_percentage: 23,
    is_available: true
  }
];

const renderScoreBreakdown = (pickup: HotPickup): React.JSX.Element => (
  <div>
    <div>Opportunity: {pickup.score_breakdown.opportunity_score}</div>
    <div>Performance: {pickup.score_breakdown.performance_score}</div>
    <div>Matchup: {pickup.score_breakdown.matchup_score}</div>
    <div>Team Fit: +{pickup.score_breakdown.team_fit_bonus}</div>
    <div>Trending: +{pickup.score_breakdown.trending_bonus}</div>
    <div>FAAB: ${pickup.faab_suggestion}</div>
  </div>
);

const renderPlayerCard = (
  pickup: HotPickup,
  isExpanded: boolean,
  onPlayerClick: (playerId: string) => void
): React.JSX.Element => (
  <div key={pickup.player_id} onClick={() => onPlayerClick(pickup.player_id)} style={styles.playerCard}>
    <div style={styles.playerHeader}>
      <h3 style={styles.playerName}>{pickup.player_name}</h3>
      <div style={styles.ownershipBadge}>{pickup.ownership_percentage}% owned</div>
    </div>
    <div style={styles.playerInfo}>
      <span style={styles.position}>{pickup.position}</span>
      {pickup.team && <span style={styles.team}>{pickup.team}</span>}
      <span style={styles.faabBid}>Bid: ${pickup.faab_suggestion}</span>
    </div>
    <p style={styles.reason}>{pickup.recommendation_reason}</p>
    {isExpanded && renderScoreBreakdown(pickup)}
  </div>
);

export const HotPickups: React.FC<HotPickupsProps> = ({ pickups = mockPickups }) => {
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);
  const sortedPickups = [...pickups].filter(pickup => pickup.is_available).sort((a, b) => b.total_score - a.total_score);

  const handlePlayerClick = (playerId: string): void => {
    setExpandedPlayerId(expandedPlayerId === playerId ? null : playerId);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔥 Hot Pickups</h2>
      <div style={styles.pickupsList}>
        {sortedPickups.map(pickup =>
          renderPlayerCard(pickup, expandedPlayerId === pickup.player_id, handlePlayerClick)
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '1rem',
    textAlign: 'center' as const
  },
  pickupsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  },
  playerCard: {
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '1rem',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  playerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  playerName: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#333',
    margin: 0
  },
  ownershipBadge: {
    backgroundColor: '#f0f8ff',
    color: '#2196F3',
    padding: '0.25rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.875rem',
    fontWeight: '500',
    border: '1px solid #2196F3'
  },
  playerInfo: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  position: {
    backgroundColor: '#2196F3',
    color: 'white',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 'bold'
  },
  team: {
    backgroundColor: '#f5f5f5',
    color: '#666',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '500'
  },
  faabBid: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 'bold'
  },
  reason: {
    color: '#666',
    fontSize: '0.875rem',
    lineHeight: '1.4',
    margin: 0
  }
};
