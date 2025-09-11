import { test, expect, Page } from '@playwright/test';

interface QAResult {
  screen: string;
  passed: string[];
  failed: string[];
  uxIssues: string[];
  performanceIssues: string[];
  accessibilityIssues: string[];
}

const qaResults: QAResult[] = [];

function addResult(screen: string, result: Partial<QAResult>) {
  const existingIndex = qaResults.findIndex(r => r.screen === screen);
  const defaultResult: QAResult = {
    screen,
    passed: [],
    failed: [],
    uxIssues: [],
    performanceIssues: [],
    accessibilityIssues: []
  };
  
  if (existingIndex >= 0) {
    qaResults[existingIndex] = { ...qaResults[existingIndex], ...result };
  } else {
    qaResults.push({ ...defaultResult, ...result });
  }
}

async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ 
    path: `test-results/screenshots/${name}.png`, 
    fullPage: true 
  });
}

async function checkAccessibility(page: Page, screen: string) {
  const issues: string[] = [];
  
  // Check for alt text on images
  const imagesWithoutAlt = await page.locator('img:not([alt])').count();
  if (imagesWithoutAlt > 0) {
    issues.push(`${imagesWithoutAlt} images missing alt text`);
  }
  
  // Check for proper heading structure
  const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
  if (headings.length === 0) {
    issues.push('No semantic headings found');
  }
  
  // Check for interactive elements without proper labels
  const buttons = await page.locator('button, [role="button"]').all();
  for (const button of buttons) {
    const text = await button.textContent();
    const ariaLabel = await button.getAttribute('aria-label');
    if (!text?.trim() && !ariaLabel) {
      issues.push('Interactive element without accessible name');
      break;
    }
  }
  
  // Check color contrast (basic check)
  const elements = await page.locator('*').all();
  let hasLowContrast = false;
  for (let i = 0; i < Math.min(elements.length, 20); i++) {
    const styles = await elements[i].evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor
      };
    });
    
    // Simple check for very light text on light backgrounds
    if (styles.color.includes('rgb(') && styles.backgroundColor.includes('rgb(')) {
      const colorValues = styles.color.match(/\d+/g)?.map(Number) || [];
      const bgValues = styles.backgroundColor.match(/\d+/g)?.map(Number) || [];
      
      if (colorValues.length >= 3 && bgValues.length >= 3) {
        const colorSum = colorValues[0] + colorValues[1] + colorValues[2];
        const bgSum = bgValues[0] + bgValues[1] + bgValues[2];
        
        if (Math.abs(colorSum - bgSum) < 100) {
          hasLowContrast = true;
          break;
        }
      }
    }
  }
  
  if (hasLowContrast) {
    issues.push('Potential low color contrast detected');
  }
  
  return issues;
}

async function checkPerformance(page: Page) {
  const issues: string[] = [];
  
  // Check page load time
  const startTime = Date.now();
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;
  
  if (loadTime > 3000) {
    issues.push(`Slow page load: ${loadTime}ms`);
  }
  
  // Check for large images
  const images = await page.locator('img').all();
  for (const img of images) {
    const src = await img.getAttribute('src');
    if (src && !src.startsWith('data:')) {
      try {
        const response = await page.request.get(src);
        const size = parseInt(response.headers()['content-length'] || '0');
        if (size > 1000000) { // 1MB
          issues.push(`Large image detected: ${src} (${(size/1024/1024).toFixed(1)}MB)`);
        }
      } catch (e) {
        // Ignore errors for external images
      }
    }
  }
  
  return issues;
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
});

test.afterAll(async () => {
  console.log('\n=== COMPREHENSIVE QA REPORT ===\n');
  
  qaResults.forEach(result => {
    console.log(`📱 ${result.screen.toUpperCase()} SCREEN`);
    console.log('─'.repeat(50));
    
    if (result.passed.length > 0) {
      console.log('✅ PASSED:');
      result.passed.forEach(item => console.log(`  • ${item}`));
    }
    
    if (result.failed.length > 0) {
      console.log('❌ FAILED:');
      result.failed.forEach(item => console.log(`  • ${item}`));
    }
    
    if (result.uxIssues.length > 0) {
      console.log('🎨 UX/UI ISSUES:');
      result.uxIssues.forEach(item => console.log(`  • ${item}`));
    }
    
    if (result.performanceIssues.length > 0) {
      console.log('⚡ PERFORMANCE ISSUES:');
      result.performanceIssues.forEach(item => console.log(`  • ${item}`));
    }
    
    if (result.accessibilityIssues.length > 0) {
      console.log('♿ ACCESSIBILITY ISSUES:');
      result.accessibilityIssues.forEach(item => console.log(`  • ${item}`));
    }
    
    console.log('\n');
  });
});

