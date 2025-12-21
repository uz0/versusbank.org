/**
 * VersusBank Game Engine
 * Main game class with game loop, state management, and core systems
 */

import { Renderer } from './Renderer';
import { InputHandler } from './InputHandler';
import { AssetManager, type AssetRequest } from './AssetManager';
import { SceneManager } from './SceneManager';

/**
 * Game states enumeration
 */
export enum GameState {
  LOADING = 'loading',
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'game_over',
  CUTSCENE = 'cutscene'
}

/**
 * Performance metrics interface
 */
interface PerformanceMetrics {
  frameTime: number;
  renderTime: number;
  updateTime: number;
  memoryUsage: number;
}

/**
 * Camera interface
 */
interface Camera {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Extended Performance interface for memory API
 */
interface ExtendedPerformance extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

/**
 * Main Game class
 */
export class Game {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;

  // Game state
  private state: GameState = GameState.LOADING;
  private previousState: GameState | null = null;
  private isRunning: boolean = false;
  private isPaused: boolean = false;

  // Core systems
  private renderer: Renderer | null = null;
  private input: InputHandler | null = null;
  private assets: AssetManager | null = null;
  private scenes: SceneManager | null = null;

  // Game loop timing
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly fixedTimeStep: number = 1000 / 60; // 60 FPS physics
  private readonly maxDeltaTime: number = 250; // Prevent spiral of death
  private frameCount: number = 0;
  private fps: number = 0;
  private fpsUpdateTime: number = 0;
  private fpsFrameCount: number = 0;

  // Performance monitoring
  private performanceMetrics: PerformanceMetrics = {
    frameTime: 0,
    renderTime: 0,
    updateTime: 0,
    memoryUsage: 0
  };

  // Game properties
  private readonly width: number = 320; // Base resolution
  private readonly height: number = 180;
  private scale: number = 1;

  // Camera
  private camera: Camera = {
    x: 0,
    y: 0,
    zoom: 1
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Unable to get 2D rendering context from canvas');
    }
    this.ctx = ctx;

    console.log('Game engine initialized');
  }

  /**
   * Initialize the game
   */
  public async init(): Promise<void> {
    try {
      console.log('Initializing VersusBank game...');

      // Setup canvas
      this.setupCanvas();

      // Initialize core systems
      this.renderer = new Renderer(this.ctx, this.width, this.height);
      this.input = new InputHandler(this.canvas);
      this.assets = new AssetManager();
      this.scenes = new SceneManager();

      // Setup event handlers
      this.setupEventHandlers();

      // Load initial assets
      await this.loadAssets();

      // Initialize scenes
      this.initializeScenes();

      console.log('Game initialized successfully');

    } catch (error) {
      console.error('Game initialization failed:', error);
      throw error;
    }
  }

  /**
   * Setup canvas with proper resolution and scaling
   */
  private setupCanvas(): void {
    // Set internal resolution
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Apply pixel-perfect rendering
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.imageSmoothingQuality = 'low';

    // Setup scaling
    this.updateScaling();
  }

  /**
   * Update canvas scaling for pixel-perfect rendering
   */
  private updateScaling(): void {
    // Calculate scale to fit viewport while maintaining aspect ratio
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const scaleX = viewportWidth / this.width;
    const scaleY = viewportHeight / this.height;

    // Use integer scaling for pixel-perfect rendering
    this.scale = Math.max(1, Math.floor(Math.min(scaleX, scaleY)));

    // Apply scaling
    this.canvas.style.width = `${this.width * this.scale}px`;
    this.canvas.style.height = `${this.height * this.scale}px`;
    this.canvas.style.imageRendering = 'pixelated';
    this.canvas.style.imageRendering = '-moz-crisp-edges';
    this.canvas.style.imageRendering = 'crisp-edges';
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Prevent context menu on right click
    this.canvas.addEventListener('contextmenu', (e: Event): void => e.preventDefault());

    // Prevent default touch behaviors
    this.canvas.addEventListener('touchstart', (e: TouchEvent) => e.preventDefault(), { passive: false });
    this.canvas.addEventListener('touchmove', (e: TouchEvent) => e.preventDefault(), { passive: false });
  }

  /**
   * Load essential game assets
   */
  private async loadAssets(): Promise<void> {
    console.log('Loading game assets...');

    // Define essential assets
    const assets: AssetRequest[] = [
      // Add sprite sheets, sounds, fonts, etc.
      // { type: AssetType.IMAGE, path: 'assets/sprites/player.png', id: 'player' },
      // { type: AssetType.AUDIO, path: 'assets/sounds/jump.wav', id: 'jump' }
    ];

    // Load assets
    if (this.assets) {
      await this.assets.loadAssets(assets);
    }

    console.log('Assets loaded successfully');
  }

  /**
   * Initialize game scenes
   */
  private initializeScenes(): void {
    // Create and register scenes
    // this.scenes.addScene('menu', new MenuScene());
    // this.scenes.addScene('game', new GameScene());
    // this.scenes.addScene('gameover', new GameOverScene());

    // Set initial scene
    this.setState(GameState.MENU);
  }

