/**
 * Scene Manager for managing game scenes and transitions
 */

/**
 * Scene interface
 */
export interface Scene {
  name: string;
  init(): Promise<void>;
  update(deltaTime: number): void;
  render(renderer: any): void;
  destroy(): void;
  handleResize?(): void;
  hasUnsavedProgress?(): boolean;
}

/**
 * Scene transition types
 */
export enum TransitionType {
  NONE = 'none',
  FADE = 'fade',
  SLIDE_LEFT = 'slideLeft',
  SLIDE_RIGHT = 'slideRight',
  SLIDE_UP = 'slideUp',
  SLIDE_DOWN = 'slideDown'
}

/**
 * Scene Manager class
 */
export class SceneManager {
  private scenes: Map<string, Scene> = new Map();
  private initializedScenes: Set<string> = new Set();
  private currentScene: Scene | null = null;
  private previousScene: Scene | null = null;
  private transitionFromScene: Scene | null = null;
  private transitionToScene: Scene | null = null;
  private transitionActive: boolean = false;
  private transitionProgress: number = 0;
  private transitionType: TransitionType = TransitionType.NONE;
  private transitionDuration: number = 500; // milliseconds

  constructor() {
    console.log('Scene manager initialized');
  }

  /**
   * Add a scene to the manager
   */
  public addScene(name: string, scene: Scene): void {
    this.scenes.set(name, scene);
    console.log(`Scene added: ${name}`);
  }

  /**
   * Remove a scene from the manager
   */
  public removeScene(name: string): void {
    const scene = this.scenes.get(name);
    if (scene) {
      if (this.currentScene === scene) {
        throw new Error(`Cannot remove active scene: ${name}`);
      }

      scene.destroy();
      this.scenes.delete(name);
      this.initializedScenes.delete(name);
      console.log(`Scene removed: ${name}`);
    }
  }

  /**
   * Switch to a specific scene
   */
  public async switchTo(sceneName: string, transitionType: TransitionType = TransitionType.NONE): Promise<void> {
    const newScene = this.scenes.get(sceneName);
    if (!newScene) {
      throw new Error(`Scene not found: ${sceneName}`);
    }

    if (this.transitionActive) {
      console.warn('Transition already in progress');
      return;
    }

    if (this.currentScene === newScene) {
      console.log('Scene already active');
      return;
    }

    this.transitionActive = true;
    this.transitionType = transitionType;
    this.transitionProgress = 0;

    // Initialize new scene if needed
    if (!this.initializedScenes.has(sceneName)) {
      await newScene.init();
      this.initializedScenes.add(sceneName);
    }

    // Set transition scenes
    this.transitionFromScene = this.currentScene;
    this.transitionToScene = newScene;

    // Start transition
    await this.performTransition(this.currentScene, newScene, transitionType);
  }

  /**
   * Perform scene transition
   */
  private async performTransition(fromScene: Scene | null, toScene: Scene, _transitionType: TransitionType): Promise<void> {
    const startTime = Date.now();

    // Run transition update loop
    return new Promise<void>((resolve) => {
      const updateTransition = (): void => {
        const elapsed = Date.now() - startTime;
        this.transitionProgress = Math.min(elapsed / this.transitionDuration, 1);

        if (this.transitionProgress >= 1) {
          // Complete transition
          this.completeTransition(fromScene, toScene);
          resolve();
        } else {
          requestAnimationFrame(updateTransition);
        }
      };

      updateTransition();
    });
  }

  /**
   * Complete scene transition
   */
  private completeTransition(fromScene: Scene | null, toScene: Scene): void {
    // Destroy previous scene before storing new reference
    if (fromScene) {
      fromScene.destroy();
    }

    // Store reference (now null since we destroyed it)
    this.previousScene = null;

    // Set new scene as current
    this.currentScene = toScene;
    this.transitionActive = false;
    this.transitionProgress = 0;

    // Clear transition scenes
    this.transitionFromScene = null;
    this.transitionToScene = null;

    console.log(`Scene switched to: ${toScene.name}`);
  }

  /**
   * Update current scene
   */
  public update(deltaTime: number): void {
    if (this.transitionActive) {
      // Update transition effects if needed
      this.updateTransition(deltaTime);
      return;
    }

    if (this.currentScene) {
      this.currentScene.update(deltaTime);
    }
  }

  /**
   * Render current scene
   */
  public render(renderer: any): void {
    if (this.transitionActive && this.transitionFromScene && this.transitionToScene) {
      // Render transition effect
      this.renderTransition(renderer, this.transitionFromScene, this.transitionToScene);
    } else if (this.currentScene) {
      this.currentScene.render(renderer);
    }
  }