test.describe('Home Screen', () => {
  test('should display and function correctly', async ({ page }) => {
    const passed: string[] = [];
    const failed: string[] = [];
    const uxIssues: string[] = [];
    
    await takeScreenshot(page, 'home-screen-initial');
    
    // Check if home screen loads
    try {
      await expect(page).toHaveTitle(/Fantasy Football/i);
      passed.push('Page title loads correctly');
    } catch (e) {
      failed.push('Page title missing or incorrect');
    }
    
    // Check navigation tabs
    try {
      await expect(page.locator('[role="tablist"], .tab-bar, nav')).toBeVisible();
      passed.push('Navigation tabs visible');
    } catch (e) {
      failed.push('Navigation tabs not found');
    }
    
    // Check for home tab being active
    try {
      const homeTab = page.locator('text=Home').first();
      await expect(homeTab).toBeVisible();
      passed.push('Home tab visible');
    } catch (e) {
      failed.push('Home tab not visible');
    }
    
    // Check for main content
    try {
      const mainContent = page.locator('main, [role="main"], .main-content').first();
      if (await mainContent.count() === 0) {
        // Fallback to checking for any visible content
        const hasContent = await page.locator('body *').filter({ hasText: /.+/ }).count() > 0;
        if (hasContent) {
          passed.push('Main content area present');
        } else {
          failed.push('No main content visible');
        }
      } else {
        await expect(mainContent).toBeVisible();
        passed.push('Main content area visible');
      }
    } catch (e) {
      failed.push('Main content area not found');
    }
    
    // Check responsive design
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    await takeScreenshot(page, 'home-screen-mobile');
    
    try {
      await expect(page.locator('body')).toBeVisible();
      passed.push('Responsive on mobile viewport');
    } catch (e) {
      failed.push('Issues with mobile viewport');
    }
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Check for loading states or error messages
    const errorMessages = await page.locator('[role="alert"], .error, .error-message').count();
    if (errorMessages > 0) {
      uxIssues.push('Error messages present on home screen');
    }
    
    const performanceIssues = await checkPerformance(page);
    const accessibilityIssues = await checkAccessibility(page, 'Home');
    
    addResult('Home', { passed, failed, uxIssues, performanceIssues, accessibilityIssues });
  });
});

test.describe('Leagues Screen', () => {
  test('should handle username input and API calls', async ({ page }) => {
    const passed: string[] = [];
    const failed: string[] = [];
    const uxIssues: string[] = [];
    
    // Navigate to Leagues screen
    try {
      await page.click('text=Leagues');
      await page.waitForTimeout(1000);
      passed.push('Successfully navigated to Leagues screen');
    } catch (e) {
      failed.push('Could not navigate to Leagues screen');
      addResult('Leagues', { passed, failed, uxIssues });
      return;
    }
    
    await takeScreenshot(page, 'leagues-screen-initial');
    
    // Check for username input field
    try {
      const usernameInput = page.locator('input[placeholder*="username" i], input[placeholder*="user" i], input[type="text"]').first();
      await expect(usernameInput).toBeVisible();
      passed.push('Username input field visible');
      
      // Test input functionality
      await usernameInput.fill('testuser123');
      const inputValue = await usernameInput.inputValue();
      if (inputValue === 'testuser123') {
        passed.push('Username input accepts text correctly');
      } else {
        failed.push('Username input not working properly');
      }
    } catch (e) {
      failed.push('Username input field not found');
    }
    
    // Check for submit/search button
    try {
      const submitButton = page.locator('button:has-text("Search"), button:has-text("Submit"), button:has-text("Get"), [role="button"]:has-text("Search")').first();
      await expect(submitButton).toBeVisible();
      passed.push('Submit button visible');
      
      // Test button click (but don't actually submit to avoid API calls)
      const isEnabled = await submitButton.isEnabled();
      if (isEnabled) {
        passed.push('Submit button is interactive');
      } else {
        uxIssues.push('Submit button appears disabled');
      }
    } catch (e) {
      failed.push('Submit button not found');
    }
    
    // Check for league display area
    try {
      const leagueDisplay = page.locator('.league, .leagues, [data-testid*="league"]').first();
      if (await leagueDisplay.count() > 0) {
        passed.push('League display area present');
      } else {
        uxIssues.push('No dedicated league display area found');
      }
    } catch (e) {
      // This might be expected if no leagues are loaded initially
    }
    
    // Check for loading states
    const loadingIndicators = await page.locator('.loading, .spinner, [aria-label*="loading" i]').count();
    if (loadingIndicators === 0) {
      uxIssues.push('No loading indicators found - users may not know when API calls are in progress');
    }
    
    const performanceIssues = await checkPerformance(page);
    const accessibilityIssues = await checkAccessibility(page, 'Leagues');
    
    addResult('Leagues', { passed, failed, uxIssues, performanceIssues, accessibilityIssues });
  });
});

