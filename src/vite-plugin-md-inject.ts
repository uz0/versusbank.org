/**
 * Custom Vite plugin to convert README.md to HTML at build time
 * and inject it directly into index.html
 */

import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Create JSDOM for server-side DOMPurify
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Get the directory where this plugin file is located
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface MarkdownInjectOptions {
  /**
   * Path to markdown file relative to project root
   * @default 'README.md'
   */
  markdownPath?: string;

  /**
   * Target element ID to inject content into
   * @default 'content'
   */
  targetId?: string;

  /**
   * CSS class to apply to content wrapper
   * @default 'retro-content'
   */
  contentClass?: string;
}

/**
 * Vite plugin to convert markdown to HTML and inject into index.html at build time
 */
export function markdownInject(options: MarkdownInjectOptions = {}) {
  const {
    markdownPath = 'README.md',
    targetId = 'content',
    contentClass = 'retro-content'
  } = options;

  return {
    name: 'vite-plugin-markdown-inject',

    /**
     * Transform index.html during build to inject markdown content
     */
    transformIndexHtml: {
      order: 'post',
      handler(html: string) {
        try {
          // Resolve markdown path: plugin is in src/, so we go up once to reach root
          const rootDir = resolve(__dirname, '..');
          const markdownPathResolved = resolve(rootDir, markdownPath);

          console.log(`Plugin dir: ${__dirname}`);
          console.log(`Looking for README at: ${markdownPathResolved}`);

          const markdownContent = readFileSync(markdownPathResolved, 'utf-8');

          // Configure marked for safe rendering
          marked.setOptions({
            gfm: true,
            breaks: true,
            langPrefix: 'language-'
          });

          // Convert markdown to HTML
          const rawHtml = marked(markdownContent) as string;

          // Sanitize HTML to prevent XSS
          const cleanHtml = purify.sanitize(rawHtml, {
            ALLOWED_TAGS: [
              'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
              'strong', 'em', 'u', 's', 'code', 'pre',
              'ul', 'ol', 'li',
              'a', 'blockquote',
              'table', 'thead', 'tbody', 'tr', 'th', 'td',
              'hr', 'img', 'div', 'span'
            ],
            ALLOWED_ATTR: [
              'href', 'src', 'alt', 'title', 'class', 'id',
              'target', 'rel', 'width', 'height'
            ]
          });

          // Wrap in article tag for semantics
          const wrappedContent = `<article class="${contentClass}">${cleanHtml}</article>`;

          // Inject into target div
          const targetPattern = new RegExp(
            `<div id="${targetId}">([\\s\\S]*?)</div>`,
            'i'
          );

          const transformedHtml = html.replace(
            targetPattern,
            `<div id="${targetId}">${wrappedContent}</div>`
          );

          console.log(`✓ Injected ${markdownContent.length} bytes of markdown as HTML`);
          return transformedHtml;
        } catch (error) {
          console.warn(`Failed to inject markdown: ${(error as Error).message}`);
          return html;
        }
      }
    }
  };
}
