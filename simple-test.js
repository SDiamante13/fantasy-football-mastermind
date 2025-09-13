const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Navigate to the app
  console.log('Navigating to http://localhost:8080...');
  await page.goto('http://localhost:8080');
  
  // Wait for page to load
  await page.waitForTimeout(2000);
  
  // Take initial screenshot
  await page.screenshot({ path: 'manual-test-1-initial.png', fullPage: true });
  console.log('Screenshot 1: Initial page loaded');
  
  // Get page title
  const title = await page.title();
  console.log('Page title:', title);
  
  // Find all h1 elements
  const h1Elements = await page.locator('h1').all();
  console.log('Number of h1 elements:', h1Elements.length);
  
  for (let i = 0; i < h1Elements.length; i++) {
    const text = await h1Elements[i].textContent();
    console.log(`H1 ${i + 1}:`, text);
  }
  
  // Look for the username input
  try {
    const usernameInput = page.locator('input[placeholder*="username"], input[aria-label*="username"], input[type="text"]');
    const inputCount = await usernameInput.count();
    console.log('Found', inputCount, 'input fields');
    
    if (inputCount > 0) {
      const placeholder = await usernameInput.first().getAttribute('placeholder');
      console.log('Input placeholder:', placeholder);
      
      // Try entering a username
      await usernameInput.first().fill('testuser');
      console.log('Entered username');
      
      // Look for submit button
      const submitButton = page.locator('button[type="submit"], button:has-text("Get"), button:has-text("Submit")');
      const buttonCount = await submitButton.count();
      console.log('Found', buttonCount, 'buttons');
      
      if (buttonCount > 0) {
        const buttonText = await submitButton.first().textContent();
        console.log('Button text:', buttonText);
        
        // Take screenshot before clicking
        await page.screenshot({ path: 'manual-test-2-before-submit.png', fullPage: true });
        console.log('Screenshot 2: Before submitting');
        
        // Click submit
        await submitButton.first().click();
        console.log('Clicked submit button');
        
        // Wait and take screenshot
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'manual-test-3-after-submit.png', fullPage: true });
        console.log('Screenshot 3: After submitting');
        
        // Check for any error messages or success messages
        const errorElements = await page.locator('[style*="background-color: #f8d7da"], .error, [class*="error"]').all();
        console.log('Error elements found:', errorElements.length);
        
        const successElements = await page.locator('[style*="background-color: #d4edda"], .success, [class*="success"]').all();
        console.log('Success elements found:', successElements.length);
        
        // Look for league elements
        const leagueElements = await page.locator('[role="button"][aria-label*="league"], .league, [class*="league"]').all();
        console.log('League elements found:', leagueElements.length);
        
        // Look for roster elements
        const rosterElements = await page.locator('h3:has-text("roster"), [class*="roster"], [style*="player"]').all();
        console.log('Roster elements found:', rosterElements.length);
      }
    }
  } catch (error) {
    console.error('Error during testing:', error.message);
    await page.screenshot({ path: 'manual-test-error.png', fullPage: true });
  }
  
  // Keep browser open for 10 seconds so we can see it
  console.log('Keeping browser open for 10 seconds...');
  await page.waitForTimeout(10000);
  
  await browser.close();
  console.log('Test completed');
})();