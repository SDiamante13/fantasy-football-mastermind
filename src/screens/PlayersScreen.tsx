import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAllPlayers } from '../hooks/useSleeperApi';
import { Player } from '../sleeper/types';

export function PlayersScreen(): React.JSX.Element {
  const { players, loading, error } = useAllPlayers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');

  const positions = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

  const filteredPlayers = useMemo(() => {
    if (!players) return [];
    
    return Object.values(players)
      .filter((player: Player) => {
        if (!player.full_name) return false;
        
        const matchesSearch = player.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (player.team || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesPosition = selectedPosition === 'ALL' || player.position === selectedPosition;
        
        return matchesSearch && matchesPosition && player.active;
      })
      .sort((a: Player, b: Player) => a.full_name.localeCompare(b.full_name))
      .slice(0, 50);
  }, [players, searchTerm, selectedPosition]);

  const renderPlayer = ({ item }: { item: Player }) => (
    <View style={styles.playerCard}>
      <View style={styles.playerHeader}>
        <Text style={styles.playerName}>{item.full_name}</Text>
        <View style={styles.playerBadge}>
          <Text style={styles.positionText}>{item.position}</Text>
        </View>
      </View>
      <Text style={styles.playerTeam}>
        {item.team || 'Free Agent'} {item.position && `• ${item.position}`}
      </Text>
      {item.years_exp !== undefined && (
        <Text style={styles.playerInfo}>
          {item.years_exp} years experience
        </Text>
      )}
    </View>
  );

  const renderPositionButton = (position: string) => (
    <TouchableOpacity
      key={position}
      style={[
        styles.positionButton,
        selectedPosition === position && styles.selectedPositionButton
      ]}
      onPress={() => setSelectedPosition(position)}
    >
      <Text style={[
        styles.positionButtonText,
        selectedPosition === position && styles.selectedPositionButtonText
      ]}>
        {position}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text>Loading players...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.error}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Player Analysis</Text>
        
        <TextInput
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search players..."
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.positionFilters}>
          {positions.map(renderPositionButton)}
        </View>

        <Text style={styles.resultCount}>
          {filteredPlayers.length} players found
        </Text>

        <FlatList
          data={filteredPlayers}
          renderItem={renderPlayer}
          keyExtractor={(item) => item.player_id}
          style={styles.playersList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    marginBottom: 15,
  },
  positionFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  positionButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedPositionButton: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  positionButtonText: {
    fontSize: 12,
    color: '#666',
  },
  selectedPositionButtonText: {
    color: 'white',
  },
  resultCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  playersList: {
    flex: 1,
  },
  playerCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  playerBadge: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  positionText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  playerTeam: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  playerInfo: {
    fontSize: 12,
    color: '#999',
  },
  error: {
    color: '#f44336',
    textAlign: 'center',
  },
});