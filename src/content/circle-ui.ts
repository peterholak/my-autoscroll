/**
 * Circle UI component for the auto-scroll feature
 */

import { debugLog } from '../utils/types';

export class AutoScrollCircle {
  private element: HTMLElement;
  private overlay: HTMLElement;
  private centerX: number = 0;
  private centerY: number = 0;
  
  constructor() {
    // Create the circle element
    this.element = document.createElement('div');
    this.element.className = 'mac-auto-scroll-circle';
    this.setupStyles();
    
    // Create the overlay element
    this.overlay = document.createElement('div');
    this.overlay.style.position = 'fixed';
    this.overlay.style.top = '0';
    this.overlay.style.left = '0';
    this.overlay.style.width = '100%';
    this.overlay.style.height = '100%';
    this.overlay.style.zIndex = '999998'; // Below circle (999999), above page content
    this.overlay.style.display = 'none';
    // The overlay intentionally doesn't set background or pointer-events,
    // effectively capturing all mouse events while it's displayed.
    
    // Add both elements to the document body, ready to be shown.
    // Appending them here ensures they are part of the DOM early.
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.element);
  }
  
  /**
   * Set up the styles for the auto-scroll circle
   */
  private setupStyles(): void {
    // Apply styles to the circle element
    const style = this.element.style;
    style.position = 'fixed';
    style.width = '40px';
    style.height = '40px';
    style.borderRadius = '50%';
    style.backgroundColor = 'rgba(255, 255, 255, 0.5)'; // More transparent white
    style.border = '1px solid #999';
    style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    style.zIndex = '999999';
    style.pointerEvents = 'none'; // Allow clicks/events to pass through the circle itself to the overlay
    style.transform = 'translate(-50%, -50%)'; // Center the circle visually on its coordinates
    
    // Add the inner elements (arrows and center dot) using inline styles.
    // While CSS classes could be used, inline styles prevent conflicts with host page styles.
    this.element.innerHTML = `
      <div style="
        position: absolute;
        top: 3px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-bottom: 8px solid black;
      "></div>
      <div style="
        position: absolute;
        bottom: 3px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid black;
      "></div>
      <div style="
        position: absolute;
        left: 3px;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
        border-right: 8px solid black;
      "></div>
      <div style="
        position: absolute;
        right: 3px;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
        border-left: 8px solid black;
      "></div>
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 6px;
        height: 6px;
        background-color: black;
        border-radius: 50%;
      "></div>
    `;
  }
  
  /**
   * Show the circle at the specified position
   */
  public show(x: number, y: number): void {
    debugLog('Showing circle at', x, y);
    this.centerX = x;
    this.centerY = y;
    
    // Position the circle element using its top-left corner
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
    
    // Make the circle element visible
    this.element.style.display = 'block';
    // NOTE: Explicitly setting visibility/opacity might be redundant if display:block is sufficient,
    // but ensures visibility in edge cases or if other styles interfere.
    this.element.style.visibility = 'visible';
    this.element.style.opacity = '1';
    
    // Show the overlay to capture mouse events
    this.overlay.style.display = 'block';
    
    // Ensure elements are in the DOM (might have been removed or failed initial append)
    try {
      // Add overlay first if not present
      if (!this.overlay.parentElement) {
         debugLog('Appending overlay to document body');
         document.body?.appendChild(this.overlay);
      }
      // Add circle if not present
      if (!this.element.parentElement) {
        debugLog('Appending circle to document body');
        // Use optional chaining for safety
        document.body?.appendChild(this.element);
      }
    } catch (error) {
      // Log errors, but don't crash the extension
      console.error('Error ensuring circle/overlay in DOM:', error);
    }
  }
  
  /**
   * Hide and remove the circle and overlay
   */
  public hide(): void {
    debugLog('Hiding circle and overlay');
    try {
      // Hide both elements. We don't remove them from DOM, just hide.
      this.element.style.display = 'none';
      this.overlay.style.display = 'none';
    } catch (error) {
      debugLog('Error hiding circle:', error);
    }
  }
  
  /**
   * Get the center X coordinate
   */
  public getCenterX(): number {
    return this.centerX;
  }
  
  /**
   * Get the center Y coordinate
   */
  public getCenterY(): number {
    return this.centerY;
  }

  public updatePosition(x: number, y: number): void {
    this.centerX = x;
    this.centerY = y;
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
  }
}