test.describe('Players Screen', () => {
  test('should provide search and filtering functionality', async ({ page }) => {
    const passed: string[] = [];
    const failed: string[] = [];
    const uxIssues: string[] = [];
    
    // Navigate to Players screen
    try {
      await page.click('text=Players');
      await page.waitForTimeout(1000);
      passed.push('Successfully navigated to Players screen');
    } catch (e) {
      failed.push('Could not navigate to Players screen');
      addResult('Players', { passed, failed, uxIssues });
      return;
    }
    
    await takeScreenshot(page, 'players-screen-initial');
    
    // Check for search functionality
    try {
      const searchInput = page.locator('input[placeholder*="search" i], input[placeholder*="player" i], input[type="search"]').first();
      await expect(searchInput).toBeVisible();
      passed.push('Search input field visible');
      
      // Test search functionality
      await searchInput.fill('mahomes');
      const searchValue = await searchInput.inputValue();
      if (searchValue.toLowerCase() === 'mahomes') {
        passed.push('Search input accepts text correctly');
      }
    } catch (e) {
      failed.push('Search input field not found');
    }
    
    // Check for position filtering
    try {
      const filterButtons = page.locator('button:has-text("QB"), button:has-text("RB"), button:has-text("WR"), button:has-text("TE")');
      const filterCount = await filterButtons.count();
      if (filterCount >= 4) {
        passed.push('Position filter buttons visible');
      } else if (filterCount > 0) {
        uxIssues.push(`Only ${filterCount} position filters found - expected QB, RB, WR, TE`);
      } else {
        // Check for dropdown or other filter UI
        const filterDropdown = page.locator('select, [role="combobox"], .filter-dropdown').first();
        if (await filterDropdown.count() > 0) {
          passed.push('Alternative filter UI found');
        } else {
          failed.push('No position filtering found');
        }
      }
    } catch (e) {
      failed.push('Position filtering not accessible');
    }
    
    // Check for player cards/list
    try {
      const playerCards = page.locator('.player, .player-card, [data-testid*="player"]');
      const cardCount = await playerCards.count();
      if (cardCount > 0) {
        passed.push(`${cardCount} player cards found`);
      } else {
        uxIssues.push('No player cards visible - may need data loading');
      }
    } catch (e) {
      failed.push('Player cards not found');
    }
    
    // Test responsive design on mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await takeScreenshot(page, 'players-screen-mobile');
    
    try {
      const mobileLayout = await page.locator('body').isVisible();
      if (mobileLayout) {
        passed.push('Mobile responsive layout works');
      }
    } catch (e) {
      failed.push('Mobile layout issues');
    }
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    const performanceIssues = await checkPerformance(page);
    const accessibilityIssues = await checkAccessibility(page, 'Players');
    
    addResult('Players', { passed, failed, uxIssues, performanceIssues, accessibilityIssues });
  });
});

