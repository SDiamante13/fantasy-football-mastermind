import { test, expect, Page } from '@playwright/test';

test.describe('Fantasy Football Mastermind - Roster Fix Validation', () => {
  let consoleLogs: string[] = [];
  let networkRequests: string[] = [];

  // Expected players for gaspjr in "DJT For Prison 2024" league
  const expectedDJTPlayers = [
    'J Daniels', 'O Hampton', 'D Sampson', 'E Egbuka', 'D London', 
    'T McMillan', 'T Warren', 'N Collins', 'C Boswell', 'ARI',
    'J McCarthy', 'B Allen', 'T Benson', 'A Ekeler', 'E Ayomanor', 'G Pickens'
  ];

  test.beforeEach(async ({ page }) => {
    consoleLogs = [];
    networkRequests = [];

    // Capture console logs
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      console.log(`Console: ${text}`);
    });

    // Capture network requests
    page.on('request', request => {
      const url = request.url();
      networkRequests.push(url);
      if (url.includes('sleeper.app')) {
        console.log(`Sleeper API: ${url}`);
      }
    });

    // Navigate to the application
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
  });

  test('should display exactly 16 players for gaspjr in DJT For Prison 2024 league', async ({ page }) => {
    console.log('🧪 Testing DJT For Prison 2024 league for gaspjr');
    
    // Click on Leagues tab first
    await page.click('text=Leagues');
    await page.waitForTimeout(1000);
    
    // Enter username "gaspjr"
    await page.fill('input[placeholder*="username" i]', 'gaspjr');
    await page.screenshot({ 
      path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-results/djt-01-username-entered.png', 
      fullPage: true 
    });
    
    // Submit the form
    await page.click('button:has-text("Get Leagues")');
    
    // Wait for user info to appear
    await page.waitForSelector('text=Welcome', { timeout: 10000 });
    await page.screenshot({ 
      path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-results/djt-02-user-loaded.png', 
      fullPage: true 
    });
    
    // Wait for leagues to load and click on "DJT For Prison 2024"
    await page.waitForSelector('text=DJT For Prison 2024', { timeout: 10000 });
    await page.click('text=DJT For Prison 2024');
    await page.screenshot({ 
      path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-results/djt-03-league-selected.png', 
      fullPage: true 
    });
    
    // Wait for roster to load
    await page.waitForSelector('text=League Roster', { timeout: 10000 });
    await page.waitForTimeout(3000); // Additional wait for roster data
    
    // Take screenshot of loaded roster
    await page.screenshot({ 
      path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-results/djt-04-roster-loaded.png', 
      fullPage: true 
    });
    
    // Count player cards
    const playerCards = await page.locator('[data-testid*="player"], .player, div:has(h4):has(span:text("QB")), div:has(h4):has(span:text("RB")), div:has(h4):has(span:text("WR")), div:has(h4):has(span:text("TE")), div:has(h4):has(span:text("K")), div:has(h4):has(span:text("DEF"))').count();
    
    console.log(`🔢 Player cards found: ${playerCards}`);
    
    // Get all player names from the page
    const playerNameElements = await page.locator('h4').allTextContents();
    const playerNames = playerNameElements.filter(name => 
      name && 
      name.trim() !== '' && 
      name !== 'League Roster' && 
      name !== 'Welcome' &&
      !name.includes('Your Leagues') &&
      !name.includes('Season:') &&
      !name.includes('Status:')
    );
    
    console.log('🎯 Player names found:', playerNames);
    console.log(`📊 Total players: ${playerNames.length}`);
    
    // Verify we have exactly 16 players
    expect(playerNames.length, `Should have exactly 16 players, but found ${playerNames.length}: ${playerNames.join(', ')}`).toBe(16);
    
    // Verify no "Player XXXX" style names (indicating API data fetch failure)
    const hasGenericPlayerNames = playerNames.some(name => name.match(/Player \d+/));
    expect(hasGenericPlayerNames, 'Should not have generic "Player XXXX" names - indicates real API data is being used').toBe(false);
    
    // Verify key expected players are present
    const foundExpectedPlayers = expectedDJTPlayers.filter(expectedPlayer => 
      playerNames.some(actualPlayer => actualPlayer.includes(expectedPlayer))
    );
    
    console.log('✅ Expected players found:', foundExpectedPlayers);
    console.log('❌ Expected players missing:', expectedDJTPlayers.filter(p => !foundExpectedPlayers.some(f => f.includes(p))));
    
    // Verify at least some expected players are found (allowing for name variations)
    expect(foundExpectedPlayers.length, `Should find at least 8 expected players, found: ${foundExpectedPlayers.join(', ')}`).toBeGreaterThanOrEqual(8);
    
    // Verify positions are shown
    const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
    for (const position of positions) {
      const hasPosition = await page.locator(`text=${position}`).count() > 0;
      expect(hasPosition, `Should have ${position} position displayed`).toBe(true);
    }
    
    // Check for Sleeper API calls
    const sleeperApiCalls = networkRequests.filter(url => url.includes('api.sleeper.app'));
    console.log('🌐 Sleeper API calls:', sleeperApiCalls);
    expect(sleeperApiCalls.length, 'Should make calls to Sleeper API').toBeGreaterThan(0);
    
    // Check for roster-specific API calls with user ID
    const rosterApiCalls = sleeperApiCalls.filter(url => url.includes('/rosters') || url.includes('/players'));
    expect(rosterApiCalls.length, 'Should make roster/player API calls').toBeGreaterThan(0);
  });

  test('should display different roster for gaspjr in Compass Disciples league', async ({ page }) => {
    console.log('🧪 Testing Compass Disciples league for gaspjr');
    
    // Click on Leagues tab first
    await page.click('text=Leagues');
    await page.waitForTimeout(1000);
    
    // Enter username "gaspjr"
    await page.fill('input[placeholder*="username" i]', 'gaspjr');
    await page.click('button:has-text("Get Leagues")');
    
    // Wait for user and leagues to load
    await page.waitForSelector('text=Welcome', { timeout: 10000 });
    
    // Check if Compass Disciples league exists
    const compassLeagueExists = await page.locator('text=Compass Disciples').count() > 0;
    
    if (compassLeagueExists) {
      await page.click('text=Compass Disciples');
      await page.screenshot({ 
        path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-results/compass-01-league-selected.png', 
        fullPage: true 
      });
      
      // Wait for roster to load
      await page.waitForSelector('text=League Roster', { timeout: 10000 });
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-results/compass-02-roster-loaded.png', 
        fullPage: true 
      });
      
      // Get player names for Compass Disciples
      const compassPlayerNames = await page.locator('h4').allTextContents();
      const compassPlayers = compassPlayerNames.filter(name => 
        name && 
        name.trim() !== '' && 
        name !== 'League Roster' && 
        name !== 'Welcome' &&
        !name.includes('Your Leagues')
      );
      
      console.log('🎯 Compass Disciples players:', compassPlayers);
      
      // Verify this roster is different and has players
      expect(compassPlayers.length, 'Compass Disciples should have players').toBeGreaterThan(0);
      
      // Now test DJT league to compare
      await page.click('text=DJT For Prison 2024');
      await page.waitForTimeout(3000);
      
      const djtPlayerNames = await page.locator('h4').allTextContents();
      const djtPlayers = djtPlayerNames.filter(name => 
        name && 
        name.trim() !== '' && 
        name !== 'League Roster' && 
        name !== 'Welcome' &&
        !name.includes('Your Leagues')
      );
      
      console.log('🎯 DJT For Prison 2024 players:', djtPlayers);
      
      // Verify the rosters are different
      const rostersAreDifferent = JSON.stringify(compassPlayers.sort()) !== JSON.stringify(djtPlayers.sort());
      expect(rostersAreDifferent, 'Rosters should be different between leagues').toBe(true);
      
      console.log('✅ Confirmed: Different rosters for different leagues');
    } else {
      console.log('⚠️ Compass Disciples league not found, testing available leagues');
      
      // Get all available leagues
      const leagueElements = await page.locator('[role="button"]:has-text("Season:")').count();
      console.log(`📋 Found ${leagueElements} leagues available`);
      
      if (leagueElements >= 2) {
        // Test first two leagues to verify different rosters
        await page.locator('[role="button"]:has-text("Season:")').first().click();
        await page.waitForTimeout(3000);
        
        const firstRosterNames = await page.locator('h4').allTextContents();
        const firstPlayers = firstRosterNames.filter(name => 
          name && name.trim() !== '' && name !== 'League Roster'
        );
        
        await page.locator('[role="button"]:has-text("Season:")').nth(1).click();
        await page.waitForTimeout(3000);
        
        const secondRosterNames = await page.locator('h4').allTextContents();
        const secondPlayers = secondRosterNames.filter(name => 
          name && name.trim() !== '' && name !== 'League Roster'
        );
        
        const rostersAreDifferent = JSON.stringify(firstPlayers.sort()) !== JSON.stringify(secondPlayers.sort());
        expect(rostersAreDifferent, 'Different leagues should show different rosters').toBe(true);
        
        console.log('✅ Confirmed: Different rosters for different leagues');
      }
    }
  });

  test('should not show infinite loop errors in console', async ({ page }) => {
    console.log('🧪 Testing for infinite loop prevention');
    
    // Click on Leagues tab first
    await page.click('text=Leagues');
    await page.waitForTimeout(1000);
    
    // Enter username and select league
    await page.fill('input[placeholder*="username" i]', 'gaspjr');
    await page.click('button:has-text("Get Leagues")');
    await page.waitForSelector('text=Welcome', { timeout: 10000 });
    await page.click('text=DJT For Prison 2024');
    
    // Wait and monitor console for errors
    await page.waitForTimeout(5000);
    
    // Check for error patterns that might indicate infinite loops
    const errorLogs = consoleLogs.filter(log => 
      log.toLowerCase().includes('error') || 
      log.toLowerCase().includes('warning') ||
      log.toLowerCase().includes('maximum') ||
      log.toLowerCase().includes('infinite')
    );
    
    console.log('🔍 Error/Warning logs:', errorLogs);
    
    // Check for excessive API calls (indicating potential infinite loop)
    const apiCallCount = networkRequests.filter(url => url.includes('api.sleeper.app')).length;
    console.log(`🌐 Total Sleeper API calls: ${apiCallCount}`);
    
    expect(apiCallCount, 'Should not make excessive API calls (>10 indicates potential infinite loop)').toBeLessThan(10);
    
    // Verify no React development warnings about infinite renders
    const hasInfiniteRenderWarnings = consoleLogs.some(log => 
      log.includes('Warning') && log.includes('render')
    );
    
    expect(hasInfiniteRenderWarnings, 'Should not have infinite render warnings').toBe(false);
    
    console.log('✅ No infinite loop indicators detected');
  });

  test.afterEach(async () => {
    // Log summary
    console.log('\n=== TEST SUMMARY ===');
    console.log(`Console logs: ${consoleLogs.length}`);
    console.log(`Network requests: ${networkRequests.length}`);
    console.log(`Sleeper API calls: ${networkRequests.filter(url => url.includes('api.sleeper.app')).length}`);
  });
});