/**
 * PWA Install Manager
 * Handles Progressive Web App installation prompts and management
 */

/**
 * Browser compatibility interface
 */
interface BrowserCompatibility {
  supportsInstallPrompt: boolean;
  supportsServiceWorker: boolean;
  supportsManifest: boolean;
  supportsStandalone: boolean;
  userAgent: string;
  isMobile: boolean;
  isChrome?: boolean;
  isFirefox?: boolean;
  isSafari?: boolean;
}


/**
 * Install Manager class
 */
export class InstallManager {
  private deferredPrompt: Event | null = null;
  private isInstalled: boolean = false;
  private isInstallable: boolean = false;
  private installPrompt: HTMLElement | null = null;

  constructor() {
    console.log('Install manager initialized');
  }

  /**
   * Initialize install manager
   */
  public init(): void {
    this.setupInstallPrompt();
    this.setupInstallButton();
    this.checkInstallStatus();
  }

  /**
   * Setup beforeinstallprompt event handler
   */
  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (event: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();

      // Stash the event so it can be triggered later
      this.deferredPrompt = event as any;
      this.isInstallable = true;

      console.log('Install prompt event received');
      this.showInstallButton();
    });

    // Handle app installed event
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.isInstallable = false;
      this.deferredPrompt = null;

      console.log('PWA was installed');
      this.hideInstallButton();
      this.showInstallSuccess();
    });
  }

  /**
   * Setup install button
   */
  private setupInstallButton(): void {
    this.installPrompt = document.getElementById('installPrompt');

    if (this.installPrompt) {
      this.installPrompt.addEventListener('click', () => {
        this.handleInstallClick();
      });
    }
  }

  /**
   * Check current install status
   */
  private checkInstallStatus(): void {
    // Check if running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      console.log('App is running in standalone mode');
    }

    // Check if app is installed (for iOS)
    if ('standalone' in window.navigator && window.navigator.standalone) {
      this.isInstalled = true;
      console.log('App is installed (iOS standalone)');
    }
  }

  /**
   * Handle install button click
   */
  private async handleInstallClick(): Promise<void> {
    if (!this.deferredPrompt) {
      console.warn('No install prompt available');
      this.showInstallInstructions();
      return;
    }

    try {
      // Show the install prompt
      (this.deferredPrompt as any).prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await (this.deferredPrompt as any).userChoice;

      console.log(`User response to install prompt: ${outcome}`);

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }

      // We've used the prompt, and can't use it again
      this.deferredPrompt = null;
      this.isInstallable = false;

      this.hideInstallButton();

    } catch (error) {
      console.error('Error showing install prompt:', error);
      this.showInstallInstructions();
    }
  }

  /**
   * Show install button
   */
  private showInstallButton(): void {
    if (!this.installPrompt || this.isInstalled) return;

    // Only show on mobile devices or when not in standalone mode
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if ((isMobile || !isStandalone) && this.isInstallable) {
      if (this.installPrompt) {
        this.installPrompt.style.display = 'block';
      }

      // Auto-hide after 10 seconds
      setTimeout(() => {
        if (this.installPrompt && this.isInstallable) {
          if (this.installPrompt) {
            this.installPrompt.style.display = 'none';
          }
        }
      }, 10000);
    }
  }

  /**
   * Hide install button
   */
  private hideInstallButton(): void {
    if (this.installPrompt) {
      this.installPrompt.style.display = 'none';
    }
  }

  /**
   * Show install success message
   */
  private showInstallSuccess(): void {
    this.createNotification('VersusBank installed successfully!', 'success');
  }

  /**
   * Show install instructions for browsers that don't support the install prompt
   */
  private showInstallInstructions(): void {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    let instructions = '';

    if (isMobile) {
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        instructions = `
          To install VersusBank on iOS:
          1. Tap the Share button
          2. Scroll down and tap "Add to Home Screen"
          3. Tap "Add" to confirm
        `;
      } else if (/Android/.test(navigator.userAgent)) {
        instructions = `
          To install VersusBank on Android:
          1. Tap the menu button (three dots)
          2. Tap "Add to Home screen" or "Install app"
          3. Tap "Add" or "Install" to confirm
        `;
      }
    } else {
      instructions = `
        To install VersusBank:
        1. Click the install icon in the address bar
        2. Click "Install" to add VersusBank to your applications
      `;
    }

    this.createNotification(instructions, 'info', 8000);
  }

  /**
   * Create notification
   */
  private createNotification(message: string, type: 'info' | 'success' | 'error' = 'info', duration: number = 5000): void {
    // Remove existing notifications
    const existingNotification = document.querySelector('.install-notification') as HTMLElement;
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'install-notification';
    const borderColor = type === 'success' ? '#00ff41' : type === 'error' ? '#ff0040' : '#0099ff';

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #1a1a2e;
      border: 2px solid ${borderColor};
      color: #ffffff;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      z-index: 1000;
      max-width: 90%;
      text-align: center;
      box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
      white-space: pre-line;
      animation: slideDown 0.3s ease;
    `;

    notification.textContent = message;
    document.body.appendChild(notification);

    // Auto-remove after duration
    setTimeout(() => {
      notification.style.animation = 'slideUp 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, duration);

    // Add click to dismiss
    notification.addEventListener('click', () => {
      notification.style.animation = 'slideUp 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    });
  }

  /**
   * Get install status
   */
  public getInstallStatus(): {
    isInstalled: boolean;
    isInstallable: boolean;
    isStandalone: boolean;
    deferredPrompt: boolean;
  } {
    return {
      isInstalled: this.isInstalled,
      isInstallable: this.isInstallable,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      deferredPrompt: !!this.deferredPrompt
    };
  }

  /**
   * Get browser compatibility for PWA installation
   */
  public getBrowserCompatibility(): BrowserCompatibility {
    const compatibility: BrowserCompatibility = {
      supportsInstallPrompt: 'beforeinstallprompt' in window,
      supportsServiceWorker: 'serviceWorker' in navigator,
      supportsManifest: 'onbeforeinstallprompt' in window,
      supportsStandalone: 'standalone' in window.navigator,
      userAgent: navigator.userAgent,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    };

    // Check for specific browser features
    if ('webkitRequestFileSystem' in window) {
      (compatibility as any).isChrome = true;
    }

    if ('firefox' in window) {
      (compatibility as any).isFirefox = true;
    }

    if ('safari' in window) {
      (compatibility as any).isSafari = true;
    }

    return compatibility;
  }
}