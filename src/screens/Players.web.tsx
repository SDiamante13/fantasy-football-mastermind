import React, { useState, useMemo } from 'react';

import { useAllPlayers } from '../hooks/useSleeperApi';
import type { Player } from '../sleeper/types';

type Position = 'ALL' | 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';

const isRetiredVeteran = (player: Player): boolean => {
  return !player.team && !!player.years_exp && player.years_exp > 15;
};

const isYoungFreeAgent = (player: Player): boolean => {
  return !player.team && (!player.years_exp || player.years_exp <= 2);
};

const isRelevantPlayer = (player: Player): boolean => {
  if (isRetiredVeteran(player)) return false;
  if (player.team) return true;
  if (isYoungFreeAgent(player)) return true;
  return false;
};

const hasValidName = (player: Player): boolean => Boolean(player.full_name);

const matchesSearch = (player: Player, searchTerm: string): boolean => {
  if (searchTerm === '') return true;
  return player.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
};

const matchesPosition = (player: Player, selectedPosition: Position): boolean => {
  return selectedPosition === 'ALL' || player.position === selectedPosition;
};

const matchesSearchCriteria = (
  player: Player,
  searchTerm: string,
  selectedPosition: Position
): boolean => {
  if (!hasValidName(player)) return false;
  if (!isRelevantPlayer(player)) return false;
  if (!matchesSearch(player, searchTerm)) return false;
  return matchesPosition(player, selectedPosition);
};

const sortPlayers = (a: Player, b: Player): number => {
  if (a.team && !b.team) return -1;
  if (!a.team && b.team) return 1;
  return a.full_name.localeCompare(b.full_name);
};

const filterPlayers = (
  players: Record<string, Player>,
  searchTerm: string,
  selectedPosition: Position
): Player[] => {
  if (!players) return [];

  return Object.values(players)
    .filter(player => matchesSearchCriteria(player, searchTerm, selectedPosition))
    .sort(sortPlayers)
    .slice(0, 150);
};

const SearchInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onChange(e.target.value);
  };

  return (
    <div style={styles.searchContainer}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search players..."
        style={styles.searchInput}
      />
    </div>
  );
};

const PositionFilter: React.FC<{
  positions: Position[];
  selectedPosition: Position;
  onPositionChange: (position: Position) => void;
}> = ({ positions, selectedPosition, onPositionChange }) => (
  <div style={styles.positionFilters}>
    {positions.map(position => (
      <button
        key={position}
        onClick={() => onPositionChange(position)}
        style={{
          ...styles.positionButton,
          ...(selectedPosition === position ? styles.selectedPositionButton : {})
        }}
      >
        {position}
      </button>
    ))}
  </div>
);

const PlayerCard: React.FC<{ player: Player }> = ({ player }) => (
  <div style={styles.playerCard}>
    <h3 style={styles.playerName}>{player.full_name}</h3>
    <div style={styles.playerDetails}>
      <span style={styles.position}>{player.position}</span>
      <span style={styles.team}>{player.team || 'Free Agent'}</span>
    </div>
    {player.years_exp !== undefined && (
      <div style={styles.playerStats}>
        <span>Experience: {player.years_exp} years</span>
      </div>
    )}
  </div>
);

const LoadingView: React.FC = () => (
  <div style={styles.centerContainer}>
    <div style={styles.loadingSpinner}>🔄</div>
    <p style={styles.loadingText}>Loading NFL players...</p>
  </div>
);

const ErrorView: React.FC<{ error: string }> = ({ error }) => (
  <div style={styles.centerContainer}>
    <div style={styles.errorIcon}>❌</div>
    <p style={styles.errorText}>Error loading players: {error}</p>
  </div>
);

const PlayersHeader: React.FC<{ playerCount: number }> = ({ playerCount }) => (
  <header style={styles.header}>
    <h1 style={styles.title}>🏈 NFL Player Database</h1>
    <p style={styles.subtitle}>
      Search active NFL players for fantasy analysis, trade research, and roster planning. Find
      player stats, team affiliations, and experience levels.
    </p>
    <div style={styles.statsContainer}>
      <span style={styles.statsText}>Active Players: {playerCount}</span>
    </div>
  </header>
);

