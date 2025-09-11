import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAllPlayers } from '../hooks/useSleeperApi';
import { Player } from '../sleeper/types';

const matchesSearch = (player: Player, searchTerm: string): boolean => {
  const nameMatch = player.full_name.toLowerCase().includes(searchTerm.toLowerCase());
  const teamMatch = (player.team || '').toLowerCase().includes(searchTerm.toLowerCase());
  return nameMatch || teamMatch;
};

const matchesPosition = (player: Player, selectedPosition: string): boolean => {
  return selectedPosition === 'ALL' || player.position === selectedPosition;
};

const isValidPlayer = (player: Player): boolean => {
  return Boolean(player.full_name && player.active);
};

const filterPlayers = (
  players: Record<string, Player>,
  searchTerm: string,
  selectedPosition: string
): Player[] => {
  if (!players) return [];

  return Object.values(players)
    .filter((player: Player) => {
      return (
        isValidPlayer(player) &&
        matchesSearch(player, searchTerm) &&
        matchesPosition(player, selectedPosition)
      );
    })
    .sort((a: Player, b: Player) => a.full_name.localeCompare(b.full_name))
    .slice(0, 50);
};

const renderPlayer = ({ item }: { item: Player }): React.JSX.Element => {
  const team = item.team || 'Free Agent';
  const experience = item.years_exp !== undefined ? `${item.years_exp} years experience` : 'Experience not available';
  const accessibilityLabel = `${item.full_name}, ${item.position} position, ${team}, ${experience}`;
  
  return (
    <View 
      style={styles.playerCard}
      accessibilityRole="none"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.playerHeader}>
        <Text 
          style={styles.playerName}
          accessibilityRole="header"
        >
          {item.full_name}
        </Text>
        <View 
          style={styles.playerBadge}
          accessibilityRole="text"
          accessibilityLabel={`Position: ${item.position}`}
        >
          <Text style={styles.positionText}>{item.position}</Text>
        </View>
      </View>
      <Text 
        style={styles.playerTeam}
        accessibilityRole="text"
      >
        {team} {item.position && `• ${item.position}`}
      </Text>
      {item.years_exp !== undefined && (
        <Text 
          style={styles.playerInfo}
          accessibilityRole="text"
        >
          {item.years_exp} years experience
        </Text>
      )}
    </View>
  );
};

const SkeletonBox = ({ 
  width, 
  height, 
  style 
}: { 
  width: number | string; 
  height: number; 
  style?: any;
}): React.JSX.Element => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const startAnimation = () => {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]).start(() => startAnimation());
    };
    startAnimation();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e0e0e0', '#f0f0f0'],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor,
          borderRadius: 4,
        },
        style,
      ]}
    />
  );
};

const SkeletonPlayerCard = (): React.JSX.Element => (
  <View style={styles.playerCard}>
    <View style={styles.playerHeader}>
      <SkeletonBox width="60%" height={16} />
      <SkeletonBox width={40} height={20} style={{ borderRadius: 12 }} />
    </View>
    <SkeletonBox width="40%" height={14} style={{ marginBottom: 3 }} />
    <SkeletonBox width="30%" height={12} />
  </View>
);

const SkeletonSearchInput = (): React.JSX.Element => (
  <SkeletonBox width="100%" height={48} style={{ borderRadius: 8, marginBottom: 15 }} />
);

const SkeletonPositionFilters = (): React.JSX.Element => (
  <View style={styles.positionFilters}>
    {Array.from({ length: 7 }).map((_, index) => (
      <SkeletonBox 
        key={index} 
        width={index === 0 ? 50 : 35} 
        height={28} 
        style={{ 
          borderRadius: 16, 
          marginRight: 8, 
          marginBottom: 8 
        }} 
      />
    ))}
  </View>
);

const SkeletonContent = (): React.JSX.Element => (
  <View style={styles.content}>
    <SkeletonBox width="50%" height={24} style={{ marginBottom: 20 }} />
    <SkeletonSearchInput />
    <SkeletonPositionFilters />
    <SkeletonBox width="30%" height={14} style={{ marginBottom: 10 }} />
    <View style={styles.playersList}>
      {Array.from({ length: 8 }).map((_, index) => (
        <SkeletonPlayerCard key={index} />
      ))}
    </View>
  </View>
);

const LoadingView = (): React.JSX.Element => (
  <SafeAreaView 
    style={styles.container}
    accessibilityRole="progressbar"
    accessibilityLabel="Loading players data"
    accessibilityLiveRegion="polite"
  >
    <SkeletonContent />
  </SafeAreaView>
);

const ErrorView = ({ error }: { error: string }): React.JSX.Element => (
  <SafeAreaView style={styles.container}>
    <View style={styles.content}>
      <View style={styles.errorContainer}>
        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>⚠️</Text>
        </View>
        <Text style={styles.errorTitle}>Unable to Load Players</Text>
        <Text style={styles.errorMessage}>
          {error.includes('network') || error.includes('fetch') 
            ? 'Please check your internet connection and try again.' 
            : 'There was a problem loading player data from Sleeper API.'}
        </Text>
        <View style={styles.errorActions}>
          <Text style={styles.errorSuggestion}>
            • Check your internet connection{'\n'}
            • Try refreshing the app{'\n'}
            • If the problem persists, Sleeper API may be temporarily unavailable
          </Text>
        </View>
      </View>
    </View>
  </SafeAreaView>
);

