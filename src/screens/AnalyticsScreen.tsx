import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type TabType = 'trades' | 'faab' | 'waivers';

const handleFeaturePress = (feature: string): void => {
  Alert.alert(
    'Feature Coming Soon',
    `${feature} analysis will be available soon! The backend systems are already built and ready to integrate.`,
    [{ text: 'OK' }]
  );
};

const FeatureCard = ({
  title,
  description,
  onPress
}: {
  title: string;
  description: string;
  onPress: () => void;
}): React.JSX.Element => (
  <TouchableOpacity 
    style={styles.featureCard} 
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`${title}: ${description}`}
    accessibilityHint="Tap to learn more about this feature"
  >
    <Text 
      style={styles.featureTitle}
      accessibilityRole="header"
    >
      {title}
    </Text>
    <Text 
      style={styles.featureDescription}
      accessibilityRole="text"
    >
      {description}
    </Text>
  </TouchableOpacity>
);

const TradesTab = (): React.JSX.Element => (
  <ScrollView 
    style={styles.tabContent}
    accessibilityLabel="Trade analysis features"
  >
    <Text 
      style={styles.sectionTitle}
      accessibilityRole="header"
    >
      Trade Analysis
    </Text>
    <FeatureCard
      title="Trade Opportunity Scanner"
      description="Automatically scan all teams in your league to find potential trade opportunities based on roster needs and player values."
      onPress={() => handleFeaturePress('Trade Opportunity Scanner')}
    />
    <FeatureCard
      title="Trade Value Calculator"
      description="Evaluate trade proposals with advanced metrics including positional scarcity and team context."
      onPress={() => handleFeaturePress('Trade Value Calculator')}
    />
    <FeatureCard
      title="Roster Analysis"
      description="Deep dive into roster strengths, weaknesses, and improvement opportunities for every team."
      onPress={() => handleFeaturePress('Roster Analysis')}
    />
  </ScrollView>
);

const FaabTab = (): React.JSX.Element => (
  <ScrollView 
    style={styles.tabContent}
    accessibilityLabel="FAAB optimization features"
  >
    <Text 
      style={styles.sectionTitle}
      accessibilityRole="header"
    >
      FAAB Optimization
    </Text>
    <FeatureCard
      title="FAAB Optimizer"
      description="Calculate optimal bid amounts based on player value, remaining budget, and league competition."
      onPress={() => handleFeaturePress('FAAB Optimizer')}
    />
    <FeatureCard
      title="Budget Tracker"
      description="Track FAAB spending across the league and identify budget management strategies."
      onPress={() => handleFeaturePress('Budget Tracker')}
    />
    <FeatureCard
      title="Bidding Analyzer"
      description="Analyze historical bidding patterns to predict optimal bid amounts for waiver targets."
      onPress={() => handleFeaturePress('Bidding Analyzer')}
    />
  </ScrollView>
);

const WaiversTab = (): React.JSX.Element => (
  <ScrollView 
    style={styles.tabContent}
    accessibilityLabel="Waiver analysis features"
  >
    <Text 
      style={styles.sectionTitle}
      accessibilityRole="header"
    >
      Waiver Analysis
    </Text>
    <FeatureCard
      title="Smart Waiver Suggestions"
      description="Get personalized waiver wire recommendations based on your roster needs and league trends."
      onPress={() => handleFeaturePress('Waiver Suggestions')}
    />
    <FeatureCard
      title="Priority Scorer"
      description="Rank waiver targets by priority score considering your roster, league format, and matchups."
      onPress={() => handleFeaturePress('Priority Scorer')}
    />
    <FeatureCard
      title="Waiver Checker"
      description="Monitor waiver wire activity and get notifications for high-value player drops."
      onPress={() => handleFeaturePress('Waiver Checker')}
    />
  </ScrollView>
);

const TabButton = ({
  tab,
  activeTab,
  onPress,
  title
}: {
  tab: TabType;
  activeTab: TabType;
  onPress: () => void;
  title: string;
}): React.JSX.Element => {
  const isSelected = activeTab === tab;
  
  return (
    <TouchableOpacity
      style={[styles.tabButton, isSelected && styles.activeTabButton]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title} analytics tab`}
      accessibilityState={{ selected: isSelected }}
      accessibilityHint={`Switch to ${title.toLowerCase()} analytics view`}
    >
      <Text style={[styles.tabButtonText, isSelected && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const createTabButton = (
  tab: TabType,
  title: string,
  activeTab: TabType,
  setActiveTab: (tab: TabType) => void
): React.JSX.Element => (
  <TabButton tab={tab} activeTab={activeTab} onPress={() => setActiveTab(tab)} title={title} />
);

const TabButtons = ({
  activeTab,
  setActiveTab
}: {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}): React.JSX.Element => (
  <View 
    style={styles.tabButtons}
    accessibilityLabel="Analytics categories"
  >
    {createTabButton('trades', 'Trades', activeTab, setActiveTab)}
    {createTabButton('faab', 'FAAB', activeTab, setActiveTab)}
    {createTabButton('waivers', 'Waivers', activeTab, setActiveTab)}
  </View>
);

const renderTabContent = (activeTab: TabType): React.JSX.Element => {
  switch (activeTab) {
    case 'trades':
      return <TradesTab />;
    case 'faab':
      return <FaabTab />;
    case 'waivers':
      return <WaiversTab />;
    default:
      return <TradesTab />;
  }
};

export function AnalyticsScreen(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>('trades');

  return (
    <SafeAreaView style={styles.container}>
      <View 
        style={styles.content}
        accessibilityRole="none"
        accessibilityLabel="Analytics screen content"
      >
        <Text 
          style={styles.title}
          accessibilityRole="header"
          accessibilityLabel="Analytics - Fantasy football analysis tools"
        >
          Analytics
        </Text>
        <TabButtons activeTab={activeTab} setActiveTab={setActiveTab} />
        {renderTabContent(activeTab)}
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
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20
  },
  tabButtons: {
    flexDirection: 'row',
    marginBottom: 20
  },
  tabButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginHorizontal: 2
  },
  activeTabButton: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3'
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666'
  },
  activeTabButtonText: {
    color: 'white'
  },
  tabContent: {
    flex: 1
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15
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
    elevation: 2
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  }
});
