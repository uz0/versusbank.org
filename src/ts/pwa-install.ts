/**
 * PWA Install and Service Worker Management
 * Handles PWA installation prompts and service worker lifecycle
 */

class PWAManager {
  private installPrompt: any = null;
  private isInstallable = false;
  private handleInstallClick?: (e: Event) => void;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    // Service worker is automatically registered by Vite PWA plugin
    await this.setupInstallPrompt();
    this.setupAppLifecycle();
  }

  /**
   * Setup PWA install prompt detection
   */
  private async setupInstallPrompt(): Promise<void> {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e;
      this.isInstallable = true;
      this.showInstallButton();
      console.log('PWA installation prompt detected');
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      this.isInstallable = false;
      this.hideInstallButton();
      console.log('PWA successfully installed');
    });
  }

  /**
   * Setup application lifecycle events
   */
  private setupAppLifecycle(): void {
    // Handle network status changes
    window.addEventListener('online', () => {
      console.log('App is online');
      this.showNetworkStatus('online');
    });

    window.addEventListener('offline', () => {
      console.log('App is offline');
      this.showNetworkStatus('offline');
    });
  }

  /**
   * Show install button when PWA is installable
   */
  private showInstallButton(): void {
    const installButton = document.getElementById('installPrompt') as HTMLButtonElement;
    if (installButton) {
      installButton.style.display = 'block';

      // Remove existing listener if any
      if (this.handleInstallClick) {
        installButton.removeEventListener('click', this.handleInstallClick);
      }

      // Create and add new listener
      this.handleInstallClick = () => this.installPWA();
      installButton.addEventListener('click', this.handleInstallClick);
    }
  }

  /**
   * Hide install button
   */
  private hideInstallButton(): void {
    const installButton = document.getElementById('installPrompt') as HTMLButtonElement;
    if (installButton) {
      installButton.style.display = 'none';
    }
  }

  /**
   * Install PWA
   */
  private async installPWA(): Promise<void> {
    if (!this.installPrompt) {
      return;
    }

    try {
      const result = await this.installPrompt.prompt();
      console.log('Install prompt result:', result);

      if (result.outcome === 'accepted') {
        console.log('User accepted PWA installation');
      } else {
        console.log('User declined PWA installation');
      }

      this.installPrompt = null;
      this.isInstallable = false;
      this.hideInstallButton();
    } catch (error) {
      console.error('PWA installation failed:', error);
    }
  }

  /**
   * Show network status indicator
   */
  private showNetworkStatus(status: 'online' | 'offline'): void {
    // Remove existing status indicator
    const existingIndicator = document.getElementById('network-status');
    if (existingIndicator) {
      existingIndicator.remove();
    }

    // Create status indicator
    const indicator = document.createElement('div');
    indicator.id = 'network-status';
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      padding: 5px 10px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      font-weight: bold;
      z-index: 1000;
      transition: all 0.3s ease;
    `;

    if (status === 'online') {
      indicator.style.background = 'rgba(0, 255, 65, 0.2)';
      indicator.style.border = '1px solid #00ff41';
      indicator.style.color = '#00ff41';
      indicator.textContent = 'ONLINE';
    } else {
      indicator.style.background = 'rgba(255, 65, 65, 0.2)';
      indicator.style.border = '1px solid #ff4141';
      indicator.style.color = '#ff4141';
      indicator.textContent = 'OFFLINE';
    }

    document.body.appendChild(indicator);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    }, 3000);
  }

  /**
   * Check if PWA is installable
   */
  public canInstall(): boolean {
    return this.isInstallable;
  }

  /**
   * Get current app mode
   */
  public getAppMode(): 'standalone' | 'browser' {
    return window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser';
  }

  /**
   * Check if running in PWA mode
   */
  public isPWA(): boolean {
    return this.getAppMode() === 'standalone' ||
           (navigator as any).standalone ||
           document.referrer.includes('android-app://');
  }

  /**
   * Check if service worker is active
   */
  public async isServiceWorkerActive(): Promise<boolean> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      return !!registration.active;
    }
    return false;
  }
}

// Initialize PWA Manager
new PWAManager();

// Export for potential external usage
export { PWAManager };
