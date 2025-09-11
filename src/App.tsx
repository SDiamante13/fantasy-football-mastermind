import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HomeScreen } from './screens/HomeScreen';
import { LeaguesScreen } from './screens/LeaguesScreen';
import { PlayersScreen } from './screens/PlayersScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';

const Tab = createBottomTabNavigator();

const createTabScreens = (): React.JSX.Element => (
  <>
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{ title: 'Home' }}
    />
    <Tab.Screen
      name="Leagues"
      component={LeaguesScreen}
      options={{ title: 'Leagues' }}
    />
    <Tab.Screen
      name="Players"
      component={PlayersScreen}
      options={{ title: 'Players' }}
    />
    <Tab.Screen
      name="Analytics"
      component={AnalyticsScreen}
      options={{ title: 'Analytics' }}
    />
  </>
);

const createTabNavigator = (): React.JSX.Element => (
  <Tab.Navigator
    screenOptions={{
      headerShown: true,
      tabBarActiveTintColor: '#2196F3',
      tabBarInactiveTintColor: '#757575',
    }}
  >
    {createTabScreens()}
  </Tab.Navigator>
);

export const App = (): React.JSX.Element => (
  <SafeAreaProvider>
    <NavigationContainer>
      {createTabNavigator()}
    </NavigationContainer>
  </SafeAreaProvider>
);