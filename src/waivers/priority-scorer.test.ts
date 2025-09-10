import { createPriorityScorer } from './priority-scorer';

type MockPlayerData = {
  getPlayerInfo: () => { team: string; position: string; name: string };
  getTargetShare: () => number;
  getOpportunityMetrics: () => { touches_per_game: number; red_zone_looks: number };
};

type MockScoreRequest = {
  playerId: string;
  injuredStarter: {
    playerId: string;
    team: string;
    position: string;
    injurySeverity: string;
  };
};

const createMockPlayerData = (): MockPlayerData => ({
  getPlayerInfo: (): { team: string; position: string; name: string } => ({
    team: 'NYG',
    position: 'RB',
    name: 'Matt Breida'
  }),
  getTargetShare: (): number => 15,
  getOpportunityMetrics: (): { touches_per_game: number; red_zone_looks: number } => ({
    touches_per_game: 8,
    red_zone_looks: 2
  })
});

const createScoreRequest = (): MockScoreRequest => ({
  playerId: 'breida_999',
  injuredStarter: {
    playerId: 'saquon_123',
    team: 'NYG',
    position: 'RB',
    injurySeverity: 'high'
  }
});

describe('Priority Scorer', () => {
  it('assigns high priority to direct handcuffs on same team', () => {
    const scorer = createPriorityScorer(createMockPlayerData());
    const score = scorer.calculateScore(createScoreRequest());

    expect(score.total).toBeGreaterThan(70);
    expect(score.breakdown.handcuff_bonus).toBeGreaterThan(0);
    expect(score.breakdown.opportunity_score).toBeGreaterThan(0);
  });
});
