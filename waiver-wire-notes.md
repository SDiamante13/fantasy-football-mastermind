# Waiver Wire Features - Research & Implementation Notes

## Requirements Summary
- **FAAB Bid Optimizer**: Market-based recommendations with safe/aggressive modes
- **Hot Pickups**: Multi-factor scoring (opportunity + performance + matchups)
- **Team Dependency**: Factor positional needs, team health for immediate vs long-term plays
- **Half PPR scoring** for all leagues

## LLM Integration Points
- Team health assessment & strategy reasoning
- Contextual recommendations with explanations
- Smart filtering based on team needs vs upside potential

## Research Findings

### Current Codebase Structure
- ✅ Firebase + React Native + TypeScript setup
- ✅ MSW for API mocking, RTL + Jest for testing
- ✅ Outside-in TDD approach (contract tests → RTL → unit tests)
- ✅ Existing features: trades analysis, basic waiver suggestions

### Sleeper API Integration
- ✅ SleeperApiService with core endpoints (user, leagues, rosters, players)
- ✅ Contract tests for API reliability
- ✅ React hooks for data fetching (useSleeperUser, useSleeperLeagues, etc.)
- ✅ Player data cached (5MB response)

### Existing Waiver Features
- ✅ Basic injury-triggered waiver suggestion service
- ✅ Priority scoring system with handcuff bonuses
- ✅ Waiver availability checker
- 🚧 Missing: Hot pickups engine, FAAB bidding, multi-factor scoring

### Data Sources Integration Plan
**Primary Sources:**
- ✅ Sleeper API (rosters, league data, transactions) - already integrated
- 🎯 FantasyPros API v2 (expert consensus rankings, player values)
- 🎯 FantasyData (Fantasy Footballers use this - rankings, projections)
- 🎯 Alternative: Fantasy Nerds API (consensus rankings, ROS projections)

**Data Points Needed:**
- Expert consensus rankings (FantasyPros)
- Rest of season projections
- Player opportunity metrics (snap %, target share)
- Market-based FAAB values
- Player trend data (rising/falling)

## TDD Implementation Plan
✅ 1. Contract tests for external APIs (FantasyPros, HotPickups, FAAB)
✅ 2. Core domain models and types defined
✅ 3. Service layer architecture implemented

## Implementation Summary

### Files Created
- `src/waivers/types.ts` - Core type definitions
- `src/waivers/fantasy-pros-api.ts` - FantasyPros API service
- `src/waivers/hot-pickups-engine.ts` - Multi-factor scoring engine
- `src/waivers/faab-optimizer.ts` - Market-based FAAB bidding
- Contract tests for all components

### Key Features Implemented
- **Hot Pickups Engine**: Multi-factor scoring (opportunity + performance + matchup + team fit + trending)
- **Team Analysis**: Positional needs assessment (healthy vs need_rb2/wr2/flex)
- **FAAB Optimizer**: Market-based bids with safe/balanced/aggressive strategies
- **Position-Specific Logic**: Different bid strategies for RB/WR/TE tiers
- **Budget Awareness**: Adjusts bids based on remaining FAAB

### Next Steps
- [ ] Write unit tests for scoring algorithms
- [ ] Create RTL acceptance tests for user interactions
- [ ] Add MSW mocks for FantasyPros API
- [ ] Integrate with existing UI components
- [ ] Add LLM integration for contextual reasoning