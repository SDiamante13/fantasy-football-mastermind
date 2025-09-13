const { test, expect } = require('@playwright/test');

test.describe('Detailed Roster Analysis for gaspjr', () => {
  test('capture all player details and compare with expected roster', async ({ page }) => {
    let gaspjrUserId = null;
    let rosterData = null;
    
    // Monitor API responses to capture data
    page.on('response', async response => {
      if (response.url().includes('/user/gaspjr')) {
        try {
          const userData = await response.json();
          gaspjrUserId = userData.user_id;
          console.log(`\n=== GASPJR USER DATA ===`);
          console.log(`User ID: ${userData.user_id}`);
          console.log(`Username: ${userData.username}`);
          console.log(`Display Name: ${userData.display_name}`);
        } catch (error) {
          console.log('Could not parse user response');
        }
      }
      
      if (response.url().includes('/rosters')) {
        try {
          rosterData = await response.json();
          console.log(`\n=== ALL ROSTER DATA ===`);
          console.log(`Total teams in league: ${rosterData.length}`);
          
          // Find gaspjr's roster
          const gaspjrRoster = rosterData.find(roster => roster.owner_id === gaspjrUserId);
          if (gaspjrRoster) {
            console.log(`\n=== GASPJR'S ACTUAL ROSTER ===`);
            console.log(`Roster ID: ${gaspjrRoster.roster_id}`);
            console.log(`Owner ID: ${gaspjrRoster.owner_id}`);
            console.log(`Player count: ${gaspjrRoster.players ? gaspjrRoster.players.length : 0}`);
            console.log(`Player IDs: ${gaspjrRoster.players ? gaspjrRoster.players.join(', ') : 'None'}`);
          } else {
            console.log(`\n❌ Could not find gaspjr's roster in the data!`);
          }
        } catch (error) {
          console.log('Could not parse roster response');
        }
      }
    });

    // Navigate and trigger the flow
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Leagues
    const leaguesTab = page.locator('text="Leagues"');
    await leaguesTab.click();
    await page.waitForTimeout(1000);

    // Enter username and get leagues
    const usernameInput = page.locator('input[placeholder="Enter your Sleeper username"]');
    await usernameInput.fill('gaspjr');
    
    const getLeaguesButton = page.locator('button:has-text("Get Leagues")');
    await getLeaguesButton.click();
    await page.waitForTimeout(3000);

    // Select DJT For Prison 2024 league
    const leagueCard = page.locator('text="DJT For Prison 2024"').first();
    await leagueCard.click();
    await page.waitForTimeout(5000);

    // Capture all displayed players
    console.log('\n=== DISPLAYED PLAYERS IN UI ===');
    const playerNames = await page.locator('h4').allTextContents();
    const displayedPlayers = playerNames.filter(name => 
      name && 
      name.trim() !== '' && 
      !name.includes('League') && 
      !name.includes('Welcome') &&
      name.length > 2
    );
    
    console.log(`Total players displayed: ${displayedPlayers.length}`);
    displayedPlayers.forEach((player, index) => {
      console.log(`${index + 1}: ${player}`);
    });

    // Expected roster for gaspjr
    const expectedPlayers = [
      'J Daniels', 'O Hampton', 'D Sampson', 'E Egbuka', 'D London', 
      'T McMillan', 'T Warren', 'N Collins', 'C Boswell', 'ARI',
      'J McCarthy', 'B Allen', 'T Benson', 'A Ekeler', 'E Ayomanor', 'G Pickens'
    ];

    console.log('\n=== COMPARISON ANALYSIS ===');
    console.log('Expected Players:');
    expectedPlayers.forEach((player, i) => console.log(`${i + 1}: ${player}`));
    
    // Check matches
    const matches = [];
    const mismatches = [];
    
    expectedPlayers.forEach(expected => {
      const found = displayedPlayers.find(displayed => 
        displayed.toLowerCase().includes(expected.toLowerCase()) ||
        expected.toLowerCase().includes(displayed.toLowerCase())
      );
      
      if (found) {
        matches.push({ expected, found });
      } else {
        mismatches.push(expected);
      }
    });

    console.log(`\n=== MATCH RESULTS ===`);
    console.log(`✅ Matches found: ${matches.length}/${expectedPlayers.length}`);
    matches.forEach(match => {
      console.log(`  ✅ Expected "${match.expected}" → Found "${match.found}"`);
    });
    
    console.log(`\n❌ Missing players: ${mismatches.length}`);
    mismatches.forEach(missing => {
      console.log(`  ❌ Missing: "${missing}"`);
    });

    // Analyze the problem
    console.log('\n=== ROOT CAUSE ANALYSIS ===');
    if (matches.length < expectedPlayers.length / 2) {
      console.log('🔴 CONFIRMED ISSUE: App is showing players from OTHER teams, not gaspjr\'s team!');
      console.log('');
      console.log('The problem is in src/sleeper/sleeper-api.ts in the createGetRoster() function:');
      console.log('- Line 99-128: Uses .flatMap() to combine ALL team rosters');
      console.log('- Should filter to only return the roster for the specified user');
      console.log('- Need to match roster.owner_id with the user\'s user_id');
    } else {
      console.log('🟢 Roster appears correct');
    }

    console.log('\n=== TECHNICAL SOLUTION ===');
    console.log('1. Modify createGetRoster() to accept userId parameter');
    console.log('2. Filter rosters array: rosters.find(roster => roster.owner_id === userId)');
    console.log('3. Only process players from that specific roster');
    console.log('4. Remove .flatMap() that combines all team rosters');
    console.log('5. Update the hook to pass the user_id to getRoster()');

    // Take final screenshot
    await page.screenshot({ 
      path: '/Users/stevendiamante/personal/fantasy-football-mastermind/detailed-roster-analysis.png',
      fullPage: true 
    });
  });
});