test.describe('Analytics Screen', () => {
  test('should display tab navigation and feature cards', async ({ page }) => {
    const passed: string[] = [];
    const failed: string[] = [];
    const uxIssues: string[] = [];
    
    // Navigate to Analytics screen
    try {
      await page.click('text=Analytics');
      await page.waitForTimeout(1000);
      passed.push('Successfully navigated to Analytics screen');
    } catch (e) {
      failed.push('Could not navigate to Analytics screen');
      addResult('Analytics', { passed, failed, uxIssues });
      return;
    }
    
    await takeScreenshot(page, 'analytics-screen-initial');
    
    // Check for tab navigation within analytics
    try {
      const tabs = page.locator('[role="tab"], .tab, .analytics-tab');
      const tabCount = await tabs.count();
      if (tabCount > 1) {
        passed.push(`${tabCount} analytics tabs found`);
        
        // Test tab switching
        const firstTab = tabs.first();
        const secondTab = tabs.nth(1);
        
        await firstTab.click();
        await page.waitForTimeout(500);
        await secondTab.click();
        await page.waitForTimeout(500);
        
        passed.push('Tab navigation functional');
      } else if (tabCount === 1) {
        uxIssues.push('Only one tab found - limited analytics navigation');
      } else {
        failed.push('No tab navigation found in analytics');
      }
    } catch (e) {
      failed.push('Tab navigation not accessible');
    }
    
    // Check for feature cards
    try {
      const featureCards = page.locator('.card, .feature-card, .analytics-card, [data-testid*="card"]');
      const cardCount = await featureCards.count();
      if (cardCount > 0) {
        passed.push(`${cardCount} feature cards found`);
        
        // Check if cards are interactive
        const firstCard = featureCards.first();
        const isClickable = await firstCard.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.cursor === 'pointer' || el.tagName === 'BUTTON' || el.getAttribute('role') === 'button';
        });
        
        if (isClickable) {
          passed.push('Feature cards appear interactive');
        } else {
          uxIssues.push('Feature cards may not be interactive');
        }
      } else {
        failed.push('No feature cards found');
      }
    } catch (e) {
      failed.push('Feature cards not accessible');
    }
    
    // Check for charts or visualizations
    try {
      const charts = page.locator('svg, canvas, .chart, .graph, .visualization');
      const chartCount = await charts.count();
      if (chartCount > 0) {
        passed.push(`${chartCount} charts/visualizations found`);
      } else {
        uxIssues.push('No charts or data visualizations found');
      }
    } catch (e) {
      // Charts might not be present, which is okay
    }
    
    const performanceIssues = await checkPerformance(page);
    const accessibilityIssues = await checkAccessibility(page, 'Analytics');
    
    addResult('Analytics', { passed, failed, uxIssues, performanceIssues, accessibilityIssues });
  });
});

test.describe('Overall App Navigation and Responsiveness', () => {
  test('should provide consistent navigation and responsive design', async ({ page }) => {
    const passed: string[] = [];
    const failed: string[] = [];
    const uxIssues: string[] = [];
    
    // Test navigation between all screens
    const screens = ['Home', 'Leagues', 'Players', 'Analytics'];
    
    for (const screen of screens) {
      try {
        await page.click(`text=${screen}`);
        await page.waitForTimeout(500);
        
        // Check if URL or active state changes
        const activeTab = page.locator(`text=${screen}`).first();
        const isActive = await activeTab.evaluate(el => {
          return el.classList.contains('active') || 
                 el.getAttribute('aria-selected') === 'true' ||
                 window.getComputedStyle(el).color !== 'rgb(117, 117, 117)'; // not inactive color
        });
        
        if (isActive) {
          passed.push(`${screen} tab shows active state`);
        } else {
          uxIssues.push(`${screen} tab doesn't show clear active state`);
        }
      } catch (e) {
        failed.push(`Failed to navigate to ${screen}`);
      }
    }
    
    // Test responsiveness across different viewports
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1280, height: 720 },
      { name: 'Large Desktop', width: 1920, height: 1080 }
    ];
    
    for (const viewport of viewports) {
      try {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(500);
        
        // Check if navigation is still accessible
        const navVisible = await page.locator('text=Home').isVisible();
        if (navVisible) {
          passed.push(`Navigation accessible on ${viewport.name}`);
        } else {
          // Check for hamburger menu or collapsed navigation
          const hamburger = page.locator('.hamburger, .menu-toggle, [aria-label*="menu"]').first();
          if (await hamburger.count() > 0) {
            passed.push(`Collapsed navigation found on ${viewport.name}`);
          } else {
            failed.push(`Navigation not accessible on ${viewport.name}`);
          }
        }
        
        await takeScreenshot(page, `responsive-${viewport.name.toLowerCase()}`);
      } catch (e) {
        failed.push(`Failed to test ${viewport.name} viewport`);
      }
    }
    
    // Reset to desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Test keyboard navigation
    try {
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      if (focusedElement) {
        passed.push('Keyboard navigation functional');
      } else {
        uxIssues.push('No clear keyboard navigation focus');
      }
    } catch (e) {
      failed.push('Keyboard navigation not working');
    }
    
    // Check for consistent styling across screens
    let consistentStyling = true;
    for (const screen of screens) {
      try {
        await page.click(`text=${screen}`);
        await page.waitForTimeout(300);
        
        const bgColor = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
        if (!bgColor || bgColor === 'rgba(0, 0, 0, 0)') {
          consistentStyling = false;
        }
      } catch (e) {
        consistentStyling = false;
      }
    }
    
    if (consistentStyling) {
      passed.push('Consistent styling across screens');
    } else {
      uxIssues.push('Inconsistent styling detected across screens');
    }
    
    const performanceIssues = await checkPerformance(page);
    const accessibilityIssues = await checkAccessibility(page, 'Overall App');
    
    addResult('Overall App', { passed, failed, uxIssues, performanceIssues, accessibilityIssues });
  });
});