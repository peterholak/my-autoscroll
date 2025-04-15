/**
 * Configuration settings for auto-scroll behavior
 */

import { AutoScrollOptions, defaultOptions } from './types';

// Get current configuration from storage
export function getScrollConfig(): Promise<AutoScrollOptions> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(defaultOptions, (items) => {
      resolve(items as unknown as AutoScrollOptions);
    });
  });
}

// Listen for option changes
chrome.storage.onChanged.addListener((changes) => {
  // Configuration changes will be picked up by getScrollConfig()
  // when the next scroll operation occurs
});

export const scrollConfig = {
  // Base speed in pixels per frame
  baseSpeed: 25.0,
  
  // Minimum distance from center to start scrolling
  minDistance: 3,
  
  // Maximum distance for full speed scrolling
  maxDistance: 100,
  
  // Default speed multiplier
  defaultSpeedMultiplier: 1.0
}; 