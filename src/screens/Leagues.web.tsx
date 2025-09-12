import React, { useState } from 'react';

type LeagueFormat = 'Standard' | 'PPR' | 'Half-PPR' | 'Superflex';
type LeagueSize = '8-Team' | '10-Team' | '12-Team' | '14-Team' | '16-Team';

interface MockLeague {
  id: string;
  name: string;
  format: LeagueFormat;
  size: LeagueSize;
  status: 'Active' | 'Draft' | 'Complete';
  draftDate?: string;
  participants: number;
  maxParticipants: number;
}

const mockLeagues: MockLeague[] = [
  {
    id: '1',
    name: 'Championship Dynasty League',
    format: 'PPR',
    size: '12-Team',
    status: 'Active',
    participants: 12,
    maxParticipants: 12
  },
  {
    id: '2', 
    name: 'Friends & Family League',
    format: 'Standard',
    size: '10-Team',
    status: 'Active',
    participants: 10,
    maxParticipants: 10
  },
  {
    id: '3',
    name: 'High Stakes Superflex',
    format: 'Superflex',
    size: '12-Team', 
    status: 'Draft',
    draftDate: '2024-09-01',
    participants: 10,
    maxParticipants: 12
  }
];

const LeagueCard: React.FC<{ league: MockLeague }> = ({ league }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#28a745';
      case 'Draft': return '#ffc107';
      case 'Complete': return '#6c757d';
      default: return '#007bff';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return '🏆';
      case 'Draft': return '📝';
      case 'Complete': return '✅';
      default: return '⚽';
    }
  };

  return (
    <div style={styles.leagueCard}>
      <div style={styles.leagueHeader}>
        <h3 style={styles.leagueName}>{league.name}</h3>
        <div 
          style={{
            ...styles.statusBadge,
            backgroundColor: getStatusColor(league.status)
          }}
        >
          <span style={styles.statusIcon}>{getStatusIcon(league.status)}</span>
          {league.status}
        </div>
      </div>
      
      <div style={styles.leagueDetails}>
        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>Format:</span>
          <span style={styles.detailValue}>{league.format}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>Size:</span>
          <span style={styles.detailValue}>{league.size}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>Participants:</span>
          <span style={styles.detailValue}>{league.participants}/{league.maxParticipants}</span>
        </div>
        {league.draftDate && (
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Draft:</span>
            <span style={styles.detailValue}>{league.draftDate}</span>
          </div>
        )}
      </div>
      
      <div style={styles.leagueActions}>
        <button style={styles.primaryButton}>View League</button>
        <button style={styles.secondaryButton}>Manage</button>
      </div>
    </div>
  );
};

const CreateLeagueCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div style={{...styles.leagueCard, ...styles.createLeagueCard}} onClick={onClick}>
    <div style={styles.createLeagueContent}>
      <div style={styles.createLeagueIcon}>➕</div>
      <h3 style={styles.createLeagueTitle}>Create New League</h3>
      <p style={styles.createLeagueDescription}>
        Set up a new fantasy football league with custom settings
      </p>
    </div>
  </div>
);

const QuickStats: React.FC = () => {
  const activeLeagues = mockLeagues.filter(l => l.status === 'Active').length;
  const draftingLeagues = mockLeagues.filter(l => l.status === 'Draft').length;
  const totalParticipants = mockLeagues.reduce((sum, l) => sum + l.participants, 0);

  return (
    <div style={styles.quickStatsContainer}>
      <div style={styles.statCard}>
        <div style={styles.statIcon}>🏆</div>
        <div style={styles.statValue}>{activeLeagues}</div>
        <div style={styles.statLabel}>Active Leagues</div>
      </div>
      <div style={styles.statCard}>
        <div style={styles.statIcon}>📝</div>
        <div style={styles.statValue}>{draftingLeagues}</div>
        <div style={styles.statLabel}>Drafting</div>
      </div>
      <div style={styles.statCard}>
        <div style={styles.statIcon}>👥</div>
        <div style={styles.statValue}>{totalParticipants}</div>
        <div style={styles.statLabel}>Total Participants</div>
      </div>
    </div>
  );
};

