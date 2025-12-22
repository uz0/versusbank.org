/**
 * Input Handler for touch, mouse, and keyboard input
 */

/**
 * Input state interface
 */
interface InputState {
  keys: { [key: string]: boolean };
  touches: TouchInfo[];
  mouse: MouseInfo;
}

/**
 * Touch information interface
 */
interface TouchInfo {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  startTime: number;
}

/**
 * Mouse information interface
 */
interface MouseInfo {
  x: number;
  y: number;
  button: number;
  pressed: boolean;
}

/**
 * Virtual joystick interface
 */
interface VirtualJoystick {
  x: number;
  y: number;
  radius: number;
  active: boolean;
  touchId: number | null;
}

/**
 * Input Handler class
 */
export class InputHandler {
  private canvas: HTMLCanvasElement;
  private state: InputState;
  private virtualJoystick: VirtualJoystick;
  private gestureCallbacks: { [key: string]: ((...args: any[]) => void)[] } = {};

  // Touch gesture thresholds
  private readonly TAP_TIMEOUT = 300;
  private readonly SWIPE_THRESHOLD = 30;
  private readonly LONG_PRESS_TIMEOUT = 500;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.state = {
      keys: {},
      touches: [],
      mouse: { x: 0, y: 0, button: -1, pressed: false }
    };

    this.virtualJoystick = {
      x: 0,
      y: 0,
      radius: 50,
      active: false,
      touchId: null
    };

