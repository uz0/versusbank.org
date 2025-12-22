/**
 * Renderer for 16-bit retro graphics using Canvas 2D API
 */

/**
 * Rendering options interface
 */
interface RenderOptions {
  pixelPerfect: boolean;
  smoothing: boolean;
  scale: number;
}

/**
 * Color interface
 */
interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

/**
 * Sprite interface
 */
interface Sprite {
  x: number;
  y: number;
  width: number;
  height: number;
  texture: HTMLImageElement;
}

/**
 * Renderer class
 */
export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private cameraX: number = 0;
  private cameraY: number = 0;
  private cameraZoom: number = 1;

  // Rendering options
  private options: RenderOptions = {
    pixelPerfect: true,
    smoothing: false,
    scale: 1
  };

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;

    this.setupCanvas();
    console.log('Renderer initialized');
  }

  /**
   * Setup canvas with proper rendering settings
   */
  private setupCanvas(): void {
    this.ctx.imageSmoothingEnabled = this.options.smoothing;
    this.ctx.imageSmoothingQuality = 'low';
  }

  /**
   * Clear screen with background color
   */
  public clearScreen(color: Color | string = '#1a1a2e'): void {
    if (typeof color === 'string') {
      this.ctx.fillStyle = color;
    } else {
      this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a ?? 1})`;
    }
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Draw text at position
   */
  public drawText(text: string, x: number, y: number, color: string = '#ffffff', font: string = '12px monospace'): void {
    this.ctx.save();

    // Apply camera transform
    this.applyCameraTransform();

    this.ctx.fillStyle = color;
    this.ctx.font = font;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';

    // Split text by newlines and draw each line
    const lines = text.split('\n');
    lines.forEach((line, index) => {
      this.ctx.fillText(line, x, y + (index * 12));
    });

    this.ctx.restore();
  }

  /**
   * Draw sprite at position
   */
  public drawSprite(sprite: Sprite, x: number, y: number): void {
    this.ctx.save();

    // Apply camera transform
    this.applyCameraTransform();

    this.ctx.drawImage(
      sprite.texture,
      sprite.x, sprite.y, sprite.width, sprite.height,
      x, y, sprite.width * this.options.scale, sprite.height * this.options.scale
    );

    this.ctx.restore();
  }

  /**
   * Draw rectangle
   */
  public drawRect(x: number, y: number, width: number, height: number, color: string): void {
    this.ctx.save();

    // Apply camera transform
    this.applyCameraTransform();

    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);

    this.ctx.restore();
  }

  /**
   * Draw pixel
   */
  public drawPixel(x: number, y: number, color: string): void {
    this.ctx.save();

    // Apply camera transform
    this.applyCameraTransform();

    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, 1, 1);

    this.ctx.restore();
  }

  /**
   * Apply camera transformation
   */
  private applyCameraTransform(): void {
    this.ctx.translate(-this.cameraX, -this.cameraY);
    this.ctx.scale(this.cameraZoom, this.cameraZoom);
  }

  /**
   * Set camera position and zoom
   */
  public setCamera(x: number, y: number, zoom: number = 1): void {
    this.cameraX = x;
    this.cameraY = y;
    this.cameraZoom = zoom;
  }

  /**
   * Get canvas context
   */
  public getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * Get dimensions
   */
  public getDimensions(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  /**
   * Get camera position
   */
  public getCamera(): { x: number; y: number; zoom: number } {
    return { x: this.cameraX, y: this.cameraY, zoom: this.cameraZoom };
  }

  /**
   * Set global alpha for transparency
   */
  public setGlobalAlpha(alpha: number): void {
    this.ctx.globalAlpha = alpha;
  }

  /**
   * Push current transform state to stack
   */
  public pushTransform(): void {
    this.ctx.save();
  }

  /**
   * Pop transform state from stack
   */
  public popTransform(): void {
    this.ctx.restore();
  }

  /**
   * Translate context by x, y
   */
  public translate(x: number, y: number): void {
    this.ctx.translate(x, y);
  }
}
