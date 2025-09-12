import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppWeb } from './App.web';

describe('AppWeb', () => {
  it('renders without crashing', () => {
    render(<AppWeb />);
    expect(screen.getAllByText('Fantasy Football Mastermind')).toHaveLength(2);
  });

  it('displays the home screen by default', () => {
    render(<AppWeb />);
    expect(screen.getByText('Welcome to your fantasy football command center')).toBeInTheDocument();
  });

  it('switches tabs when clicked', () => {
    render(<AppWeb />);
    
    // Click on Test tab
    fireEvent.click(screen.getByText('Test'));
    expect(screen.getByText('Pure React Test Component')).toBeInTheDocument();
    
    // Click back to Home tab
    fireEvent.click(screen.getByText('Home'));
    expect(screen.getByText('Welcome to your fantasy football command center')).toBeInTheDocument();
  });

  it('renders all tab buttons', () => {
    render(<AppWeb />);
    
    expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Leagues' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Players' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analytics' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Test' })).toBeInTheDocument();
  });
});