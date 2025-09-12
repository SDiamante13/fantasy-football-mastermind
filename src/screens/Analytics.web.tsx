import React, { useState } from 'react';

import { useAllPlayers } from '../hooks/useSleeperApi';

type AnalyticsTab = 'Overview' | 'Players' | 'Trends' | 'FAAB';

const analyticsTabNames: AnalyticsTab[] = ['Overview', 'Players', 'Trends', 'FAAB'];

const AnalyticsTabNavigation: React.FC<{
  activeTab: AnalyticsTab;
  onTabChange: (tab: AnalyticsTab) => void;
}> = ({ activeTab, onTabChange }) => (
  <div style={styles.analyticsTabBar}>
    {analyticsTabNames.map(tab => (
      <button
        key={tab}
        onClick={() => onTabChange(tab)}
        style={{
          ...styles.analyticsTabButton,
          ...(activeTab === tab ? styles.activeAnalyticsTabButton : {})
        }}
      >
        {tab}
      </button>
    ))}
  </div>
);

const OverviewCard: React.FC<{ title: string; value: string; description: string; icon: string }> = ({ 
  title, value, description, icon 
}) => (
  <div style={styles.overviewCard}>
    <div style={styles.overviewCardIcon}>{icon}</div>
    <h3 style={styles.overviewCardTitle}>{title}</h3>
    <div style={styles.overviewCardValue}>{value}</div>
    <p style={styles.overviewCardDescription}>{description}</p>
  </div>
);

const OverviewTab: React.FC = () => {
  const { players, loading } = useAllPlayers();
  
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}>🔄</div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  const playerCount = Object.keys(players || {}).length;
  const qbCount = Object.values(players || {}).filter(p => p.position === 'QB').length;
  const rbCount = Object.values(players || {}).filter(p => p.position === 'RB').length;
  const wrCount = Object.values(players || {}).filter(p => p.position === 'WR').length;

  return (
    <div style={styles.overviewContainer}>
      <div style={styles.overviewGrid}>
        <OverviewCard
          title="Total Players"
          value={playerCount.toLocaleString()}
          description="Active NFL players in database"
          icon="🏈"
        />
        <OverviewCard
          title="Quarterbacks"
          value={qbCount.toString()}
          description="Starting and backup QBs"
          icon="🎯"
        />
        <OverviewCard
          title="Running Backs"
          value={rbCount.toString()}
          description="Featured backs and handcuffs"
          icon="💨"
        />
        <OverviewCard
          title="Wide Receivers"
          value={wrCount.toString()}
          description="WR1s, WR2s, and sleepers"
          icon="🎪"
        />
      </div>
      
      <div style={styles.insightsSection}>
        <h2 style={styles.insightsTitle}>🔍 Fantasy Insights</h2>
        <div style={styles.insightsList}>
          <div style={styles.insightItem}>
            <span style={styles.insightIcon}>📈</span>
            <div>
              <h4>Player Trends</h4>
              <p>Track rising and falling player values across the season</p>
            </div>
          </div>
          <div style={styles.insightItem}>
            <span style={styles.insightIcon}>💰</span>
            <div>
              <h4>FAAB Analysis</h4>
              <p>Optimize your free agent acquisition budget spending</p>
            </div>
          </div>
          <div style={styles.insightItem}>
            <span style={styles.insightIcon}>🔄</span>
            <div>
              <h4>Trade Opportunities</h4>
              <p>Identify undervalued players for potential trades</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlayersTab: React.FC = () => (
  <div style={styles.tabContent}>
    <h2>📊 Player Analytics</h2>
    <p>Advanced player statistics and performance metrics coming soon.</p>
    <div style={styles.featureList}>
      <div style={styles.featureItem}>✨ Weekly performance trends</div>
      <div style={styles.featureItem}>📈 Target share analysis</div>
      <div style={styles.featureItem}>🏆 Playoff schedule strength</div>
      <div style={styles.featureItem}>🔥 Breakout candidate identification</div>
    </div>
  </div>
);

const TrendsTab: React.FC = () => (
  <div style={styles.tabContent}>
    <h2>📈 Market Trends</h2>
    <p>Track player value movements and fantasy market trends.</p>
    <div style={styles.featureList}>
      <div style={styles.featureItem}>📊 Trade value fluctuations</div>
      <div style={styles.featureItem}>🔍 Waiver wire activity</div>
      <div style={styles.featureItem}>💡 Sleeper alerts</div>
      <div style={styles.featureItem}>⚠️ Bust warnings</div>
    </div>
  </div>
);

const FaabTab: React.FC = () => (
  <div style={styles.tabContent}>
    <h2>💰 FAAB Strategy</h2>
    <p>Free Agent Acquisition Budget analysis and recommendations.</p>
    <div style={styles.featureList}>
      <div style={styles.featureItem}>💵 Optimal bid amounts</div>
      <div style={styles.featureItem}>📅 Timing strategies</div>
      <div style={styles.featureItem}>🎯 Priority rankings</div>
      <div style={styles.featureItem}>📊 League spending patterns</div>
    </div>
  </div>
);

const AnalyticsTabContent: React.FC<{ tab: AnalyticsTab }> = ({ tab }) => {
  switch (tab) {
    case 'Overview':
      return <OverviewTab />;
    case 'Players':
      return <PlayersTab />;
    case 'Trends':
      return <TrendsTab />;
    case 'FAAB':
      return <FaabTab />;
    default:
      return <OverviewTab />;
  }
};

export function AnalyticsWeb(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('Overview');

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>📊 Fantasy Analytics</h1>
        <p style={styles.subtitle}>
          Advanced insights and data-driven recommendations for your fantasy football decisions
        </p>
      </header>

      <AnalyticsTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main style={styles.mainContent}>
        <AnalyticsTabContent tab={activeTab} />
      </main>
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
  analyticsTabBar: {
    display: 'flex',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '0.5rem',
    marginBottom: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
    gap: '0.5rem'
  },
  analyticsTabButton: {
    flex: '1 0 auto',
    minWidth: '120px',
    padding: '0.75rem 1rem',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#666',
    transition: 'all 0.2s ease'
  },
  activeAnalyticsTabButton: {
    backgroundColor: '#007bff',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,123,255,0.3)'
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  overviewContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem'
  },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem'
  },
  overviewCard: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    textAlign: 'center' as const,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer'
  },
  overviewCardIcon: {
    fontSize: '2.5rem',
    marginBottom: '1rem'
  },
  overviewCardTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#666',
    marginBottom: '0.5rem',
    margin: '0 0 0.5rem 0'
  },
  overviewCardValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: '0.5rem'
  },
  overviewCardDescription: {
    fontSize: '0.875rem',
    color: '#888',
    margin: 0
  },
  insightsSection: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
  },
  insightsTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '1.5rem',
    margin: '0 0 1.5rem 0'
  },
  insightsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  },
  insightItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f8f9ff',
    borderRadius: '12px',
    border: '1px solid #e0e7ff'
  },
  insightIcon: {
    fontSize: '1.5rem',
    minWidth: '2rem'
  },
  tabContent: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
  },
  featureList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginTop: '2rem'
  },
  featureItem: {
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
    textAlign: 'center' as const
  },
  loadingSpinner: {
    fontSize: '3rem',
    marginBottom: '1rem',
    animation: 'spin 2s linear infinite'
  }
};