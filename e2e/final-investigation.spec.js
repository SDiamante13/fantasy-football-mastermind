const { test, expect } = require('@playwright/test');

test('final confirmation of player name issue', async ({ page }) => {
  console.log('🔍 Final investigation to confirm the player name issue...');
  
  let rosterCallMade = false;
  let rosterCallUrl = '';
  let rosterCallStatus = 0;
  
  // Track the specific roster API call
  page.on('request', request => {
    if (request.url().includes('/league/') && request.url().includes('/rosters')) {
      rosterCallMade = true;
      rosterCallUrl = request.url();
      console.log(`🎯 ROSTER API CALL DETECTED: ${request.url()}`);
    }
  });

  page.on('response', response => {
    if (response.url().includes('/league/') && response.url().includes('/rosters')) {
      rosterCallStatus = response.status();
      console.log(`📊 ROSTER API RESPONSE: ${response.url()} - Status: ${response.status()}`);
    }
  });

  // Navigate and set up
  await page.goto('http://localhost:8080');
  await page.locator('button:has-text("Leagues")').click();
  await page.locator('input[placeholder*="Sleeper username"]').fill('gaspjr');
  await page.locator('button:has-text("Get Leagues")').click();
  await page.waitForTimeout(3000);

  // Click on first league
  const leagueCards = page.locator('div:has-text("DJT For Prison"), div:has-text("Compass Disciples")').first();
  await leagueCards.click();
  
  // Wait for potential roster loading
  await page.waitForTimeout(5000);
  await page.waitForLoadState('networkidle');
  
  // Check if roster section appeared
  const rosterSection = page.locator('section:has-text("League Roster")');
  const rosterSectionVisible = await rosterSection.isVisible().catch(() => false);
  
  console.log(`📋 Roster section visible: ${rosterSectionVisible}`);
  console.log(`🌐 Roster API call made: ${rosterCallMade}`);
  
  if (rosterCallMade) {
    console.log(`📍 Roster API URL: ${rosterCallUrl}`);
    console.log(`📊 Roster API Status: ${rosterCallStatus}`);
  }
  
  // Take final screenshot
  await page.screenshot({ 
    path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-screenshots/final-investigation.png',
    fullPage: true 
  });
  
  // Final conclusion
  if (!rosterCallMade) {
    console.log('❌ CONFIRMED ISSUE: No roster API call is being made when league is selected');
    console.log('🔧 ROOT CAUSE: League selection is not triggering roster fetch');
  } else if (rosterCallStatus !== 200) {
    console.log(`❌ CONFIRMED ISSUE: Roster API call failed with status ${rosterCallStatus}`);
  } else if (!rosterSectionVisible) {
    console.log('❌ CONFIRMED ISSUE: Roster API succeeds but roster UI is not displaying');
  } else {
    console.log('✅ Roster API call and UI display working - issue may be in player name mapping');
  }
});