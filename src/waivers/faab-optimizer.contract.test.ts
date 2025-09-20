import { SleeperApiService } from '../services/SleeperApiService';

import { FaabOptimizer } from './faab-optimizer';
import { FantasyProsApiService } from './fantasy-pros-api';
import { FaabBidRequest, BidRecommendation } from './types';

const createBaseBidRequest = (): FaabBidRequest => ({
  playerId: 'test_player_123',
  leagueId: 'test_league_123',
  rosterId: 1,
  remainingBudget: 150,
  strategy: 'balanced' as const,
  teamNeed: 'high' as const
});

const createBidRequestWithOverrides = (overrides: Partial<FaabBidRequest>): FaabBidRequest => ({
  ...createBaseBidRequest(),
  ...overrides
});

const assertValidBidRecommendation = (bidRecommendation: BidRecommendation, request: FaabBidRequest): void => {
  expect(bidRecommendation).toHaveProperty('suggested_bid');
  expect(bidRecommendation).toHaveProperty('bid_range');
  expect(bidRecommendation).toHaveProperty('confidence_level');
  expect(bidRecommendation).toHaveProperty('reasoning');
  expect(bidRecommendation).toHaveProperty('risk_assessment');

  expect(bidRecommendation.suggested_bid).toBeGreaterThan(0);
  expect(bidRecommendation.suggested_bid).toBeLessThanOrEqual(request.remainingBudget);
};

const assertValidBidRange = (bidRecommendation: BidRecommendation): void => {
  expect(bidRecommendation.bid_range.min).toBeLessThanOrEqual(bidRecommendation.suggested_bid);
  expect(bidRecommendation.bid_range.max).toBeGreaterThanOrEqual(bidRecommendation.suggested_bid);
};

const assertValidConfidenceLevel = (bidRecommendation: BidRecommendation): void => {
  expect(bidRecommendation.confidence_level).toBeGreaterThanOrEqual(0);
  expect(bidRecommendation.confidence_level).toBeLessThanOrEqual(100);
};

const assertValidReasoning = (bidRecommendation: BidRecommendation): void => {
  expect(typeof bidRecommendation.reasoning).toBe('string');
  expect(bidRecommendation.reasoning.length).toBeGreaterThan(10);
};

const setupOptimizer = (): FaabOptimizer => {
  const sleeperApi = new SleeperApiService();
  const fantasyProsApi = new FantasyProsApiService();
  return new FaabOptimizer({ sleeperApi, fantasyProsApi });
};

describe.skip('getOptimalBid - Basic Properties', () => {
  const optimizer = setupOptimizer();

  it('should return market-based bid recommendations with required properties', async () => {
    const bidRequest = createBaseBidRequest();
    const bidRecommendation = await optimizer.getOptimalBid(bidRequest);

    assertValidBidRecommendation(bidRecommendation, bidRequest);
  });

  it('should return bid within reasonable budget constraints', async () => {
    const bidRequest = createBaseBidRequest();
    const bidRecommendation = await optimizer.getOptimalBid(bidRequest);

    assertValidBidRange(bidRecommendation);
  });

  it('should return valid confidence level and reasoning', async () => {
    const bidRequest = createBaseBidRequest();
    const bidRecommendation = await optimizer.getOptimalBid(bidRequest);

    assertValidConfidenceLevel(bidRecommendation);
    assertValidReasoning(bidRecommendation);
  });
});

describe.skip('getOptimalBid - Strategy Variations', () => {
  const optimizer = setupOptimizer();

  it('should adjust bids based on strategy (safe vs aggressive)', async () => {
    const baseRequest = createBidRequestWithOverrides({
      remainingBudget: 100,
      teamNeed: 'medium'
    });

    const safeBid = await optimizer.getOptimalBid({ ...baseRequest, strategy: 'safe' });
    const aggressiveBid = await optimizer.getOptimalBid({ ...baseRequest, strategy: 'aggressive' });

    expect(aggressiveBid.suggested_bid).toBeGreaterThan(safeBid.suggested_bid);
    expect(safeBid.risk_assessment).toBe('low');
    expect(aggressiveBid.risk_assessment).toBe('high');
  });

  it('should factor in team need level', async () => {
    const baseRequest = createBidRequestWithOverrides({
      remainingBudget: 100,
      strategy: 'balanced'
    });

    const lowNeedBid = await optimizer.getOptimalBid({ ...baseRequest, teamNeed: 'low' });
    const highNeedBid = await optimizer.getOptimalBid({ ...baseRequest, teamNeed: 'high' });

    expect(highNeedBid.suggested_bid).toBeGreaterThan(lowNeedBid.suggested_bid);
    expect(highNeedBid.reasoning).toMatch(/need|weakness|essential/i);
    expect(lowNeedBid.reasoning).toMatch(/depth|luxury|upside/i);
  });
});

describe.skip('getOptimalBid - Budget Constraints', () => {
  const optimizer = setupOptimizer();

  it('should consider remaining budget constraints', async () => {
    const lowBudgetRequest = createBidRequestWithOverrides({
      remainingBudget: 20,
      strategy: 'balanced',
      teamNeed: 'high'
    });

    const highBudgetRequest = createBidRequestWithOverrides({
      remainingBudget: 200,
      strategy: 'balanced',
      teamNeed: 'high'
    });

    const lowBudgetBid = await optimizer.getOptimalBid(lowBudgetRequest);
    const highBudgetBid = await optimizer.getOptimalBid(highBudgetRequest);

    const lowBudgetPercent = lowBudgetBid.suggested_bid / lowBudgetRequest.remainingBudget;
    const highBudgetPercent = highBudgetBid.suggested_bid / highBudgetRequest.remainingBudget;

    expect(lowBudgetPercent).toBeLessThan(highBudgetPercent);
    expect(lowBudgetBid.reasoning).toMatch(/budget|conservative|remaining/i);
  });
});

describe.skip('getMarketValue', () => {
  const optimizer = setupOptimizer();

  it('should return market-based player valuation', async () => {
    const marketValue = await optimizer.getMarketValue('test_player_123');

    expect(marketValue).toHaveProperty('estimated_value');
    expect(marketValue).toHaveProperty('value_tier');
    expect(marketValue).toHaveProperty('position_rank');
    expect(marketValue).toHaveProperty('ros_projection');

    expect(typeof marketValue.estimated_value).toBe('number');
    expect(marketValue.estimated_value).toBeGreaterThan(0);
    expect(['high_end_rb1', 'rb1', 'rb2', 'rb3', 'handcuff', 'deep_stash']).toContain(marketValue.value_tier);
  });
});