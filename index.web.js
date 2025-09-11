import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppRegistry } from 'react-native';
import { App } from './src/App';

// Register the main component
AppRegistry.registerComponent('fantasy-football-mastermind', () => App);

// Get the app container
const container = document.getElementById('app-root');
const root = createRoot(container);

// Render the app
const AppComponent = () => <App />;
root.render(<AppComponent />);