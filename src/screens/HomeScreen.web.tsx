import React from 'react';

export function HomeScreenWeb(): React.JSX.Element {
  console.log('HomeScreenWeb rendering');

  return (
    <div style={styles.container} role="main" aria-label="Fantasy Football Mastermind home screen">
      <div style={styles.content}>
        <h1 style={styles.title} aria-label="Fantasy Football Mastermind - Main application title">
          Fantasy Football Mastermind
        </h1>
        <p
          style={styles.subtitle}
          aria-label="Welcome message: Your fantasy football command center"
        >
          Welcome to your fantasy football command center
        </p>
        <div style={styles.featuresContainer}>
          <h2 style={styles.featuresTitle}>Features</h2>
          <div style={styles.featuresList}>
            <p style={styles.featureItem}>• View and manage your fantasy leagues</p>
            <p style={styles.featureItem}>• Search and analyze player statistics</p>
            <p style={styles.featureItem}>• Access comprehensive analytics dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100%',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    flexDirection: 'column' as const
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '1rem',
    textAlign: 'center' as const,
    margin: '0 0 1rem 0'
  },
  subtitle: {
    fontSize: '1.25rem',
    color: '#666',
    textAlign: 'center' as const,
    marginBottom: '2rem',
    margin: '0 0 2rem 0'
  },
  featuresContainer: {
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center'
  },
  featuresTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '1rem',
    textAlign: 'center' as const,
    margin: '0 0 1rem 0'
  },
  featuresList: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    width: '100%'
  },
  featureItem: {
    fontSize: '1rem',
    color: '#555',
    marginBottom: '0.5rem',
    lineHeight: '1.25',
    margin: '0 0 0.5rem 0'
  }
};
