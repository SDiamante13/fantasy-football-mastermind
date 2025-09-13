const { test, expect } = require('@playwright/test');

test.describe('Roster Player Names Deep Investigation', () => {
  let networkRequests = [];
  let networkResponses = [];

  test.beforeEach(async ({ page }) => {
    // Capture detailed network information
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        timestamp: new Date().toISOString()
      });
    });

    page.on('response', async response => {
      try {
        const request = networkRequests.find(req => req.url === response.url());
        const responseData = {
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          headers: response.headers(),
          timestamp: new Date().toISOString()
        };

        // Try to get response body for API calls
        if (response.url().includes('api.sleeper.app')) {
          try {
            const body = await response.text();
            responseData.body = body;
            console.log(`🌐 API Response: ${response.url()} - ${response.status()}`);
            console.log(`📄 Response body length: ${body.length} characters`);
            if (response.url().includes('players')) {
              console.log(`👥 Players API response preview: ${body.substring(0, 200)}...`);
            }
          } catch (error) {
            console.log(`❌ Could not read response body for ${response.url()}: ${error.message}`);
          }
        }

        networkResponses.push(responseData);
        if (request) {
          request.status = response.status();
          request.statusText = response.statusText();
        }
      } catch (error) {
        console.log(`❌ Error processing response: ${error.message}`);
      }
    });

    // Clear arrays
    networkRequests.length = 0;
    networkResponses.length = 0;
  });

  test('investigate roster player names in detail', async ({ page }) => {
    console.log('🔍 Starting detailed roster player names investigation...');
    
    // Navigate to the application
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    
    // Go to Leagues tab
    await page.locator('button:has-text("Leagues")').click();
    await page.waitForTimeout(2000);
    
    // Enter username
    await page.locator('input[placeholder*="Sleeper username"]').fill('gaspjr');
    
    // Click Get Leagues
    await page.locator('button:has-text("Get Leagues")').click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot after leagues load
    await page.screenshot({ 
      path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-screenshots/roster-01-leagues-loaded.png',
      fullPage: true 
    });
    
    // Find and click on the first league
    const leagueCards = page.locator('[class*="league"], div:has-text("DJT For Prison"), div:has-text("Compass Disciples")');
    console.log(`🏈 Looking for league cards...`);
    
    const leagueCount = await leagueCards.count();
    console.log(`🏈 Found ${leagueCount} league cards`);
    
    if (leagueCount > 0) {
      console.log('👆 Clicking on first league...');
      await leagueCards.first().click();
      
      // Wait longer for roster data to load
      console.log('⏳ Waiting for roster data to load...');
      await page.waitForTimeout(5000);
      await page.waitForLoadState('networkidle');
      
      // Take screenshot after league click
      await page.screenshot({ 
        path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-screenshots/roster-02-league-clicked.png',
        fullPage: true 
      });
      
      // Now look specifically for player information
      console.log('👥 Looking for player information...');
      
      // Get all text content to analyze
      const bodyContent = await page.locator('body').textContent();
      console.log(`📄 Page content length: ${bodyContent?.length} characters`);
      
      // Look for player patterns
      const playerNumberPatterns = bodyContent?.match(/Player \d+/g) || [];
      console.log(`🏷️ Found ${playerNumberPatterns.length} "Player [number]" patterns:`);
      playerNumberPatterns.forEach((pattern, index) => {
        console.log(`  ${index + 1}. ${pattern}`);
      });
      
      // Look for actual player names (common NFL names)
      const commonNames = ['Josh', 'Patrick', 'Aaron', 'Tom', 'Lamar', 'Dak', 'Russell', 'Kyler', 'Joe', 'Justin'];
      const foundNames = [];
      commonNames.forEach(name => {
        if (bodyContent?.includes(name)) {
          foundNames.push(name);
        }
      });
      console.log(`🏈 Found potential real player names: ${foundNames.join(', ')}`);
      
      // Look for roster-related elements
      const rosterElements = page.locator('[class*="roster"], [class*="player"], [data-testid*="roster"], [data-testid*="player"]');
      const rosterCount = await rosterElements.count();
      console.log(`👥 Found ${rosterCount} roster-related elements`);
      
      // Try to find specific player elements
      const playerElements = page.locator('div:has-text("Player"), span:has-text("Player"), li:has-text("Player")');
      const playerElementCount = await playerElements.count();
      console.log(`👤 Found ${playerElementCount} player elements`);
      
      // Get text from first few player elements
      for (let i = 0; i < Math.min(10, playerElementCount); i++) {
        try {
          const playerText = await playerElements.nth(i).textContent();
          console.log(`Player Element ${i + 1}: "${playerText?.trim()}"`);
        } catch (error) {
          console.log(`Player Element ${i + 1}: Could not get text`);
        }
      }
      
      // Wait a bit more and take another screenshot
      await page.waitForTimeout(3000);
      await page.screenshot({ 
        path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-screenshots/roster-03-final-state.png',
        fullPage: true 
      });
    }
    
    // Detailed network analysis
    console.log('📊 NETWORK ANALYSIS:');
    console.log(`Total requests: ${networkRequests.length}`);
    console.log(`Total responses: ${networkResponses.length}`);
    
    // Sleeper API calls
    const sleeperCalls = networkResponses.filter(resp => resp.url.includes('api.sleeper.app'));
    console.log(`🏈 Sleeper API calls: ${sleeperCalls.length}`);
    
    sleeperCalls.forEach((call, index) => {
      console.log(`  ${index + 1}. ${call.url} - Status: ${call.status}`);
      if (call.body && call.url.includes('roster')) {
        console.log(`    📄 Roster data length: ${call.body.length} characters`);
        if (call.body.length > 0) {
          try {
            const rosterData = JSON.parse(call.body);
            console.log(`    👥 Roster players count: ${Array.isArray(rosterData) ? rosterData.length : 'Not an array'}`);
          } catch (error) {
            console.log(`    ❌ Could not parse roster JSON`);
          }
        }
      }
    });
    
    // Check for missing player data endpoint
    const playersEndpoint = 'https://api.sleeper.app/v1/players/nfl';
    const playerDataCall = sleeperCalls.find(call => call.url === playersEndpoint);
    
    console.log(`🎯 KEY FINDING: Players endpoint (${playersEndpoint})`);
    if (playerDataCall) {
      console.log(`  ✅ FOUND - Status: ${playerDataCall.status}`);
      if (playerDataCall.body) {
        console.log(`  📄 Players data length: ${playerDataCall.body.length} characters`);
      }
    } else {
      console.log(`  ❌ NOT FOUND - This is likely the issue!`);
      console.log(`  🔧 The app is not fetching player name mappings from Sleeper API`);
    }
    
    // Create comprehensive report
    const report = {
      investigation: 'Roster Player Names Issue',
      timestamp: new Date().toISOString(),
      findings: {
        playerNumberPatternsFound: playerNumberPatterns.length,
        playerNumberPatterns: playerNumberPatterns,
        realPlayerNamesFound: foundNames.length,
        realPlayerNames: foundNames,
        rosterElementsFound: rosterCount,
        playerElementsFound: playerElementCount
      },
      networkAnalysis: {
        totalRequests: networkRequests.length,
        sleeperApiCalls: sleeperCalls.length,
        playersEndpointCalled: !!playerDataCall,
        playersEndpointStatus: playerDataCall?.status || 'NOT_CALLED',
        allSleeperCalls: sleeperCalls.map(call => ({
          url: call.url,
          status: call.status,
          bodyLength: call.body?.length || 0
        }))
      },
      diagnosis: {
        issue: playerDataCall ? 'Players API called but names not displaying' : 'Players API not being called',
        likelyProblem: playerDataCall ? 'Player name mapping logic issue' : 'Missing API call to fetch player names',
        recommendation: playerDataCall ? 'Check player name mapping in frontend code' : 'Add API call to fetch player names from /v1/players/nfl'
      }
    };
    
    // Save report
    require('fs').writeFileSync(
      '/Users/stevendiamante/personal/fantasy-football-mastermind/roster-investigation-report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('✅ Detailed roster investigation complete!');
    console.log(`🎯 KEY ISSUE: ${report.diagnosis.issue}`);
    console.log(`🔧 RECOMMENDATION: ${report.diagnosis.recommendation}`);
  });
});