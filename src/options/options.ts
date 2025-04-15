import { AutoScrollOptions, defaultOptions } from '../utils/types';

// DOM elements
const speedMultiplierInput = document.getElementById('speedMultiplier') as HTMLInputElement;
const speedMultiplierValue = document.getElementById('speedMultiplierValue') as HTMLDivElement;
const baseSpeedInput = document.getElementById('baseSpeed') as HTMLInputElement;
const baseSpeedValue = document.getElementById('baseSpeedValue') as HTMLDivElement;
const minDistanceInput = document.getElementById('minDistance') as HTMLInputElement;
const minDistanceValue = document.getElementById('minDistanceValue') as HTMLDivElement;
const maxDistanceInput = document.getElementById('maxDistance') as HTMLInputElement;
const maxDistanceValue = document.getElementById('maxDistanceValue') as HTMLDivElement;
const clickDeadZoneInput = document.getElementById('clickDeadZone') as HTMLInputElement;
const clickDeadZoneValue = document.getElementById('clickDeadZoneValue') as HTMLDivElement;
const debugModeCheckbox = document.getElementById('debugMode') as HTMLInputElement;
const saveButton = document.getElementById('saveButton') as HTMLButtonElement;
const statusElement = document.getElementById('status') as HTMLDivElement;
const speedExponentInput = document.getElementById('speedExponent') as HTMLInputElement;
const speedExponentValue = document.getElementById('speedExponentValue') as HTMLDivElement;

// Update displayed value when slider changes
function updateDisplayedValue(input: HTMLInputElement, valueElement: HTMLDivElement): void {
  valueElement.textContent = input.value;
}

// Load saved options
function loadOptions(): void {
  chrome.storage.sync.get(defaultOptions, (items) => {
    const options = items as AutoScrollOptions;
    speedMultiplierInput.value = options.speedMultiplier.toString();
    baseSpeedInput.value = options.baseSpeed.toString();
    minDistanceInput.value = options.minDistance.toString();
    maxDistanceInput.value = options.maxDistance.toString();
    clickDeadZoneInput.value = options.clickDeadZone.toString();
    speedExponentInput.value = options.speedExponent.toString();
    debugModeCheckbox.checked = options.debugMode;
    
    // Update displayed values
    updateDisplayedValue(speedMultiplierInput, speedMultiplierValue);
    updateDisplayedValue(baseSpeedInput, baseSpeedValue);
    updateDisplayedValue(minDistanceInput, minDistanceValue);
    updateDisplayedValue(maxDistanceInput, maxDistanceValue);
    updateDisplayedValue(clickDeadZoneInput, clickDeadZoneValue);
    updateDisplayedValue(speedExponentInput, speedExponentValue);
  });
}

// Save options to chrome.storage.sync
function saveOptions(): void {
  const options: AutoScrollOptions = {
    speedMultiplier: parseFloat(speedMultiplierInput.value),
    baseSpeed: parseFloat(baseSpeedInput.value),
    minDistance: parseFloat(minDistanceInput.value),
    maxDistance: parseFloat(maxDistanceInput.value),
    clickDeadZone: parseFloat(clickDeadZoneInput.value),
    speedExponent: parseFloat(speedExponentInput.value),
    debugMode: debugModeCheckbox.checked
  };

  chrome.storage.sync.set(options, () => {
    // Update status to let user know options were saved
    statusElement.textContent = 'Options saved.';
    setTimeout(() => {
      statusElement.textContent = '';
    }, 1500);
  });
}

// Initialize the options page
function init(): void {
  // Load saved options
  loadOptions();

  // Add event listeners for value updates
  speedMultiplierInput.addEventListener('input', () => updateDisplayedValue(speedMultiplierInput, speedMultiplierValue));
  baseSpeedInput.addEventListener('input', () => updateDisplayedValue(baseSpeedInput, baseSpeedValue));
  minDistanceInput.addEventListener('input', () => updateDisplayedValue(minDistanceInput, minDistanceValue));
  maxDistanceInput.addEventListener('input', () => updateDisplayedValue(maxDistanceInput, maxDistanceValue));
  clickDeadZoneInput.addEventListener('input', () => updateDisplayedValue(clickDeadZoneInput, clickDeadZoneValue));
  speedExponentInput.addEventListener('input', () => updateDisplayedValue(speedExponentInput, speedExponentValue));
  
  // Add save button listener
  saveButton.addEventListener('click', saveOptions);
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
