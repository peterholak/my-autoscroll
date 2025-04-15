/**
 * Utility function for retrieving auto-scroll configuration settings.
 */

import { AutoScrollOptions, defaultOptions } from './types';

/**
 * Asynchronously retrieves the current auto-scroll configuration from
 * chrome.storage.sync, falling back to default values if necessary.
 * @returns A Promise that resolves with the AutoScrollOptions.
 */
export function getScrollConfig(): Promise<AutoScrollOptions> {
  return new Promise((resolve, reject) => {
    // Check if chrome.storage is available (might not be in all contexts, e.g., testing)
    if (chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(defaultOptions, (items) => {
        // Check for runtime errors during storage access
        if (chrome.runtime.lastError) {
          console.error("Error getting scroll config:", chrome.runtime.lastError);
          // Resolve with defaults even if there was an error, to avoid breaking functionality
          resolve({ ...defaultOptions }); 
        } else {
          // Assume the retrieved items match the structure, cast carefully.
          // TODO: Add more robust validation if storage corruption is a concern.
          resolve(items as unknown as AutoScrollOptions);
        }
      });
    } else {
      // Fallback to default options if chrome.storage.sync is not available
      console.warn('chrome.storage.sync not available, using default scroll options.');
      resolve({ ...defaultOptions });
    }
  });
}

// No listener needed here, the AutoScroll class handles option updates directly.

// No static config export needed, config is loaded dynamically via getScrollConfig. 