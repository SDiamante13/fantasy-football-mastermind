import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AppTitle: React.FC = () => (
  <Text
    style={styles.title}
    accessibilityRole="header"
    accessibilityLabel="Fantasy Football Mastermind - Main application title"
  >
    Fantasy Football Mastermind
  </Text>
);

const WelcomeMessage: React.FC = () => (
  <Text
    style={styles.subtitle}
    accessibilityRole="text"
    accessibilityLabel="Welcome message: Your fantasy football command center"
  >
    Welcome to your fantasy football command center
  </Text>
);

const Features: React.FC = () => (
  <View style={styles.featuresContainer}>
    <Text style={styles.featuresTitle} accessibilityRole="header">
      Features
    </Text>
    <View style={styles.featuresList}>
      <Text style={styles.featureItem} accessibilityRole="text">
        • View and manage your fantasy leagues
      </Text>
      <Text style={styles.featureItem} accessibilityRole="text">
        • Search and analyze player statistics
      </Text>
      <Text style={styles.featureItem} accessibilityRole="text">
        • Access comprehensive analytics dashboard
      </Text>
    </View>
  </View>
);

export function HomeScreen(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <View
        style={styles.content}
        accessibilityRole="none"
        accessibilityLabel="Fantasy Football Mastermind home screen"
      >
        <AppTitle />
        <WelcomeMessage />
        <Features />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30
  },
  featuresContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center'
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center'
  },
  featuresList: {
    alignItems: 'flex-start',
    width: '100%'
  },
  featureItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    lineHeight: 20
  }
});
