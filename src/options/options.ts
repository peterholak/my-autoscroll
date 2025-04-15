import { AutoScrollOptions, defaultOptions } from '../utils/types';

// Constants for storage keys (optional but good practice)
const OPTION_KEYS = {
  SPEED_MULTIPLIER: 'speedMultiplier',
  BASE_SPEED: 'baseSpeed',
  MIN_DISTANCE: 'minDistance',
  MAX_DISTANCE: 'maxDistance',
  CLICK_DEAD_ZONE: 'clickDeadZone',
  SPEED_EXPONENT: 'speedExponent',
  DEBUG_MODE: 'debugMode'
};

// Helper to safely get DOM elements
function getElement<T extends HTMLElement>(id: string, type: new () => T): T | null {
  const element = document.getElementById(id);
  if (!element) {
    console.error(`Element with ID '${id}' not found.`);
    return null;
  }
  if (!(element instanceof type)) {
     console.error(`Element with ID '${id}' is not of type ${type.name}.`);
     return null;
  }
  return element as T;
}

// DOM elements - Use helper for safer retrieval
const speedMultiplierInput = getElement('speedMultiplier', HTMLInputElement);
const speedMultiplierValue = getElement('speedMultiplierValue', HTMLDivElement);
const baseSpeedInput = getElement('baseSpeed', HTMLInputElement);
const baseSpeedValue = getElement('baseSpeedValue', HTMLDivElement);
const minDistanceInput = getElement('minDistance', HTMLInputElement);
const minDistanceValue = getElement('minDistanceValue', HTMLDivElement);
const maxDistanceInput = getElement('maxDistance', HTMLInputElement);
const maxDistanceValue = getElement('maxDistanceValue', HTMLDivElement);
const clickDeadZoneInput = getElement('clickDeadZone', HTMLInputElement);
const clickDeadZoneValue = getElement('clickDeadZoneValue', HTMLDivElement);
const debugModeCheckbox = getElement('debugMode', HTMLInputElement);
const saveButton = getElement('saveButton', HTMLButtonElement);
const statusElement = getElement('status', HTMLDivElement);
const speedExponentInput = getElement('speedExponent', HTMLInputElement);
const speedExponentValue = getElement('speedExponentValue', HTMLDivElement);

/**
 * Updates the text content of a display element when an input slider changes.
 * @param input The input element (e.g., range slider).
 * @param valueElement The element displaying the input's value.
 */
function updateDisplayedValue(input: HTMLInputElement | null, valueElement: HTMLDivElement | null): void {
  if (input && valueElement) {
     valueElement.textContent = input.value;
  }
}

/**
 * Loads options from chrome.storage.sync and populates the form fields.
 */
function loadOptions(): void {
  chrome.storage.sync.get(defaultOptions, (items) => {
    const options = items as AutoScrollOptions; // Assume storage structure matches default

    // Populate inputs only if they exist
    if (speedMultiplierInput) speedMultiplierInput.value = options.speedMultiplier.toString();
    if (baseSpeedInput) baseSpeedInput.value = options.baseSpeed.toString();
    if (minDistanceInput) minDistanceInput.value = options.minDistance.toString();
    if (maxDistanceInput) maxDistanceInput.value = options.maxDistance.toString();
    if (clickDeadZoneInput) clickDeadZoneInput.value = options.clickDeadZone.toString();
    if (speedExponentInput) speedExponentInput.value = options.speedExponent.toString();
    if (debugModeCheckbox) debugModeCheckbox.checked = options.debugMode;

    // Update displayed values (handles null checks internally)
    updateDisplayedValue(speedMultiplierInput, speedMultiplierValue);
    updateDisplayedValue(baseSpeedInput, baseSpeedValue);
    updateDisplayedValue(minDistanceInput, minDistanceValue);
    updateDisplayedValue(maxDistanceInput, maxDistanceValue);
    updateDisplayedValue(clickDeadZoneInput, clickDeadZoneValue);
    updateDisplayedValue(speedExponentInput, speedExponentValue);
  });
}

/**
 * Saves the current form values to chrome.storage.sync.
 */
function saveOptions(): void {
  // Ensure all necessary elements exist before saving
  if (!speedMultiplierInput || !baseSpeedInput || !minDistanceInput || !maxDistanceInput || 
      !clickDeadZoneInput || !speedExponentInput || !debugModeCheckbox || !statusElement) {
    console.error("One or more option elements are missing. Cannot save.");
    if (statusElement) statusElement.textContent = 'Error: Missing form elements!';
    return;
  }

  // Helper to parse float safely, returning default if NaN
  const parseFloatOrDefault = (value: string, defaultValue: number): number => {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
  };

  const options: AutoScrollOptions = {
    speedMultiplier: parseFloatOrDefault(speedMultiplierInput.value, defaultOptions.speedMultiplier),
    baseSpeed:       parseFloatOrDefault(baseSpeedInput.value, defaultOptions.baseSpeed),
    minDistance:     parseFloatOrDefault(minDistanceInput.value, defaultOptions.minDistance),
    maxDistance:     parseFloatOrDefault(maxDistanceInput.value, defaultOptions.maxDistance),
    clickDeadZone:   parseFloatOrDefault(clickDeadZoneInput.value, defaultOptions.clickDeadZone),
    speedExponent:   parseFloatOrDefault(speedExponentInput.value, defaultOptions.speedExponent),
    debugMode:       debugModeCheckbox.checked
  };

  chrome.storage.sync.set(options, () => {
    // Update status to let user know options were saved
    statusElement.textContent = 'Options saved.';
    setTimeout(() => {
      if (statusElement) statusElement.textContent = ''; // Check existence again
    }, 1500);
  });
}

/**
 * Initializes the options page: loads options and sets up event listeners.
 */
function init(): void {
  loadOptions();

  // Add event listeners only if elements exist
  speedMultiplierInput?.addEventListener('input', () => updateDisplayedValue(speedMultiplierInput, speedMultiplierValue));
  baseSpeedInput?.addEventListener('input', () => updateDisplayedValue(baseSpeedInput, baseSpeedValue));
  minDistanceInput?.addEventListener('input', () => updateDisplayedValue(minDistanceInput, minDistanceValue));
  maxDistanceInput?.addEventListener('input', () => updateDisplayedValue(maxDistanceInput, maxDistanceValue));
  clickDeadZoneInput?.addEventListener('input', () => updateDisplayedValue(clickDeadZoneInput, clickDeadZoneValue));
  speedExponentInput?.addEventListener('input', () => updateDisplayedValue(speedExponentInput, speedExponentValue));

  saveButton?.addEventListener('click', saveOptions);
}

// Run initialization when the DOM is fully loaded and parsed.
document.addEventListener('DOMContentLoaded', init);
