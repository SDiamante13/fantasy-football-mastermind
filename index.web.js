import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppWeb } from './src/App.web';

console.log('Script loaded, finding container...');
const container = document.getElementById('app-root');
if (!container) {
  console.error('Root container not found');
  throw new Error('Root container not found');
}

console.log('Container found, creating root...');
const root = createRoot(container);
console.log('Rendering AppWeb...');
root.render(<AppWeb />);
console.log('AppWeb rendered!');