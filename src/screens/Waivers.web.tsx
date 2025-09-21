import React, { useState } from 'react';

import { HotPickups } from '../waivers/HotPickups.web';

import { WaiversLeague } from './WaiversLeague.web';

type ViewMode = 'demo' | 'league';

export const WaiversWeb: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('demo');

  if (viewMode === 'league') {
    return <WaiversLeague />;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🔥 Waiver Wire Analysis</h1>
        <p style={styles.subtitle}>
          Discover hot pickups and get optimal FAAB bid suggestions based on your team's needs and
          league context.
        </p>

        <div style={styles.modeSelector}>
          <button
            onClick={() => setViewMode('demo')}
            style={{
              ...styles.modeButton,
              ...(viewMode === 'demo' ? styles.activeModeButton : {})
            }}
          >
            Demo Mode
          </button>
          <button
            onClick={() => setViewMode('league')}
            style={{
              ...styles.modeButton,
              // eslint-disable-next-line no-constant-condition
              ...(false ? styles.activeModeButton : {}) // This mode is inactive in demo view
            }}
          >
            My Leagues
          </button>
        </div>
      </header>

      <div style={styles.content}>
        <div style={styles.demoNotice}>
          <strong>Demo Mode:</strong> Showing example waiver wire targets with mock ownership data.
          Switch to "My Leagues" for real data from your Sleeper leagues.
        </div>
        <HotPickups />
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
  modeSelector: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginTop: '1.5rem'
  },
  modeButton: {
    padding: '0.75rem 1.5rem',
    border: '2px solid #2196F3',
    borderRadius: '25px',
    backgroundColor: 'white',
    color: '#2196F3',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  activeModeButton: {
    backgroundColor: '#2196F3',
    color: 'white'
  },
  demoNotice: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '2rem',
    border: '1px solid #ffeaa7',
    textAlign: 'center' as const
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto'
  }
};
