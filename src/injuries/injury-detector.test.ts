import { createInjuryDetector } from './injury-detector';

describe('Injury Detector', () => {
  it('detects when a player is ruled out for current week', () => {
    const mockPlayerData = {
      getPlayerStatus: (): { status: string; injury_status: string } => ({
        status: 'Active',
        injury_status: 'Out'
      })
    };

    const injuryDetector = createInjuryDetector(mockPlayerData);
    const injuries = injuryDetector.checkForInjuries(['player123']);

    expect(injuries).toHaveLength(1);
    expect(injuries[0].playerId).toBe('player123');
    expect(injuries[0].injuryStatus).toBe('Out');
    expect(injuries[0].severity).toBe('high');
  });
});
