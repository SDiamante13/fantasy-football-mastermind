# Fantasy Football Mastermind - Roster Mapping Investigation Report

## Issue Summary
User "gaspjr" is seeing incorrect roster data when viewing the "DJT For Prison 2024" league. The application displays players from other teams in the league instead of showing only gaspjr's actual roster.

## Investigation Results

### 1. Current App Behavior (INCORRECT)
**What user "gaspjr" sees when selecting "DJT For Prison 2024" league:**
- Brian Thomas (WR-JAX) 
- Woody Marks (RB-HOU)
- Quinshon Judkins (RB-CLE)
- Mike Evans (WR-TB)
- Dak Prescott (QB-DAL)
- Tyreek Hill (WR-MIA)
- Joe Mixon (RB-HOU)
- Jonnu Smith (TE-PIT)
- Aaron Jones (RB-MIN)
- Dallas Goedert (TE-PHI)
- David Montgomery (RB-DET)
- Amon-Ra St. Brown (WR-DET)
- Evan McPherson (K-CIN)
- Calvin Austin (WR-PIT)
- Rachaad White (RB-TB)

**Total displayed:** 15+ players from various teams

### 2. Expected Roster for gaspjr (CORRECT)
**What gaspjr should see (his actual team):**

**STARTERS:**
- J Daniels (QB-WAS) ✅ [Player ID: 11566]
- O Hampton (RB-LAC)
- D Sampson (RB-CLE) ✅ [Player ID: 12469] 
- E Egbuka (WR-TB)
- D London (WR-ATL)
- T McMillan (WR-CAR)
- T Warren (TE-IND)
- N Collins (WR-HOU)
- C Boswell (K-PIT)
- ARI (DEF-ARI) ✅ [Player ID: ARI]

**BENCH:**
- J McCarthy (QB-MIN) ✅ [Player ID: 11565]
- B Allen (RB-NYJ)
- T Benson (RB-ARI)
- A Ekeler (RB-WAS)
- E Ayomanor (WR-TEN)
- G Pickens (WR-DAL)

**Match Result:** 0/16 expected players found in UI = 100% incorrect roster display

### 3. API Network Analysis

**API Calls Made:**
1. `GET https://api.sleeper.app/v1/user/gaspjr`
   - Returns: user_id = "332421385567600640"
   
2. `GET https://api.sleeper.app/v1/user/332421385567600640/leagues/nfl/2025`
   - Returns: User's leagues including "DJT For Prison 2024"
   
3. `GET https://api.sleeper.app/v1/league/1257435123188498432/rosters`
   - **CRITICAL:** Returns ALL 12 team rosters in the league
   - gaspjr's roster is Team 6 (roster_id: 6, owner_id: 332421385567600640)
   - Contains 16 players: [11565, 11566, 11576, 11589, 12469, 12499, 12507, 12514, 12518, 12526, 1945, 4663, 7569, 8112, 8137, ARI]

4. `GET https://api.sleeper.app/v1/players/nfl`
   - Returns: Full NFL player database for name/team lookup

### 4. Root Cause Analysis

**Location:** `/Users/stevendiamante/personal/fantasy-football-mastermind/src/sleeper/sleeper-api.ts`

**Problem Code (Lines 99-128):**
```typescript
return rosters
  .flatMap(
    (roster: any) =>
      roster.players?.slice(0, 15).map((playerId: string) => {
        // ... player processing logic
      }) || []
  )
  .slice(0, 15); // Show more players
```

**Issue:** 
- The `flatMap()` operation combines players from **ALL 12 team rosters** in the league
- Instead of filtering to show only the user's roster, it shows a random mix of players from all teams
- The function doesn't accept or use any user identification to filter rosters

**Expected vs Actual Rosters:**
- **Actual roster data for gaspjr:** Team 6 with specific player IDs (11565, 11566, etc.)
- **Displayed in UI:** Random players from multiple other teams in the league

## 5. Technical Solution

### Required Changes:

**1. Update `createGetRoster()` function signature:**
```typescript
function createGetRoster() {
  return async (leagueId: string, userId: string): Promise<SleeperRosterPlayer[]> => {
```

**2. Filter to user's roster only:**
```typescript
const rosters = await rostersResponse.json();
const players: Record<string, SleeperPlayer> = await playersData.json();

// Find the user's specific roster
const userRoster = rosters.find((roster: any) => roster.owner_id === userId);
if (!userRoster || !userRoster.players) {
  return [];
}

// Process only the user's players (remove flatMap)
return userRoster.players.map((playerId: string) => {
  // ... existing player processing logic
});
```

**3. Update the API interface:**
```typescript
getRoster: (leagueId: string, userId: string) => Promise<SleeperRosterPlayer[]>;
```

**4. Update `useSleeperRoster` hook:**
```typescript
const fetchRoster = useCallback(
  async (leagueId: string, userId: string) => {
    // ... existing logic
    const rosterData = await sleeperApi.getRoster(leagueId, userId);
    // ... rest of function
  },
  [sleeperApi]
);
```

**5. Update component call in Leagues.web.tsx:**
```typescript
useEffect(() => {
  if (selectedLeague && user?.user_id) {
    void fetchRoster(selectedLeague, user.user_id);
  }
}, [selectedLeague, user?.user_id, fetchRoster]);
```

## 6. Evidence Documentation

### Screenshots:
- **Current incorrect display:** `/Users/stevendiamante/personal/fantasy-football-mastermind/roster-investigation-screenshot.png`
- **Detailed analysis:** `/Users/stevendiamante/personal/fantasy-football-mastermind/detailed-roster-analysis.png`

### Test Files:
- **Investigation test:** `/Users/stevendiamante/personal/fantasy-football-mastermind/e2e/roster-investigation.spec.js`
- **Detailed analysis:** `/Users/stevendiamante/personal/fantasy-football-mastermind/e2e/detailed-roster-analysis.spec.js`

## 7. Impact Assessment

**Severity:** High - Core functionality completely broken
**User Impact:** Users see random players from other teams instead of their own roster
**Data Integrity:** No data corruption (API returns correct data, but filtering is wrong)
**Scope:** Affects all users viewing league rosters

## 8. Recommendations

1. **Immediate Fix:** Implement the technical solution above to filter rosters by user_id
2. **Testing:** Add integration tests to verify roster filtering works correctly
3. **Validation:** Test with multiple users and leagues to ensure proper isolation
4. **Performance:** Consider caching individual roster data to reduce API calls

## Investigation Completed By
Claude Code Playwright investigation on 2025-09-13