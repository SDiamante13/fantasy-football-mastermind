import React, { useState } from 'react';

import { HomeScreenWeb } from './screens/HomeScreen.web';
import { PlayersWeb } from './screens/Players.web';
import { AnalyticsWeb } from './screens/Analytics.web';
import { LeaguesWeb } from './screens/Leagues.web';
import { WaiversWeb } from './screens/Waivers.web';

type TabName = 'Home' | 'Leagues' | 'Players' | 'Waivers' | 'Analytics';

const tabNames: TabName[] = ['Home', 'Leagues', 'Players', 'Waivers', 'Analytics'];

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

const tabComponents: Record<TabName, React.ComponentType> = {
  Home: HomeScreenWeb,
  Leagues: LeaguesWeb,
  Players: PlayersWeb,
  Waivers: WaiversWeb,
  Analytics: AnalyticsWeb,
};

const getTabScreen = (tab: TabName): React.JSX.Element => {
  const Component = tabComponents[tab];
  return Component ? <Component /> : (
    <div style={styles.screenContainer}>
      <h1>Unknown Tab</h1>
    </div>
  );
};

const TabScreen: React.FC<{ tab: TabName }> = ({ tab }) => {
  console.log(`Rendering tab: ${tab}`);
  return getTabScreen(tab);
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