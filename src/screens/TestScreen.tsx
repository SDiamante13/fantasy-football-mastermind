import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function TestScreen(): React.JSX.Element {
  console.log('🧪 TestScreen: Component is mounting');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 React Native Web Test</Text>
      <View style={styles.box}>
        <Text style={styles.boxText}>This is a colored box</Text>
      </View>
      <Text style={styles.description}>
        If you can see this content, React Native Web components are working!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center'
  },
  box: {
    width: 200,
    height: 100,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  boxText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    maxWidth: 300
  }
});
