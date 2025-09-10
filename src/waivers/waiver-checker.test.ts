import { createWaiverChecker } from './waiver-checker';

describe('Waiver Checker', () => {
  it('identifies players available on waivers in league', () => {
    const mockSleeperApi = {
      getLeagueRosters: (): Array<{ players: string[] }> => [
        { players: ['saquon_123', 'mahomes_456'] },
        { players: ['henry_789', 'allen_101'] }
      ]
    };

    const waiverChecker = createWaiverChecker(mockSleeperApi);
    const availablePlayers = waiverChecker.checkAvailability(
      ['breida_999', 'saquon_123', 'pollard_888'], 
      'league_123'
    );

    expect(availablePlayers).toHaveLength(2);
    expect(availablePlayers).toContain('breida_999');
    expect(availablePlayers).toContain('pollard_888');
    expect(availablePlayers).not.toContain('saquon_123');
  });
});