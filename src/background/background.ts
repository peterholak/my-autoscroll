// Background script for the macOS Auto-Scroll extension
// This script is minimal as most functionality is in the content script

import { defaultOptions, debugLog } from '../utils/types';

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  // Use console.log directly here since this is important installation info
  console.log('macOS Auto-Scroll extension installed');
  
  // Set default options if not already set
  chrome.storage.sync.get(['speedMultiplier', 'debugMode'], (result) => {
    if (result.speedMultiplier === undefined || result.debugMode === undefined) {
      chrome.storage.sync.set(defaultOptions);
      console.log('Default options set:', defaultOptions);
    }
  });
});

// No other background functionality needed for now
