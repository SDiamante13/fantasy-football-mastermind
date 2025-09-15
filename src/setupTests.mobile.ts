import React from 'react';

// Setup for mobile tests
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }): React.ReactNode => children,
}));

jest.mock('@react-navigation/bottom-tabs', () => {
  let isFirstScreen = true;
  return {
    createBottomTabNavigator: (): {
      Navigator: ({ children }: { children: React.ReactNode }) => React.ReactNode;
      Screen: ({ component }: { component?: React.ComponentType }) => React.ReactElement | null;
    } => ({
      Navigator: ({ children }: { children: React.ReactNode }): React.ReactNode => children,
      Screen: ({ component }: { component?: React.ComponentType }): React.ReactElement | null => {
        // Only render the first screen (Home) by default in tests
        if (component && isFirstScreen) {
          isFirstScreen = false;
          return React.createElement(component);
        }
        return null;
      },
    }),
  };
});