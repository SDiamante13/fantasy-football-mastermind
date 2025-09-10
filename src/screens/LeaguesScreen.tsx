import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSleeperUser, useUserLeagues } from '../hooks/useSleeperApi';

export function LeaguesScreen(): React.JSX.Element {
  const [username, setUsername] = useState('');
  const [submittedUsername, setSubmittedUsername] = useState('');
  
  const { user, loading: userLoading, error: userError } = useSleeperUser(submittedUsername);
  const { leagues, loading: leaguesLoading, error: leaguesError } = useUserLeagues(user?.user_id || null);

  const handleSubmit = () => {
    setSubmittedUsername(username.trim());
  };

  const renderLeague = ({ item }: { item: any }) => (
    <View style={styles.leagueCard}>
      <Text style={styles.leagueName}>{item.name}</Text>
      <Text style={styles.leagueInfo}>
        {item.total_rosters} teams • Week {item.settings.leg || 1}
      </Text>
      <Text style={styles.leagueType}>
        {item.settings.type === 1 ? 'Redraft' : 'Dynasty'} • {item.scoring_settings.rec || 0} PPR
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>My Leagues</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your Sleeper username"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Load Leagues</Text>
          </TouchableOpacity>
        </View>

        {userError && <Text style={styles.error}>{userError}</Text>}
        {leaguesError && <Text style={styles.error}>{leaguesError}</Text>}

        {userLoading && <ActivityIndicator size="large" color="#2196F3" />}
        
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.userText}>
              {user.display_name} (@{user.username})
            </Text>
          </View>
        )}

        {leaguesLoading && <ActivityIndicator size="large" color="#2196F3" />}

        {leagues.length > 0 && (
          <FlatList
            data={leagues}
            renderItem={renderLeague}
            keyExtractor={(item) => item.league_id}
            style={styles.leaguesList}
            showsVerticalScrollIndicator={false}
          />
        )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    marginRight: 10,
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  error: {
    color: '#f44336',
    marginBottom: 10,
    textAlign: 'center',
  },
  userInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  userText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  leaguesList: {
    flex: 1,
  },
  leagueCard: {
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
  leagueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  leagueInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  leagueType: {
    fontSize: 14,
    color: '#666',
  },
});