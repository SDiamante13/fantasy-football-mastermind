import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const SleeperApiService = {
  async getAllPlayers() {
    console.log('🔄 Fetching players from Sleeper API...');
    const response = await fetch('https://api.sleeper.app/v1/players/nfl');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('✅ Players fetched successfully:', Object.keys(data).length);
    return data;
  }
};

const HelloWorld = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const playersData = await SleeperApiService.getAllPlayers();
        const playersList = Object.values(playersData)
          .filter(player => player.full_name && player.position)
          .slice(0, 10);
        console.log('✅ First 10 players:', playersList);
        setPlayers(playersList);
      } catch (err) {
        console.error('🚨 Error fetching players:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  console.log('HelloWorld component rendering, players count:', players.length);

  if (loading) {
    return React.createElement('div', {
      style: {
        padding: '50px',
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        backgroundColor: '#f0f0f0',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, 'Loading players... 🔄');
  }

  if (error) {
    return React.createElement('div', {
      style: {
        padding: '50px',
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        backgroundColor: '#ffe0e0',
        color: '#d00',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, `Error: ${error} ❌`);
  }

  return React.createElement('div', {
    style: {
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }
  }, [
    React.createElement('h1', {
      key: 'title',
      style: {
        textAlign: 'center',
        color: '#333',
        marginBottom: '30px'
      }
    }, `NFL Players (${players.length}) 🏈`),
    ...players.map((player, index) => 
      React.createElement('div', {
        key: player.player_id || index,
        style: {
          backgroundColor: 'white',
          padding: '15px',
          margin: '10px 0',
          borderRadius: '8px',
          border: '1px solid #ddd',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }
      }, [
        React.createElement('h3', {
          key: 'name',
          style: { margin: '0 0 5px 0', color: '#333' }
        }, player.full_name),
        React.createElement('p', {
          key: 'details',
          style: { margin: '0', color: '#666' }
        }, `${player.position} - ${player.team || 'Free Agent'}`)
      ])
    )
  ]);
};

console.log('Script loaded, finding container...');
const container = document.getElementById('app-root');
if (!container) {
  console.error('Root container not found');
  throw new Error('Root container not found');
}

console.log('Container found, creating root...');
const root = createRoot(container);
console.log('Rendering HelloWorld...');
root.render(React.createElement(HelloWorld));
console.log('HelloWorld rendered!');