import { test, expect } from '@playwright/test';

test.describe('VersusBank PWA Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the app
    await page.goto('/');
  });

  test('page loads correctly', async ({ page }) => {
    // Check if main elements are present
    await expect(page.locator('title')).toHaveText('VersusBank - 16-bit Financial Game');
    await expect(page.locator('#gameContainer')).toBeVisible();
    await expect(page.locator('#gameCanvas')).toBeVisible();
  });

  test('retro styling is applied', async ({ page }) => {
    // Check CSS variables are set
    const primaryGreen = await page.locator('html').evaluate(el =>
      getComputedStyle(el).getPropertyValue('--primary-green').trim()
    );
    expect(primaryGreen).toBe('#00ff41');
  });

  test('game canvas renders', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toBeVisible();

    // Check canvas has correct attributes
    const canvasElement = await canvas.elementHandle();
    const width = await canvasElement?.getAttribute('width');
    const height = await canvasElement?.getAttribute('height');

    expect(width && parseInt(width, 10) > 0).toBeTruthy();
    expect(height && parseInt(height, 10) > 0).toBeTruthy();
  });

  test('PWA manifest is accessible', async ({ page }) => {
    const response = await page.goto('/manifest.webmanifest');
    expect(response?.ok()).toBeTruthy();
  });

  test('loading screen functionality', async ({ page }) => {
    // Check loading screen exists
    const loadingScreen = page.locator('#loadingScreen');
    await expect(loadingScreen).toBeVisible();

    // Check loading text
    await expect(page.locator('.loading-text')).toHaveText('LOADING VERSUSBANK...');
  });

  test('install prompt button exists', async ({ page }) => {
    // Check install prompt button is present (may not be visible initially)
    const installPrompt = page.locator('#installPrompt');
    await expect(installPrompt).toBeAttached();
  });

  test('content section exists', async ({ page }) => {
    // Check content section is present
    const content = page.locator('#content');
    await expect(content).toBeVisible();
  });

  test('app is responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('#gameContainer')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('#gameContainer')).toBeVisible();
  });

  test('no JavaScript fallback works', async ({ page }) => {
    // Check noscript content exists
    const noScriptContent = page.locator('noscript .no-js');
    await expect(noScriptContent).toBeAttached();
  });
});
