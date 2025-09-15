import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';

import { useAllPlayers } from '../hooks/useSleeperApi';
import { Player } from '../sleeper/types';

const filterPlayers = (
  players: Record<string, Player>,
  searchTerm: string,
  selectedPosition: string
): Player[] => {
  console.log('🔍 PlayersScreenWeb filterPlayers:', {
    playersCount: Object.keys(players).length,
    searchTerm,
    selectedPosition
  });

  if (!players) return [];

  const filtered = Object.values(players)
    .filter((player: Player) => {
      const hasName = Boolean(player.full_name);
      const matchesSearch =
        searchTerm === '' || player.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPosition = selectedPosition === 'ALL' || player.position === selectedPosition;

      return hasName && matchesSearch && matchesPosition;
    })
    .sort((a: Player, b: Player) => a.full_name.localeCompare(b.full_name))
    .slice(0, 20); // Smaller list for testing

  console.log('🔍 PlayersScreenWeb filtered result:', filtered.length);
  return filtered;
};

const renderPlayer = ({ item }: { item: Player }): React.JSX.Element => (
  <View style={styles.playerCard}>
    <Text style={styles.playerName}>{item.full_name}</Text>
    <Text style={styles.playerDetails}>
      {item.position} - {item.team || 'Free Agent'}
    </Text>
  </View>
);

const LoadingView: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.loadingText}>Loading players...</Text>
  </View>
);

const ErrorView: React.FC<{ error: string }> = ({ error }) => (
  <View style={styles.container}>
    <Text style={styles.errorText}>Error: {error}</Text>
  </View>
);

const PositionFilter: React.FC<{
  position: string;
  isSelected: boolean;
  onPress: () => void;
}> = ({ position, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.positionButton, isSelected && styles.selectedPositionButton]}
    onPress={onPress}
  >
    <Text style={[styles.positionButtonText, isSelected && styles.selectedPositionButtonText]}>
      {position}
    </Text>
  </TouchableOpacity>
);

const usePlayersWebData = (): {
  players: Record<string, Player>;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedPosition: string;
  setSelectedPosition: (value: string) => void;
  positions: string[];
  filteredPlayers: Player[];
} => {
  const { players, loading, error } = useAllPlayers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');
  const positions = ['ALL', 'QB', 'RB', 'WR', 'TE'];

  const filteredPlayers = useMemo(
    () => filterPlayers(players, searchTerm, selectedPosition),
    [players, searchTerm, selectedPosition]
  );

  return {
    players,
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

export function PlayersScreenWeb(): React.JSX.Element {
  const {
    players,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedPosition,
    setSelectedPosition,
    positions,
    filteredPlayers
  } = usePlayersWebData();

  if (loading) return <LoadingView />;
  if (error) return <ErrorView error={error} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌐 Players (Web Test)</Text>
      <TextInput
        style={styles.searchInput}
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Search players..."
      />
      <View style={styles.positionFilters}>
        {positions.map(position => (
          <PositionFilter
            key={position}
            position={position}
            isSelected={selectedPosition === position}
            onPress={() => setSelectedPosition(position)}
          />
        ))}
      </View>
      <Text style={styles.resultCount}>
        Players loaded: {Object.keys(players || {}).length}, Showing: {filteredPlayers.length}
      </Text>
      <FlatList
        data={filteredPlayers}
        renderItem={renderPlayer}
        keyExtractor={item => item.player_id}
        style={styles.playersList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 100
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginTop: 100
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    marginBottom: 15,
    fontSize: 16
  },
  positionFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15
  },
  positionButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8
  },
  selectedPositionButton: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3'
  },
  positionButtonText: {
    fontSize: 14,
    color: '#666'
  },
  selectedPositionButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  resultCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10
  },
  playersList: {
    flex: 1
  },
  playerCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee'
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  playerDetails: {
    fontSize: 14,
    color: '#666'
  }
});
