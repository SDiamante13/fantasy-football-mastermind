import React from 'react';

// Types
type User = {
  user_id: string;
  display_name: string;
};

type League = {
  league_id: string;
  name: string;
  season: string;
  status: string;
};

type RosterPlayer = {
  player_id: string;
  name: string;
  position: string;
  team: string;
  projected_points: number;
  matchup: string;
};

// Component Props
interface UsernameFormProps {
  username: string;
  loading: boolean;
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  styles: Record<string, React.CSSProperties>;
}

interface UserInfoProps {
  user: User;
  styles: Record<string, React.CSSProperties>;
}

interface LeagueCardProps {
  league: League;
  isSelected: boolean;
  onSelect: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  styles: Record<string, React.CSSProperties>;
}

interface LeaguesListProps {
  leagues: League[];
  selectedLeague: string | null;
  onLeagueSelect: (leagueId: string) => void;
  onLeagueKeyDown: (e: React.KeyboardEvent, leagueId: string) => void;
  styles: Record<string, React.CSSProperties>;
}

interface PlayerCardProps {
  player: RosterPlayer;
  styles: Record<string, React.CSSProperties>;
}

interface RosterGridProps {
  roster: RosterPlayer[];
  styles: Record<string, React.CSSProperties>;
}

// Components
const SubmitButton: React.FC<{
  loading: boolean;
  disabled: boolean;
  styles: Record<string, React.CSSProperties>;
}> = ({ loading, disabled, styles }) => {
  const buttonStyle = {
    ...styles.submitButton,
    opacity: disabled ? 0.6 : 1
  };

  return (
    <button type="submit" disabled={disabled} style={buttonStyle}>
      {loading ? 'Loading...' : 'Get Leagues'}
    </button>
  );
};

export const UsernameForm: React.FC<UsernameFormProps> = ({
  username,
  loading,
  onUsernameChange,
  onSubmit,
  styles
}) => {
  const isDisabled = loading || !username.trim();

  return (
    <form onSubmit={onSubmit} style={styles.usernameForm}>
      <div style={styles.inputGroup}>
        <input
          type="text"
          value={username}
          onChange={onUsernameChange}
          placeholder="Enter your Sleeper username"
          style={styles.usernameInput}
          disabled={loading}
          aria-label="Sleeper username"
          aria-describedby="username-help"
          aria-required="true"
        />
        <SubmitButton loading={loading} disabled={isDisabled} styles={styles} />
      </div>
    </form>
  );
};

export const UserInfo: React.FC<UserInfoProps> = ({ user, styles }) => (
  <div style={styles.userInfo}>
    <h3>Welcome, {user.display_name}!</h3>
    <p>User ID: {user.user_id}</p>
  </div>
);

const LeagueCardDetails: React.FC<{ league: League; styles: Record<string, React.CSSProperties> }> = ({ league, styles }) => (
  <>
    <h4 style={styles.leagueName}>{league.name}</h4>
    <div style={styles.leagueDetails}>
      <span style={styles.leagueDetail}>Season: {league.season}</span>
      <span style={styles.leagueDetail}>Status: {league.status}</span>
    </div>
  </>
);

export const LeagueCard: React.FC<LeagueCardProps> = ({
  league,
  isSelected,
  onSelect,
  onKeyDown,
  styles
}) => {
  const cardStyle = {
    ...styles.leagueCard,
    ...(isSelected ? styles.selectedLeagueCard : {})
  };

  return (
    <div
      style={cardStyle}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`Select ${league.name} league`}
    >
      <LeagueCardDetails league={league} styles={styles} />
      {isSelected && (
        <div style={styles.selectedIndicator} aria-live="polite">
          ✓ Selected
        </div>
      )}
    </div>
  );
};

export const LeaguesList: React.FC<LeaguesListProps> = ({
  leagues,
  selectedLeague,
  onLeagueSelect,
  onLeagueKeyDown,
  styles
}) => (
  <div style={styles.leaguesSection}>
    <h3>Your Leagues ({leagues.length})</h3>
    <div style={styles.leaguesList}>
      {leagues.map(league => (
        <LeagueCard
          key={league.league_id}
          league={league}
          isSelected={selectedLeague === league.league_id}
          onSelect={() => onLeagueSelect(league.league_id)}
          onKeyDown={e => onLeagueKeyDown(e, league.league_id)}
          styles={styles}
        />
      ))}
    </div>
  </div>
);

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, styles }) => (
  <div style={styles.playerCard}>
    <div style={styles.playerHeader}>
      <h4 style={styles.playerName}>{player.name}</h4>
      <span style={styles.playerPosition}>{player.position}</span>
    </div>
    <div style={styles.playerDetails}>
      <div style={styles.playerDetail}>
        <span style={styles.detailLabel}>Team:</span>
        <span style={styles.detailValue}>{player.team}</span>
      </div>
      <div style={styles.playerDetail}>
        <span style={styles.detailLabel}>Projected:</span>
        <span style={styles.detailValue}>{player.projected_points} pts</span>
      </div>
      <div style={styles.playerDetail}>
        <span style={styles.detailLabel}>Matchup:</span>
        <span style={styles.detailValue}>{player.matchup}</span>
      </div>
    </div>
  </div>
);

export const RosterGrid: React.FC<RosterGridProps> = ({ roster, styles }) => (
  <div style={styles.rosterGrid}>
    {roster.map(player => (
      <PlayerCard key={player.player_id} player={player} styles={styles} />
    ))}
  </div>
);

export const LoadingMessage: React.FC<{ message: string; styles: Record<string, React.CSSProperties> }> = ({ message, styles }) => (
  <div style={styles.loadingMessage}>{message}</div>
);

export const ErrorMessage: React.FC<{ error: string; styles: Record<string, React.CSSProperties> }> = ({ error, styles }) => (
  <div style={styles.errorMessage}>{error}</div>
);