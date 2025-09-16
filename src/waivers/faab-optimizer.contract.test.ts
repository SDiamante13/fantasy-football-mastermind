import { SleeperApiService } from '../services/SleeperApiService';

import { FaabOptimizer } from './faab-optimizer';
import { FantasyProsApiService } from './fantasy-pros-api';

describe('FAAB Optimizer Contract Tests', () => {
  const sleeperApi = new SleeperApiService();
  const fantasyProsApi = new FantasyProsApiService();
  const optimizer = new FaabOptimizer({ sleeperApi, fantasyProsApi });

  describe('getOptimalBid', () => {
    it('should return market-based bid recommendations with safe/aggressive modes', async () => {
      const bidRequest = {
        playerId: 'test_player_123',
        leagueId: 'test_league_123',
        rosterId: 1,
        remainingBudget: 150,
        strategy: 'balanced' as const, // 'safe' | 'balanced' | 'aggressive'
        teamNeed: 'high' as const // 'low' | 'medium' | 'high'
      };

      const bidRecommendation = await optimizer.getOptimalBid(bidRequest);

      expect(bidRecommendation).toHaveProperty('suggested_bid');
      expect(bidRecommendation).toHaveProperty('bid_range');
      expect(bidRecommendation).toHaveProperty('confidence_level');
      expect(bidRecommendation).toHaveProperty('reasoning');
      expect(bidRecommendation).toHaveProperty('risk_assessment');

      // Bid should be reasonable percentage of budget
      expect(bidRecommendation.suggested_bid).toBeGreaterThan(0);
      expect(bidRecommendation.suggested_bid).toBeLessThanOrEqual(bidRequest.remainingBudget);

      // Bid range should span reasonable values
      expect(bidRecommendation.bid_range.min).toBeLessThanOrEqual(bidRecommendation.suggested_bid);
      expect(bidRecommendation.bid_range.max).toBeGreaterThanOrEqual(bidRecommendation.suggested_bid);

      // Confidence should be 0-100
      expect(bidRecommendation.confidence_level).toBeGreaterThanOrEqual(0);
      expect(bidRecommendation.confidence_level).toBeLessThanOrEqual(100);

      // Should have reasoning
      expect(typeof bidRecommendation.reasoning).toBe('string');
      expect(bidRecommendation.reasoning.length).toBeGreaterThan(10);
    });

    it('should adjust bids based on strategy (safe vs aggressive)', async () => {
      const baseRequest = {
        playerId: 'test_player_123',
        leagueId: 'test_league_123',
        rosterId: 1,
        remainingBudget: 100,
        teamNeed: 'medium' as const
      };

      const safeBid = await optimizer.getOptimalBid({
        ...baseRequest,
        strategy: 'safe'
      });

      const aggressiveBid = await optimizer.getOptimalBid({
        ...baseRequest,
        strategy: 'aggressive'
      });

      // Aggressive should bid higher than safe
      expect(aggressiveBid.suggested_bid).toBeGreaterThan(safeBid.suggested_bid);
      expect(safeBid.risk_assessment).toBe('low');
      expect(aggressiveBid.risk_assessment).toBe('high');
    });

    it('should factor in team need level', async () => {
      const baseRequest = {
        playerId: 'test_player_123',
        leagueId: 'test_league_123',
        rosterId: 1,
        remainingBudget: 100,
        strategy: 'balanced' as const
      };

      const lowNeedBid = await optimizer.getOptimalBid({
        ...baseRequest,
        teamNeed: 'low'
      });

      const highNeedBid = await optimizer.getOptimalBid({
        ...baseRequest,
        teamNeed: 'high'
      });

      // High need should bid more than low need
      expect(highNeedBid.suggested_bid).toBeGreaterThan(lowNeedBid.suggested_bid);
      expect(highNeedBid.reasoning).toMatch(/need|weakness|essential/i);
      expect(lowNeedBid.reasoning).toMatch(/depth|luxury|upside/i);
    });

    it('should consider remaining budget constraints', async () => {
      const lowBudgetRequest = {
        playerId: 'test_player_123',
        leagueId: 'test_league_123',
        rosterId: 1,
        remainingBudget: 20,
        strategy: 'balanced' as const,
        teamNeed: 'high' as const
      };

      const highBudgetRequest = {
        ...lowBudgetRequest,
        remainingBudget: 200
      };

      const lowBudgetBid = await optimizer.getOptimalBid(lowBudgetRequest);
      const highBudgetBid = await optimizer.getOptimalBid(highBudgetRequest);

      // Low budget should be more conservative as percentage
      const lowBudgetPercent = lowBudgetBid.suggested_bid / lowBudgetRequest.remainingBudget;
      const highBudgetPercent = highBudgetBid.suggested_bid / highBudgetRequest.remainingBudget;

      expect(lowBudgetPercent).toBeLessThan(highBudgetPercent);
      expect(lowBudgetBid.reasoning).toMatch(/budget|conservative|remaining/i);
    });
  });

  describe('getMarketValue', () => {
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
});