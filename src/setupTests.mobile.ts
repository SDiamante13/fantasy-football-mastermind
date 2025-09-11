// Setup for mobile tests

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock('@react-navigation/bottom-tabs', () => {
  const React = require('react');
  let isFirstScreen = true;
  return {
    createBottomTabNavigator: () => ({
      Navigator: ({ children }: { children: React.ReactNode }) => children,
      Screen: ({ component: Component, name }: { component?: React.ComponentType; name?: string }) => {
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