export function LeaguesWeb(): React.JSX.Element {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateLeague = () => {
    setShowCreateModal(true);
    // TODO: Implement league creation modal
    console.log('Creating new league...');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>⚡ Your Fantasy Leagues</h1>
        <p style={styles.subtitle}>
          Manage your fantasy football leagues, track performance, and stay on top of your game
        </p>
      </header>

      <QuickStats />

      <section style={styles.leaguesSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>My Leagues</h2>
          <button 
            style={styles.primaryButton}
            onClick={handleCreateLeague}
          >
            ➕ Create League
          </button>
        </div>

        <div style={styles.leaguesGrid}>
          <CreateLeagueCard onClick={handleCreateLeague} />
          {mockLeagues.map(league => (
            <LeagueCard key={league.id} league={league} />
          ))}
        </div>
      </section>

      <section style={styles.featuresSection}>
        <h2 style={styles.sectionTitle}>League Management Features</h2>
        <div style={styles.featuresList}>
          <div style={styles.featureItem}>
            <span style={styles.featureIcon}>📊</span>
            <div>
              <h4>Advanced Analytics</h4>
              <p>Deep dive into league trends and player performance metrics</p>
            </div>
          </div>
          <div style={styles.featureItem}>
            <span style={styles.featureIcon}>🔄</span>
            <div>
              <h4>Trade Analysis</h4>
              <p>Evaluate trade proposals with advanced valuation tools</p>
            </div>
          </div>
          <div style={styles.featureItem}>
            <span style={styles.featureIcon}>💰</span>
            <div>
              <h4>FAAB Optimizer</h4>
              <p>Maximize your free agent budget with smart bidding strategies</p>
            </div>
          </div>
          <div style={styles.featureItem}>
            <span style={styles.featureIcon}>📱</span>
            <div>
              <h4>Mobile Sync</h4>
              <p>Access your leagues seamlessly across all devices</p>
            </div>
          </div>
        </div>
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
  quickStatsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    textAlign: 'center' as const
  },
  statIcon: {
    fontSize: '2rem',
    marginBottom: '0.5rem'
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: '0.25rem'
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#666',
    fontWeight: '500'
  },
  leaguesSection: {
    marginBottom: '3rem'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap' as const,
    gap: '1rem'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
    margin: 0
  },
  leaguesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem'
  },
  leagueCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer'
  },
  createLeagueCard: {
    backgroundColor: '#f8f9ff',
    border: '2px dashed #007bff',
    textAlign: 'center' as const,
    minHeight: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  createLeagueContent: {
    padding: '1rem'
  },
  createLeagueIcon: {
    fontSize: '3rem',
    color: '#007bff',
    marginBottom: '1rem'
  },
  createLeagueTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: '0.5rem',
    margin: '0 0 0.5rem 0'
  },
  createLeagueDescription: {
    fontSize: '0.875rem',
    color: '#666',
    margin: 0
  },
  leagueHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
    gap: '1rem'
  },
  leagueName: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
    flex: 1
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    whiteSpace: 'nowrap' as const
  },
  statusIcon: {
    fontSize: '0.875rem'
  },
  leagueDetails: {
    marginBottom: '1.5rem'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem'
  },
  detailLabel: {
    fontSize: '0.875rem',
    color: '#666',
    fontWeight: '500'
  },
  detailValue: {
    fontSize: '0.875rem',
    color: '#333',
    fontWeight: '600'
  },
  leagueActions: {
    display: 'flex',
    gap: '0.75rem'
  },
  primaryButton: {
    flex: 1,
    padding: '0.75rem 1rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'background-color 0.2s ease'
  },
  secondaryButton: {
    flex: 1,
    padding: '0.75rem 1rem',
    backgroundColor: 'transparent',
    color: '#007bff',
    border: '2px solid #007bff',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease'
  },
  featuresSection: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
  },
  featuresList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginTop: '1.5rem'
  },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px'
  },
  featureIcon: {
    fontSize: '1.5rem',
    minWidth: '2rem',
    marginTop: '0.25rem'
  }
};