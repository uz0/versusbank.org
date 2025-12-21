/**
 * Asset Manager for loading and managing game resources
 */

/**
 * Asset types enumeration
 */
export enum AssetType {
  IMAGE = 'image',
  AUDIO = 'audio',
  JSON = 'json',
  SPRITESHEET = 'spritesheet',
  FONT = 'font'
}

/**
 * Asset interface
 */
interface Asset {
  id: string;
  type: AssetType;
  path: string;
  loaded: boolean;
  data: any;
  error?: string;
}

/**
 * Asset load request interface
 */
export interface AssetRequest {
  id: string;
  type: AssetType;
  path: string;
  options?: { [key: string]: any };
}

/**
 * Load progress interface
 */
interface LoadProgress {
  total: number;
  loaded: number;
  failed: number;
  percentage: number;
}

/**
 * Asset Manager class
 */
export class AssetManager {
  private assets: Map<string, Asset> = new Map();
  private totalAssets: number = 0;
  private loadedAssets: number = 0;
  private failedAssets: number = 0;
  private loadPromises: Map<string, Promise<any>> = new Map();

  constructor() {
    console.log('Asset manager initialized');
  }

  /**
   * Load a single asset
   */
  public async loadAsset(request: AssetRequest): Promise<Asset> {
    // Check if asset is already loaded
    if (this.assets.has(request.id)) {
      const asset = this.assets.get(request.id)!;
      if (asset.loaded) {
        return asset;
      }
    }

    // Create asset record
    const asset: Asset = {
      id: request.id,
      type: request.type,
      path: request.path,
      loaded: false,
      data: null
    };

    this.assets.set(request.id, asset);

    // Create load promise
    const loadPromise = this.loadAssetData(request);
    this.loadPromises.set(request.id, loadPromise);

    try {
      const data = await loadPromise;
      asset.data = data;
      asset.loaded = true;
      this.loadedAssets++;
      console.log(`Asset loaded: ${request.id}`);
      return asset;
    } catch (error) {
      asset.error = (error as Error).message;
      this.failedAssets++;
      console.error(`Failed to load asset ${request.id}:`, error);
      throw error;
    } finally {
      this.loadPromises.delete(request.id);
    }
  }

  /**
   * Load multiple assets
   */
  public async loadAssets(requests: AssetRequest[]): Promise<Asset[]> {
    this.totalAssets = requests.length;
    this.loadedAssets = 0;
    this.failedAssets = 0;

    console.log(`Loading ${requests.length} assets...`);

    const loadPromises = requests.map(request =>
      this.loadAsset(request).catch(error => {
        console.error(`Asset ${request.id} failed to load:`, error);
        return null;
      })
    );

    const results = await Promise.all(loadPromises);
    const successfulLoads = results.filter(asset => asset !== null) as Asset[];

    console.log(`Asset loading complete: ${successfulLoads.length}/${requests.length} loaded successfully`);
    return successfulLoads;
  }

  /**
   * Load asset data based on type
   */
  private async loadAssetData(request: AssetRequest): Promise<any> {
    switch (request.type) {
      case AssetType.IMAGE:
        return this.loadImage(request.path);
      case AssetType.AUDIO:
        return this.loadAudio(request.path);
      case AssetType.JSON:
        return this.loadJSON(request.path);
      case AssetType.SPRITESHEET:
        return this.loadSpriteSheet(request.path, request.options);
      case AssetType.FONT:
        return this.loadFont(request.path, request.options);
      default:
        throw new Error(`Unsupported asset type: ${request.type}`);
    }
  }