  /**
   * Start the game loop
   */
  public start(): void {
    if (this.isRunning) {
      console.warn('Game is already running');
      return;
    }

    console.log('Starting game loop');
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop);
  }

  /**
   * Stop the game loop
   */
  public stop(): void {
    console.log('Stopping game loop');
    this.isRunning = false;
  }

  /**
   * Pause the game
   */
  public pause(): void {
    if (!this.isPaused) {
      this.isPaused = true;
      this.previousState = this.state;
      this.setState(GameState.PAUSED);
      console.log('Game paused');
    }
  }

  /**
   * Resume the game
   */
  public resume(): void {
    if (this.isPaused) {
      this.isPaused = false;
      this.setState(this.previousState || GameState.PLAYING);
      console.log('Game resumed');
    }
  }

  /**
   * Main game loop
   */
  private gameLoop(currentTime: number): void {
    if (!this.isRunning) return;

    // Calculate delta time
    const deltaTime = Math.min(currentTime - this.lastTime, this.maxDeltaTime);
    this.lastTime = currentTime;

    // Update FPS counter
    this.updateFPSCounter(currentTime);

    // Fixed timestep physics update
    this.accumulator += deltaTime;
    while (this.accumulator >= this.fixedTimeStep) {
      this.update(this.fixedTimeStep);
      this.accumulator -= this.fixedTimeStep;
    }

    // Render at screen refresh rate
    this.render();

    // Update performance metrics
    this.updatePerformanceMetrics(deltaTime);

    // Continue the loop
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Update game logic
   */
  private update = (deltaTime: number): void => {
    if (this.isPaused) return;

    const updateStart = performance.now();

    // Update input
    if (this.input) {
      this.input.update(deltaTime);
    }

    // Update current scene
    if (this.scenes) {
      this.scenes.update(deltaTime);
    }

    // Update performance metrics
    this.performanceMetrics.updateTime = performance.now() - updateStart;
  };

  /**
   * Render game graphics
   */
  private render = (): void => {
    if (!this.renderer) return;

    const renderStart = performance.now();

    // Clear screen
    this.renderer.clearScreen();

    // Render current scene
    if (this.scenes) {
      this.scenes.render(this.renderer);
    }

    // Render debug info if in development
    if (process.env.NODE_ENV === 'development') {
      this.renderDebugInfo();
    }

    // Update performance metrics
    this.performanceMetrics.renderTime = performance.now() - renderStart;
  };

  /**
   * Render debug information
   */
  private renderDebugInfo = (): void => {
    if (!this.renderer) return;

    const debugText = [
      `FPS: ${this.fps.toFixed(1)}`,
      `State: ${this.state}`,
      `Scale: ${this.scale}x`,
      `Frame Time: ${this.performanceMetrics.frameTime.toFixed(2)}ms`,
      `Update: ${this.performanceMetrics.updateTime.toFixed(2)}ms`,
      `Render: ${this.performanceMetrics.renderTime.toFixed(2)}ms`
    ];

    this.renderer.drawText(
      debugText.join('\n'),
      5, 5,
      '#00ff41',
      '12px Courier New'
    );
  };

  /**
   * Update FPS counter
   */
  private updateFPSCounter = (currentTime: number): void => {
    this.fpsFrameCount++;

    if (currentTime - this.fpsUpdateTime >= 1000) {
      this.fps = this.fpsFrameCount;
      this.fpsFrameCount = 0;
      this.fpsUpdateTime = currentTime;
    }
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics = (deltaTime: number): void => {
    this.performanceMetrics.frameTime = deltaTime;

    // Update memory usage if available
    const perf = performance as ExtendedPerformance;
    if (perf.memory) {
      this.performanceMetrics.memoryUsage = perf.memory.usedJSHeapSize;
    }

    this.frameCount++;
  }

  /**
   * Set game state
   */
  public setState(newState: GameState): void {
    const previousState = this.state;
    this.state = newState;

    // Handle state changes
    switch (newState) {
      case GameState.PLAYING:
        if (this.scenes) {
          this.scenes.switchTo('game');
        }
        break;
      case GameState.MENU:
        if (this.scenes) {
          this.scenes.switchTo('menu');
        }
        break;
      case GameState.PAUSED:
        // Current scene remains active
        break;
      case GameState.GAME_OVER:
        if (this.scenes) {
          this.scenes.switchTo('gameover');
        }
        break;
    }

    console.log(`Game state changed: ${previousState} -> ${newState}`);
  }

  /**
   * Handle window resize
   */
  public handleResize(): void {
    this.updateScaling();
    if (this.scenes) {
      this.scenes.handleResize();
    }
  }

  /**
   * Check if there are unsaved changes
   */
  public hasUnsavedChanges(): boolean {
    // Check if game has unsaved progress
    return this.state === GameState.PLAYING &&
           (this.scenes ? this.scenes.hasUnsavedProgress() : false);
  }

  /**
   * Get current performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetrics & {
    fps: number;
    frameCount: number;
    state: GameState;
    memoryUsageMB: number;
  } {
    return {
      ...this.performanceMetrics,
      fps: this.fps,
      frameCount: this.frameCount,
      state: this.state,
      memoryUsageMB: this.performanceMetrics.memoryUsage / (1024 * 1024)
    };
  }

  /**
   * Get game state
   */
  public getState(): GameState {
    return this.state;
  }

  /**
   * Get renderer
   */
  public getRenderer(): Renderer | null {
    return this.renderer;
  }

  /**
   * Get input handler
   */
  public getInput(): InputHandler | null {
    return this.input;
  }

  /**
   * Get asset manager
   */
  public getAssets(): AssetManager | null {
    return this.assets;
  }

  /**
   * Get scene manager
   */
  public getScenes(): SceneManager | null {
    return this.scenes;
  }

  /**
   * Get camera
   */
  public getCamera(): Camera {
    return { ...this.camera };
  }

  /**
   * Set camera position
   */
  public setCamera(x: number, y: number, zoom: number = 1): void {
    this.camera.x = x;
    this.camera.y = y;
    this.camera.zoom = zoom;

    if (this.renderer) {
      this.renderer.setCamera(x, y, zoom);
    }
  }

  /**
   * Get current scale
   */
  public getScale(): number {
    return this.scale;
  }
}