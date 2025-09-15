import React, { useState, useEffect } from 'react';

import { useSleeperUser } from '../hooks/useSleeperUser';
import { useSleeperLeagues } from '../hooks/useSleeperLeagues';
import { useSleeperRoster } from '../hooks/useSleeperRoster';

import {
  UsernameForm,
  UserInfo,
  LeaguesList,
  RosterGrid,
  LoadingMessage,
  ErrorMessage
} from './Leagues.web.components';

export function LeaguesWeb(): React.JSX.Element {
  const [username, setUsername] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const { user, error, loading, fetchUser } = useSleeperUser();
  const { leagues, error: leaguesError, loading: leaguesLoading, fetchLeagues } = useSleeperLeagues();
  const { roster, error: rosterError, loading: rosterLoading, fetchRoster } = useSleeperRoster();

  useEffect(() => {
    if (user?.user_id) void fetchLeagues(user.user_id);
  }, [user]);

  useEffect(() => {
    if (selectedLeague && user?.user_id) void fetchRoster(selectedLeague, user.user_id);
  }, [selectedLeague, user?.user_id, fetchRoster]);

  const handleUsernameSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (username.trim()) void fetchUser(username.trim());
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUsername(e.target.value);
  };

  const handleLeagueKeyDown = (e: React.KeyboardEvent, leagueId: string): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedLeague(leagueId);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>⚡ Your Fantasy Leagues</h1>
        <p style={styles.subtitle}>Enter your Sleeper username to view your leagues and rosters</p>
      </header>

      <section style={styles.usernameSection}>
        <UsernameForm
          username={username}
          loading={loading}
          onUsernameChange={handleUsernameChange}
          onSubmit={handleUsernameSubmit}
          styles={styles}
        />

        <div id="username-help" style={styles.helpText}>
          Enter your Sleeper username to view your fantasy leagues and rosters
        </div>

        {error && <ErrorMessage error={error} styles={styles} />}
        {user && <UserInfo user={user} styles={styles} />}
        {leaguesLoading && <LoadingMessage message="Loading your leagues..." styles={styles} />}
        {leaguesError && <ErrorMessage error={leaguesError} styles={styles} />}

        {leagues.length > 0 && (
          <LeaguesList
            leagues={leagues}
            selectedLeague={selectedLeague}
            onLeagueSelect={setSelectedLeague}
            onLeagueKeyDown={handleLeagueKeyDown}
            styles={styles}
          />
        )}

        {selectedLeague && (
          <section style={styles.rosterSection}>
            <h3>League Roster</h3>
            {rosterLoading && <LoadingMessage message="Loading roster..." styles={styles} />}
            {rosterError && <ErrorMessage error={rosterError} styles={styles} />}
            {roster.length > 0 && <RosterGrid roster={roster} styles={styles} />}
          </section>
        )}
      </section>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100%',
    backgroundColor: '#f5f5f5',
    padding: '1rem'
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 0.5rem 0'
  },
  subtitle: {
    fontSize: '1.125rem',
    color: '#666',
    margin: 0
  },
  usernameSection: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  usernameForm: {
    marginBottom: '1rem'
  },
  inputGroup: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'center',
    flexWrap: 'wrap' as const
  },
  usernameInput: {
    padding: '0.75rem',
    fontSize: '1rem',
    border: '2px solid #ddd',
    borderRadius: '4px',
    minWidth: '280px',
    flex: '0 1 400px'
  },
  submitButton: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  helpText: {
    textAlign: 'center' as const,
    color: '#666',
    fontSize: '0.875rem',
    marginBottom: '1rem'
  },
  userInfo: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center' as const
  },
  loadingMessage: {
    textAlign: 'center' as const,
    color: '#007bff',
    fontSize: '1rem',
    padding: '1rem'
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '0.75rem 1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    border: '1px solid #f5c6cb'
  },
  leaguesSection: {
    marginTop: '2rem'
  },
  leaguesList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
    marginTop: '1rem'
  },
  leagueCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
    position: 'relative' as const
  },
  selectedLeagueCard: {
    borderColor: '#007bff',
    borderWidth: '2px',
    borderStyle: 'solid',
    boxShadow: '0 4px 8px rgba(0,123,255,0.2)'
  },
  leagueName: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '0.5rem',
    margin: '0 0 0.5rem 0'
  },
  leagueDetails: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem'
  },
  leagueDetail: {
    fontSize: '0.875rem',
    color: '#666'
  },
  selectedIndicator: {
    position: 'absolute' as const,
    top: '0.5rem',
    right: '0.5rem',
    color: '#007bff',
    fontWeight: 'bold'
  },
  rosterSection: {
    marginTop: '2rem'
  },
  rosterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem',
    marginTop: '1rem'
  },
  playerCard: {
    backgroundColor: 'white',
    padding: '1rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  playerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #eee'
  },
  playerName: {
    fontSize: '1.125rem',
    fontWeight: 'bold',
    color: '#333',
    margin: 0
  },
  playerPosition: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: 'bold'
  },
  playerDetails: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem'
  },
  playerDetail: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.875rem'
  },
  detailLabel: {
    color: '#666',
    fontWeight: '500'
  },
  detailValue: {
    color: '#333',
    fontWeight: 'bold'
  }
};