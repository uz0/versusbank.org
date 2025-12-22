/**
 * Simple Content Manager for handling game content and README.md integration
 */

import { marked, type MarkedOptions } from 'marked';
import DOMPurify from 'dompurify';

/**
 * Content status interface
 */
interface ContentStatus {
  isLoaded: boolean;
  isVisible: boolean;
  hasContent: boolean;
}

/**
 * Simple Content Manager class
 * All styling is handled by CSS classes defined in index.html
 */
export class ContentManager {
  private content: string | null = null;
  private isContentLoaded: boolean = false;
  private isVisible: boolean = false;

  constructor() {
    console.log('Content manager initialized');
    // Apply retro class to document for styling
    document.documentElement.classList.add('versusbank-retro');
  }

  /**
   * Initialize content manager
   */
  public async init(): Promise<void> {
    await this.loadContent();
  }

  /**
   * Load README.md content
   */
  private async loadContent(): Promise<void> {
    try {
      const response = await fetch('/README.md');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const markdown = await response.text();
      this.content = this.processMarkdown(markdown);
      this.isContentLoaded = true;
      this.injectContent();

      console.log('README.md content loaded successfully');
    } catch (error) {
      console.warn('Could not load README.md:', (error as Error).message);
      this.setFallbackContent();
    }
  }

  /**
   * Process markdown into clean HTML
   */
  private processMarkdown(markdown: string): string {
    marked.setOptions({
      gfm: true,
      breaks: true,
      langPrefix: 'language-'
    } as MarkedOptions);

    return marked(markdown);
  }

  /**
   * Set fallback content when README.md is not available
   */
  private setFallbackContent(): void {
    this.content = `
      <article class="retro-content">
        <h1 class="retro-title">VersusBank</h1>
        <p class="retro-paragraph">
          Welcome to VersusBank - a 16-bit retro financial game experience.
        </p>
        <h2 class="retro-title">About</h2>
        <p class="retro-paragraph">
          This game combines retro 16-bit aesthetics with modern web technologies
          to create an engaging financial gameplay experience.
        </p>
        <h2 class="retro-title">Features</h2>
        <ul class="retro-list">
          <li class="retro-list-item">16-bit pixel art graphics</li>
          <li class="retro-list-item">Mobile-first touch controls</li>
          <li class="retro-list-item">PWA capabilities</li>
          <li class="retro-list-item">Progressive Web App</li>
        </ul>
        <h2 class="retro-title">Controls</h2>
        <p class="retro-paragraph">
          <strong class="retro-strong">Mobile:</strong> Use the virtual joystick and on-screen buttons<br>
          <strong class="retro-strong">Desktop:</strong> Use arrow keys and spacebar
        </p>
      </article>
    `;

    this.isContentLoaded = true;
    this.injectContent();
  }

  /**
   * Inject content into DOM
   */
  private injectContent(): void {
    const contentContainer = document.getElementById('content');
    if (contentContainer && this.content) {
      const sanitizedContent = DOMPurify.sanitize(this.content);
      contentContainer.innerHTML = sanitizedContent;
    }
  }

  /**
   * Show content with smooth scroll
   */
  public showContent(): void {
    if (!this.isContentLoaded) {
      return;
    }

    this.isVisible = true;
    window.scrollTo({
      top: window.innerHeight * 2,
      behavior: 'smooth'
    });
    console.log('Content shown');
  }

  /**
   * Hide content
   */
  public hideContent(): void {
    this.isVisible = false;
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    console.log('Content hidden');
  }

  /**
   * Toggle content visibility
   */
  public toggleContent(): void {
    if (this.isVisible) {
      this.hideContent();
    } else {
      this.showContent();
    }
  }

  /**
   * Get content status
   */
  public getContentStatus(): ContentStatus {
    return {
      isLoaded: this.isContentLoaded,
      isVisible: this.isVisible,
      hasContent: !!this.content
    };
  }
}
