const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
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
    console.log('🚀 Starting comprehensive roster display test...');
    
    // Navigate to the app
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(2000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-screenshots/01-homepage.png', fullPage: true });
    console.log('📸 Screenshot 1: Homepage loaded');
    
    // Click on Leagues tab
    console.log('🔍 Looking for Leagues tab...');
    const leaguesTab = page.locator('text=Leagues').first();
    await leaguesTab.click();
    console.log('✅ Clicked Leagues tab');
    
    // Wait for leagues page to load
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-screenshots/02-leagues-page.png', fullPage: true });
    console.log('📸 Screenshot 2: Leagues page loaded');
    
    // Look for the username input
    const usernameInput = page.locator('input[aria-label="Sleeper username"]');
    await expect(usernameInput).toBeVisible();
    console.log('✅ Found username input field');
    
    // Test with a known good username (using a real one for testing)
    console.log('🧪 Testing with username: testuser123');
    await usernameInput.fill('testuser123');
    
    await page.screenshot({ path: 'test-screenshots/03-username-entered.png', fullPage: true });
    console.log('📸 Screenshot 3: Username entered');
    
    // Click Get Leagues button
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    console.log('✅ Clicked Get Leagues button');
    
    // Wait for API call and response
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'test-screenshots/04-after-user-lookup.png', fullPage: true });
    console.log('📸 Screenshot 4: After user lookup');
    
    // Check if we have any error or success messages
    const errorMsg = page.locator('[style*="background-color: #f8d7da"]');
    const successMsg = page.locator('[style*="background-color: #d4edda"]');
    
    const hasError = await errorMsg.isVisible().catch(() => false);
    const hasSuccess = await successMsg.isVisible().catch(() => false);
    
    if (hasError) {
      const errorText = await errorMsg.textContent();
      console.log('❌ Error message:', errorText);
      
      // Try with a different approach - let's try a username that might exist
      console.log('🔄 Trying with a different username: sleeper');
      await usernameInput.clear();
      await usernameInput.fill('sleeper');
      await submitButton.click();
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'test-screenshots/05-retry-different-username.png', fullPage: true });
    }
    
    if (hasSuccess) {
      const successText = await successMsg.textContent();
      console.log('✅ Success message:', successText);
      
      // Look for leagues
      await page.waitForTimeout(2000);
      const leagueCards = page.locator('[role="button"][aria-label*="league"]');
      const leagueCount = await leagueCards.count();
      console.log(`🏈 Found ${leagueCount} leagues`);
      
      if (leagueCount > 0) {
        // Click on first league
        await leagueCards.first().click();
        console.log('✅ Selected first league');
        
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'test-screenshots/06-league-selected.png', fullPage: true });
        console.log('📸 Screenshot 6: League selected');
        
        // Wait for roster to load
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'test-screenshots/07-roster-loaded.png', fullPage: true });
        console.log('📸 Screenshot 7: Roster should be loaded');
        
        // Analyze player names
        const playerCards = page.locator('[style*="backgroundColor: white"][style*="padding: 1rem"]').filter({
          has: page.locator('h4')
        });
        
        const playerCount = await playerCards.count();
        console.log(`👥 Found ${playerCount} player cards`);
        
        if (playerCount > 0) {
          console.log('🔍 Analyzing player names...');
          
          for (let i = 0; i < Math.min(playerCount, 10); i++) {
            try {
              const playerCard = playerCards.nth(i);
              const nameElement = playerCard.locator('h4').first();
              const playerName = await nameElement.textContent();
              
              // Check if it's a placeholder name
              const isPlaceholder = playerName?.match(/^Player \d+$/);
              
              if (isPlaceholder) {
                console.log(`❌ ISSUE: Placeholder name found - "${playerName}"`);
                
                // Get additional details
                const position = await playerCard.locator('[style*="backgroundColor: #007bff"]').textContent().catch(() => 'N/A');
                const teamElement = playerCard.locator('span:has-text("Team:")').locator('..').locator('span').last();
                const team = await teamElement.textContent().catch(() => 'N/A');
                
                console.log(`   Position: ${position}, Team: ${team}`);
                
                // Take screenshot of problematic card
                await playerCard.screenshot({ path: `test-screenshots/08-placeholder-player-${i + 1}.png` });
              } else {
                console.log(`✅ Real name found - "${playerName}"`);
              }
            } catch (error) {
              console.log(`⚠️  Error analyzing player ${i + 1}:`, error.message);
            }
          }
          
          await page.screenshot({ path: 'test-screenshots/09-final-roster-analysis.png', fullPage: true });
        } else {
          console.log('❌ No player cards found');
        }
      } else {
        console.log('❌ No leagues found');
      }
    }
    
    // Log all API calls
    console.log('\n📊 API Call Summary:');
    console.log('====================');
    apiCalls.forEach((call, index) => {
      if (call.type === 'request') {
        console.log(`${index + 1}. 🔄 ${call.method} ${call.url}`);
      } else {
        console.log(`   📡 Response: ${call.status}`);
      }
    });
    
    if (apiCalls.length === 0) {
      console.log('❌ No Sleeper API calls detected');
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    await page.screenshot({ path: 'test-screenshots/error-final.png', fullPage: true });
  }
  
  console.log('⏱️  Keeping browser open for 10 seconds for manual inspection...');
  await page.waitForTimeout(10000);
  
  await browser.close();
  console.log('🏁 Test completed');
})();

// Helper function for expect (simplified version)
async function expect(locator) {
  return {
    toBeVisible: async () => {
      const isVisible = await locator.isVisible();
      if (!isVisible) {
        throw new Error(`Element not visible: ${locator}`);
      }
      return true;
    }
  };
}