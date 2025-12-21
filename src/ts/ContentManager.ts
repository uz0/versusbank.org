/**
 * Content Manager for handling game content and README.md integration
 */

import { marked, type MarkedOptions } from 'marked';
import DOMPurify from 'dompurify';

/**
 * Retro color scheme interface
 */
interface RetroColors {
  heading: string;
  text: string;
  code: string;
  link: string;
  quote: string;
}

/**
 * Content status interface
 */
interface ContentStatus {
  isLoaded: boolean;
  isVisible: boolean;
  hasContent: boolean;
}

/**
 * Content Manager class
 */
export class ContentManager {
  private content: string | null = null;
  private isContentLoaded: boolean = false;
  private isVisible: boolean = false;

  // Content styling
  private readonly retroColors: RetroColors = {
    heading: '#00ff41',
    text: '#66ff66',
    code: '#ffcc33',
    link: '#66ccff',
    quote: '#9966ff'
  };

  constructor() {
    console.log('Content manager initialized');
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
      // Try to load README.md from root
      const response = await fetch('/README.md');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const markdown = await response.text();
      this.content = this.processMarkdown(markdown);
      this.isContentLoaded = true;

      // Inject content into DOM
      this.injectContent();

      console.log('README.md content loaded successfully');

    } catch (error) {
      console.warn('Could not load README.md:', (error as Error).message);
      // Set fallback content
      this.setFallbackContent();
    }
  }

  /**
   * Process markdown with retro styling
   */
  private processMarkdown(markdown: string): string {
    // Configure marked for retro styling
    marked.setOptions({
      gfm: true,
      breaks: true,
      langPrefix: 'language-'
    } as MarkedOptions);

    // Convert markdown to HTML
    let html = marked(markdown);

    // Apply retro styling classes
    html = this.applyRetroStyling(html);

    return html;
  }

  /**
   * Apply retro styling to markdown HTML
   */
  private applyRetroStyling(html: string): string {
    // Apply styling to headings
    html = html.replace(/<h([1-6])>/g, `<h$1 class="retro-heading">`);
    html = html.replace(/<\/h([1-6])>/g, `</h$1>`);

    // Apply styling to paragraphs
    html = html.replace(/<p>/g, '<p class="retro-text">');

    // Apply styling to links
    html = html.replace(/<a /g, '<a class="retro-link" ');

    // Apply styling to code blocks
    html = html.replace(/<pre>/g, '<pre class="retro-code-block">');
    html = html.replace(/<code>/g, '<code class="retro-code-inline">');

    // Apply styling to blockquotes
    html = html.replace(/<blockquote>/g, '<blockquote class="retro-quote">');

    // Apply styling to lists
    html = html.replace(/<ul>/g, '<ul class="retro-list">');
    html = html.replace(/<ol>/g, '<ol class="retro-list">');
    html = html.replace(/<li>/g, '<li class="retro-list-item">');

    // Add pixel border class to main content
    html = `<div class="retro-content">${html}</div>`;

    return html;
  }

  /**
   * Set fallback content when README.md is not available
   */
  private setFallbackContent(): void {
    this.content = `
      <div class="retro-content">
        <h1 class="retro-heading">VersusBank</h1>
        <p class="retro-text">
          Welcome to VersusBank - a 16-bit retro financial game experience.
        </p>
        <h2 class="retro-heading">About</h2>
        <p class="retro-text">
          This game combines retro 16-bit aesthetics with modern web technologies
          to create an engaging financial gameplay experience.
        </p>
        <h2 class="retro-heading">Features</h2>
        <ul class="retro-list">
          <li class="retro-list-item">16-bit pixel art graphics</li>
          <li class="retro-list-item">Mobile-first touch controls</li>
          <li class="retro-list-item">PWA capabilities</li>
          <li class="retro-list-item">Progressive Web App</li>
        </ul>
        <h2 class="retro-heading">Controls</h2>
        <p class="retro-text">
          <strong>Mobile:</strong> Use the virtual joystick and on-screen buttons<br>
          <strong>Desktop:</strong> Use arrow keys and spacebar
        </p>
      </div>
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
      if (sanitizedContent) {
        contentContainer.innerHTML = sanitizedContent;
        this.injectRetroStyles();
      }
    }
  }

  /**
   * Inject retro styles for content
   */
  private injectRetroStyles(): void {
    const styleId = 'retro-content-styles';
    if (document.getElementById(styleId)) {
      return; // Styles already injected
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Retro Content Styles */
      .retro-content {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
        font-family: 'Courier New', monospace;
        line-height: 1.6;
      }

      .retro-heading {
        color: ${this.retroColors.heading};
        text-shadow: 0 0 10px ${this.retroColors.heading};
        margin-bottom: 1rem;
        animation: glow 2s ease-in-out infinite alternate;
      }

      .retro-text {
        color: ${this.retroColors.text};
        margin-bottom: 1rem;
      }

      .retro-link {
        color: ${this.retroColors.link};
        text-decoration: underline;
        text-shadow: 0 0 5px ${this.retroColors.link};
      }

      .retro-link:hover {
        color: #ffffff;
        text-shadow: 0 0 10px ${this.retroColors.link};
      }

      .retro-code-block {
        background: #0f0f1e;
        border: 2px solid ${this.retroColors.code};
        padding: 1rem;
        margin: 1rem 0;
        overflow-x: auto;
        font-family: 'Courier New', monospace;
        font-size: 0.9rem;
        color: ${this.retroColors.code};
        box-shadow: 0 0 10px rgba(255, 204, 51, 0.3);
      }

      .retro-code-inline {
        background: #0f0f1e;
        color: ${this.retroColors.code};
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
      }

      .retro-quote {
        border-left: 4px solid ${this.retroColors.quote};
        padding-left: 1rem;
        margin: 1rem 0;
        color: ${this.retroColors.quote};
        font-style: italic;
      }

      .retro-list {
        margin: 1rem 0;
        padding-left: 2rem;
      }

      .retro-list-item {
        color: ${this.retroColors.text};
        margin-bottom: 0.5rem;
      }

      /* Glow animation */
      @keyframes glow {
        from { text-shadow: 0 0 10px currentColor; }
        to { text-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
      }

      /* Pixel border for content */
      .pixel-border {
        border: 4px solid ${this.retroColors.heading};
        box-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
        padding: 1rem;
        margin: 1rem 0;
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .retro-content {
          padding: 1rem;
        }

        .retro-heading {
          font-size: 1.5rem;
        }

        .retro-code-block {
          font-size: 0.8rem;
          padding: 0.8rem;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Show content with smooth scroll
   */
  public showContent(): void {
    if (!this.isContentLoaded) return;

    const contentContainer = document.getElementById('content') as HTMLElement;
    if (contentContainer) {
      this.isVisible = true;

      // Smooth scroll to content
      window.scrollTo({
        top: window.innerHeight * 2, // 2 viewport heights
        behavior: 'smooth'
      });

      console.log('Content shown');
    }
  }

  /**
   * Hide content
   */
  public hideContent(): void {
    this.isVisible = false;

    // Smooth scroll to top
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