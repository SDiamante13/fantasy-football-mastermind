const { test, expect } = require('@playwright/test');

test.describe('Player Name Display Investigation', () => {
  let networkRequests = [];
  let consoleErrors = [];

  test.beforeEach(async ({ page }) => {
    // Capture network requests
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        timestamp: new Date().toISOString()
      });
    });

    // Capture responses
    page.on('response', response => {
      const request = networkRequests.find(req => req.url === response.url());
      if (request) {
        request.status = response.status();
        request.statusText = response.statusText();
      }
    });

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push({
          text: msg.text(),
          timestamp: new Date().toISOString()
        });
      }
    });
  });

  test('investigate player name display issue', async ({ page }) => {
    console.log('🔍 Starting player name investigation...');
    
    // Step 1: Navigate to the application
    console.log('📍 Step 1: Navigating to localhost:8080');
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-screenshots/01-initial-load.png',
      fullPage: true 
    });
    
    // Step 2: Enter username
    console.log('📍 Step 2: Entering username "gaspjr"');
    const usernameInput = page.locator('input[placeholder*="username" i], input[placeholder*="user" i], input[type="text"]').first();
    await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
    await usernameInput.fill('gaspjr');
    
    // Take screenshot after username entry
    await page.screenshot({ 
      path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-screenshots/02-username-entered.png',
      fullPage: true 
    });
    
    // Step 3: Submit username or trigger league loading
    console.log('📍 Step 3: Submitting username to load leagues');
    const submitButton = page.locator('button[type="submit"], button:has-text("Search"), button:has-text("Load"), button:has-text("Get")').first();
    
    try {
      await submitButton.waitFor({ state: 'visible', timeout: 5000 });
      await submitButton.click();
    } catch (error) {
      console.log('⚠️ No submit button found, trying Enter key');
      await usernameInput.press('Enter');
    }
    
    // Wait for leagues to load
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot after leagues load
    await page.screenshot({ 
      path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-screenshots/03-leagues-loaded.png',
      fullPage: true 
    });
    
    // Step 4: Find and click on a league
    console.log('📍 Step 4: Looking for available leagues');
    const leagueButtons = page.locator('button:has-text("League"), [role="button"]:has-text("League"), div[role="button"], button').filter({
      hasNotText: /username|search|load|get/i
    });
    
    const leagueCount = await leagueButtons.count();
    console.log(`🏈 Found ${leagueCount} potential league elements`);
    
    if (leagueCount > 0) {
      console.log('📍 Step 5: Clicking on first available league');
      await leagueButtons.first().click();
      await page.waitForTimeout(2000);
      await page.waitForLoadState('networkidle');
      
      // Take screenshot after league selection
      await page.screenshot({ 
        path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-screenshots/04-league-selected.png',
        fullPage: true 
      });
      
      // Step 6: Look for roster display
      console.log('📍 Step 6: Examining roster display');
      const rosterContainer = page.locator('[class*="roster"], [class*="player"], [class*="team"]').first();
      
      try {
        await rosterContainer.waitFor({ state: 'visible', timeout: 5000 });
        
        // Check for player names
        const playerElements = page.locator('[class*="player"], div:has-text("Player"), span:has-text("Player")');
        const playerCount = await playerElements.count();
        console.log(`👥 Found ${playerCount} player elements`);
        
        // Get text content of first few players
        for (let i = 0; i < Math.min(5, playerCount); i++) {
          const playerText = await playerElements.nth(i).textContent();
          console.log(`Player ${i + 1}: "${playerText}"`);
        }
        
        // Take screenshot of roster area
        await page.screenshot({ 
          path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-screenshots/05-roster-display.png',
          fullPage: true 
        });
        
      } catch (error) {
        console.log('⚠️ Could not find roster container');
        console.log('📸 Taking screenshot of current state');
        await page.screenshot({ 
          path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-screenshots/05-no-roster-found.png',
          fullPage: true 
        });
      }
    } else {
      console.log('⚠️ No leagues found');
      await page.screenshot({ 
        path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-screenshots/04-no-leagues-found.png',
        fullPage: true 
      });
    }
    
    // Step 7: Analyze network requests
    console.log('📍 Step 7: Analyzing network requests');
    console.log(`📊 Total network requests captured: ${networkRequests.length}`);
    
    // Filter for Sleeper API calls
    const sleeperRequests = networkRequests.filter(req => 
      req.url.includes('sleeper.app') || req.url.includes('sleeper')
    );
    
    console.log(`🏈 Sleeper API requests: ${sleeperRequests.length}`);
    sleeperRequests.forEach((req, index) => {
      console.log(`  ${index + 1}. ${req.method} ${req.url} - Status: ${req.status || 'pending'}`);
    });
    
    // Filter for player-related requests
    const playerRequests = networkRequests.filter(req => 
      req.url.includes('players') || req.url.includes('player')
    );
    
    console.log(`👥 Player-related requests: ${playerRequests.length}`);
    playerRequests.forEach((req, index) => {
      console.log(`  ${index + 1}. ${req.method} ${req.url} - Status: ${req.status || 'pending'}`);
    });
    
    // Check for expected Sleeper endpoints
    const expectedEndpoints = [
      'api.sleeper.app/v1/user/gaspjr',
      'api.sleeper.app/v1/user/',
      'api.sleeper.app/v1/league/',
      'api.sleeper.app/v1/players/nfl'
    ];
    
    console.log('🔍 Checking for expected Sleeper endpoints:');
    expectedEndpoints.forEach(endpoint => {
      const found = networkRequests.some(req => req.url.includes(endpoint));
      console.log(`  ✓ ${endpoint}: ${found ? 'FOUND' : 'NOT FOUND'}`);
    });
    
    // Step 8: Report console errors
    console.log('📍 Step 8: Console errors analysis');
    console.log(`❌ Console errors captured: ${consoleErrors.length}`);
    consoleErrors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.text} (${error.timestamp})`);
    });
    
    // Step 9: Final comprehensive screenshot
    await page.screenshot({ 
      path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-screenshots/09-final-state.png',
      fullPage: true 
    });
    
    // Write detailed report
    const report = {
      testRun: {
        timestamp: new Date().toISOString(),
        username: 'gaspjr',
        url: 'http://localhost:8080'
      },
      networkAnalysis: {
        totalRequests: networkRequests.length,
        sleeperRequests: sleeperRequests.length,
        playerRequests: playerRequests.length,
        allRequests: networkRequests,
        sleeperRequests: sleeperRequests,
        playerRequests: playerRequests
      },
      consoleErrors: consoleErrors,
      findings: {
        userUsernameEntry: true,
        leaguesFound: leagueCount > 0,
        rosterDisplayed: false, // Will be updated based on findings
        playerNamesCorrect: false // Will be updated based on findings
      }
    };
    
    // Save the report
    require('fs').writeFileSync(
      '/Users/stevendiamante/personal/fantasy-football-mastermind/player-name-investigation-report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('✅ Investigation complete! Check screenshots and report for detailed findings.');
  });
});