type TransactionData = {
  playerId: string;
  playerTier: string;
  position: string;
  winningBid: number;
  totalBids: number;
  playerValue: string;
};

type PlayerCriteria = {
  position: string;
  tier: string;
  value: string;
};

type BiddingPattern = {
  averageWinningBid: number;
  averageTotalBids: number;
  sampleSize: number;
  bidRange: { min: number; max: number };
};

function filterMatchingTransactions(
  transactions: TransactionData[],
  criteria: PlayerCriteria
): TransactionData[] {
  return transactions.filter(
    transaction =>
      transaction.position === criteria.position &&
      transaction.playerTier === criteria.tier &&
      transaction.playerValue === criteria.value
  );
}

function calculateBiddingPattern(transactions: TransactionData[]): BiddingPattern {
  if (transactions.length === 0) {
    return {
      averageWinningBid: 0,
      averageTotalBids: 0,
      sampleSize: 0,
      bidRange: { min: 0, max: 0 }
    };
  }

  const winningBids = transactions.map(t => t.winningBid);
  const totalBids = transactions.map(t => t.totalBids);

  const averageWinningBid = winningBids.reduce((sum, bid) => sum + bid, 0) / winningBids.length;
  const averageTotalBids = totalBids.reduce((sum, bids) => sum + bids, 0) / totalBids.length;

  return {
    averageWinningBid,
    averageTotalBids,
    sampleSize: transactions.length,
    bidRange: {
      min: Math.min(...winningBids),
      max: Math.max(...winningBids)
    }
  };
}

export function createBiddingAnalyzer(transactions: TransactionData[]): {
  analyzeSimilarPlayers: (criteria: PlayerCriteria) => BiddingPattern;
} {
  return {
    analyzeSimilarPlayers: (criteria: PlayerCriteria): BiddingPattern => {
      const matchingTransactions = filterMatchingTransactions(transactions, criteria);
      return calculateBiddingPattern(matchingTransactions);
    }
  };
}
