import React, { useState } from 'react';
import { HomeScreenWeb } from './screens/HomeScreen.web';

type TabName = 'Home' | 'Leagues' | 'Players' | 'Analytics' | 'Test';

const tabNames: TabName[] = ['Home', 'Leagues', 'Players', 'Analytics', 'Test'];

const TabNavigation: React.FC<{
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}> = ({ activeTab, onTabChange }) => (
  <nav style={styles.tabBar}>
    {tabNames.map(tab => (
      <button
        key={tab}
        onClick={() => onTabChange(tab)}
        style={{
          ...styles.tabButton,
          ...(activeTab === tab ? styles.activeTabButton : {})
        }}
      >
        {tab}
      </button>
    ))}
  </nav>
);

const TabScreen: React.FC<{ tab: TabName }> = ({ tab }) => {
  console.log(`Rendering tab: ${tab}`);
  
  switch (tab) {
    case 'Home':
      return <HomeScreenWeb />;
    case 'Leagues':
      return (
        <div style={styles.screenContainer}>
          <h1>⚡ Leagues</h1>
          <p>Your fantasy leagues will appear here.</p>
        </div>
      );
    case 'Players':
      return (
        <div style={styles.screenContainer}>
          <h1>🏈 Players</h1>
          <p>Player analysis and data will be shown here.</p>
        </div>
      );
    case 'Analytics':
      return (
        <div style={styles.screenContainer}>
          <h1>📊 Analytics</h1>
          <p>Fantasy analytics and insights coming soon.</p>
        </div>
      );
    case 'Test':
      return (
        <div style={styles.screenContainer}>
          <h1>🧪 Test</h1>
          <div style={styles.testBox}>
            <p style={styles.testBoxText}>Pure React Test Component</p>
          </div>
          <p>If you see this styled box, pure React rendering is working!</p>
        </div>
      );
    default:
      return (
        <div style={styles.screenContainer}>
          <h1>Unknown Tab</h1>
        </div>
      );
  }
};

export const AppWeb: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabName>('Home');

  console.log('AppWeb rendering, activeTab:', activeTab);

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <h1 style={styles.appTitle}>Fantasy Football Mastermind</h1>
      </header>
      
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main style={styles.mainContent}>
        <TabScreen tab={activeTab} />
      </main>
    </div>
  );
};

const styles = {
  appContainer: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    backgroundColor: '#2196F3',
    color: 'white',
    padding: '1rem',
    textAlign: 'center' as const,
  },
  appTitle: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  tabBar: {
    display: 'flex',
    backgroundColor: 'white',
    borderBottom: '1px solid #ddd',
    padding: 0,
    margin: 0,
  },
  tabButton: {
    flex: 1,
    padding: '1rem',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '1rem',
    color: '#757575',
    transition: 'all 0.2s ease',
    borderBottom: '3px solid transparent',
  },
  activeTabButton: {
    color: '#2196F3',
    backgroundColor: '#f8f9ff',
    borderBottom: '3px solid #2196F3',
  },
  mainContent: {
    flex: 1,
    padding: '1rem',
  },
  screenContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  testBox: {
    width: '200px',
    height: '100px',
    backgroundColor: '#4CAF50',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '1rem 0',
  },
  testBoxText: {
    color: 'white',
    fontWeight: 'bold',
    margin: 0,
  },
};