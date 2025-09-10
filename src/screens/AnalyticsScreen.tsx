import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function AnalyticsScreen(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'trades' | 'faab' | 'waivers'>('trades');

  const handleFeaturePress = (feature: string) => {
    Alert.alert(
      'Feature Coming Soon',
      `${feature} analysis will be available soon! The backend systems are already built and ready to integrate.`,
      [{ text: 'OK' }]
    );
  };

  const renderTradesTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Trade Analysis</Text>
      
      <TouchableOpacity 
        style={styles.featureCard}
        onPress={() => handleFeaturePress('Trade Opportunity Scanner')}
      >
        <Text style={styles.featureTitle}>Trade Opportunity Scanner</Text>
        <Text style={styles.featureDescription}>
          Automatically scan all teams in your league to find potential trade opportunities based on roster needs and player values.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.featureCard}
        onPress={() => handleFeaturePress('Trade Value Calculator')}
      >
        <Text style={styles.featureTitle}>Trade Value Calculator</Text>
        <Text style={styles.featureDescription}>
          Evaluate trade proposals with advanced metrics including positional scarcity and team context.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.featureCard}
        onPress={() => handleFeaturePress('Roster Analysis')}
      >
        <Text style={styles.featureTitle}>Roster Analysis</Text>
        <Text style={styles.featureDescription}>
          Deep dive into roster strengths, weaknesses, and improvement opportunities for every team.
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderFaabTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>FAAB Optimization</Text>
      
      <TouchableOpacity 
        style={styles.featureCard}
        onPress={() => handleFeaturePress('FAAB Optimizer')}
      >
        <Text style={styles.featureTitle}>FAAB Optimizer</Text>
        <Text style={styles.featureDescription}>
          Calculate optimal bid amounts based on player value, remaining budget, and league competition.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.featureCard}
        onPress={() => handleFeaturePress('Budget Tracker')}
      >
        <Text style={styles.featureTitle}>Budget Tracker</Text>
        <Text style={styles.featureDescription}>
          Track FAAB spending across the league and identify budget management strategies.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.featureCard}
        onPress={() => handleFeaturePress('Bidding Analyzer')}
      >
        <Text style={styles.featureTitle}>Bidding Analyzer</Text>
        <Text style={styles.featureDescription}>
          Analyze historical bidding patterns to predict optimal bid amounts for waiver targets.
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderWaiversTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Waiver Analysis</Text>
      
      <TouchableOpacity 
        style={styles.featureCard}
        onPress={() => handleFeaturePress('Waiver Suggestions')}
      >
        <Text style={styles.featureTitle}>Smart Waiver Suggestions</Text>
        <Text style={styles.featureDescription}>
          Get personalized waiver wire recommendations based on your roster needs and league trends.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.featureCard}
        onPress={() => handleFeaturePress('Priority Scorer')}
      >
        <Text style={styles.featureTitle}>Priority Scorer</Text>
        <Text style={styles.featureDescription}>
          Rank waiver targets by priority score considering your roster, league format, and matchups.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.featureCard}
        onPress={() => handleFeaturePress('Waiver Checker')}
      >
        <Text style={styles.featureTitle}>Waiver Checker</Text>
        <Text style={styles.featureDescription}>
          Monitor waiver wire activity and get notifications for high-value player drops.
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Analytics</Text>
        
        <View style={styles.tabButtons}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'trades' && styles.activeTabButton]}
            onPress={() => setActiveTab('trades')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'trades' && styles.activeTabButtonText]}>
              Trades
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'faab' && styles.activeTabButton]}
            onPress={() => setActiveTab('faab')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'faab' && styles.activeTabButtonText]}>
              FAAB
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'waivers' && styles.activeTabButton]}
            onPress={() => setActiveTab('waivers')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'waivers' && styles.activeTabButtonText]}>
              Waivers
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'trades' && renderTradesTab()}
        {activeTab === 'faab' && renderFaabTab()}
        {activeTab === 'waivers' && renderWaiversTab()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  tabButtons: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  activeTabButton: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabButtonText: {
    color: 'white',
  },
  tabContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  featureCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});