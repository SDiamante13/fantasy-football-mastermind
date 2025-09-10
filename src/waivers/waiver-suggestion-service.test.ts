import { createWaiverSuggestionService } from './waiver-suggestion-service';

type MockServices = {
  injuryDetector: {
    checkForInjuries: () => Array<{ playerId: string; injuryStatus: string; severity: string }>;
  };
  backupFinder: {
    findBackups: () => Array<{ playerId: string; position: string; team: string; name: string }>;
  };
  waiverChecker: {
    checkAvailability: () => string[];
  };
  priorityScorer: {
    calculateScore: () => {
      total: number;
      breakdown: {
        handcuff_bonus: number;
        opportunity_score: number;
        injury_severity_bonus: number;
      };
    };
  };
};

const createMockServices = (): MockServices => ({
  injuryDetector: {
    checkForInjuries: () => [{ playerId: 'saquon_123', injuryStatus: 'Out', severity: 'high' }]
  },
  backupFinder: {
    findBackups: () => [
      { playerId: 'breida_999', position: 'RB', team: 'NYG', name: 'Matt Breida' },
      { playerId: 'mostert_888', position: 'RB', team: 'MIA', name: 'Raheem Mostert' }
    ]
  },
  waiverChecker: {
    checkAvailability: () => ['breida_999']
  },
  priorityScorer: {
    calculateScore: () => ({
      total: 77,
      breakdown: { handcuff_bonus: 40, opportunity_score: 27, injury_severity_bonus: 10 }
    })
  }
});

describe('Waiver Suggestion Service', () => {
  it('suggests available backup players when starter gets injured', () => {
    const service = createWaiverSuggestionService(createMockServices());
    const suggestions = service.getSuggestions(['saquon_123'], 'league_123');

    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].playerId).toBe('breida_999');
    expect(suggestions[0].playerName).toBe('Matt Breida');
    expect(suggestions[0].priorityScore).toBe(77);
    expect(suggestions[0].reason).toContain('Out');
  });
});
