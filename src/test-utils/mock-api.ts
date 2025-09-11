import { User, League, Player } from '../sleeper/types';

export const mockSleeperApi = {
  useAllPlayers: (): { players: Record<string, Player>; loading: boolean; error: null } => ({
    players: { 
      'test-player-1': { 
        player_id: 'test-player-1', 
        full_name: 'Test Player', 
        position: 'QB', 
        team: 'TEST', 
        active: true,
        first_name: 'Test',
        last_name: 'Player',
      }
    },
    loading: false,
    error: null
  }),
  useSleeperUser: (submittedUsername: string): { user: User | null; loading: boolean; error: null } => ({ 
    user: submittedUsername ? { user_id: 'test-user-id', username: submittedUsername, display_name: submittedUsername, avatar: '' } : null, 
    loading: false, 
    error: null 
  }),
  useUserLeagues: (): { leagues: League[]; loading: boolean; error: null } => ({ leagues: [], loading: false, error: null })
};