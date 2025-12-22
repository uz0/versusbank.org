import { test, expect } from '@playwright/test';

test.describe('Basic Rendering Tests', () => {
  test('page loads successfully', async ({ page }) => {
    await page.goto('/');

    // Check that the page loads without errors
    await expect(page).toHaveTitle(/VersusBank/i);

    // Check for any 404 or error states
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('canvas element renders', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Look for the specific game canvas by ID and take the first one
    const canvas = page.locator('#gameCanvas').first();
    await expect(canvas).toBeVisible();

    // Check that canvas has dimensions
    const boundingBox = await canvas.boundingBox();
    expect(boundingBox?.width).toBeGreaterThan(0);
    expect(boundingBox?.height).toBeGreaterThan(0);
  });

  test('no console errors', async ({ page }) => {
    const errors: string[] = [];

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');

    // Wait a bit for any async errors
    await page.waitForTimeout(2000);

    // Assert no console errors
    expect(errors).toHaveLength(0);
  });

  test('screenshot consistency', async ({ page }) => {
    await page.goto('/');

    // Wait for any animations or loading
    await page.waitForLoadState('networkidle');

    // Take a screenshot
    const screenshot = await page.screenshot();

    // Ensure screenshot is not empty
    expect(screenshot.length).toBeGreaterThan(0);

    // Basic image validation (should have content)
    expect(screenshot.length).toBeGreaterThan(1000); // At least some content
  });
});

test.describe('Cross-platform Rendering', () => {
  ['Desktop Chrome', 'Desktop Firefox', 'Desktop Safari'].forEach(browserName => {
    test(`${browserName} renders consistently`, async ({ page }) => {
      // Skip if not the right browser
      test.skip(browserName !== test.info().project.name);

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Take screenshot for visual comparison
      await page.screenshot({
        path: `test-results/screenshot-${browserName.toLowerCase().replace(/\s+/g, '-')}.png`
      });

      // Verify canvas is present and sized correctly
      const canvas = page.locator('#gameCanvas').first();
      await expect(canvas).toBeVisible();

      const boundingBox = await canvas.boundingBox();
      expect(boundingBox?.width).toBeGreaterThan(100);
      expect(boundingBox?.height).toBeGreaterThan(100);
    });
  });
});