    this.setupEventListeners();
    console.log('Input handler initialized');
  }

  /**
   * Setup input event listeners
   */
  private setupEventListeners(): void {
    // Keyboard events
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));

    // Mouse events
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));

    // Touch events
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
  }

  /**
   * Handle keyboard input
   */
  private handleKeyDown(event: KeyboardEvent): void {
    this.state.keys[event.code] = true;
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.state.keys[event.code] = false;
  }

  /**
   * Handle mouse input
   */
  private handleMouseDown(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.state.mouse = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      button: event.button,
      pressed: true
    };
  }

  private handleMouseMove(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.state.mouse.x = event.clientX - rect.left;
    this.state.mouse.y = event.clientY - rect.top;
  }

  private handleMouseUp(): void {
    this.state.mouse.pressed = false;
    this.state.mouse.button = -1;
  }

  /**
   * Handle touch input
   */
  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      if (!touch) {
        continue;
      }

      const rect = this.canvas.getBoundingClientRect();
      const touchInfo: TouchInfo = {
        id: touch.identifier,
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
        startX: touch.clientX - rect.left,
        startY: touch.clientY - rect.top,
        startTime: Date.now()
      };

      this.state.touches.push(touchInfo);

      // Check if touch is in joystick area (left side of screen)
      if (touchInfo.x < this.canvas.width / 2) {
        this.activateVirtualJoystick(touchInfo.x, touchInfo.y, touch.identifier);
      }

      // Start gesture recognition
      this.startGestureRecognition(touchInfo);
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      if (!touch) {
        continue;
      }

      const touchInfo = this.state.touches.find(t => t.id === touch.identifier);

      if (touchInfo) {
        const rect = this.canvas.getBoundingClientRect();
        touchInfo.x = touch.clientX - rect.left;
        touchInfo.y = touch.clientY - rect.top;

        // Update virtual joystick
        if (this.virtualJoystick.active && this.virtualJoystick.touchId === touch.identifier) {
          this.updateVirtualJoystick(touchInfo.x, touchInfo.y);
        }
      }
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      if (!touch) {
        continue;
      }

      const touchInfoIndex = this.state.touches.findIndex(t => t.id === touch.identifier);

      if (touchInfoIndex !== -1) {
        const touchInfo = this.state.touches[touchInfoIndex];
        if (touchInfo) {
          // Complete gesture recognition
          this.completeGestureRecognition(touchInfo);
        }

        // Remove touch from state
        this.state.touches.splice(touchInfoIndex, 1);
      }

      // Deactivate virtual joystick
      if (this.virtualJoystick.touchId === touch.identifier) {
        this.deactivateVirtualJoystick();
      }
    }
  }

  /**
   * Virtual joystick management
   */
  private activateVirtualJoystick(x: number, y: number, touchId: number): void {
    this.virtualJoystick = {
      x,
      y,
      radius: 50,
      active: true,
      touchId
    };
  }

  private updateVirtualJoystick(x: number, y: number): void {
    if (!this.virtualJoystick.active) {
      return;
    }

    const dx = x - this.virtualJoystick.x;
    const dy = y - this.virtualJoystick.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = this.virtualJoystick.radius;

    if (distance <= maxDistance) {
      this.virtualJoystick.x = x;
      this.virtualJoystick.y = y;
    } else {
      const angle = Math.atan2(dy, dx);
      this.virtualJoystick.x = this.virtualJoystick.x + Math.cos(angle) * maxDistance;
      this.virtualJoystick.y = this.virtualJoystick.y + Math.sin(angle) * maxDistance;
    }
  }

  private deactivateVirtualJoystick(): void {
    this.virtualJoystick.active = false;
    this.virtualJoystick.touchId = null;
  }

  /**
   * Gesture recognition
   */
  private startGestureRecognition(touchInfo: TouchInfo): void {
    // Set timeout for long press
    setTimeout(() => {
      const currentTouch = this.state.touches.find(t => t.id === touchInfo.id);
      if (currentTouch) {
        this.emitGesture('longPress', currentTouch);
      }
    }, this.LONG_PRESS_TIMEOUT);
  }

  private completeGestureRecognition(touchInfo: TouchInfo): void {
    const touchDuration = Date.now() - touchInfo.startTime;
    const deltaX = touchInfo.x - touchInfo.startX;
    const deltaY = touchInfo.y - touchInfo.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (touchDuration <= this.TAP_TIMEOUT && distance < 10) {
      this.emitGesture('tap', touchInfo);
    } else if (distance > this.SWIPE_THRESHOLD) {
      const direction = this.getSwipeDirection(deltaX, deltaY);
      this.emitGesture('swipe', { ...touchInfo, direction, deltaX, deltaY });
    }
  }

  private getSwipeDirection(deltaX: number, deltaY: number): string {
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > absY) {
      return deltaX > 0 ? 'right' : 'left';
    }
    return deltaY > 0 ? 'down' : 'up';

  }

  private emitGesture(type: string, data: any): void {
    if (this.gestureCallbacks[type]) {
      this.gestureCallbacks[type].forEach(callback => callback(data));
    }
  }

  /**
   * Public API methods
   */
  public update(_deltaTime: number): void {
    // Update input state if needed
  }

  public isKeyPressed(keyCode: string): boolean {
    return this.state.keys[keyCode] || false;
  }

  public getMousePosition(): { x: number; y: number } {
    return { x: this.state.mouse.x, y: this.state.mouse.y };
  }

  public isMousePressed(): boolean {
    return this.state.mouse.pressed;
  }

  public getTouchPositions(): { x: number; y: number }[] {
    return this.state.touches.map(touch => ({ x: touch.x, y: touch.y }));
  }

  public getVirtualJoystick(): { x: number; y: number; active: boolean } {
    if (!this.virtualJoystick.active || !this.virtualJoystick.touchId) {
      return { x: 0, y: 0, active: false };
    }

    const startTouch = this.state.touches.find(t => t.id === this.virtualJoystick.touchId);
    if (!startTouch) {
      return { x: 0, y: 0, active: false };
    }

    // Calculate normalized joystick position (-1 to 1)
    const dx = this.virtualJoystick.x - startTouch.startX;
    const dy = this.virtualJoystick.y - startTouch.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = this.virtualJoystick.radius;

    return {
      x: distance <= maxDistance ? dx / maxDistance : dx / distance,
      y: distance <= maxDistance ? dy / maxDistance : dy / distance,
      active: true
    };
  }

  public onGesture(type: string, callback: (...args: any[]) => void): void {
    if (!this.gestureCallbacks[type]) {
      this.gestureCallbacks[type] = [];
    }
    this.gestureCallbacks[type].push(callback);
  }

  public removeGestureListener(type: string, callback: (...args: any[]) => void): void {
    if (this.gestureCallbacks[type]) {
      const index = this.gestureCallbacks[type].indexOf(callback);
      if (index !== -1) {
        this.gestureCallbacks[type].splice(index, 1);
      }
    }
  }
}
