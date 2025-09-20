import React, { useState, useEffect } from 'react';
import { HotPickups } from '../waivers/HotPickups.web';
import { SleeperApiService } from '../services/SleeperApiService';
import { LeagueWaiverService } from '../waivers/league-waiver-service';
import { HotPickupsEngine } from '../waivers/hot-pickups-engine';
import { FantasyProsApiService } from '../waivers/fantasy-pros-api';
import type { League, User } from '../sleeper/types';
import type { HotPickup, HotPickupsRequest } from '../waivers/types';

interface WaiversLeagueProps {
  username?: string;
}

export const WaiversLeague: React.FC<WaiversLeagueProps> = ({ username }) => {
  const [user, setUser] = useState<User | null>(null);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('');
  const [hotPickups, setHotPickups] = useState<HotPickup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (username) {
      loadUserAndLeagues(username);
    }
  }, [username]);

  useEffect(() => {
    if (selectedLeagueId && user) {
      loadHotPickups(selectedLeagueId, user);
    }
  }, [selectedLeagueId, user]);

  const loadUserAndLeagues = async (sleeperUsername: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const sleeperApi = new SleeperApiService();
      const userData = await sleeperApi.getUserByUsername(sleeperUsername);

      if (!userData) {
        throw new Error('User not found');
      }

      setUser(userData);

      const userLeagues = await sleeperApi.getUserLeagues(userData.user_id, '2025');
      setLeagues(userLeagues);

      if (userLeagues.length > 0) {
        setSelectedLeagueId(userLeagues[0].league_id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const loadHotPickups = async (leagueId: string, userData: User): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const sleeperApi = new SleeperApiService();
      const fantasyProsApi = new FantasyProsApiService();
      const hotPickupsEngine = new HotPickupsEngine({ sleeperApi, fantasyProsApi });
      const leagueWaiverService = new LeagueWaiverService(sleeperApi, hotPickupsEngine);

      // Get user's roster in the selected league
      const userRoster = await leagueWaiverService.getUserRosterInLeague(leagueId, userData.user_id);

      if (!userRoster) {
        throw new Error('User roster not found in this league');
      }

      const request: HotPickupsRequest = {
        leagueId,
        rosterId: userRoster.roster_id,
        teamAnalysis: 'need_flex', // Could be enhanced with actual team analysis
        strategy: 'balanced'
      };

      const availablePickups = await leagueWaiverService.getAvailableHotPickups(request);
      setHotPickups(availablePickups);
    } catch (err) {
      console.error('Error loading hot pickups:', err);
      setError(err instanceof Error ? err.message : 'Failed to load hot pickups');
      // Fall back to mock data on error
      setHotPickups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLeagueChange = (leagueId: string): void => {
    setSelectedLeagueId(leagueId);
  };

  const handleUsernameSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const submittedUsername = formData.get('username') as string;
    if (submittedUsername?.trim()) {
      loadUserAndLeagues(submittedUsername.trim());
    }
  };

  if (!username && !user) {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>🔥 League-Specific Waiver Analysis</h1>
          <p style={styles.subtitle}>
            Enter your Sleeper username to see available waiver wire pickups with real ownership data
          </p>
        </header>

        <form onSubmit={handleUsernameSubmit} style={styles.usernameForm}>
          <input
            type="text"
            name="username"
            placeholder="Enter your Sleeper username"
            style={styles.usernameInput}
            required
          />
          <button type="submit" style={styles.submitButton} disabled={loading}>
            {loading ? 'Loading...' : 'Load My Leagues'}
          </button>
        </form>

        {error && (
          <div style={styles.error}>
            Error: {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🔥 League-Specific Waiver Analysis</h1>
        <p style={styles.subtitle}>
          Real ownership data and available players for your leagues
        </p>
      </header>

      {user && leagues.length > 0 && (
        <div style={styles.controls}>
          <div style={styles.userInfo}>
            <strong>{user.username}</strong> - Select League:
          </div>
          <select
            value={selectedLeagueId}
            onChange={(e) => handleLeagueChange(e.target.value)}
            style={styles.leagueSelect}
          >
            {leagues.map(league => (
              <option key={league.league_id} value={league.league_id}>
                {league.name} ({league.total_rosters} teams)
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div style={styles.error}>
          Error: {error}
        </div>
      )}

      {loading && (
        <div style={styles.loading}>
          Loading waiver wire data...
        </div>
      )}

      <div style={styles.content}>
        <HotPickups pickups={hotPickups} />
      </div>
    </div>
  );
};

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
  usernameForm: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '2rem',
    maxWidth: '500px',
    margin: '0 auto 2rem auto'
  },
  usernameInput: {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem'
  },
  submitButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    minWidth: '120px'
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '2rem',
    padding: '1rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  userInfo: {
    fontSize: '1rem',
    color: '#333'
  },
  leagueSelect: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    minWidth: '200px'
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  loading: {
    textAlign: 'center' as const,
    padding: '2rem',
    fontSize: '1.125rem',
    color: '#666'
  },
  error: {
    textAlign: 'center' as const,
    padding: '1rem',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '4px',
    marginBottom: '1rem',
    border: '1px solid #ffcdd2'
  }
};