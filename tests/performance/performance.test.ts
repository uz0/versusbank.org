import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('canvas renders smoothly', async ({ page }) => {
    await page.goto('/');

    // Wait for canvas to be ready
    await page.waitForSelector('canvas');

    // Monitor frame rate
    const frameMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const canvas = document.querySelector('canvas');
        if (!canvas) {
          resolve({ fps: 0, frames: 0 });
          return;
        }

        let frameCount = 0;
        const startTime = performance.now();

        function countFrames() {
          frameCount++;
          const elapsed = performance.now() - startTime;

          if (elapsed >= 2000) { // Test for 2 seconds
            const fps = (frameCount / elapsed) * 1000;
            resolve({ fps, frames: frameCount });
          } else {
            requestAnimationFrame(countFrames);
          }
        }

        requestAnimationFrame(countFrames);
      });
    });

    // Should maintain reasonable frame rate
    expect(frameMetrics.fps).toBeGreaterThan(30);
    expect(frameMetrics.frames).toBeGreaterThan(0);
  });

  test('memory usage stays reasonable', async ({ page }) => {
    await page.goto('/');

    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    // Simulate some interaction
    await page.click('body');
    await page.waitForTimeout(1000);

    // Check memory after interaction
    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    // Memory shouldn't grow excessively (simple check)
    if (initialMemory > 0 && finalMemory > 0) {
      const growth = finalMemory - initialMemory;
      expect(growth).toBeLessThan(50 * 1024 * 1024); // Less than 50MB growth
    }
  });
});

test.describe('Screenshot Performance', () => {
  test('can take screenshots reliably', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test multiple screenshots
    for (let i = 0; i < 3; i++) {
      const screenshot = await page.screenshot({
        fullPage: true,
        animations: 'disabled'
      });

      expect(screenshot.length).toBeGreaterThan(1000);

      // Small delay between screenshots
      await page.waitForTimeout(100);
    }
  });

  test('canvas screenshots are consistent', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas');
    await page.waitForLoadState('networkidle');

    // Take canvas screenshot
    const canvas = page.locator('canvas');
    const screenshot1 = await canvas.screenshot();

    await page.waitForTimeout(500);

    // Wait for potential animation frames
    await page.waitForTimeout(1000);

    const screenshot2 = await canvas.screenshot();

    // Screenshots should be similar (allowing for minor differences)
    expect(screenshot1.length).toBeGreaterThan(0);
    expect(screenshot2.length).toBeGreaterThan(0);

    // Size should be very similar (within 10%)
    const sizeDiff = Math.abs(screenshot1.length - screenshot2.length) / screenshot1.length;
    expect(sizeDiff).toBeLessThan(0.1); // Less than 10% difference
  });
});