const PositionButton = ({
  position,
  selectedPosition,
  setSelectedPosition
}: {
  position: string;
  selectedPosition: string;
  setSelectedPosition: (position: string) => void;
}): React.JSX.Element => {
  const isSelected = selectedPosition === position;
  const positionLabel = position === 'ALL' ? 'All positions' : `${position} position`;
  
  return (
    <TouchableOpacity
      style={[styles.positionButton, isSelected && styles.selectedPositionButton]}
      onPress={() => setSelectedPosition(position)}
      accessibilityRole="button"
      accessibilityLabel={`Filter by ${positionLabel}`}
      accessibilityState={{ selected: isSelected }}
      accessibilityHint={`Tap to ${isSelected ? 'keep' : 'filter by'} ${positionLabel}`}
    >
      <Text
        style={[
          styles.positionButtonText,
          isSelected && styles.selectedPositionButtonText
        ]}
      >
        {position}
      </Text>
    </TouchableOpacity>
  );
};

const PositionFilters = ({
  positions,
  selectedPosition,
  setSelectedPosition
}: {
  positions: string[];
  selectedPosition: string;
  setSelectedPosition: (position: string) => void;
}): React.JSX.Element => (
  <View 
    style={styles.positionFilters}
    accessibilityRole="none"
    accessibilityLabel="Position filters"
    accessibilityHint="Filter players by position"
  >
    {positions.map(position => (
      <PositionButton
        key={position}
        position={position}
        selectedPosition={selectedPosition}
        setSelectedPosition={setSelectedPosition}
      />
    ))}
  </View>
);

type PlayersContentProps = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  positions: string[];
  selectedPosition: string;
  setSelectedPosition: (position: string) => void;
  filteredPlayers: Player[];
};

const renderPlayersHeader = (): React.JSX.Element => (
  <Text 
    style={styles.title}
    accessibilityRole="header"
    accessibilityLabel="Player Analysis - Search and filter NFL players"
  >
    Player Analysis
  </Text>
);

const PlayersSearchInput = ({
  searchTerm,
  setSearchTerm
}: {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}): React.JSX.Element => (
  <TextInput
    style={styles.searchInput}
    value={searchTerm}
    onChangeText={setSearchTerm}
    placeholder="Search players by name or team..."
    autoCapitalize="none"
    autoCorrect={false}
    accessibilityRole="search"
    accessibilityLabel="Search players by name or team"
    accessibilityHint="Type to filter the player list"
  />
);

const PlayersResultCount = ({ count }: { count: number }): React.JSX.Element => (
  <Text 
    style={styles.resultCount}
    accessibilityRole="text"
    accessibilityLabel={`${count} players found in search results`}
    accessibilityLiveRegion="polite"
  >
    {count} players found
  </Text>
);

const PlayersList = ({ players }: { players: Player[] }): React.JSX.Element => (
  <FlatList
    data={players}
    renderItem={renderPlayer}
    keyExtractor={item => item.player_id}
    style={styles.playersList}
    showsVerticalScrollIndicator={false}
    accessibilityRole="list"
    accessibilityLabel={`Players list with ${players.length} players`}
    accessibilityHint="Scroll to view more players"
  />
);

const PlayersContentLayout = ({ children }: { children: React.ReactNode }): React.JSX.Element => (
  <View 
    style={styles.content}
    accessibilityRole="none"
    accessibilityLabel="Players screen content"
  >
    {children}
  </View>
);

const PlayersContent = ({
  searchTerm,
  setSearchTerm,
  positions,
  selectedPosition,
  setSelectedPosition,
  filteredPlayers
}: PlayersContentProps): React.JSX.Element => (
  <PlayersContentLayout>
    {renderPlayersHeader()}
    <PlayersSearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
    <PositionFilters
      positions={positions}
      selectedPosition={selectedPosition}
      setSelectedPosition={setSelectedPosition}
    />
    <PlayersResultCount count={filteredPlayers.length} />
    <PlayersList players={filteredPlayers} />
  </PlayersContentLayout>
);

export function PlayersScreen(): React.JSX.Element {
  const { players, loading, error } = useAllPlayers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');

  const positions = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

  const filteredPlayers = useMemo(
    () => filterPlayers(players, searchTerm, selectedPosition),
    [players, searchTerm, selectedPosition]
  );

  if (loading) return <LoadingView />;
  if (error) return <ErrorView error={error} />;

  return (
    <SafeAreaView style={styles.container}>
      <PlayersContent
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        positions={positions}
        selectedPosition={selectedPosition}
        setSelectedPosition={setSelectedPosition}
        filteredPlayers={filteredPlayers}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  content: {
    flex: 1,
    padding: 20
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    marginBottom: 15
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8
  },
  selectedPositionButton: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3'
  },
  positionButtonText: {
    fontSize: 12,
    color: '#666'
  },
  selectedPositionButtonText: {
    color: 'white'
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1
  },
  playerBadge: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8
  },
  positionText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500'
  },
  playerTeam: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3
  },
  playerInfo: {
    fontSize: 12,
    color: '#999'
  },
  error: {
    color: '#f44336',
    textAlign: 'center'
  },
  errorContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    margin: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336'
  },
  errorIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffebee',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  errorIconText: {
    fontSize: 24
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 12,
    textAlign: 'center'
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22
  },
  errorActions: {
    alignItems: 'flex-start',
    width: '100%'
  },
  errorSuggestion: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    width: '100%'
  }
});
