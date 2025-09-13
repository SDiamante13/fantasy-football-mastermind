const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();
  
  // Track network requests
  const apiCalls = [];
  page.on('request', request => {
    if (request.url().includes('sleeper.app')) {
      console.log('🌐 API Request:', request.method(), request.url());
      apiCalls.push({
        type: 'request',
        method: request.method(),
        url: request.url(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('sleeper.app')) {
      console.log('📡 API Response:', response.status(), response.url());
      apiCalls.push({
        type: 'response',
        status: response.status(),
        url: response.url(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  try {
    console.log('🚀 Starting Fantasy Football Mastermind roster display test...');
    
    // Navigate to the app
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(3000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-screenshots/01-homepage.png', fullPage: true });
    console.log('📸 Screenshot 1: Homepage loaded');
    
    // Click on Leagues tab
    console.log('🔍 Looking for Leagues tab...');
    const leaguesTab = page.locator('text=Leagues').first();
    await leaguesTab.click();
    console.log('✅ Clicked Leagues tab');
    
    // Wait for leagues page to load
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-screenshots/02-leagues-page.png', fullPage: true });
    console.log('📸 Screenshot 2: Leagues page loaded');
    
    // Check if username input exists
    const usernameInput = page.locator('input[aria-label="Sleeper username"]');
    const inputExists = await usernameInput.count() > 0;
    
    if (!inputExists) {
      console.log('❌ Username input not found, checking all inputs...');
      const allInputs = await page.locator('input').count();
      console.log(`Found ${allInputs} total inputs`);
      
      // Try different selectors
      const altUsernameInput = page.locator('input[placeholder*="username"], input[type="text"]').first();
      const altExists = await altUsernameInput.count() > 0;
      
      if (altExists) {
        console.log('✅ Found alternative username input');
        await altUsernameInput.fill('testuser123');
      } else {
        console.log('❌ No username input found at all');
        return;
      }
    } else {
      console.log('✅ Found username input field');
      await usernameInput.fill('testuser123');
    }
    
    await page.screenshot({ path: 'test-screenshots/03-username-entered.png', fullPage: true });
    console.log('📸 Screenshot 3: Username entered');
    
    // Click submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Get"), button:has-text("Submit")').first();
    const buttonExists = await submitButton.count() > 0;
    
    if (buttonExists) {
      await submitButton.click();
      console.log('✅ Clicked submit button');
    } else {
      console.log('❌ Submit button not found');
      return;
    }
    
    // Wait for API call and response
    await page.waitForTimeout(8000);
    await page.screenshot({ path: 'test-screenshots/04-after-user-lookup.png', fullPage: true });
    console.log('📸 Screenshot 4: After user lookup');
    
    // Check for error or success messages
    const errorMsg = page.locator('[style*="background-color: #f8d7da"]');
    const successMsg = page.locator('[style*="background-color: #d4edda"]');
    
    const errorCount = await errorMsg.count();
    const successCount = await successMsg.count();
    
    console.log(`Found ${errorCount} error messages, ${successCount} success messages`);
    
    if (errorCount > 0) {
      const errorText = await errorMsg.first().textContent();
      console.log('❌ Error message:', errorText);
      
      // Try with a more common username
      console.log('🔄 Trying with username: sleeperbot');
      const inputField = page.locator('input[aria-label="Sleeper username"], input[placeholder*="username"], input[type="text"]').first();
      await inputField.clear();
      await inputField.fill('sleeperbot');
      await submitButton.click();
      await page.waitForTimeout(8000);
      await page.screenshot({ path: 'test-screenshots/05-retry-sleeperbot.png', fullPage: true });
      
      // Check again
      const newSuccessCount = await successMsg.count();
      if (newSuccessCount === 0) {
        console.log('🔄 Trying with username: sleeper');
        await inputField.clear();
        await inputField.fill('sleeper');
        await submitButton.click();
        await page.waitForTimeout(8000);
        await page.screenshot({ path: 'test-screenshots/06-retry-sleeper.png', fullPage: true });
      }
    }
    
    // Look for leagues regardless
    const leagueCards = page.locator('[role="button"][aria-label*="league"]');
    const leagueCount = await leagueCards.count();
    console.log(`🏈 Found ${leagueCount} league cards`);
    
    if (leagueCount > 0) {
      // Click on first league
      await leagueCards.first().click();
      console.log('✅ Selected first league');
      
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'test-screenshots/07-league-selected.png', fullPage: true });
      console.log('📸 Screenshot 7: League selected');
      
      // Wait for roster to load
      await page.waitForTimeout(8000);
      await page.screenshot({ path: 'test-screenshots/08-roster-should-be-loaded.png', fullPage: true });
      console.log('📸 Screenshot 8: Roster should be loaded');
      
      // Look for roster section
      const rosterSection = page.locator('h3:has-text("League Roster")');
      const rosterExists = await rosterSection.count() > 0;
      
      if (rosterExists) {
        console.log('✅ Found roster section');
        
        // Analyze player cards
        const playerCards = page.locator('[style*="backgroundColor: white"][style*="padding: 1rem"]').filter({
          has: page.locator('h4')
        });
        
        const playerCount = await playerCards.count();
        console.log(`👥 Found ${playerCount} player cards`);
        
        if (playerCount > 0) {
          console.log('🔍 Analyzing player names for placeholder issue...');
          let placeholderCount = 0;
          let realNameCount = 0;
          
          for (let i = 0; i < Math.min(playerCount, 15); i++) {
            try {
              const playerCard = playerCards.nth(i);
              const nameElement = playerCard.locator('h4').first();
              const playerName = await nameElement.textContent();
              
              // Check if it's a placeholder name pattern
              const isPlaceholder = playerName?.match(/^Player \d+$/);
              
              if (isPlaceholder) {
                placeholderCount++;
                console.log(`❌ PLACEHOLDER FOUND: "${playerName}"`);
                
                // Get additional details for diagnosis
                try {
                  const position = await playerCard.locator('[style*="backgroundColor: #007bff"]').textContent();
                  const teamSpan = playerCard.locator('text=Team:').locator('..').locator('span').last();
                  const team = await teamSpan.textContent();
                  const projectedSpan = playerCard.locator('text=Projected:').locator('..').locator('span').last();  
                  const projected = await projectedSpan.textContent();
                  
                  console.log(`   Position: ${position}, Team: ${team}, Projected: ${projected}`);
                } catch (detailError) {
                  console.log(`   Could not get additional details: ${detailError.message}`);
                }
                
                // Screenshot the problematic card
                await playerCard.screenshot({ path: `test-screenshots/09-placeholder-${i + 1}-${playerName.replace(/\s+/g, '-')}.png` });
              } else {
                realNameCount++;
                console.log(`✅ Real name: "${playerName}"`);
              }
            } catch (error) {
              console.log(`⚠️  Error analyzing player ${i + 1}:`, error.message);
            }
          }
          
          // Summary
          console.log('\n📊 ROSTER ANALYSIS SUMMARY:');
          console.log('============================');
          console.log(`Total players analyzed: ${Math.min(playerCount, 15)}`);
          console.log(`Real names found: ${realNameCount}`);
          console.log(`Placeholder names found: ${placeholderCount}`);
          
          if (placeholderCount > 0) {
            console.log('🚨 ISSUE CONFIRMED: Placeholder names are being displayed instead of real player names');
          } else {
            console.log('✅ No placeholder names found - roster display appears to be working correctly');
          }
          
          await page.screenshot({ path: 'test-screenshots/10-final-roster-analysis.png', fullPage: true });
        } else {
          console.log('❌ No player cards found in roster section');
        }
      } else {
        console.log('❌ Roster section not found');
        
        // Look for any roster-related content
        const anyRoster = page.locator('*:has-text("roster"), *:has-text("player")');
        const anyRosterCount = await anyRoster.count();
        console.log(`Found ${anyRosterCount} elements containing "roster" or "player"`);
      }
    } else {
      console.log('❌ No league cards found');
      
      // Check what's actually on the page
      const pageContent = await page.textContent('body');
      if (pageContent.includes('Loading')) {
        console.log('⏳ Page seems to be in loading state');
      }
      if (pageContent.includes('Error') || pageContent.includes('Failed')) {
        console.log('❌ Page shows error state');
      }
    }
    
    // Final API call analysis
    console.log('\n🌐 API CALL ANALYSIS:');
    console.log('=====================');
    if (apiCalls.length === 0) {
      console.log('❌ No Sleeper API calls detected - This indicates a networking issue');
    } else {
      apiCalls.forEach((call, index) => {
        if (call.type === 'request') {
          const responseCall = apiCalls.find(c => c.type === 'response' && c.url === call.url);
          const status = responseCall ? responseCall.status : 'No response';
          console.log(`${index + 1}. ${call.method} ${call.url} → ${status}`);
        }
      });
      
      // Analyze what API calls should have been made
      const userCalls = apiCalls.filter(c => c.url.includes('/user/'));
      const leagueCalls = apiCalls.filter(c => c.url.includes('/leagues/'));
      const rosterCalls = apiCalls.filter(c => c.url.includes('/rosters'));
      const playerCalls = apiCalls.filter(c => c.url.includes('/players/nfl'));
      
      console.log(`User API calls: ${userCalls.length}`);
      console.log(`League API calls: ${leagueCalls.length}`);
      console.log(`Roster API calls: ${rosterCalls.length}`);
      console.log(`Player data API calls: ${playerCalls.length}`);
      
      if (rosterCalls.length > 0 && playerCalls.length === 0) {
        console.log('🚨 DIAGNOSIS: Roster API called but no player data API called - this explains placeholder names!');
      }
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
    console.error(error.stack);
    await page.screenshot({ path: 'test-screenshots/error-final.png', fullPage: true });
  }
  
  console.log('\n⏱️  Keeping browser open for 15 seconds for manual inspection...');
  await page.waitForTimeout(15000);
  
  await browser.close();
  console.log('🏁 Test completed - Check test-screenshots folder for visual evidence');
})();