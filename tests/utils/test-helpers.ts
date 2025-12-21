import { Page, BrowserContext } from '@playwright/test';

export interface ScreenshotOptions {
  width?: number;
  height?: number;
  fullPage?: boolean;
}

export class TestHelper {
  constructor(private page: Page) {}

  /**
   * Take a consistent screenshot with normalized settings
   */
  async takeNormalizedScreenshot(options: ScreenshotOptions = {}): Promise<Buffer> {
    const {
      width = 1920,
      height = 1080,
      fullPage = false
    } = options;

    // Set consistent viewport
    await this.page.setViewportSize({ width, height });
    await this.page.addStyleTag({ content: `* { animation-duration: 0s !important; }` });

    // Wait for any animations to settle
    await this.page.waitForTimeout(100);

    return this.page.screenshot({
      fullPage,
      animations: 'disabled'
    });
  }

  /**
   * Wait for canvas to be ready and stable
   */
  async waitForCanvasReady(): Promise<void> {
    await this.page.waitForSelector('canvas');
    await this.page.waitForFunction(() => {
      const canvas = document.querySelector('canvas');
      return canvas && canvas.width > 0 && canvas.height > 0;
    });
  }

  /**
   * Get canvas performance metrics
   */
  async getCanvasMetrics(): Promise<{
    fps: number;
    frameCount: number;
    avgFrameTime: number;
  }> {
    return this.page.evaluate(() => {
      return new Promise((resolve) => {
        const canvas = document.querySelector('canvas');
        if (!canvas) {
          resolve({ fps: 0, frameCount: 0, avgFrameTime: 0 });
          return;
        }

        let frameCount = 0;
        let totalTime = 0;
        const startTime = performance.now();

        function measureFrame() {
          const frameStart = performance.now();
          frameCount++;

          requestAnimationFrame(() => {
            const frameEnd = performance.now();
            totalTime += (frameEnd - frameStart);

            const elapsed = frameEnd - startTime;
            if (elapsed >= 2000) { // Measure for 2 seconds
              const fps = (frameCount / elapsed) * 1000;
              const avgFrameTime = totalTime / frameCount;
              resolve({ fps, frameCount, avgFrameTime });
            } else {
              measureFrame();
            }
          });
        }

        measureFrame();
      });
    });
  }

  /**
   * Check for console errors or warnings
   */
  async captureConsoleLogs(context?: BrowserContext): Promise<{
    errors: string[];
    warnings: string[];
    logs: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const logs: string[] = [];

    const target = context || this.page.context();

    // Store the handler so we can remove it later
    const consoleHandler = (msg: any) => {
      const text = msg.text();
      switch (msg.type()) {
        case 'error':
          errors.push(text);
          break;
        case 'warning':
          warnings.push(text);
          break;
        case 'log':
          logs.push(text);
          break;
      }
    };

    target.on('console', consoleHandler);

    // Wait a bit for any async console messages
    await this.page.waitForTimeout(2000);

    // Remove the listener to prevent memory leaks
    target.off('console', consoleHandler);

    return { errors, warnings, logs };
  }

  /**
   * Get network performance metrics
   */
  async getNetworkMetrics(): Promise<{
    totalRequests: number;
    totalBytes: number;
    failedRequests: number;
  }> {
    const metrics = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        const entries: any[] = [];
        let totalRequests = 0;
        let totalBytes = 0;
        let failedRequests = 0;

        const observer = new PerformanceObserver((list) => {
          entries.push(...list.getEntries());
        });

        observer.observe({ entryTypes: ['resource'] });

        // Give some time for resources to be captured
        setTimeout(() => {
          observer.disconnect();

          // Process collected entries after disconnecting
          entries.forEach((entry) => {
            if (entry.entryType === 'resource') {
              totalRequests++;
              if (entry.name.includes('error')) {
                failedRequests++;
              }
              totalBytes += (entry as any).transferSize || 0;
            }
          });

          resolve({ totalRequests, totalBytes, failedRequests });
        }, 3000);
      });
    });

    return metrics;
  }
}

/**
 * Cross-platform screenshot comparison helper
 */
export class CrossPlatformHelper {
  /**
   * Normalize screenshots across platforms by removing platform-specific differences
   */
  static normalizeScreenshot(buffer: Buffer): Promise<Buffer> {
    // This could include image processing to remove:
    // - Font rendering differences
    // - Anti-aliasing variations
    // - Minor color variations
    return Promise.resolve(buffer);
  }

  /**
   * Compare two screenshots with tolerance for minor differences
   */
  static async compareScreenshots(
    screenshot1: Buffer,
    screenshot2: Buffer,
    tolerance = 0.01
  ): Promise<{ similar: boolean; difference: number }> {
    // For now, just compare sizes
    // In a full implementation, you'd use image comparison libraries
    const sizeDiff = Math.abs(screenshot1.length - screenshot2.length) / screenshot1.length;
    const similar = sizeDiff <= tolerance;

    return { similar, difference: sizeDiff };
  }
}