/**
 * Content script entry point for the macOS Auto-Scroll extension
 */

import { AutoScroll } from './autoscroll';
import { debugLog } from '../utils/types';

// Log initialization
debugLog('Content script loaded');

// Initialize auto-scroll functionality when the DOM is ready
function initAutoScroll() {
  try {
    debugLog('Initializing AutoScroll');
    const autoScroll = new AutoScroll();
    autoScroll.init();
    debugLog('AutoScroll initialized successfully');
    
    // Add a direct event listener to test middle click
    document.addEventListener('mousedown', (event) => {
      if (event.button === 1) {
        debugLog('Middle mouse button clicked at', event.clientX, event.clientY);
      }
    });
  } catch (error) {
    debugLog('Error initializing AutoScroll:', error);
  }
}

// Initialize immediately if document is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  debugLog('Document already loaded, initializing immediately');
  initAutoScroll();
} else {
  // Otherwise wait for DOMContentLoaded
  debugLog('Waiting for DOMContentLoaded');
  document.addEventListener('DOMContentLoaded', () => {
    debugLog('DOM fully loaded');
    initAutoScroll();
  });
}
