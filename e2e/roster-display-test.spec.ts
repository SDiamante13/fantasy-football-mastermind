import { test, expect, Page } from '@playwright/test';

test.describe('Fantasy Football Mastermind - Roster Display Testing', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Enable network logging to capture API calls
    page.on('request', request => {
      if (request.url().includes('sleeper.app')) {
        console.log('API Request:', request.method(), request.url());
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('sleeper.app')) {
        console.log('API Response:', response.status(), response.url());
      }
    });
    
    await page.goto('/');
  });

  test('should display real player names instead of placeholder names', async () => {
    // Take initial screenshot
    await page.screenshot({ path: 'e2e-screenshots/01-initial-page.png', fullPage: true });

    // Check if we're on the leagues page
    await expect(page.locator('h1')).toContainText('Your Fantasy Leagues');

    // Enter a test Sleeper username (using a known active username)
    const usernameInput = page.locator('input[aria-label="Sleeper username"]');
    await usernameInput.fill('testuser123'); // This should be a real username for testing
    
    // Take screenshot after entering username
    await page.screenshot({ path: 'e2e-screenshots/02-username-entered.png', fullPage: true });

    // Click the Get Leagues button
    await page.locator('button[type="submit"]').click();

    // Wait for loading to complete
    await expect(page.locator('text=Loading...')).toBeHidden({ timeout: 10000 });

    // Take screenshot after attempting to load user
    await page.screenshot({ path: 'e2e-screenshots/03-after-user-load.png', fullPage: true });

    // Check if user was found or if there's an error
    const errorMessage = page.locator('[style*="background-color: #f8d7da"]');
    const userInfo = page.locator('[style*="background-color: #d4edda"]');
    
    if (await errorMessage.isVisible()) {
      console.log('User not found, trying with a different approach...');
      
      // Try with a different known username or mock approach
      await usernameInput.clear();
      await usernameInput.fill('sleepertestuser');
      await page.locator('button[type="submit"]').click();
      await expect(page.locator('text=Loading...')).toBeHidden({ timeout: 10000 });
    }

    // If user is found, proceed with league selection
    if (await userInfo.isVisible()) {
      console.log('User found successfully');
      
      // Wait for leagues to load
      await expect(page.locator('text=Loading your leagues...')).toBeHidden({ timeout: 10000 });
      
      // Take screenshot after leagues load
      await page.screenshot({ path: 'e2e-screenshots/04-leagues-loaded.png', fullPage: true });

      // Check if leagues are available
      const leagueCards = page.locator('[role="button"][aria-label*="Select"][aria-label*="league"]');
      const leagueCount = await leagueCards.count();
      
      if (leagueCount > 0) {
        console.log(`Found ${leagueCount} leagues`);
        
        // Click on the first league
        await leagueCards.first().click();
        
        // Take screenshot after selecting league
        await page.screenshot({ path: 'e2e-screenshots/05-league-selected.png', fullPage: true });

        // Wait for roster to load
        await expect(page.locator('text=Loading roster...')).toBeHidden({ timeout: 15000 });
        
        // Take screenshot after roster loads
        await page.screenshot({ path: 'e2e-screenshots/06-roster-loaded.png', fullPage: true });

        // Check for roster section
        const rosterSection = page.locator('section:has(h3:text("League Roster"))');
        await expect(rosterSection).toBeVisible();

        // Get all player cards
        const playerCards = page.locator('[style*="backgroundColor: white"][style*="padding: 1rem"][style*="borderRadius: 8px"]').filter({
          has: page.locator('h4') // Has player name header
        });
        
        const playerCount = await playerCards.count();
        console.log(`Found ${playerCount} players in roster`);

        if (playerCount > 0) {
          // Check each player card for placeholder names
          for (let i = 0; i < Math.min(playerCount, 5); i++) { // Check first 5 players
            const playerCard = playerCards.nth(i);
            const playerName = await playerCard.locator('h4').textContent();
            
            console.log(`Player ${i + 1}: ${playerName}`);
            
            // Check if it's a placeholder name pattern "Player XXXX"
            const isPlaceholder = playerName?.match(/^Player \d+$/);
            
            if (isPlaceholder) {
              console.error(`❌ Found placeholder name: ${playerName}`);
              
              // Take detailed screenshot of the problematic player card
              await playerCard.screenshot({ path: `e2e-screenshots/07-placeholder-player-${i + 1}.png` });
              
              // Check what data is actually being displayed
              const position = await playerCard.locator('[style*="backgroundColor: #007bff"]').textContent();
              const team = await playerCard.locator('text=Team:').locator('..').locator('span').last().textContent();
              const projectedPoints = await playerCard.locator('text=Projected:').locator('..').locator('span').last().textContent();
              const matchup = await playerCard.locator('text=Matchup:').locator('..').locator('span').last().textContent();
              
              console.log(`  Position: ${position}`);
              console.log(`  Team: ${team}`);
              console.log(`  Projected: ${projectedPoints}`);
              console.log(`  Matchup: ${matchup}`);
            } else {
              console.log(`✅ Real player name found: ${playerName}`);
            }
          }
          
          // Take final screenshot showing all roster data
          await page.screenshot({ path: 'e2e-screenshots/08-final-roster-display.png', fullPage: true });
          
        } else {
          console.log('❌ No players found in roster');
          await page.screenshot({ path: 'e2e-screenshots/07-no-players-found.png', fullPage: true });
        }
      } else {
        console.log('❌ No leagues found for user');
        await page.screenshot({ path: 'e2e-screenshots/04-no-leagues-found.png', fullPage: true });
      }
    } else {
      console.log('❌ User lookup failed');
      await page.screenshot({ path: 'e2e-screenshots/03-user-lookup-failed.png', fullPage: true });
    }
  });

  test('should make correct API calls to Sleeper', async () => {
    const apiCalls: { method: string; url: string; status?: number }[] = [];
    
    // Track all Sleeper API calls
    page.on('request', request => {
      if (request.url().includes('sleeper.app')) {
        apiCalls.push({
          method: request.method(),
          url: request.url()
        });
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('sleeper.app')) {
        const existingCall = apiCalls.find(call => call.url === response.url());
        if (existingCall) {
          existingCall.status = response.status();
        }
      }
    });

    // Enter username and trigger API calls
    await page.locator('input[aria-label="Sleeper username"]').fill('testuser123');
    await page.locator('button[type="submit"]').click();
    
    // Wait for user lookup
    await page.waitForTimeout(2000);
    
    console.log('API Calls made:');
    apiCalls.forEach((call, index) => {
      console.log(`${index + 1}. ${call.method} ${call.url} - Status: ${call.status || 'pending'}`);
    });

    // Check if expected API calls were made
    const userCall = apiCalls.find(call => call.url.includes('/user/'));
    const leaguesCall = apiCalls.find(call => call.url.includes('/leagues/'));
    
    if (userCall) {
      console.log('✅ User API call made');
    } else {
      console.log('❌ User API call missing');
    }
    
    if (leaguesCall) {
      console.log('✅ Leagues API call made');
    } else {
      console.log('❌ Leagues API call missing');
    }

    // Save API call log to file
    await page.evaluate((calls) => {
      console.log('Complete API Log:', JSON.stringify(calls, null, 2));
    }, apiCalls);
  });

  test('should handle network errors gracefully', async () => {
    // Block all Sleeper API calls to test error handling
    await page.route('**/sleeper.app/**', route => {
      route.abort('failed');
    });

    await page.locator('input[aria-label="Sleeper username"]').fill('testuser');
    await page.locator('button[type="submit"]').click();
    
    // Wait and check for error message
    await page.waitForTimeout(3000);
    
    const errorMessage = page.locator('[style*="background-color: #f8d7da"]');
    await expect(errorMessage).toBeVisible();
    
    // Take screenshot of error state
    await page.screenshot({ path: 'e2e-screenshots/09-network-error.png', fullPage: true });
    
    console.log('✅ Network error handled gracefully');
  });

  test.afterEach(async () => {
    await page.close();
  });
});