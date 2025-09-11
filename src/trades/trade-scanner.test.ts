import { commonExpectations, tradeServiceMocks } from '../test-utils';
import { TradeOpportunityDetector, TradeValueCalculator, RosterAnalyzer } from './trade-scanner';

import { createTradeScanner } from './trade-scanner';


describe('Trade Scanner', () => {
  it('[TEST] provides comprehensive trade opportunity analysis for league', () => {
    const mockServices = {
      tradeOpportunityDetector: tradeServiceMocks.tradeOpportunityDetector() as TradeOpportunityDetector,
      tradeValueCalculator: tradeServiceMocks.tradeValueCalculator() as TradeValueCalculator,
      rosterAnalyzer: tradeServiceMocks.rosterAnalyzer() as RosterAnalyzer,
    };
    const scanner = createTradeScanner(mockServices);
    
    const results = scanner.scanForTrades('league_456');

    commonExpectations.toHaveLength(results.opportunities, 1);
    commonExpectations.toBe(results.opportunities[0].recommended, true);
    commonExpectations.toBe(results.opportunities[0].confidence, 'high');
    commonExpectations.toBe(results.totalOpportunities, 1);
  });
});