const PlayersGrid: React.FC<{ players: Player[] }> = ({ players }) => {
  if (players.length === 0) {
    return (
      <div style={styles.noResults}>
        <p>No players found matching your criteria</p>
      </div>
    );
  }

  return (
    <div style={styles.playersGrid}>
      {players.map(player => (
        <PlayerCard key={player.player_id} player={player} />
      ))}
    </div>
  );
};

type PlayersWebData = {
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedPosition: Position;
  setSelectedPosition: (value: Position) => void;
  positions: Position[];
  filteredPlayers: Player[];
};

const usePlayersWebData = (): PlayersWebData => {
  const { players, loading, error } = useAllPlayers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<Position>('ALL');
  const positions: Position[] = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

  const filteredPlayers = useMemo(
    () => filterPlayers(players, searchTerm, selectedPosition),
    [players, searchTerm, selectedPosition]
  );

  return {
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedPosition,
    setSelectedPosition,
    positions,
    filteredPlayers
  };
};

export function PlayersWeb(): React.JSX.Element {
  const data = usePlayersWebData();
  if (data.loading) return <LoadingView />;
  if (data.error) return <ErrorView error={data.error} />;

  return (
    <div style={styles.container}>
      <PlayersHeader playerCount={data.filteredPlayers.length} />
      <div style={styles.controls}>
        <SearchInput value={data.searchTerm} onChange={data.setSearchTerm} />
        <PositionFilter
          positions={data.positions}
          selectedPosition={data.selectedPosition}
          onPositionChange={data.setSelectedPosition}
        />
      </div>
      <PlayersGrid players={data.filteredPlayers} />
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100%',
    backgroundColor: '#f8f9fa',
    padding: '1rem'
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center' as const
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '0.5rem',
    margin: 0
  },
  subtitle: {
    fontSize: '1.125rem',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '1rem',
    maxWidth: '800px',
    margin: '0 auto 1rem auto'
  },
  statsContainer: {
    marginTop: '0.5rem'
  },
  statsText: {
    fontSize: '1rem',
    color: '#666',
    backgroundColor: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    border: '1px solid #e0e0e0'
  },
  controls: {
    marginBottom: '2rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  },
  searchContainer: {
    display: 'flex',
    justifyContent: 'center'
  },
  searchInput: {
    width: '100%',
    maxWidth: '500px',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    border: '2px solid #e0e0e0',
    borderRadius: '25px',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  },
  positionFilters: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
    gap: '0.5rem'
  },
  positionButton: {
    padding: '0.5rem 1rem',
    border: '2px solid #e0e0e0',
    borderRadius: '20px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    color: '#666'
  },
  selectedPositionButton: {
    backgroundColor: '#007bff',
    color: 'white',
    borderColor: '#007bff'
  },
  playersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem'
  },
  playerCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid #e0e0e0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    transition: 'box-shadow 0.2s ease',
    cursor: 'pointer'
  },
  playerName: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '0.5rem',
    margin: '0 0 0.5rem 0'
  },
  playerDetails: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '0.5rem'
  },
  position: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '0.25rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 'bold'
  },
  team: {
    backgroundColor: '#f8f9fa',
    color: '#666',
    padding: '0.25rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500'
  },
  playerStats: {
    fontSize: '0.875rem',
    color: '#666',
    marginTop: '0.5rem'
  },
  centerContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    textAlign: 'center' as const
  },
  loadingSpinner: {
    fontSize: '3rem',
    marginBottom: '1rem',
    animation: 'spin 2s linear infinite'
  },
  loadingText: {
    fontSize: '1.25rem',
    color: '#666',
    margin: 0
  },
  errorIcon: {
    fontSize: '3rem',
    marginBottom: '1rem'
  },
  errorText: {
    fontSize: '1.25rem',
    color: '#d32f2f',
    margin: 0
  },
  noResults: {
    gridColumn: '1 / -1',
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#666'
  }
};
