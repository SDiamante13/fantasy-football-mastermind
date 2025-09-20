import React from 'react';
import { HotPickups } from '../waivers/HotPickups.web';

export const WaiversWeb: React.FC = () => {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🔥 Waiver Wire Analysis</h1>
        <p style={styles.subtitle}>
          Discover hot pickups and get optimal FAAB bid suggestions based on your team's needs and league context.
        </p>
      </header>

      <div style={styles.content}>
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
  content: {
    maxWidth: '1200px',
    margin: '0 auto'
  }
};