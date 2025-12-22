/**
 * Main Menu Scene for VersusBank
 * Uses DOM-based menu instead of canvas rendering
 */

import type { Scene } from '../SceneManager';

export class MenuScene implements Scene {
  public name = 'menu';
  private menuContainer: HTMLElement | null = null;
  private selectedIndex = 0;
  private menuOptions: string[] = ['Start Game', 'Settings', 'About', 'Exit'];
  private cleanupKeyboard?: (() => void) | undefined;

  async init(): Promise<void> {
    console.log('Menu scene initialized');
    this.createMenuDOM();
  }

  update(_deltaTime: number): void {
    // Menu updates handled by DOM events
  }

  render(_renderer: any): void {
    // DOM-based menu, no canvas rendering needed
  }

  destroy(): void {
    this.removeMenuDOM();
    console.log('Menu scene destroyed');
  }

  handleResize(): void {
    // Menu is responsive, no resize handling needed
  }

  hasUnsavedProgress(): boolean {
    return false;
  }

  private createMenuDOM(): void {
    // Create menu container
    this.menuContainer = document.createElement('div');
    this.menuContainer.className = 'menu-overlay';
    this.menuContainer.innerHTML = `
      <div class="menu-content">
        <h1 class="menu-title">VERSUSBANK</h1>
        <div class="menu-options"></div>
        <div class="menu-instructions">
          Use ↑↓ arrows to navigate, Enter to select
        </div>
      </div>
    `;

    // Create menu options
    const optionsContainer = this.menuContainer.querySelector('.menu-options') as HTMLElement;
    this.menuOptions.forEach((option, index) => {
      const optionElement = document.createElement('button');
      optionElement.className = `menu-option ${index === 0 ? 'selected' : ''}`;
      optionElement.textContent = option;
      optionElement.addEventListener('click', () => this.selectOption(index));
      optionsContainer.appendChild(optionElement);
    });

    // Add keyboard controls
    this.setupKeyboardControls();

    // Append to body
    document.body.appendChild(this.menuContainer);
  }

  private removeMenuDOM(): void {
    if (this.cleanupKeyboard) {
      this.cleanupKeyboard();
      this.cleanupKeyboard = undefined;
    }
    if (this.menuContainer && this.menuContainer.parentNode) {
      this.menuContainer.parentNode.removeChild(this.menuContainer);
      this.menuContainer = null;
    }
  }

  private setupKeyboardControls(): void {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          this.selectPrevious();
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.selectNext();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          this.selectCurrentOption();
          break;
        case 'Escape':
          e.preventDefault();
          // Handle escape (maybe return to previous screen)
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    this.cleanupKeyboard = () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }

  private updateSelectedOption(): void {
    if (!this.menuContainer) {
      return;
    }

    const options = this.menuContainer.querySelectorAll('.menu-option');
    options.forEach((option, index) => {
      if (index === this.selectedIndex) {
        option.classList.add('selected');
      } else {
        option.classList.remove('selected');
      }
    });
  }

  private selectNext(): void {
    this.selectedIndex = (this.selectedIndex + 1) % this.menuOptions.length;
    this.updateSelectedOption();
  }

  private selectPrevious(): void {
    this.selectedIndex = (this.selectedIndex - 1 + this.menuOptions.length) % this.menuOptions.length;
    this.updateSelectedOption();
  }

  private selectCurrentOption(): void {
    const selectedOption = this.getSelectedOption();
    console.log('Selected:', selectedOption);

    // Handle menu selection
    switch (selectedOption) {
      case 'Start Game':
        // Switch to game scene
        break;
      case 'Settings':
        // Open settings
        break;
      case 'About':
        // Show about
        break;
      case 'Exit':
        // Exit game or go back
        break;
    }
  }

  private selectOption(index: number): void {
    this.selectedIndex = index;
    this.updateSelectedOption();
    this.selectCurrentOption();
  }

  getSelectedOption(): string {
    return this.menuOptions[this.selectedIndex] || '';
  }
}
