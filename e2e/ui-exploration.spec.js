const { test, expect } = require('@playwright/test');

test('explore current UI structure', async ({ page }) => {
  console.log('🔍 Exploring current UI structure...');
  
  // Navigate to the application
  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
  
  // Take initial screenshot
  await page.screenshot({ 
    path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-screenshots/ui-exploration-initial.png',
    fullPage: true 
  });
  
  // Get page title
  const title = await page.title();
  console.log(`📄 Page title: "${title}"`);
  
  // Get all input elements
  const inputs = await page.locator('input').all();
  console.log(`📝 Found ${inputs.length} input elements`);
  
  for (let i = 0; i < inputs.length; i++) {
    try {
      const placeholder = await inputs[i].getAttribute('placeholder');
      const type = await inputs[i].getAttribute('type');
      const id = await inputs[i].getAttribute('id');
      const className = await inputs[i].getAttribute('class');
      console.log(`Input ${i + 1}: type="${type}", placeholder="${placeholder}", id="${id}", class="${className}"`);
    } catch (error) {
      console.log(`Input ${i + 1}: Could not get attributes`);
    }
  }
  
  // Get all button elements
  const buttons = await page.locator('button').all();
  console.log(`🔘 Found ${buttons.length} button elements`);
  
  for (let i = 0; i < buttons.length; i++) {
    try {
      const text = await buttons[i].textContent();
      const type = await buttons[i].getAttribute('type');
      const className = await buttons[i].getAttribute('class');
      console.log(`Button ${i + 1}: text="${text?.trim()}", type="${type}", class="${className}"`);
    } catch (error) {
      console.log(`Button ${i + 1}: Could not get attributes`);
    }
  }
  
  // Get the entire body text content to understand what's on the page
  const bodyText = await page.locator('body').textContent();
  console.log(`📃 Page content preview: "${bodyText?.substring(0, 200)}..."`);
  
  // Look for any text that mentions username, leagues, etc.
  const relevantText = bodyText?.toLowerCase();
  if (relevantText) {
    const keywords = ['username', 'league', 'sleeper', 'player', 'roster', 'fantasy'];
    keywords.forEach(keyword => {
      if (relevantText.includes(keyword)) {
        console.log(`🎯 Found keyword "${keyword}" in page content`);
      }
    });
  }
  
  // Get all clickable elements
  const clickables = await page.locator('button, [role="button"], a, input[type="submit"]').all();
  console.log(`👆 Found ${clickables.length} clickable elements`);
  
  // Wait a bit and take another screenshot
  await page.waitForTimeout(2000);
  await page.screenshot({ 
    path: '/Users/stevendiamante/personal/fantasy-football-mastermind/test-screenshots/ui-exploration-final.png',
    fullPage: true 
  });
});