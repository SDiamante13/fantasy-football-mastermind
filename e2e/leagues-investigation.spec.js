const { test, expect } = require('@playwright/test');

test.describe('Leagues and Player Name Investigation', () => {
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

    // Capture console messages (all types)
    page.on('console', msg => {
      console.log(`🖥️  CONSOLE [${msg.type()}]: ${msg.text()}`);
      if (msg.type() === 'error') {
        consoleErrors.push({
          text: msg.text(),
          timestamp: new Date().toISOString()
        });
      }
    });

    // Clear arrays for each test
    networkRequests.length = 0;
    consoleErrors.length = 0;
  });

  test('investigate player names in Leagues section', async ({ page }) => {
    console.log('🔍 Starting leagues and player name investigation...');
    
    // Step 1: Navigate to the application
    console.log('📍 Step 1: Navigating to localhost:8080');
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-screenshots/leagues-01-initial.png',
      fullPage: true 
    });
    
    // Step 2: Click on Leagues navigation
    console.log('📍 Step 2: Clicking on Leagues navigation');
    const leaguesButton = page.locator('button:has-text("Leagues")');
    await leaguesButton.waitFor({ state: 'visible', timeout: 10000 });
    await leaguesButton.click();
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot after clicking Leagues
    await page.screenshot({ 
      path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-screenshots/leagues-02-navigation-clicked.png',
      fullPage: true 
    });
    
    // Step 3: Look for username input or any inputs on the Leagues page
    console.log('📍 Step 3: Looking for inputs on Leagues page');
    const allInputs = await page.locator('input').all();
    console.log(`📝 Found ${allInputs.length} input elements on Leagues page`);
    
    for (let i = 0; i < allInputs.length; i++) {
      try {
        const placeholder = await allInputs[i].getAttribute('placeholder');
        const type = await allInputs[i].getAttribute('type');
        const value = await allInputs[i].inputValue();
        console.log(`Input ${i + 1}: type="${type}", placeholder="${placeholder}", value="${value}"`);
      } catch (error) {
        console.log(`Input ${i + 1}: Could not get attributes - ${error.message}`);
      }
    }
    
    // Step 4: Try to enter username if input is found
    if (allInputs.length > 0) {
      console.log('📍 Step 4: Attempting to enter username "gaspjr"');
      try {
        await allInputs[0].fill('gaspjr');
        await page.screenshot({ 
          path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-screenshots/leagues-03-username-entered.png',
          fullPage: true 
        });
        
        // Look for submit button or try Enter
        const submitButtons = await page.locator('button[type="submit"], button:has-text("Search"), button:has-text("Load"), button:has-text("Get"), button:has-text("Submit")').all();
        console.log(`🔘 Found ${submitButtons.length} potential submit buttons`);
        
        if (submitButtons.length > 0) {
          await submitButtons[0].click();
        } else {
          await allInputs[0].press('Enter');
        }
        
        // Wait for response
        await page.waitForTimeout(5000);
        await page.waitForLoadState('networkidle');
        
        await page.screenshot({ 
          path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-screenshots/leagues-04-after-submit.png',
          fullPage: true 
        });
        
      } catch (error) {
        console.log(`❌ Error entering username: ${error.message}`);
      }
    }
    
    // Step 5: Look for leagues or any content that appeared
    console.log('📍 Step 5: Looking for leagues or roster content');
    
    // Get all text content to see what's displayed
    const pageContent = await page.locator('body').textContent();
    console.log(`📄 Page content length: ${pageContent?.length} characters`);
    
    // Look for league-related elements
    const leagueElements = await page.locator('div:has-text("League"), span:has-text("League"), [class*="league"], [data-testid*="league"]').all();
    console.log(`🏈 Found ${leagueElements.length} league-related elements`);
    
    // Look for player-related elements
    const playerElements = await page.locator('div:has-text("Player"), span:has-text("Player"), [class*="player"], [data-testid*="player"]').all();
    console.log(`👥 Found ${playerElements.length} player-related elements`);
    
    // Check for specific player name patterns (like "Player 1584")
    const playerPatternElements = await page.locator('text=/Player \\d+/').all();
    console.log(`🏷️ Found ${playerPatternElements.length} elements with "Player [number]" pattern`);
    
    for (let i = 0; i < Math.min(5, playerPatternElements.length); i++) {
      try {
        const text = await playerPatternElements[i].textContent();
        console.log(`  - Player pattern ${i + 1}: "${text}"`);
      } catch (error) {
        console.log(`  - Player pattern ${i + 1}: Could not get text`);
      }
    }
    
    // Look for any clickable leagues
    const clickableLeagues = await page.locator('button:has-text("League"), [role="button"]:has-text("League"), div[role="button"]').all();
    console.log(`👆 Found ${clickableLeagues.length} clickable league elements`);
    
    // If we found clickable leagues, try clicking the first one
    if (clickableLeagues.length > 0) {
      console.log('📍 Step 6: Clicking on first available league');
      try {
        await clickableLeagues[0].click();
        await page.waitForTimeout(3000);
        await page.waitForLoadState('networkidle');
        
        await page.screenshot({ 
          path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-screenshots/leagues-05-league-clicked.png',
          fullPage: true 
        });
        
        // Now look for roster/player information
        const rosterContent = await page.locator('body').textContent();
        console.log('📄 Checking for roster content after league click');
        
        // Look again for player patterns after league selection
        const updatedPlayerPatterns = await page.locator('text=/Player \\d+/').all();
        console.log(`🏷️ After league click - found ${updatedPlayerPatterns.length} "Player [number]" patterns`);
        
        for (let i = 0; i < Math.min(10, updatedPlayerPatterns.length); i++) {
          try {
            const text = await updatedPlayerPatterns[i].textContent();
            console.log(`  - Player pattern ${i + 1}: "${text}"`);
          } catch (error) {
            console.log(`  - Player pattern ${i + 1}: Could not get text`);
          }
        }
        
      } catch (error) {
        console.log(`❌ Error clicking league: ${error.message}`);
      }
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-screenshots/leagues-06-final-state.png',
      fullPage: true 
    });
    
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
    
    // Check for specific Sleeper endpoints
    const expectedEndpoints = [
      'api.sleeper.app/v1/user/gaspjr',
      'api.sleeper.app/v1/user/',
      'api.sleeper.app/v1/league/',
      'api.sleeper.app/v1/players/nfl'
    ];
    
    console.log('🔍 Checking for expected Sleeper endpoints:');
    expectedEndpoints.forEach(endpoint => {
      const found = networkRequests.some(req => req.url.includes(endpoint));
      console.log(`  ${found ? '✅' : '❌'} ${endpoint}: ${found ? 'FOUND' : 'NOT FOUND'}`);
    });
    
    // Step 8: Report console errors
    console.log('📍 Step 8: Console errors analysis');
    console.log(`❌ Console errors captured: ${consoleErrors.length}`);
    consoleErrors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.text} (${error.timestamp})`);
    });
    
    // Create comprehensive report
    const report = {
      testRun: {
        timestamp: new Date().toISOString(),
        target: 'Leagues page investigation',
        url: 'http://localhost:8080'
      },
      uiFindings: {
        inputsFound: allInputs.length,
        leagueElementsFound: leagueElements.length,
        playerElementsFound: playerElements.length,
        playerPatternsFound: playerPatternElements.length,
        clickableLeaguesFound: clickableLeagues.length
      },
      networkAnalysis: {
        totalRequests: networkRequests.length,
        sleeperRequests: sleeperRequests.length,
        playerRequests: playerRequests.length,
        allRequests: networkRequests.map(req => ({ 
          method: req.method, 
          url: req.url, 
          status: req.status,
          timestamp: req.timestamp 
        })),
        expectedEndpointsFound: expectedEndpoints.map(endpoint => ({
          endpoint,
          found: networkRequests.some(req => req.url.includes(endpoint))
        }))
      },
      consoleErrors: consoleErrors
    };
    
    // Save detailed report
    require('fs').writeFileSync(
      '/Users/stevendiamante/personal/fantasy-football-mastermind/leagues-investigation-report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('✅ Leagues investigation complete! Check screenshots and report for detailed findings.');
  });
});