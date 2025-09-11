import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSleeperUser, useUserLeagues } from '../hooks/useSleeperApi';
import { League, User } from '../sleeper/types';

const renderLeague = ({ item }: { item: League }): React.JSX.Element => (
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

const UserInputSection = ({
  username,
  setUsername,
  handleSubmit,
  isLoading
}: {
  username: string;
  setUsername: (value: string) => void;
  handleSubmit: () => void;
  isLoading?: boolean;
}): React.JSX.Element => (
  <View style={styles.inputContainer}>
    <TextInput
      style={styles.input}
      value={username}
      onChangeText={setUsername}
      placeholder="Enter your Sleeper username"
      autoCapitalize="none"
      autoCorrect={false}
      editable={!isLoading}
    />
    <TouchableOpacity 
      style={[styles.button, isLoading && styles.buttonDisabled]} 
      onPress={handleSubmit}
      disabled={isLoading || !username.trim()}
      accessibilityLabel="Load leagues for the entered username"
      accessibilityRole="button"
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <Text style={styles.buttonText}>Load Leagues</Text>
      )}
    </TouchableOpacity>
  </View>
);

const ErrorCard = ({ 
  title, 
  message, 
  suggestions 
}: { 
  title: string; 
  message: string; 
  suggestions: string[];
}): React.JSX.Element => (
  <View style={styles.errorCard}>
    <View style={styles.errorHeader}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>{title}</Text>
    </View>
    <Text style={styles.errorMessage}>{message}</Text>
    <View style={styles.errorSuggestions}>
      {suggestions.map((suggestion, index) => (
        <Text key={index} style={styles.errorSuggestion}>• {suggestion}</Text>
      ))}
    </View>
  </View>
);

const ErrorDisplay = ({
  userError,
  leaguesError
}: {
  userError: string | null;
  leaguesError: string | null;
}): React.JSX.Element | null => {
  if (!userError && !leaguesError) return null;
  
  return (
    <>
      {userError && (
        <ErrorCard
          title="User Not Found"
          message="We couldn't find a Sleeper user with that username."
          suggestions={[
            'Double-check the spelling of the username',
            'Make sure the user has a Sleeper account',
            'Try a different username'
          ]}
        />
      )}
      {leaguesError && (
        <ErrorCard
          title="Unable to Load Leagues"
          message="There was a problem loading leagues for this user."
          suggestions={[
            'Check your internet connection',
            'Try again in a few moments',
            'The user may not be in any leagues this season'
          ]}
        />
      )}
    </>
  );
};

const UserInfo = ({ user }: { user: User | null }): React.JSX.Element | null => {
  if (!user) return null;
  return (
    <View style={styles.userInfo}>
      <Text style={styles.userText}>
        {user.display_name} (@{user.username})
      </Text>
    </View>
  );
};

const LeaguesList = ({ leagues }: { leagues: League[] }): React.JSX.Element | null => {
  if (leagues.length === 0) return null;
  return (
    <FlatList
      data={leagues}
      renderItem={renderLeague}
      keyExtractor={item => item.league_id}
      style={styles.leaguesList}
      showsVerticalScrollIndicator={false}
    />
  );
};

const LoadingIndicator = ({ message }: { message: string }): React.JSX.Element => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#2196F3" />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);

const StatusSection = ({
  userError,
  leaguesError,
  userLoading,
  user,
  leaguesLoading
}: {
  userError: string | null;
  leaguesError: string | null;
  userLoading: boolean;
  user: User | null;
  leaguesLoading: boolean;
}): React.JSX.Element => (
  <>
    <ErrorDisplay userError={userError} leaguesError={leaguesError} />
    {userLoading && <LoadingIndicator message="Finding user..." />}
    <UserInfo user={user} />
    {leaguesLoading && <LoadingIndicator message="Loading leagues..." />}
  </>
);

type LeaguesContentProps = {
  username: string;
  setUsername: (value: string) => void;
  handleSubmit: () => void;
  userError: string | null;
  leaguesError: string | null;
  userLoading: boolean;
  user: User | null;
  leaguesLoading: boolean;
  leagues: League[];
};

const renderLeaguesHeader = (): React.JSX.Element => <Text style={styles.title}>My Leagues</Text>;

const LeaguesContentLayout = ({ children }: { children: React.ReactNode }): React.JSX.Element => (
  <View style={styles.content}>{children}</View>
);

const renderUserInput = (
  username: string,
  setUsername: (value: string) => void,
  handleSubmit: () => void,
  isLoading: boolean
): React.JSX.Element => (
  <UserInputSection username={username} setUsername={setUsername} handleSubmit={handleSubmit} isLoading={isLoading} />
);

const renderStatus = (statusProps: {
  userError: string | null;
  leaguesError: string | null;
  userLoading: boolean;
  user: User | null;
  leaguesLoading: boolean;
}): React.JSX.Element => (
  <StatusSection
    userError={statusProps.userError}
    leaguesError={statusProps.leaguesError}
    userLoading={statusProps.userLoading}
    user={statusProps.user}
    leaguesLoading={statusProps.leaguesLoading}
  />
);

const LeaguesContent = ({
  username,
  setUsername,
  handleSubmit,
  userError,
  leaguesError,
  userLoading,
  user,
  leaguesLoading,
  leagues
}: LeaguesContentProps): React.JSX.Element => (
  <LeaguesContentLayout>
    {renderLeaguesHeader()}
    {renderUserInput(username, setUsername, handleSubmit, userLoading || leaguesLoading)}
    {renderStatus({ userError, leaguesError, userLoading, user, leaguesLoading })}
    <LeaguesList leagues={leagues} />
  </LeaguesContentLayout>
);

export function LeaguesScreen(): React.JSX.Element {
  const [username, setUsername] = useState('');
  const [submittedUsername, setSubmittedUsername] = useState('');

  const { user, loading: userLoading, error: userError } = useSleeperUser(submittedUsername);
  const {
    leagues,
    loading: leaguesLoading,
    error: leaguesError
  } = useUserLeagues(user?.user_id || null);

  const handleSubmit = (): void => {
    setSubmittedUsername(username.trim());
  };

  return (
    <SafeAreaView style={styles.container}>
      <LeaguesContent
        username={username}
        setUsername={setUsername}
        handleSubmit={handleSubmit}
        userError={userError}
        leaguesError={leaguesError}
        userLoading={userLoading}
        user={user}
        leaguesLoading={leaguesLoading}
        leagues={leagues}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    marginRight: 10
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  error: {
    color: '#f44336',
    marginBottom: 10,
    textAlign: 'center'
  },
  errorCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 8
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
    flex: 1
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20
  },
  errorSuggestions: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12
  },
  errorSuggestion: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    marginBottom: 4
  },
  userInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20
  },
  userText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333'
  },
  leaguesList: {
    flex: 1
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
    elevation: 2
  },
  leagueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  leagueInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3
  },
  leagueType: {
    fontSize: 14,
    color: '#666'
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    marginVertical: 10
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '500'
  }
});
