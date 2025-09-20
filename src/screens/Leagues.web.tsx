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

type SleeperRosterPlayer = {
  player_id: string;
  name: string;
  position: string;
  team: string;
  projected_points: number;
  matchup: string;
};

const LeaguesHeader: React.FC = () => (
  <header style={styles.header}>
    <h1 style={styles.title}>⚡ Your Fantasy Leagues</h1>
    <p style={styles.subtitle}>Enter your Sleeper username to view your leagues and rosters</p>
  </header>
);

const RosterSection: React.FC<{
  selectedLeague: string | null;
  roster: SleeperRosterPlayer[];
  rosterLoading: boolean;
  rosterError: string | null;
  styles: Record<string, React.CSSProperties>;
}> = ({ selectedLeague, roster, rosterLoading, rosterError, styles }) => {
  if (!selectedLeague) return null;

  return (
    <section style={styles.rosterSection}>
      <h3>League Roster</h3>
      {rosterLoading && <LoadingMessage message="Loading roster..." styles={styles} />}
      {rosterError && <ErrorMessage error={rosterError} styles={styles} />}
      {roster.length > 0 && <RosterGrid roster={roster} styles={styles} />}
    </section>
  );
};

type LeaguesData = {
  userData: ReturnType<typeof useSleeperUser>;
  leaguesData: ReturnType<typeof useSleeperLeagues>;
  rosterData: ReturnType<typeof useSleeperRoster>;
  selectedLeague: string | null;
  setSelectedLeague: (id: string | null) => void;
};

const useLeaguesData = (): LeaguesData => {
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const userData = useSleeperUser();
  const leaguesData = useSleeperLeagues();
  const rosterData = useSleeperRoster();
  useEffect(() => {
    if (userData.user?.user_id) void leaguesData.fetchLeagues(userData.user.user_id);
  }, [userData.user, leaguesData.fetchLeagues]);
  useEffect(() => {
    if (selectedLeague && userData.user?.user_id) {
      void rosterData.fetchRoster(selectedLeague, userData.user.user_id);
    }
  }, [selectedLeague, userData.user?.user_id, rosterData.fetchRoster]);
  return { userData, leaguesData, rosterData, selectedLeague, setSelectedLeague };
};

type MainContentData = {
  username: string;
  userData: ReturnType<typeof useSleeperUser>;
  leaguesData: ReturnType<typeof useSleeperLeagues>;
  rosterData: ReturnType<typeof useSleeperRoster>;
  selectedLeague: string | null;
  setSelectedLeague: (id: string) => void;
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onLeagueKeyDown: (e: React.KeyboardEvent, id: string) => void;
};

const UserSection: React.FC<{
  userData: ReturnType<typeof useSleeperUser>;
  leaguesData: ReturnType<typeof useSleeperLeagues>;
}> = ({ userData, leaguesData }) => (
  <>
    {userData.error && <ErrorMessage error={userData.error} styles={styles} />}
    {userData.user && <UserInfo user={userData.user} styles={styles} />}
    {leaguesData.loading && <LoadingMessage message="Loading your leagues..." styles={styles} />}
    {leaguesData.error && <ErrorMessage error={leaguesData.error} styles={styles} />}
  </>
);

const LeaguesDisplay: React.FC<{
  leaguesData: ReturnType<typeof useSleeperLeagues>;
  rosterData: ReturnType<typeof useSleeperRoster>;
  selectedLeague: string | null;
  setSelectedLeague: (id: string) => void;
  onLeagueKeyDown: (e: React.KeyboardEvent, id: string) => void;
}> = props => (
  <>
    {props.leaguesData.leagues.length > 0 && (
      <LeaguesList
        leagues={props.leaguesData.leagues}
        selectedLeague={props.selectedLeague}
        onLeagueSelect={props.setSelectedLeague}
        onLeagueKeyDown={props.onLeagueKeyDown}
        styles={styles}
      />
    )}
    <RosterSection
      selectedLeague={props.selectedLeague}
      roster={props.rosterData.roster}
      rosterLoading={props.rosterData.loading}
      rosterError={props.rosterData.error}
      styles={styles}
    />
  </>
);

const MainContent: React.FC<MainContentData> = props => (
  <section style={styles.usernameSection}>
    <UsernameForm
      username={props.username}
      loading={props.userData.loading}
      onUsernameChange={props.onUsernameChange}
      onSubmit={props.onSubmit}
      styles={styles}
    />
    <div id="username-help" style={styles.helpText}>
      Enter your Sleeper username to view your fantasy leagues and rosters
    </div>
    <UserSection userData={props.userData} leaguesData={props.leaguesData} />
    <LeaguesDisplay
      leaguesData={props.leaguesData}
      rosterData={props.rosterData}
      selectedLeague={props.selectedLeague}
      setSelectedLeague={props.setSelectedLeague}
      onLeagueKeyDown={props.onLeagueKeyDown}
    />
  </section>
);

type LeaguesHandlers = {
  handleUsernameSubmit: (e: React.FormEvent) => void;
  handleUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLeagueKeyDown: (e: React.KeyboardEvent, leagueId: string) => void;
};

const useLeaguesHandlers = (
  username: string,
  setUsername: (value: string) => void,
  userData: ReturnType<typeof useSleeperUser>,
  setSelectedLeague: (id: string | null) => void
): LeaguesHandlers => {
  const handleUsernameSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (username.trim()) void userData.fetchUser(username.trim());
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

  return { handleUsernameSubmit, handleUsernameChange, handleLeagueKeyDown };
};

export function LeaguesWeb(): React.JSX.Element {
  const [username, setUsername] = useState('');
  const { userData, leaguesData, rosterData, selectedLeague, setSelectedLeague } = useLeaguesData();
  const { handleUsernameSubmit, handleUsernameChange, handleLeagueKeyDown } = useLeaguesHandlers(
    username,
    setUsername,
    userData,
    setSelectedLeague
  );

  return (
    <div style={styles.container}>
      <LeaguesHeader />
      <MainContent
        username={username}
        userData={userData}
        leaguesData={leaguesData}
        rosterData={rosterData}
        selectedLeague={selectedLeague}
        setSelectedLeague={setSelectedLeague}
        onUsernameChange={handleUsernameChange}
        onSubmit={handleUsernameSubmit}
        onLeagueKeyDown={handleLeagueKeyDown}
      />
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