  /**
   * Update transition effects
   */
  private updateTransition(_deltaTime: number): void {
    // Update transition logic if needed
    // This could include interpolation for smooth transitions
  }

  /**
   * Render transition effect
   */
  private renderTransition(renderer: any, fromScene: Scene, toScene: Scene): void {
    const progress = this.transitionProgress;

    switch (this.transitionType) {
      case TransitionType.FADE:
        this.renderFadeTransition(renderer, fromScene, toScene, progress);
        break;
      case TransitionType.SLIDE_LEFT:
        this.renderSlideTransition(renderer, fromScene, toScene, progress, 'left');
        break;
      case TransitionType.SLIDE_RIGHT:
        this.renderSlideTransition(renderer, fromScene, toScene, progress, 'right');
        break;
      case TransitionType.SLIDE_UP:
        this.renderSlideTransition(renderer, fromScene, toScene, progress, 'up');
        break;
      case TransitionType.SLIDE_DOWN:
        this.renderSlideTransition(renderer, fromScene, toScene, progress, 'down');
        break;
      default:
        // No transition, just render current scene
        toScene.render(renderer);
        break;
    }
  }

  /**
   * Render fade transition
   */
  private renderFadeTransition(renderer: any, fromScene: Scene, toScene: Scene, progress: number): void {
    // Render from scene with decreasing opacity
    renderer.setGlobalAlpha(1 - progress);
    fromScene.render(renderer);

    // Render to scene with increasing opacity
    renderer.setGlobalAlpha(progress);
    toScene.render(renderer);

    // Reset alpha
    renderer.setGlobalAlpha(1);
  }

  /**
   * Render slide transition
   */
  private renderSlideTransition(renderer: any, fromScene: Scene, toScene: Scene, progress: number, direction: string): void {
    const dims = renderer.getDimensions();
    let offsetX = 0;
    let offsetY = 0;

    switch (direction) {
      case 'left':
        offsetX = dims.width * progress;
        break;
      case 'right':
        offsetX = -dims.width * progress;
        break;
      case 'up':
        offsetY = dims.height * progress;
        break;
      case 'down':
        offsetY = -dims.height * progress;
        break;
    }

    // Render from scene sliding out
    renderer.pushTransform();
    renderer.translate(offsetX, offsetY);
    fromScene.render(renderer);
    renderer.popTransform();

    // Render to scene sliding in
    offsetX = direction === 'left' ? -dims.width * (1 - progress) :
      direction === 'right' ? dims.width * (1 - progress) : 0;
    offsetY = direction === 'up' ? -dims.height * (1 - progress) :
      direction === 'down' ? dims.height * (1 - progress) : 0;

    renderer.pushTransform();
    renderer.translate(offsetX, offsetY);
    toScene.render(renderer);
    renderer.popTransform();
  }

  /**
   * Get current scene
   */
  public getCurrentScene(): Scene | null {
    return this.currentScene;
  }

  /**
   * Get previous scene
   */
  public getPreviousScene(): Scene | null {
    return this.previousScene;
  }

  /**
   * Get scene by name
   */
  public getScene(name: string): Scene | null {
    return this.scenes.get(name) || null;
  }

  /**
   * Check if scene exists
   */
  public hasScene(name: string): boolean {
    return this.scenes.has(name);
  }

  /**
   * Get list of all scene names
   */
  public getSceneNames(): string[] {
    return Array.from(this.scenes.keys());
  }

  /**
   * Check if transition is active
   */
  public isTransitionActive(): boolean {
    return this.transitionActive;
  }

  /**
   * Get transition progress (0-1)
   */
  public getTransitionProgress(): number {
    return this.transitionProgress;
  }

  /**
   * Handle window resize
   */
  public handleResize(): void {
    if (this.currentScene && this.currentScene.handleResize) {
      this.currentScene.handleResize();
    }
  }

  /**
   * Check if current scene has unsaved progress
   */
  public hasUnsavedProgress(): boolean {
    if (this.currentScene && this.currentScene.hasUnsavedProgress) {
      return this.currentScene.hasUnsavedProgress();
    }
    return false;
  }

  /**
   * Destroy all scenes
   */
  public destroy(): void {
    for (const scene of this.scenes.values()) {
      scene.destroy();
    }
    this.scenes.clear();
    this.initializedScenes.clear();
    this.currentScene = null;
    this.previousScene = null;
    this.transitionFromScene = null;
    this.transitionToScene = null;
    console.log('Scene manager destroyed');
  }

  /**
   * Set transition duration
   */
  public setTransitionDuration(duration: number): void {
    this.transitionDuration = Math.max(0, duration);
  }

  /**
   * Get transition duration
   */
  public getTransitionDuration(): number {
    return this.transitionDuration;
  }
}