  /**
   * Load image asset
   */
  private async loadImage(path: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
      img.src = path;
    });
  }

  /**
   * Load audio asset
   */
  private async loadAudio(path: string): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => resolve(audio);
      audio.onerror = () => reject(new Error(`Failed to load audio: ${path}`));
      audio.src = path;
      audio.load();
    });
  }

  /**
   * Load JSON asset
   */
  private async loadJSON(path: string): Promise<any> {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to load JSON: ${path}`);
    }
  }

  /**
   * Load sprite sheet asset
   */
  private async loadSpriteSheet(path: string, options?: { frameWidth?: number; frameHeight?: number }): Promise<any> {
    const image = await this.loadImage(path);

    return {
      image: image,
      frameWidth: options?.frameWidth || 16,
      frameHeight: options?.frameHeight || 16,
      path: path
    };
  }

  /**
   * Load font asset
   */
  private async loadFont(path: string, options?: { family?: string }): Promise<FontFace> {
    try {
      const response = await fetch(path);
      const fontData = await response.arrayBuffer();

      const fontFamily = options?.family || 'CustomFont';
      const fontFace = new FontFace(fontFamily, fontData);

      await fontFace.load();
      document.fonts.add(fontFace);

      return fontFace;
    } catch (error) {
      throw new Error(`Failed to load font: ${path}`);
    }
  }

  /**
   * Get loaded asset
   */
  public getAsset(id: string): Asset | null {
    const asset = this.assets.get(id);
    return asset || null;
  }

  /**
   * Get asset data
   */
  public getAssetData(id: string): any {
    const asset = this.assets.get(id);
    return asset?.data || null;
  }

  /**
   * Get image asset
   */
  public getImage(id: string): HTMLImageElement | null {
    const asset = this.assets.get(id);
    if (asset && asset.loaded && asset.type === AssetType.IMAGE) {
      return asset.data as HTMLImageElement;
    }
    return null;
  }

  /**
   * Get audio asset
   */
  public getAudio(id: string): HTMLAudioElement | null {
    const asset = this.assets.get(id);
    if (asset && asset.loaded && asset.type === AssetType.AUDIO) {
      return asset.data as HTMLAudioElement;
    }
    return null;
  }

  /**
   * Get JSON asset
   */
  public getJSON(id: string): any {
    const asset = this.assets.get(id);
    if (asset && asset.loaded && asset.type === AssetType.JSON) {
      return asset.data;
    }
    return null;
  }

  /**
   * Get sprite sheet asset
   */
  public getSpriteSheet(id: string): any {
    const asset = this.assets.get(id);
    if (asset && asset.loaded && asset.type === AssetType.SPRITESHEET) {
      return asset.data;
    }
    return null;
  }

  /**
   * Check if asset is loaded
   */
  public isAssetLoaded(id: string): boolean {
    const asset = this.assets.get(id);
    return asset?.loaded || false;
  }

  /**
   * Check if all requested assets are loaded
   */
  public isFullyLoaded(): boolean {
    if (this.totalAssets === 0) return true;
    return (this.loadedAssets + this.failedAssets) >= this.totalAssets;
  }

  /**
   * Get loading progress
   */
  public getProgress(): LoadProgress {
    const total = Math.max(this.totalAssets, 1);
    const processed = this.loadedAssets + this.failedAssets;
    const percentage = (processed / total) * 100;

    return {
      total: this.totalAssets,
      loaded: this.loadedAssets,
      failed: this.failedAssets,
      percentage: Math.min(percentage, 100)
    };
  }

  /**
   * Unload asset
   */
  public unloadAsset(id: string): void {
    const asset = this.assets.get(id);
    if (asset) {
      // Cleanup asset data if needed
      if (asset.type === AssetType.AUDIO && asset.data) {
        const audio = asset.data as HTMLAudioElement;
        audio.pause();
        audio.currentTime = 0;
      }

      this.assets.delete(id);
      console.log(`Asset unloaded: ${id}`);
    }
  }

  /**
   * Unload all assets
   */
  public unloadAllAssets(): void {
    for (const id of this.assets.keys()) {
      this.unloadAsset(id);
    }

    this.totalAssets = 0;
    this.loadedAssets = 0;
    this.failedAssets = 0;
    this.loadPromises.clear();

    console.log('All assets unloaded');
  }

  /**
   * Get list of all loaded asset IDs
   */
  public getLoadedAssetIds(): string[] {
    const loadedIds: string[] = [];
    for (const [id, asset] of this.assets.entries()) {
      if (asset.loaded) {
        loadedIds.push(id);
      }
    }
    return loadedIds;
  }

  /**
   * Get asset statistics
   */
  public getStatistics(): { [key: string]: number } {
    const stats: { [key: string]: number } = {};

    for (const asset of this.assets.values()) {
      if (asset.loaded) {
        stats[asset.type] = (stats[asset.type] || 0) + 1;
      }
    }

    return stats;
  }
}