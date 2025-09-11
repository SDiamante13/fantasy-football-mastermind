import React from 'react';

// Setup for mobile tests
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@react-navigation/bottom-tabs', () => {
  let isFirstScreen = true;
  return {
    createBottomTabNavigator: () => ({
      Navigator: ({ children }: { children: React.ReactNode }) => children,
      Screen: ({ component: Component }: { component?: React.ComponentType }) => {
        // Only render the first screen (Home) by default in tests
        if (Component && isFirstScreen) {
          isFirstScreen = false;
          return React.createElement(Component);
        }
        return null;
      },
    }),
  };
});