import { createBiddingAnalyzer } from './bidding-analyzer';

type MockTransaction = {
  playerId: string;
  playerTier: string;
  position: string;
  winningBid: number;
  totalBids: number;
  playerValue: string;
};

type MockCriteria = {
  position: string;
  tier: string;
  value: string;
};

const createMockTransactionData = (): MockTransaction[] => [
  {
    playerId: 'rb_similar_1',
    playerTier: 'handcuff',
    position: 'RB',
    winningBid: 25,
    totalBids: 4,
    playerValue: 'medium'
  },
  {
    playerId: 'rb_similar_2', 
    playerTier: 'handcuff',
    position: 'RB',
    winningBid: 18,
    totalBids: 3,
    playerValue: 'medium'
  }
];

const createPlayerCriteria = (): MockCriteria => ({
  position: 'RB',
  tier: 'handcuff',
  value: 'medium'
});

describe('Bidding Analyzer', () => {
  it('analyzes successful bid amounts for similar players', () => {
    const analyzer = createBiddingAnalyzer(createMockTransactionData());
    const patterns = analyzer.analyzeSimilarPlayers(createPlayerCriteria());

    expect(patterns.averageWinningBid).toBe(21.5);
    expect(patterns.averageTotalBids).toBe(3.5);
    expect(patterns.sampleSize).toBe(2);
    expect(patterns.bidRange).toEqual({ min: 18, max: 25 });
  });
});