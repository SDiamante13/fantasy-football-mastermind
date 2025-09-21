const { chromium } = require('playwright');
const fs = require('fs');

async function finalWaiversTest() {
  console.log('Starting final comprehensive waivers test...');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  const findings = {
    demoModeAnalysis: {},
    myLeaguesAnalysis: {},
    usabilityIssues: [],
    accuracyIssues: [],
    screenshots: [],
    overallAssessment: ''
  };

  try {
    // Navigate to waivers
    console.log('Navigating to waivers page...');
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
    await page.click('text=Waivers');
    await page.waitForTimeout(2000);

    findings.screenshots.push('01-waiver-page-initial.png');
    await page.screenshot({ path: 'screenshots/01-waiver-page-initial.png', fullPage: true });

    // Get current page content
    let pageContent = await page.textContent('body');
    console.log('Initial waiver page content preview:', pageContent.substring(0, 200) + '...');

    // Test Demo Mode (should be active by default)
    console.log('\n=== ANALYZING DEMO MODE ===');

    // Ensure we're in demo mode by clicking the button if needed
    try {
      const demoButton = page.locator('button:has-text("Demo Mode")').first();
      if (await demoButton.isVisible()) {
        await demoButton.click();
        await page.waitForTimeout(2000);
        findings.screenshots.push('02-demo-mode-active.png');
        await page.screenshot({ path: 'screenshots/02-demo-mode-active.png', fullPage: true });
      }
    } catch (e) {
      console.log('Demo mode button click failed or not needed:', e.message);
    }

    // Extract player recommendations from demo mode
    pageContent = await page.textContent('body');

    // Look for player names (common NFL names)
    const playerNames = pageContent.match(/(?:Jaylen Warren|Quentin Johnston|[A-Z][a-z]+ [A-Z][a-z]+)/g) || [];
    console.log('Found player names:', playerNames);

    // Extract ownership percentages
    const ownershipData = pageContent.match(/(\d+)% owned/g) || [];
    console.log('Found ownership data:', ownershipData);

    // Extract FAAB bids
    const faabData = pageContent.match(/Bid: \$(\d+)/g) || [];
    console.log('Found FAAB data:', faabData);

    // Extract positions and teams
    const positionTeamData = pageContent.match(/\b(RB|WR|QB|TE|K|DST)\s+([A-Z]{2,4})\b/g) || [];
    console.log('Found position/team data:', positionTeamData);

    findings.demoModeAnalysis = {
      playerNames,
      ownershipData,
      faabData,
      positionTeamData,
      fullContent: pageContent.length > 1000 ? pageContent.substring(0, 1000) + '...' : pageContent
    };

    // Analyze demo mode data for issues
    ownershipData.forEach(ownership => {
      const percentage = parseInt(ownership.match(/(\d+)/)[1]);
      if (percentage > 100) {
        findings.accuracyIssues.push(`Invalid ownership percentage in demo mode: ${ownership}`);
      }
      if (percentage === 0) {
        findings.accuracyIssues.push(`Zero ownership in demo mode might be unrealistic: ${ownership}`);
      }
    });

    faabData.forEach(faab => {
      const amount = parseInt(faab.match(/\$(\d+)/)[1]);
      if (amount > 200) {
        findings.accuracyIssues.push(`Very high FAAB suggestion in demo mode: ${faab}`);
      }
      if (amount === 0) {
        findings.accuracyIssues.push(`Zero FAAB bid in demo mode: ${faab}`);
      }
    });

    // Test My Leagues mode
    console.log('\n=== TESTING MY LEAGUES MODE ===');

    try {
      const myLeaguesButton = page.locator('button:has-text("My Leagues")').first();
      if (await myLeaguesButton.isVisible()) {
        console.log('Clicking My Leagues button...');
        await myLeaguesButton.click();
        await page.waitForTimeout(2000);

        findings.screenshots.push('03-my-leagues-mode.png');
        await page.screenshot({ path: 'screenshots/03-my-leagues-mode.png', fullPage: true });

        // Look for username input
        const usernameInput = page.locator('input[type="text"]').first();
        if (await usernameInput.isVisible()) {
          console.log('Found username input, testing with "gaspjr"...');
          await usernameInput.fill('gaspjr');

          findings.screenshots.push('04-username-entered.png');
          await page.screenshot({ path: 'screenshots/04-username-entered.png', fullPage: true });

          // Submit the form
          await usernameInput.press('Enter');
          console.log('Submitted username, waiting for response...');

          // Wait and check for different possible states
          await page.waitForTimeout(5000);

          findings.screenshots.push('05-after-username-submit.png');
          await page.screenshot({ path: 'screenshots/05-after-username-submit.png', fullPage: true });

          const afterSubmitContent = await page.textContent('body');

          if (afterSubmitContent.includes('Loading') || afterSubmitContent.includes('loading')) {
            console.log('Still loading, waiting more...');
            await page.waitForTimeout(5000);

            findings.screenshots.push('06-after-extended-wait.png');
            await page.screenshot({ path: 'screenshots/06-after-extended-wait.png', fullPage: true });
          }

          // Check for error states
          if (afterSubmitContent.toLowerCase().includes('error') ||
              afterSubmitContent.toLowerCase().includes('failed') ||
              afterSubmitContent.toLowerCase().includes('not found')) {
            findings.usabilityIssues.push('Error state encountered when submitting username "gaspjr"');
            console.log('Error state detected');
          }

          // Check for league selection
          const leagueSelectElement = page.locator('select, .league-selector').first();
          if (await leagueSelectElement.isVisible()) {
            console.log('League selector found, testing selection...');

            findings.screenshots.push('07-league-selector-found.png');
            await page.screenshot({ path: 'screenshots/07-league-selector-found.png', fullPage: true });

            // Get options
            if (await page.locator('select').first().isVisible()) {
              const options = await page.locator('select option').allTextContents();
              console.log('League options:', options);
              findings.myLeaguesAnalysis.availableLeagues = options;

              // Select first real league (skip "Select league" option)
              if (options.length > 1) {
                await page.locator('select').first().selectOption({ index: 1 });
                await page.waitForTimeout(3000);

                findings.screenshots.push('08-league-selected.png');
                await page.screenshot({ path: 'screenshots/08-league-selected.png', fullPage: true });

                // Analyze recommendations after league selection
                const leagueContent = await page.textContent('body');
                const leaguePlayerNames = leagueContent.match(/(?:[A-Z][a-z]+ [A-Z][a-z]+)/g) || [];
                const leagueOwnership = leagueContent.match(/(\d+)% owned/g) || [];
                const leagueFaab = leagueContent.match(/Bid: \$(\d+)/g) || [];

                findings.myLeaguesAnalysis = {
                  ...findings.myLeaguesAnalysis,
                  playerNames: leaguePlayerNames,
                  ownershipData: leagueOwnership,
                  faabData: leagueFaab,
                  contentAfterLeagueSelection: leagueContent.length > 500 ? leagueContent.substring(0, 500) + '...' : leagueContent
                };

                console.log('League mode player names:', leaguePlayerNames);
                console.log('League mode ownership:', leagueOwnership);
                console.log('League mode FAAB:', leagueFaab);
              }
            }
          } else {
            console.log('No league selector found');
            findings.usabilityIssues.push('No league selector found after successful username submission');
          }

          findings.myLeaguesAnalysis.usernameTestSuccessful = true;

        } else {
          console.log('No username input found in My Leagues mode');
          findings.usabilityIssues.push('No username input field found in My Leagues mode');
          findings.myLeaguesAnalysis.usernameInputFound = false;
        }
      } else {
        console.log('My Leagues button not found');
        findings.usabilityIssues.push('My Leagues button not accessible');
      }
    } catch (e) {
      console.log('Error testing My Leagues mode:', e.message);
      findings.usabilityIssues.push(`Error in My Leagues mode: ${e.message}`);
    }

    // Check for general usability issues
    console.log('\n=== USABILITY ANALYSIS ===');

    // Check if there are any obvious UI issues
    const currentContent = await page.textContent('body');

    if (currentContent.length < 100) {
      findings.usabilityIssues.push('Very little content displayed - possible loading or error state');
    }

    if (!currentContent.toLowerCase().includes('waiver') && !currentContent.toLowerCase().includes('wire')) {
      findings.usabilityIssues.push('No waiver-related content visible on waiver page');
    }

    // Final comprehensive screenshot
    findings.screenshots.push('09-final-comprehensive.png');
    await page.screenshot({ path: 'screenshots/09-final-comprehensive.png', fullPage: true });

    // Overall assessment
    let assessment = 'FINDINGS SUMMARY:\n';
    assessment += `- Demo mode functional: ${findings.demoModeAnalysis.playerNames.length > 0}\n`;
    assessment += `- Username input available: ${findings.myLeaguesAnalysis.usernameInputFound !== false}\n`;
    assessment += `- League selection working: ${findings.myLeaguesAnalysis.availableLeagues?.length > 0}\n`;
    assessment += `- Usability issues found: ${findings.usabilityIssues.length}\n`;
    assessment += `- Accuracy issues found: ${findings.accuracyIssues.length}\n`;

    findings.overallAssessment = assessment;

    console.log('\n' + assessment);

    // Save results
    fs.writeFileSync('waiver-test-findings.json', JSON.stringify(findings, null, 2));
    console.log('Findings saved to waiver-test-findings.json');

    return findings;

  } catch (error) {
    console.error('Critical error during testing:', error);
    findings.usabilityIssues.push(`Critical error: ${error.message}`);
    await page.screenshot({ path: 'screenshots/critical-error-final.png', fullPage: true });
    return findings;
  } finally {
    await browser.close();
  }
}

// Ensure screenshots directory exists
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

finalWaiversTest().catch(console.error);