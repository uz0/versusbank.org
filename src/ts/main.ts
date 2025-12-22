/**
 * VersusBank Web Game - Main Entry Point
 * 16-bit retro financial game using Canvas 2D API with TypeScript
 */

import { Game } from './Game.js';
import { ContentManager } from './ContentManager.js';
import { InstallManager } from './pwa/InstallManager.js';

/**
 * Global type definitions
 */
declare global {
  interface Window {
    VersusBank: {
      game: () => Game | null;
      contentManager: () => ContentManager | null;
      installManager: () => InstallManager | null;
    };
  }
}

/**
 * Global game instance
 */
let game: Game | null = null;
let contentManager: ContentManager | null = null;
let installManager: InstallManager | null = null;

/**
 * Initialize the application
 */
const init = async (): Promise<void> => {
  try {
    showLoadingScreen();

    // Initialize managers
    contentManager = new ContentManager();
    installManager = new InstallManager();

    // Get canvas element with type assertion
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Canvas element not found');
    }

    // Initialize game
    game = new Game(canvas);
    await game.init();

    // Initialize content
    await contentManager.init();

    // Setup PWA install prompt
    installManager.init();

    // Start the game
    game.start();

    // Hide loading screen
    hideLoadingScreen();

    console.log('VersusBank initialized successfully');

  } catch (error) {
    console.error('Failed to initialize VersusBank:', error);
    showErrorScreen((error as Error).message);
  }
};

/**
 * Show loading screen with progress
 */
const showLoadingScreen = (): void => {
  const loadingScreen = document.getElementById('loadingScreen');
  const progress = document.getElementById('loadingProgress');

  if (loadingScreen) {
    loadingScreen.style.display = 'flex';

    // Simulate loading progress
    let progressValue = 0;
    const loadingInterval = setInterval(() => {
      progressValue += Math.random() * 15;
      if (progressValue >= 100) {
        progressValue = 100;
        clearInterval(loadingInterval);
      }

      if (progress) {
        progress.style.width = `${progressValue}%`;
      }
    }, 200);
  }
};

/**
 * Hide loading screen
 */
const hideLoadingScreen = (): void => {
  const loadingScreen = document.getElementById('loadingScreen');
  if (loadingScreen) {
    // Add fade out effect
    loadingScreen.style.opacity = '0';
    loadingScreen.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }
};

/**
 * Show error screen
 */
const showErrorScreen = (message: string): void => {
  const loadingScreen = document.getElementById('loadingScreen');
  const loadingText = loadingScreen?.querySelector('.loading-text') as HTMLElement;

  if (loadingScreen && loadingText) {
    loadingText.textContent = `ERROR: ${message}`;
    loadingText.style.color = '#ff4141';
    loadingText.style.textShadow = '0 0 10px #ff4141';

    // Hide loading bar
    const loadingBar = loadingScreen.querySelector('.loading-bar') as HTMLElement;
    if (loadingBar) {
      loadingBar.style.display = 'none';
    }
  }
};

/**
 * Handle window resize
 */
const handleResize = (): void => {
  if (game) {
    game.handleResize();
  }
};

/**
 * Handle visibility change (page hidden/visible)
 */
const handleVisibilityChange = (): void => {
  if (game) {
    if (document.hidden) {
      game.pause();
    } else {
      game.resume();
    }
  }
};

/**
 * Handle beforeunload (page closing)
 */
const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
  if (game && game.hasUnsavedChanges()) {
    event.preventDefault();
    event.returnValue = 'You have unsaved game progress. Are you sure you want to leave?';
    // Note: Modern browsers require setting both message and returnValue
    // Note: event.returnValue is already set above
  }
};

/**
 * Setup event listeners
 */
const setupEventListeners = (): void => {
  // Window resize
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);

  // Page visibility
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Before unload
  window.addEventListener('beforeunload', handleBeforeUnload);

  // Error handling
  window.addEventListener('error', (event: ErrorEvent) => {
    console.error('Global error:', event.error);
    showErrorScreen(event.error?.message || 'Unknown error occurred');
  });

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    console.error('Unhandled promise rejection:', event.reason);
    showErrorScreen((event.reason as Error)?.message || 'Promise rejected');
  });
};

/**
 * Check browser compatibility
 */
const checkCompatibility = (): boolean => {
  const requiredFeatures = [
    'canvas',
    'requestAnimationFrame',
    'localStorage',
    'fetch'
  ];

  const missingFeatures = requiredFeatures.filter((feature: string): boolean => {
    if (feature === 'canvas') {
      return !document.createElement('canvas').getContext;
    }
    return !(feature in window);
  });

  if (missingFeatures.length > 0) {
    const message = `Your browser is missing required features: ${missingFeatures.join(', ')}. Please update your browser or try a different one.`;
    showErrorScreen(message);
    return false;
  }

  return true;
};

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', (): void => {
    if (checkCompatibility()) {
      setupEventListeners();
      init().catch(console.error);
    }
  });
} else {
  if (checkCompatibility()) {
    setupEventListeners();
    init().catch(console.error);
  }
}

// Export global functions for debugging
window.VersusBank = {
  game: (): Game | null => game,
  contentManager: (): ContentManager | null => contentManager,
  installManager: (): InstallManager | null => installManager
};
