import { createTradeScanner } from './trade-scanner';
import { createTradeServiceMocks, commonExpectations } from '../test-utils/unit-test-helpers';


describe('Trade Scanner', () => {
  it('[TEST] provides comprehensive trade opportunity analysis for league', () => {
    const mockServices = createTradeServiceMocks();
    const scanner = createTradeScanner(mockServices);
    
    const results = scanner.scanForTrades('league_456');

    commonExpectations.toHaveLength(results.opportunities, 1);
    commonExpectations.toBe(results.opportunities[0].recommended, true);
    commonExpectations.toBe(results.opportunities[0].confidence, 'high');
    commonExpectations.toBe(results.totalOpportunities, 1);
  });
});
