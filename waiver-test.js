const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testWaiversFeature() {
  console.log('Starting waivers feature test...');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // Slow down actions for better observation
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  try {
    // Navigate to the application
    console.log('Navigating to http://localhost:8080/');
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });

    // Take initial screenshot
    await page.screenshot({ path: 'screenshots/01-initial-page.png', fullPage: true });
    console.log('Initial page loaded');

    // Look for waivers/waiver wire navigation
    console.log('Looking for waivers navigation...');

    // Try to find various waiver-related elements
    const possibleSelectors = [
      'text=Waivers',
      'text=Waiver Wire',
      'text=waiver',
      '[href*="waiver"]',
      '[data-testid*="waiver"]',
      'a:has-text("Waiver")',
      'button:has-text("Waiver")'
    ];

    let waiversElement = null;
    for (const selector of possibleSelectors) {
      try {
        waiversElement = await page.locator(selector).first();
        if (await waiversElement.isVisible()) {
          console.log(`Found waivers element with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    if (!waiversElement || !(await waiversElement.isVisible())) {
      // If no direct waiver navigation found, look for menu or navigation elements
      console.log('No direct waiver navigation found, looking for menus...');

      // Check for hamburger menu, navigation menu, etc.
      const menuSelectors = [
        '[data-testid="menu"]',
        '.menu',
        '.nav',
        '.navigation',
        'button[aria-label*="menu"]',
        '[role="navigation"]'
      ];

      for (const menuSelector of menuSelectors) {
        try {
          const menu = await page.locator(menuSelector);
          if (await menu.isVisible()) {
            console.log(`Found menu with selector: ${menuSelector}`);
            await menu.click();
            await page.waitForTimeout(1000);

            // Now look for waivers in the opened menu
            for (const selector of possibleSelectors) {
              try {
                waiversElement = await page.locator(selector).first();
                if (await waiversElement.isVisible()) {
                  console.log(`Found waivers element in menu with selector: ${selector}`);
                  break;
                }
              } catch (e) {
                // Continue
              }
            }
            break;
          }
        } catch (e) {
          // Continue to next menu selector
        }
      }
    }

    if (waiversElement && await waiversElement.isVisible()) {
      console.log('Clicking on waivers navigation...');
      await waiversElement.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/02-after-waiver-click.png', fullPage: true });
    } else {
      console.log('Could not find waivers navigation. Taking screenshot of current page...');
      await page.screenshot({ path: 'screenshots/02-no-waiver-nav-found.png', fullPage: true });

      // Try to navigate directly to potential waiver URLs
      const potentialUrls = [
        'http://localhost:8080/waivers',
        'http://localhost:8080/waiver-wire',
        'http://localhost:8080/waiver',
        'http://localhost:8080/#/waivers',
        'http://localhost:8080/#/waiver-wire'
      ];

      for (const url of potentialUrls) {
        try {
          console.log(`Trying direct navigation to: ${url}`);
          await page.goto(url, { waitUntil: 'networkidle' });
          await page.waitForTimeout(1000);

          // Check if we're on a waiver page (not 404 or redirect)
          const pageContent = await page.textContent('body');
          if (pageContent.toLowerCase().includes('waiver') || pageContent.toLowerCase().includes('wire')) {
            console.log(`Successfully navigated to waivers at: ${url}`);
            await page.screenshot({ path: 'screenshots/03-direct-waiver-navigation.png', fullPage: true });
            break;
          }
        } catch (e) {
          console.log(`Failed to navigate to ${url}: ${e.message}`);
        }
      }
    }

    // Look for username input
    console.log('Looking for username input...');
    const usernameSelectors = [
      'input[placeholder*="username"]',
      'input[placeholder*="Username"]',
      'input[name="username"]',
      'input[id="username"]',
      'input[type="text"]',
      '[data-testid*="username"]'
    ];

    let usernameInput = null;
    for (const selector of usernameSelectors) {
      try {
        usernameInput = await page.locator(selector).first();
        if (await usernameInput.isVisible()) {
          console.log(`Found username input with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    if (usernameInput && await usernameInput.isVisible()) {
      console.log('Entering username "gaspjr"...');
      await usernameInput.fill('gaspjr');
      await page.screenshot({ path: 'screenshots/04-username-entered.png', fullPage: true });

      // Look for submit button or form submission
      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Submit")',
        'button:has-text("Load")',
        'button:has-text("Go")',
        'button:has-text("Search")',
        '[data-testid*="submit"]'
      ];

      let submitButton = null;
      for (const selector of submitSelectors) {
        try {
          submitButton = await page.locator(selector).first();
          if (await submitButton.isVisible()) {
            console.log(`Found submit button with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue
        }
      }

      if (submitButton && await submitButton.isVisible()) {
        console.log('Clicking submit button...');
        await submitButton.click();
        await page.waitForTimeout(3000); // Wait for loading
        await page.screenshot({ path: 'screenshots/05-after-submit.png', fullPage: true });
      } else {
        // Try pressing Enter
        console.log('No submit button found, trying Enter key...');
        await usernameInput.press('Enter');
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'screenshots/05-after-enter.png', fullPage: true });
      }
    } else {
      console.log('No username input found');
      await page.screenshot({ path: 'screenshots/04-no-username-input.png', fullPage: true });
    }

    // Look for leagues or recommendations
    console.log('Looking for leagues or recommendations...');
    await page.waitForTimeout(2000);

    // Check for any league selection
    const leagueSelectors = [
      'text=League',
      'text=league',
      '[data-testid*="league"]',
      '.league',
      'select'
    ];

    for (const selector of leagueSelectors) {
      try {
        const element = await page.locator(selector);
        if (await element.isVisible()) {
          console.log(`Found league element with selector: ${selector}`);
          await page.screenshot({ path: 'screenshots/06-league-found.png', fullPage: true });

          // If it's a select, click on it to see options
          if (selector === 'select') {
            await element.click();
            await page.waitForTimeout(1000);
            await page.screenshot({ path: 'screenshots/07-league-options.png', fullPage: true });
          }
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    // Look for player recommendations
    console.log('Looking for player recommendations...');
    const playerSelectors = [
      'text=Player',
      'text=player',
      '[data-testid*="player"]',
      '.player',
      'table tr',
      '.recommendation',
      '[data-testid*="recommendation"]'
    ];

    let playersFound = false;
    for (const selector of playerSelectors) {
      try {
        const elements = await page.locator(selector);
        const count = await elements.count();
        if (count > 0) {
          console.log(`Found ${count} elements with selector: ${selector}`);
          playersFound = true;
          await page.screenshot({ path: 'screenshots/08-players-found.png', fullPage: true });

          // Get text content of first few players for analysis
          for (let i = 0; i < Math.min(3, count); i++) {
            try {
              const text = await elements.nth(i).textContent();
              console.log(`Player ${i + 1}: ${text}`);
            } catch (e) {
              // Continue
            }
          }
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    if (!playersFound) {
      console.log('No player recommendations found');
      await page.screenshot({ path: 'screenshots/08-no-players-found.png', fullPage: true });
    }

    // Look for FAAB values, ownership percentages
    console.log('Looking for FAAB and ownership data...');
    const dataSelectors = [
      'text=%',
      'text=$',
      '[data-testid*="faab"]',
      '[data-testid*="ownership"]',
      '.faab',
      '.ownership',
      '.percentage'
    ];

    for (const selector of dataSelectors) {
      try {
        const elements = await page.locator(selector);
        const count = await elements.count();
        if (count > 0) {
          console.log(`Found ${count} data elements with selector: ${selector}`);
          for (let i = 0; i < Math.min(3, count); i++) {
            try {
              const text = await elements.nth(i).textContent();
              console.log(`Data ${i + 1}: ${text}`);
            } catch (e) {
              // Continue
            }
          }
        }
      } catch (e) {
        // Continue
      }
    }

    // Final comprehensive screenshot
    await page.screenshot({ path: 'screenshots/09-final-state.png', fullPage: true });

    // Get page content for analysis
    const pageContent = await page.content();
    fs.writeFileSync('page-content.html', pageContent);

    console.log('Test completed. Screenshots saved to screenshots/ directory');

  } catch (error) {
    console.error('Error during testing:', error);
    await page.screenshot({ path: 'screenshots/error-state.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Create screenshots directory
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

testWaiversFeature().catch(console.error);