import React, { useState, useEffect } from 'react';

import { useSleeperUser } from '../hooks/useSleeperUser';
import { useSleeperLeagues } from '../hooks/useSleeperLeagues';

export function LeaguesWeb(): React.JSX.Element {
  const [username, setUsername] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const { user, error, loading, fetchUser } = useSleeperUser();
  const { leagues, error: leaguesError, loading: leaguesLoading, fetchLeagues } = useSleeperLeagues();

  useEffect(() => {
    if (user?.user_id) {
      void fetchLeagues(user.user_id);
    }
  }, [user]);

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      void fetchUser(username.trim());
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>⚡ Your Fantasy Leagues</h1>
        <p style={styles.subtitle}>
          Enter your Sleeper username to view your leagues and rosters
        </p>
      </header>

      <section style={styles.usernameSection}>
        <form onSubmit={handleUsernameSubmit} style={styles.usernameForm}>
          <div style={styles.inputGroup}>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Enter your Sleeper username"
              style={styles.usernameInput}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !username.trim()}
              style={{
                ...styles.submitButton,
                opacity: loading || !username.trim() ? 0.6 : 1
              }}
            >
              {loading ? 'Loading...' : 'Get Leagues'}
            </button>
          </div>
        </form>

        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}

        {user && (
          <div style={styles.userInfo}>
            <h3>Welcome, {user.display_name}!</h3>
            <p>User ID: {user.user_id}</p>
          </div>
        )}

        {leaguesLoading && (
          <div style={styles.loadingMessage}>
            Loading your leagues...
          </div>
        )}

        {leaguesError && (
          <div style={styles.errorMessage}>
            {leaguesError}
          </div>
        )}

        {leagues.length > 0 && (
          <div style={styles.leaguesSection}>
            <h3>Your Leagues ({leagues.length})</h3>
            <div style={styles.leaguesList}>
              {leagues.map((league) => (
                <div 
                  key={league.league_id} 
                  style={{
                    ...styles.leagueCard,
                    ...(selectedLeague === league.league_id ? styles.selectedLeagueCard : {})
                  }}
                  onClick={() => setSelectedLeague(league.league_id)}
                >
                  <h4 style={styles.leagueName}>{league.name}</h4>
                  <div style={styles.leagueDetails}>
                    <span style={styles.leagueDetail}>Season: {league.season}</span>
                    <span style={styles.leagueDetail}>Status: {league.status}</span>
                  </div>
                  {selectedLeague === league.league_id && (
                    <div style={styles.selectedIndicator}>
                      ✓ Selected - Loading roster...
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
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
    margin: '0 0 0.5rem 0'
  },
  subtitle: {
    fontSize: '1.125rem',
    color: '#666',
    lineHeight: '1.6',
    maxWidth: '800px',
    margin: '0 auto'
  },
  usernameSection: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
  },
  usernameForm: {
    marginBottom: '1.5rem'
  },
  inputGroup: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  usernameInput: {
    flex: 1,
    padding: '0.75rem 1rem',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  },
  submitButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background-color 0.2s ease',
    whiteSpace: 'nowrap' as const
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #f5c6cb',
    marginBottom: '1rem'
  },
  userInfo: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #c3e6cb'
  },
  loadingMessage: {
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #bee5eb',
    textAlign: 'center' as const
  },
  leaguesSection: {
    marginTop: '2rem'
  },
  leaguesList: {
    display: 'grid',
    gap: '1rem',
    marginTop: '1rem'
  },
  leagueCard: {
    backgroundColor: 'white',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  selectedLeagueCard: {
    backgroundColor: '#e7f3ff',
    borderColor: '#007bff',
    boxShadow: '0 4px 8px rgba(0,123,255,0.2)'
  },
  leagueName: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.125rem',
    color: '#333'
  },
  leagueDetails: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const
  },
  leagueDetail: {
    fontSize: '0.875rem',
    color: '#666',
    backgroundColor: '#f8f9fa',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px'
  },
  selectedIndicator: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '0.5rem',
    borderRadius: '4px',
    marginTop: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 'bold',
    textAlign: 'center' as const
  }
};
