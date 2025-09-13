import { test, expect, Page } from '@playwright/test';

test.describe('Manual Roster Fix Verification', () => {
  test('Manual verification of roster fix for gaspjr', async ({ page }) => {
    console.log('🧪 Manual verification starting...');
    
    // Navigate to the application
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-results/manual-01-homepage.png', 
      fullPage: true 
    });
    
    // Click on Leagues tab
    await page.click('text=Leagues');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-results/manual-02-leagues-tab.png', 
      fullPage: true 
    });
    
    // Enter username "gaspjr"
    await page.fill('input[placeholder*="username" i]', 'gaspjr');
    
    await page.screenshot({ 
      path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-results/manual-03-username-entered.png', 
      fullPage: true 
    });
    
    // Submit the form
    await page.click('button:has-text("Get Leagues")');
    
    // Wait for user info to load
    await page.waitForTimeout(5000);
    
    await page.screenshot({ 
      path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-results/manual-04-user-and-leagues-loaded.png', 
      fullPage: true 
    });
    
    // Click on "DJT For Prison 2024" league
    await page.click('text=DJT For Prison 2024');
    
    // Wait for roster to load completely
    await page.waitForTimeout(5000);
    
    await page.screenshot({ 
      path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-results/manual-05-djt-roster-loaded.png', 
      fullPage: true 
    });
    
    // Get player card elements more specifically
    const playerCards = await page.locator('div[style*="backgroundColor: white"]:has(h4):has(span)').count();
    console.log(`🔢 Player cards found: ${playerCards}`);
    
    // Get all text content from player cards only
    const allText = await page.textContent('body');
    console.log('📄 Full page text length:', allText?.length);
    
    // Try to scroll to see all players
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-results/manual-06-djt-roster-scrolled.png', 
      fullPage: true 
    });
    
    // Click on Compass Disciples if available
    const compassLeague = await page.locator('text=Compass Disciples').count();
    if (compassLeague > 0) {
      console.log('🎯 Testing Compass Disciples league...');
      await page.click('text=Compass Disciples');
      await page.waitForTimeout(5000);
      
      await page.screenshot({ 
        path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-results/manual-07-compass-roster.png', 
        fullPage: true 
      });
      
      // Scroll to see all players
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-results/manual-08-compass-roster-scrolled.png', 
        fullPage: true 
      });
    }
    
    console.log('✅ Manual verification completed - check screenshots for results');
  });
});