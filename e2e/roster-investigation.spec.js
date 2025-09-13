const { test, expect } = require('@playwright/test');

test.describe('Roster Investigation for gaspjr', () => {
  test('investigate roster display issue', async ({ page }) => {
    const apiCalls = [];
    const apiResponses = [];
    
    // Monitor API calls
    page.on('request', request => {
      if (request.url().includes('api.sleeper.app')) {
        apiCalls.push({
          url: request.url(),
          method: request.method()
        });
        console.log(`🟡 API Request: ${request.method()} ${request.url()}`);
      }
    });

    // Monitor API responses
    page.on('response', async response => {
      if (response.url().includes('api.sleeper.app')) {
        console.log(`🟢 API Response: ${response.status()} ${response.url()}`);
        
        if (response.url().includes('/rosters')) {
          try {
            const responseBody = await response.json();
            apiResponses.push({
              url: response.url(),
              data: responseBody
            });
            console.log(`\n=== ROSTER API RESPONSE ===`);
            console.log(`Number of rosters returned: ${responseBody.length}`);
            
            responseBody.forEach((roster, index) => {
              console.log(`\nTeam ${index + 1}:`);
              console.log(`- Roster ID: ${roster.roster_id}`);
              console.log(`- Owner ID: ${roster.owner_id}`);
              console.log(`- User ID: ${roster.user_id || 'N/A'}`);
              console.log(`- Players count: ${roster.players ? roster.players.length : 0}`);
              if (roster.players && roster.players.length > 0) {
                console.log(`- First few players: ${roster.players.slice(0, 3).join(', ')}`);
              }
            });
          } catch (error) {
            console.log('Could not parse roster response as JSON');
          }
        }

        if (response.url().includes('/user/gaspjr')) {
          try {
            const userData = await response.json();
            console.log(`\n=== USER DATA FOR GASPJR ===`);
            console.log(`User ID: ${userData.user_id}`);
            console.log(`Username: ${userData.username}`);
            console.log(`Display Name: ${userData.display_name}`);
          } catch (error) {
            console.log('Could not parse user response');
          }
        }
      }
    });

    console.log('🚀 Starting investigation...');
    
    // Navigate to the application
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click on Leagues tab
    console.log('🏈 Navigating to Leagues tab...');
    const leaguesTab = page.locator('text="Leagues"');
    await expect(leaguesTab).toBeVisible();
    await leaguesTab.click();
    await page.waitForTimeout(1000);

    // Enter username "gaspjr"
    console.log('📝 Entering username "gaspjr"...');
    const usernameInput = page.locator('input[placeholder="Enter your Sleeper username"]');
    await expect(usernameInput).toBeVisible();
    await usernameInput.fill('gaspjr');
    
    // Click "Get Leagues" button
    console.log('🔍 Clicking Get Leagues button...');
    const getLeaguesButton = page.locator('button:has-text("Get Leagues")');
    await expect(getLeaguesButton).toBeVisible();
    await getLeaguesButton.click();

    // Wait for user data and leagues to load
    await page.waitForTimeout(3000);

    // Look for "DJT For Prison 2024" league
    console.log('🏈 Looking for "DJT For Prison 2024" league...');
    const leagueCard = page.locator('text="DJT For Prison 2024"').first();
    await expect(leagueCard).toBeVisible({ timeout: 10000 });
    
    // Click on the league
    console.log('👆 Clicking on DJT For Prison 2024 league...');
    await leagueCard.click();

    // Wait for roster to load
    console.log('⏳ Waiting for roster to load...');
    await page.waitForTimeout(5000);

    // Capture the displayed roster
    console.log('\n=== CURRENT ROSTER DISPLAY ===');
    const playerCards = page.locator('[style*="playerCard"]');
    const playerCount = await playerCards.count();
    console.log(`Found ${playerCount} player cards displayed`);
    
    const displayedPlayers = [];
    for (let i = 0; i < Math.min(playerCount, 20); i++) {
      try {
        const playerCard = playerCards.nth(i);
        const playerName = await playerCard.locator('[style*="playerName"]').textContent();
        const playerPosition = await playerCard.locator('[style*="playerPosition"]').textContent();
        const playerTeam = await playerCard.locator('text=/Team:.*?([A-Z]{2,3})/', { hasText: 'Team:' }).first().textContent();
        
        const playerInfo = `${playerName} (${playerPosition}-${playerTeam?.replace('Team: ', '') || 'UNK'})`;
        displayedPlayers.push(playerInfo);
        console.log(`${i + 1}: ${playerInfo}`);
      } catch (error) {
        console.log(`${i + 1}: Error parsing player card`);
      }
    }

    // Take a screenshot
    await page.screenshot({ 
      path: '/Users/stevendiamante/personal/fantasy-football-mastermind/roster-investigation-screenshot.png',
      fullPage: true 
    });

    console.log('\n=== EXPECTED ROSTER FOR GASPJR ===');
    const expectedStarters = [
      'J Daniels (QB-WAS)',
      'O Hampton (RB-LAC)', 
      'D Sampson (RB-CLE)',
      'E Egbuka (WR-TB)',
      'D London (WR-ATL)',
      'T McMillan (WR-CAR)',
      'T Warren (TE-IND)',
      'N Collins (WR-HOU)',
      'C Boswell (K-PIT)',
      'ARI (DEF-ARI)'
    ];
    
    const expectedBench = [
      'J McCarthy (QB-MIN)',
      'B Allen (RB-NYJ)',
      'T Benson (RB-ARI)',
      'A Ekeler (RB-WAS)',
      'E Ayomanor (WR-TEN)',
      'G Pickens (WR-DAL)'
    ];

    console.log('EXPECTED STARTERS:');
    expectedStarters.forEach((player, i) => console.log(`${i + 1}: ${player}`));
    console.log('\nEXPECTED BENCH:');
    expectedBench.forEach((player, i) => console.log(`${i + 1}: ${player}`));

    console.log('\n=== ANALYSIS ===');
    
    // Check if we're seeing the expected players
    const allExpected = [...expectedStarters, ...expectedBench];
    const matchingPlayers = displayedPlayers.filter(displayed => 
      allExpected.some(expected => 
        displayed.toLowerCase().includes(expected.split(' ')[0].toLowerCase()) ||
        expected.toLowerCase().includes(displayed.split(' ')[0].toLowerCase())
      )
    );

    console.log(`Expected players found: ${matchingPlayers.length}/${allExpected.length}`);
    console.log(`Total players displayed: ${displayedPlayers.length}`);
    
    if (matchingPlayers.length < allExpected.length / 2) {
      console.log('❌ ISSUE CONFIRMED: Showing incorrect roster data!');
      console.log('The app is likely showing players from other teams instead of gaspjr\'s team.');
    } else {
      console.log('✅ Roster appears to be correct');
    }

    // Analyze API calls
    console.log('\n=== API CALLS SUMMARY ===');
    apiCalls.forEach((call, index) => {
      console.log(`${index + 1}: ${call.method} ${call.url}`);
    });

    // Check roster API response
    const rosterResponse = apiResponses.find(r => r.url.includes('/rosters'));
    if (rosterResponse && rosterResponse.data) {
      console.log('\n=== ROOT CAUSE ANALYSIS ===');
      console.log(`Total rosters returned: ${rosterResponse.data.length}`);
      console.log('The Sleeper API returns ALL team rosters in the league.');
      console.log('Our code uses .flatMap() to combine ALL rosters instead of filtering to user\'s roster.');
      console.log('This is why gaspjr sees players from other teams!');
      
      // Try to identify which roster belongs to gaspjr
      const userResponse = apiResponses.find(r => r.url.includes('/user/gaspjr'));
      if (userResponse) {
        console.log('\n=== SOLUTION ===');
        console.log('1. Get gaspjr\'s user_id from /user/gaspjr API call');
        console.log('2. Filter rosters array to find roster with matching owner_id or user_id');
        console.log('3. Only return players from that specific roster');
        console.log('4. Remove .flatMap() that combines all rosters');
      }
    }
  });
});