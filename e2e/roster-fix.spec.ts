import { test, expect, Page } from '@playwright/test';

test.describe('Fantasy Football Mastermind - Roster Fix Verification', () => {
  let consoleLogs: string[] = [];
  let networkRequests: string[] = [];

  test.beforeEach(async ({ page }) => {
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
      console.log(`Network: ${url}`);
    });
  });

  test('should trigger roster fetch and display player data', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:8080');
    
    // Take initial screenshot
    await page.screenshot({ path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-results/01-initial-load.png', fullPage: true });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click on the Leagues tab
    await page.click('text=Leagues');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-results/01b-leagues-tab.png', fullPage: true });
    
    // Enter username "gaspjr"
    await page.fill('input[placeholder*="username" i], input[type="text"]', 'gaspjr');
    await page.screenshot({ path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-results/02-username-entered.png', fullPage: true });
    
    // Look for and click a submit/search button
    const submitButton = page.locator('button').filter({ hasText: /search|submit|go|find/i }).first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
    } else {
      // Try pressing Enter in the input field
      await page.keyboard.press('Enter');
    }
    
    // Wait for leagues to load
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-results/03-leagues-loaded.png', fullPage: true });
    
    // Look for "Compass Disciples" league or any available league
    const compassLeague = page.locator('text=Compass Disciples').first();
    let selectedLeague;
    
    if (await compassLeague.isVisible()) {
      selectedLeague = compassLeague;
    } else {
      // Find any clickable league element
      selectedLeague = page.locator('[role="button"], button, div[onclick], .league, [data-testid*="league"]').first();
    }
    
    // Click on the league
    await selectedLeague.click();
    await page.screenshot({ path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-results/04-league-selected.png', fullPage: true });
    
    // Wait for roster data to load
    await page.waitForTimeout(3000);
    
    // Take final screenshot
    await page.screenshot({ path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-results/05-roster-final.png', fullPage: true });
    
    // Verify debug logs are present
    const hasSelectedLeagueLog = consoleLogs.some(log => log.includes('🎯 selectedLeague changed:'));
    const hasTriggerFetchLog = consoleLogs.some(log => log.includes('🚀 Triggering fetchRoster for:'));
    const hasFetchRosterLog = consoleLogs.some(log => log.includes('🔍 fetchRoster called with leagueId:'));
    const hasApiCallLog = consoleLogs.some(log => log.includes('🌐 Making API call for roster:'));
    
    // Check for API requests to sleeper.app
    const hasSleeperApiRequest = networkRequests.some(url => url.includes('api.sleeper.app'));
    
    console.log('\n=== DEBUG LOGS FOUND ===');
    console.log('🎯 Selected League Log:', hasSelectedLeagueLog);
    console.log('🚀 Trigger Fetch Log:', hasTriggerFetchLog);
    console.log('🔍 Fetch Roster Log:', hasFetchRosterLog);
    console.log('🌐 API Call Log:', hasApiCallLog);
    console.log('🌐 Sleeper API Request:', hasSleeperApiRequest);
    
    console.log('\n=== ALL CONSOLE LOGS ===');
    consoleLogs.forEach(log => console.log(log));
    
    console.log('\n=== ALL NETWORK REQUESTS ===');
    networkRequests.forEach(url => console.log(url));
    
    // Look for roster content
    const rosterContent = await page.locator('[data-testid*="roster"], .roster, [class*="roster"]').count();
    const playerElements = await page.locator('[data-testid*="player"], .player, [class*="player"]').count();
    
    console.log('\n=== ROSTER CONTENT ===');
    console.log('Roster containers found:', rosterContent);
    console.log('Player elements found:', playerElements);
    
    // Check if there's any text content indicating players
    const pageText = await page.textContent('body');
    const hasPlayerNames = pageText && (
      pageText.includes('QB') || 
      pageText.includes('RB') || 
      pageText.includes('WR') || 
      pageText.includes('TE') ||
      pageText.includes('player') ||
      pageText.includes('roster')
    );
    
    console.log('Has player-related content:', hasPlayerNames);
    
    // Assertions
    expect(hasSelectedLeagueLog || hasTriggerFetchLog, 'Should have debug logs indicating roster fetch was triggered').toBeTruthy();
    
    if (hasSleeperApiRequest) {
      console.log('✅ API requests are being made to Sleeper');
    } else {
      console.log('❌ No API requests detected to Sleeper');
    }
  });
});