const { chromium } = require('playwright');
const fs = require('fs');

async function detailedWaiversTest() {
  console.log('Starting detailed waivers test...');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1500
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  const testResults = {
    demoMode: {},
    myLeagues: {},
    usabilityIssues: [],
    accuracyIssues: [],
    screenshots: []
  };

  try {
    // Navigate to waivers page
    console.log('Navigating to waivers page...');
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
    await page.click('text=Waivers');
    await page.waitForTimeout(2000);

    testResults.screenshots.push('waiver-page-loaded.png');
    await page.screenshot({ path: `screenshots/waiver-page-loaded.png`, fullPage: true });

    // Test Demo Mode first
    console.log('\n=== TESTING DEMO MODE ===');

    // Check if already in demo mode or click demo mode button
    const demoButton = page.locator('text=Demo Mode');
    if (await demoButton.isVisible()) {
      await demoButton.click();
      await page.waitForTimeout(2000);
    }

    testResults.screenshots.push('demo-mode-active.png');
    await page.screenshot({ path: `screenshots/demo-mode-active.png`, fullPage: true });

    // Analyze demo mode content
    console.log('Analyzing demo mode recommendations...');

    const players = await page.locator('[data-testid="player-card"], .player-card, .player').all();

    for (let i = 0; i < players.length; i++) {
      try {
        const playerText = await players[i].textContent();
        console.log(`Demo Player ${i + 1}: ${playerText}`);

        // Extract player details
        const playerData = {
          fullText: playerText,
          name: '',
          position: '',
          team: '',
          ownership: '',
          faabBid: ''
        };

        // Try to find specific elements within player card
        try {
          const nameElement = await players[i].locator('h3, .player-name, [data-testid="player-name"]').first();
          if (await nameElement.isVisible()) {
            playerData.name = await nameElement.textContent();
          }
        } catch (e) {}

        try {
          const ownershipElement = await players[i].locator('text=/\\d+% owned/').first();
          if (await ownershipElement.isVisible()) {
            playerData.ownership = await ownershipElement.textContent();
          }
        } catch (e) {}

        try {
          const faabElement = await players[i].locator('text=/Bid: \\$\\d+/').first();
          if (await faabElement.isVisible()) {
            playerData.faabBid = await faabElement.textContent();
          }
        } catch (e) {}

        testResults.demoMode[`player${i + 1}`] = playerData;
      } catch (e) {
        console.log(`Error analyzing player ${i + 1}: ${e.message}`);
      }
    }

    // Test My Leagues mode
    console.log('\n=== TESTING MY LEAGUES MODE ===');

    const myLeaguesButton = page.locator('text=My Leagues');
    if (await myLeaguesButton.isVisible()) {
      await myLeaguesButton.click();
      await page.waitForTimeout(2000);

      testResults.screenshots.push('my-leagues-clicked.png');
      await page.screenshot({ path: `screenshots/my-leagues-clicked.png`, fullPage: true });

      // Look for username input
      console.log('Looking for username input in My Leagues mode...');

      const usernameSelectors = [
        'input[placeholder*="username"]',
        'input[placeholder*="Username"]',
        'input[placeholder*="Sleeper"]',
        'input[name="username"]',
        'input[id="username"]',
        'input[type="text"]'
      ];

      let usernameInput = null;
      for (const selector of usernameSelectors) {
        try {
          const element = page.locator(selector);
          if (await element.isVisible()) {
            usernameInput = element;
            console.log(`Found username input: ${selector}`);
            break;
          }
        } catch (e) {}
      }

      if (usernameInput) {
        console.log('Testing username input with "gaspjr"...');
        await usernameInput.fill('gaspjr');

        testResults.screenshots.push('username-entered.png');
        await page.screenshot({ path: `screenshots/username-entered.png`, fullPage: true });

        // Look for submit button or enter key
        const submitButton = page.locator('button[type="submit"], button:has-text("Load"), button:has-text("Submit"), button:has-text("Go")');

        if (await submitButton.first().isVisible()) {
          console.log('Clicking submit button...');
          await submitButton.first().click();
        } else {
          console.log('No submit button found, pressing Enter...');
          await usernameInput.press('Enter');
        }

        await page.waitForTimeout(5000); // Wait for API call

        testResults.screenshots.push('after-username-submit.png');
        await page.screenshot({ path: `screenshots/after-username-submit.png`, fullPage: true });

        // Check for loading states, errors, or results
        const pageText = await page.textContent('body');

        if (pageText.includes('Loading') || pageText.includes('loading')) {
          console.log('Loading state detected, waiting longer...');
          await page.waitForTimeout(5000);

          testResults.screenshots.push('after-loading.png');
          await page.screenshot({ path: `screenshots/after-loading.png`, fullPage: true });
        }

        if (pageText.includes('Error') || pageText.includes('error') || pageText.includes('failed')) {
          console.log('Error state detected');
          testResults.usabilityIssues.push('Error message displayed after username submission');

          // Try to capture error message
          try {
            const errorElement = page.locator('text=/error/i, text=/Error/i, .error, [data-testid*="error"]').first();
            if (await errorElement.isVisible()) {
              const errorText = await errorElement.textContent();
              testResults.myLeagues.error = errorText;
              console.log(`Error message: ${errorText}`);
            }
          } catch (e) {}
        }

        // Look for league selection
        console.log('Looking for league selection...');
        const leagueElements = await page.locator('select, .league-option, [data-testid*="league"]').all();

        if (leagueElements.length > 0) {
          console.log(`Found ${leagueElements.length} league-related elements`);

          for (let i = 0; i < Math.min(3, leagueElements.length); i++) {
            try {
              const leagueText = await leagueElements[i].textContent();
              console.log(`League element ${i + 1}: ${leagueText}`);
              testResults.myLeagues[`league${i + 1}`] = leagueText;
            } catch (e) {}
          }

          // If there's a select dropdown, try to select the first option
          const selectElement = page.locator('select').first();
          if (await selectElement.isVisible()) {
            console.log('Found league select dropdown, selecting first option...');
            await selectElement.selectOption({ index: 1 }); // Skip "Select league" option
            await page.waitForTimeout(3000);

            testResults.screenshots.push('league-selected.png');
            await page.screenshot({ path: `screenshots/league-selected.png`, fullPage: true });
          }
        }

        // Analyze recommendations in My Leagues mode
        console.log('Analyzing My Leagues mode recommendations...');
        const myLeaguesPlayers = await page.locator('[data-testid="player-card"], .player-card, .player').all();

        for (let i = 0; i < myLeaguesPlayers.length; i++) {
          try {
            const playerText = await myLeaguesPlayers[i].textContent();
            console.log(`My Leagues Player ${i + 1}: ${playerText}`);
            testResults.myLeagues[`player${i + 1}`] = playerText;
          } catch (e) {
            console.log(`Error analyzing My Leagues player ${i + 1}: ${e.message}`);
          }
        }

      } else {
        console.log('No username input found in My Leagues mode');
        testResults.usabilityIssues.push('No username input field found in My Leagues mode');
      }
    }

    // Final screenshot
    testResults.screenshots.push('final-state.png');
    await page.screenshot({ path: `screenshots/final-state.png`, fullPage: true });

    // Analyze for specific accuracy issues
    console.log('\n=== ANALYZING FOR ACCURACY ISSUES ===');

    // Check if ownership percentages make sense
    const currentPageText = await page.textContent('body');
    const ownershipMatches = currentPageText.match(/(\d+)% owned/g);

    if (ownershipMatches) {
      ownershipMatches.forEach(match => {
        const percentage = parseInt(match.match(/(\d+)/)[1]);
        if (percentage > 100) {
          testResults.accuracyIssues.push(`Invalid ownership percentage: ${match}`);
        }
        if (percentage < 1) {
          testResults.accuracyIssues.push(`Suspiciously low ownership: ${match}`);
        }
      });
    }

    // Check FAAB bids
    const faabMatches = currentPageText.match(/Bid: \$(\d+)/g);
    if (faabMatches) {
      faabMatches.forEach(match => {
        const bid = parseInt(match.match(/\$(\d+)/)[1]);
        if (bid > 200) {
          testResults.accuracyIssues.push(`Unusually high FAAB bid: ${match}`);
        }
        if (bid < 1) {
          testResults.accuracyIssues.push(`Suspiciously low FAAB bid: ${match}`);
        }
      });
    }

    console.log('\n=== TEST RESULTS ===');
    console.log('Demo Mode Data:', JSON.stringify(testResults.demoMode, null, 2));
    console.log('My Leagues Data:', JSON.stringify(testResults.myLeagues, null, 2));
    console.log('Usability Issues:', testResults.usabilityIssues);
    console.log('Accuracy Issues:', testResults.accuracyIssues);

    // Save test results
    fs.writeFileSync('test-results.json', JSON.stringify(testResults, null, 2));

  } catch (error) {
    console.error('Error during detailed testing:', error);
    testResults.usabilityIssues.push(`Critical error: ${error.message}`);
    await page.screenshot({ path: 'screenshots/critical-error.png', fullPage: true });
  } finally {
    await browser.close();
    return testResults;
  }
}

// Create screenshots directory
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

detailedWaiversTest().then(results => {
  console.log('Test completed successfully');
  console.log('Results saved to test-results.json');
}).catch(console.error);