/**
 * Core auto-scroll functionality
 */

import { AutoScrollCircle } from './circle-ui';
import { 
  findScrollableElementAtPosition, 
  getScrollableParents, 
  calculateScrollVector, 
  canScrollFurther 
} from '../utils/dom-utils';
import { AutoScrollOptions, defaultOptions, debugLog } from '../utils/types';
import { getScrollConfig } from '../utils/config';

enum AutoScrollState {
  INACTIVE = 'inactive',
  ACTIVATING = 'activating',  // Middle button down, not yet activated
  ACTIVE = 'active',          // Auto-scroll is active
  DEACTIVATING = 'deactivating'  // Transitioning to inactive
}

export class AutoScroll {
  private circle: AutoScrollCircle;
  private state: AutoScrollState = AutoScrollState.INACTIVE;
  private scrollableElements: HTMLElement[] = [];
  private currentScrollElement: HTMLElement | null = null;
  private animationFrameId: number | null = null;
  private options: AutoScrollOptions = defaultOptions;
  private lastActivationTime: number = 0;
  private mouseDownX: number | null = null;
  private mouseDownY: number | null = null;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;
  private isDragging: boolean = false;
  private lastLinkTarget: HTMLElement | null = null;
  
  constructor() {
    this.circle = new AutoScrollCircle();
    this.loadOptions();
  }
  
