/**
 * Types and utilities for the auto-scroll extension.
 */

/**
 * Configuration options for the auto-scroll functionality.
 */
export interface AutoScrollOptions {
  /** 
   * User-controlled speed multiplier (0.1-10.0). 
   * Acts as a global speed adjustment. 
   */
  speedMultiplier: number;
  
  /** 
   * When true, writes diagnostic logs to the console.
   */
  debugMode: boolean;
  
  /** 
   * Base scrolling speed in pixels per frame (1-100).
   * The core speed before multipliers are applied.
   */
  baseSpeed: number;
  
  /** 
   * Minimum distance in pixels from circle center to start scrolling (1-50).
   * Creates a dead zone in the center of the circle.
   */
  minDistance: number;
  
  /** 
   * Maximum distance in pixels for reaching full scroll speed (50-500).
   * Distance at which scroll speed reaches its maximum.
   */
  maxDistance: number;
  
  /** 
   * Maximum distance in pixels to consider a click vs drag (1-20).
   * Prevents accidental drags when trying to click.
   */
  clickDeadZone: number;
  
  /** 
   * Controls how quickly scroll speed increases with distance (0.5-3.0).
   * Values > 1 create exponential acceleration, < 1 create logarithmic slowdown.
   */
  speedExponent: number;
}

/**
 * Default values for all auto-scroll options.
 */
export const defaultOptions: AutoScrollOptions = {
  speedMultiplier: 1.0,
  debugMode: false,
  baseSpeed: 45.0,
  minDistance: 25,
  maxDistance: 350,
  clickDeadZone: 5,
  speedExponent: 1.3
};

/**
 * Debug logging system with caching to avoid frequent storage access.
 * Log messages are only displayed if debugMode is enabled.
 */

// Cache the debug mode setting to avoid repeated storage access
let cachedDebugMode = false;

// Initialize and listen for changes to debug mode if in a browser environment
function initDebugMode() {
  try {
    if (typeof chrome !== 'undefined' && chrome?.storage?.sync) {
      chrome.storage.sync.get(['debugMode'], (result) => {
        cachedDebugMode = result.debugMode === true;
      });
      
      chrome.storage.onChanged.addListener((changes) => {
        if (changes.debugMode) {
          cachedDebugMode = changes.debugMode.newValue === true;
        }
      });
    }
  } catch (error) {
    console.error('Error initializing debug mode:', error);
    // If there's an error, default to false
    cachedDebugMode = false;
  }
}

// Call init function immediately
initDebugMode();

/**
 * Logs a message to the console if debug mode is enabled.
 * Critical error messages are always logged regardless of debug mode.
 * @param message The message to log
 * @param args Additional arguments to include in the log
 */
export function debugLog(message: string, ...args: any[]): void {
  try {
    // In non-window context (e.g., service workers), only log critical messages
    if (typeof window === 'undefined') {
      // Always log critical messages in any context
      const isCritical = typeof message === 'string' && (
        message.toLowerCase().includes('error') || 
        message.toLowerCase().includes('fail')
      );
      
      if (isCritical) {
        console.log('[AutoScroll]', message, ...args);
      }
      return;
    }
    
    // In window context, check cached debug mode
    if (cachedDebugMode) {
      console.log('[AutoScroll]', message, ...args);
    }
  } catch (e) {
    // Last resort fallback if something goes wrong
    console.log('[AutoScroll] (Error in debugLog):', message);
  }
}
