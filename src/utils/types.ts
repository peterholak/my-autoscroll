/**
 * Types for the auto-scroll extension
 */

export interface AutoScrollOptions {
  speedMultiplier: number;
  debugMode: boolean;
  baseSpeed: number;
  minDistance: number;
  maxDistance: number;
  clickDeadZone: number;  // Maximum distance in pixels to consider a click vs drag
}

export const defaultOptions: AutoScrollOptions = {
  speedMultiplier: 1.0,
  debugMode: false,
  baseSpeed: 25.0,
  minDistance: 3,
  maxDistance: 100,
  clickDeadZone: 5  // 5 pixels of movement is considered a click
};

// Cache for debug mode to avoid frequent storage access
let cachedDebugMode = false;

// Initialize debug mode from storage
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.sync.get(['debugMode'], (result) => {
    cachedDebugMode = result.debugMode === true;
  });
  
  // Listen for changes to debug mode
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.debugMode) {
      cachedDebugMode = changes.debugMode.newValue === true;
    }
  });
}

// Global debug logger function
export function debugLog(message: string, ...args: any[]): void {
  // In service worker context, always log important messages
  if (typeof window === 'undefined') {
    if (message.includes('error') || message.includes('Error') || message.includes('fail') || message.includes('Fail')) {
      console.log('[AutoScroll]', message, ...args);
    }
    return;
  }
  
  // In window context, check cached debug mode
  if (cachedDebugMode) {
    console.log('[AutoScroll]', message, ...args);
  }
}