  /**
   * Load user options from storage
   */
  private loadOptions(): void {
    chrome.storage.sync.get(defaultOptions, (items) => {
      this.options = items as unknown as AutoScrollOptions;
    });
    
    // Listen for option changes
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.speedMultiplier) {
        this.options.speedMultiplier = changes.speedMultiplier.newValue;
      }
    });
  }
  
  /**
   * Initialize event listeners
   */
  public init(): void {
    // Middle mouse button click (button 1)
    document.addEventListener('mousedown', this.handleMouseDown.bind(this), true);
    
    // Click handler for preventing actions when active
    document.addEventListener('click', this.handleClick.bind(this), true);
    
    // Auxiliary click handler (middle click)
    document.addEventListener('auxclick', this.handleAuxClick.bind(this), true);
    
    // Mouse movement (for scrolling direction and drag detection)
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    
    // Mouse up (to handle click activation and reset drag state)
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    // Deactivation events
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Clean up when navigating away
    window.addEventListener('beforeunload', this.deactivate.bind(this));
  }
  
  private transitionToState(newState: AutoScrollState): void {
    debugLog('State transition:', this.state, '->', newState);
    this.state = newState;
  }
  
  /**
   * Handle mouse down events to detect middle clicks
   */
  private handleMouseDown(event: MouseEvent): void {
    if (this.state === AutoScrollState.ACTIVE) {
      // If auto-scroll is active, any click deactivates it
      this.deactivate();
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return;
    }

    // Only handle middle mouse button
    if (event.button !== 1) return;

    // Store the initial mouse position
    this.mouseDownX = event.clientX;
    this.mouseDownY = event.clientY;
    this.isDragging = false;

    // Check if we're clicking on a link
    const target = event.target as HTMLElement;
    const link = target.closest('a');
    if (link) {
      // If clicking on a link, store it but don't prevent default yet
      this.lastLinkTarget = link;
    } else {
      // If not on a link, we can activate auto-scroll immediately
      this.activate(event.clientX, event.clientY);
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
  }
  
  private handleClick(event: MouseEvent): void {
    // If auto-scroll is active, prevent all clicks
    if (this.state === AutoScrollState.ACTIVE) {
      debugLog('Click while active, preventing default');
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return;
    }
  }
  
  private handleAuxClick(event: MouseEvent): void {
    // If auto-scroll is active, prevent all auxiliary clicks
    if (this.state === AutoScrollState.ACTIVE) {
      debugLog('Aux click while active, preventing default');
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return;
    }
  }
  
  /**
   * Handle mouse move events to update scroll direction and speed
   */
  private handleMouseMove(event: MouseEvent): void {
    if (this.state === AutoScrollState.ACTIVE) {
      // Update the last mouse position for scroll calculations
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
      return;
    }

    // If we're not dragging yet and have a mouse down position
    if (this.mouseDownX !== null && this.mouseDownY !== null && !this.isDragging) {
      // Calculate how far we've moved
      const dx = event.clientX - this.mouseDownX;
      const dy = event.clientY - this.mouseDownY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If we've moved beyond the dead zone, start dragging
      if (distance > this.options.clickDeadZone) {
        this.isDragging = true;
        
        // If we were on a link, prevent it from opening
        if (this.lastLinkTarget) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
        }
        
        // Activate auto-scroll at the initial click position
        this.activate(this.mouseDownX, this.mouseDownY);
      }
    }
  }
  
  private handleMouseUp(event: MouseEvent): void {
    // If we were dragging, prevent any default actions
    if (this.isDragging) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
    
    // Reset dragging state
    this.isDragging = false;
    this.mouseDownX = null;
    this.mouseDownY = null;
    this.lastLinkTarget = null;
  }
  
  /**
   * Handle key down events for deactivation
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // Deactivate on Escape key
    if (this.state === AutoScrollState.ACTIVE && event.key === 'Escape') {
      this.deactivate();
    }
  }
  
  /**
   * Find the innermost scrollable element at the given position
   * This is a direct implementation similar to the one in direct-inject.ts
   */
  private findScrollableElementDirect(x: number, y: number): HTMLElement | null {
    // Get the element at the position
    const element = document.elementFromPoint(x, y) as HTMLElement;
    if (!element) {
      debugLog('No element found at position', x, y);
      return null;
    }
    
    debugLog('Element at position:', element.tagName, element.className);
    
    // Check if element is scrollable
    const isScrollable = (el: HTMLElement): boolean => {
      if (!el) return false;
      
      const style = window.getComputedStyle(el);
      const overflowX = style.getPropertyValue('overflow-x');
      const overflowY = style.getPropertyValue('overflow-y');
      
      const hasScroll = (
        (overflowX === 'auto' || overflowX === 'scroll' || 
         overflowY === 'auto' || overflowY === 'scroll')
      );
      
      const canScroll = (
        el.scrollHeight > el.clientHeight || 
        el.scrollWidth > el.clientWidth
      );
      
      return hasScroll && canScroll;
    };
    
    // Check if the element itself is scrollable
    if (element && element !== document.documentElement && element !== document.body && isScrollable(element)) {
      debugLog('Element itself is scrollable:', element.tagName);
      return element;
    }
    
    // Check parent elements
    let current: HTMLElement | null = element;
    while (current) {
      if (isScrollable(current)) {
        debugLog('Found scrollable parent:', current.tagName);
        return current;
      }
      current = current.parentElement;
    }
    
    // Default to document
    debugLog('No scrollable element found, using document');
    return document.scrollingElement as HTMLElement || document.documentElement;
  }
  
  /**
   * Get all scrollable parent elements in order from innermost to outermost
   * This is a direct implementation similar to the one in direct-inject.ts
   */
  private getScrollableParentsDirect(element: HTMLElement): HTMLElement[] {
    if (!element) return [];
    
    // Check if element is scrollable
    const isScrollable = (el: HTMLElement): boolean => {
      if (!el) return false;
      
      const style = window.getComputedStyle(el);
      const overflowX = style.getPropertyValue('overflow-x');
      const overflowY = style.getPropertyValue('overflow-y');
      
      return (
        (overflowX === 'auto' || overflowX === 'scroll' || 
         overflowY === 'auto' || overflowY === 'scroll') &&
        (el.scrollHeight > el.clientHeight || 
         el.scrollWidth > el.clientWidth)
      );
    };
    
    const scrollableParents: HTMLElement[] = [];
    
    // Add the element itself if it's scrollable
    if (element !== document.documentElement && element !== document.body && isScrollable(element)) {
      scrollableParents.push(element);
      debugLog('Added element itself to scrollable parents:', element.tagName);
    }
    
    // Add all scrollable parents
    let current: HTMLElement | null = element.parentElement;
    while (current) {
      if (isScrollable(current)) {
        scrollableParents.push(current);
        debugLog('Added parent to scrollable parents:', current.tagName);
      }
      current = current.parentElement;
    }
    
    // Add document as the outermost scrollable element
    const documentElement = document.scrollingElement as HTMLElement || document.documentElement;
    if (!scrollableParents.includes(documentElement)) {
      scrollableParents.push(documentElement);
      debugLog('Added document to scrollable parents');
    }
    
    debugLog('Total scrollable parents:', scrollableParents.length);
    return scrollableParents;
  }
  
  /**
   * Activate auto-scroll at the specified position
   */
  private activate(x: number, y: number): void {
    if (this.state === AutoScrollState.ACTIVE) return;
    
    this.transitionToState(AutoScrollState.ACTIVE);
    
    // Record activation time
    this.lastActivationTime = Date.now();
    debugLog('Activation time recorded:', this.lastActivationTime);
    
    // Show the circle at the click position
    this.circle.show(x, y);
    
    // Find the scrollable element at the click position
    const element = this.findScrollableElementDirect(x, y);
    if (element) {
      this.currentScrollElement = element;
      this.scrollableElements = this.getScrollableParentsDirect(element);
      debugLog('Found scrollable element:', element.tagName, 'with', this.scrollableElements.length, 'parents');
    } else {
      // If no scrollable element found, use document
      this.currentScrollElement = document.scrollingElement as HTMLElement || document.documentElement;
      this.scrollableElements = [this.currentScrollElement];
      debugLog('No scrollable element found, using document');
    }
    
    // Start the scroll animation
    this.startScrollAnimation();
  }
  
  /**
   * Deactivate auto-scroll
   */
  public deactivate(): void {
    if (this.state !== AutoScrollState.ACTIVE) return;
    
    this.transitionToState(AutoScrollState.INACTIVE);
    
    // Hide the circle
    this.circle.hide();
    
    // Stop the scroll animation
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Reset state
    this.currentScrollElement = null;
    this.scrollableElements = [];
  }
  
  /**
   * Start the scroll animation loop
   * Direct implementation from direct-inject.ts
   */
  private startScrollAnimation(): void {
    debugLog('Starting scroll animation');
    
    // Store the last mouse position
    let lastMouseX = 0;
    let lastMouseY = 0;
    
    // Update last mouse position on mouse move
    const mouseMoveHandler = (e: MouseEvent) => {
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };
    
    document.addEventListener('mousemove', mouseMoveHandler);
    
    // Animation loop
    const animate = () => {
      if (this.state !== AutoScrollState.ACTIVE) {
        document.removeEventListener('mousemove', mouseMoveHandler);
        return;
      }
      
      // Calculate scroll direction and speed directly
      const deltaX = lastMouseX - this.circle.getCenterX();
      const deltaY = lastMouseY - this.circle.getCenterY();
      
      // Apply scroll with parent fallback
      this.applyScroll(deltaX, deltaY);
      
      // Continue animation
      this.animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start animation
    this.animationFrameId = requestAnimationFrame(animate);
  }
  
  /**
   * Check if an element can scroll further in a given direction
   * Direct implementation from direct-inject.ts
   */
  private canScrollFurtherDirect(element: HTMLElement, deltaX: number, deltaY: number): boolean {
    if (!element) return false;
    
    // Check horizontal scrolling
    if (deltaX < 0 && element.scrollLeft > 0) {
      return true; // Can scroll left
    }
    if (deltaX > 0 && element.scrollLeft + element.clientWidth < element.scrollWidth) {
      return true; // Can scroll right
    }
    
    // Check vertical scrolling
    if (deltaY < 0 && element.scrollTop > 0) {
      return true; // Can scroll up
    }
    if (deltaY > 0 && element.scrollTop + element.clientHeight < element.scrollHeight) {
      return true; // Can scroll down
    }
    
    return false; // Cannot scroll further in the requested direction
  }
  
  /**
   * Apply scrolling to the current element
   * Direct implementation from direct-inject.ts
   */
  private async applyScroll(deltaX: number, deltaY: number): Promise<void> {
    if (!this.currentScrollElement || this.state !== AutoScrollState.ACTIVE) return;
    
    // Get current configuration
    const config = await getScrollConfig();
    
    // Calculate absolute distances for each axis
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    // Calculate speeds for each axis independently
    let speedX = 0;
    let speedY = 0;
    
    // Only apply horizontal scroll if we're beyond minDistance horizontally
    if (absDeltaX >= config.minDistance) {
      const normalizedSpeedX = Math.min(
        (absDeltaX - config.minDistance) / (config.maxDistance - config.minDistance),
        1
      );
      speedX = (deltaX / absDeltaX) * normalizedSpeedX * config.baseSpeed * this.options.speedMultiplier;
    }
    
    // Only apply vertical scroll if we're beyond minDistance vertically
    if (absDeltaY >= config.minDistance) {
      const normalizedSpeedY = Math.min(
        (absDeltaY - config.minDistance) / (config.maxDistance - config.minDistance),
        1
      );
      speedY = (deltaY / absDeltaY) * normalizedSpeedY * config.baseSpeed * this.options.speedMultiplier;
    }
    
    // If we have any scroll to apply
    if (speedX !== 0 || speedY !== 0) {
      // Try to scroll the current target element
      if (this.currentScrollElement && this.canScrollFurtherDirect(this.currentScrollElement, speedX, speedY)) {
        this.currentScrollElement.scrollLeft += speedX;
        this.currentScrollElement.scrollTop += speedY;
        debugLog('Scrolling element', 
                 this.currentScrollElement.tagName, 
                 'by', speedX.toFixed(2), speedY.toFixed(2));
        return;
      }
      
      // If we can't scroll the target element further, try its parents
      for (let i = 0; i < this.scrollableElements.length; i++) {
        const parent = this.scrollableElements[i];
        if (this.canScrollFurtherDirect(parent, speedX, speedY)) {
          // Switch to this parent
          debugLog('Switching to parent element:', parent.tagName);
          this.currentScrollElement = parent;
          
          // Apply scroll
          parent.scrollLeft += speedX;
          parent.scrollTop += speedY;
          return;
        }
      }
    }
    
    // If we get here, we can't scroll any further in this direction
    debugLog('Cannot scroll further in this direction');
  }
}
