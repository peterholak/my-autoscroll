/**
 * DOM utility functions for the auto-scroll feature
 */

import { getScrollConfig } from './config';
import { debugLog } from './types';

/**
 * Checks if an element is scrollable based on its overflow style and content size.
 * @param element The HTML element to check.
 * @returns True if the element is scrollable, false otherwise.
 */
export function isScrollable(element: HTMLElement): boolean {
  if (!element) return false;
  
  const style = window.getComputedStyle(element);
  const overflowX = style.getPropertyValue('overflow-x');
  const overflowY = style.getPropertyValue('overflow-y');
  
  const hasScrollableStyle = 
    overflowX === 'auto' || overflowX === 'scroll' ||
    overflowY === 'auto' || overflowY === 'scroll';
    
  const hasOverflow = 
    element.scrollHeight > element.clientHeight || 
    element.scrollWidth > element.clientWidth;
    
  return hasScrollableStyle && hasOverflow;
}

/**
 * Finds the innermost scrollable element at a specified position on the page.
 * @param x The X coordinate to check.
 * @param y The Y coordinate to check.
 * @returns The innermost scrollable element, or document.scrollingElement as fallback.
 */
export function findScrollableElementAtPosition(x: number, y: number): HTMLElement | null {
  // Get the element at the position
  const element = document.elementFromPoint(x, y) as HTMLElement;
  if (!element) {
    debugLog('No element found at position', x, y);
    return null;
  }
  
  debugLog('Element at position:', element.tagName, element.className);
  
  // First, check if the element itself is scrollable
  if (element !== document.documentElement && element !== document.body && isScrollable(element)) {
    debugLog('Element itself is scrollable');
    return element;
  }
  
  // If not, try to find the closest scrollable element by traversing up
  // Start with the element itself and check all ancestors
  let currentElement: HTMLElement | null = element;
  let scrollableAncestors: HTMLElement[] = [];
  
  while (currentElement) {
    if (isScrollable(currentElement)) {
      scrollableAncestors.push(currentElement);
    }
    currentElement = currentElement.parentElement;
  }
  
  debugLog('Found', scrollableAncestors.length, 'scrollable ancestors');
  
  // If we found scrollable ancestors, return the innermost one (first in the array)
  if (scrollableAncestors.length > 0) {
    debugLog('Using innermost scrollable ancestor:', 
              scrollableAncestors[0].tagName, scrollableAncestors[0].className);
    return scrollableAncestors[0];
  }
  
  // If no scrollable element is found, use the document for scrolling
  debugLog('No scrollable elements found, using document');
  return document.scrollingElement as HTMLElement || document.documentElement;
}

/**
 * Gets all scrollable parent elements of the specified element, from innermost to outermost.
 * @param element The element to find scrollable parents for.
 * @returns Array of scrollable elements, always including document.scrollingElement as fallback.
 */
export function getScrollableParents(element: HTMLElement): HTMLElement[] {
  if (!element) return [document.scrollingElement as HTMLElement || document.documentElement];
  
  const scrollableParents: HTMLElement[] = [];
  
  // Check if the element itself is scrollable
  if (isScrollable(element)) {
    scrollableParents.push(element);
  }
  
  // Traverse up the DOM tree to find all scrollable parents
  let currentElement: HTMLElement | null = element.parentElement;
  while (currentElement) {
    if (isScrollable(currentElement)) {
      scrollableParents.push(currentElement);
    }
    currentElement = currentElement.parentElement;
  }
  
  // Add document as the outermost scrollable element
  const documentElement = document.scrollingElement as HTMLElement || document.documentElement;
  if (!scrollableParents.includes(documentElement)) {
    scrollableParents.push(documentElement);
  }
  
  return scrollableParents;
}

/**
 * Calculates the scroll direction and speed based on mouse position relative to the center point.
 * Applies minimum distance threshold to each axis independently.
 * 
 * @param mouseX The current mouse X coordinate.
 * @param mouseY The current mouse Y coordinate.
 * @param circleX The center X coordinate.
 * @param circleY The center Y coordinate.
 * @param speedMultiplier The user-configured speed multiplier.
 * @returns Object with deltaX and deltaY values for scrolling.
 */
export async function calculateScrollVector(
  mouseX: number, 
  mouseY: number, 
  circleX: number, 
  circleY: number, 
  speedMultiplier: number
): Promise<{ deltaX: number; deltaY: number }> {
  // Calculate distance from circle center
  const deltaX = mouseX - circleX;
  const deltaY = mouseY - circleY;
  
  // Calculate absolute distances for each axis
  const absDeltaX = Math.abs(deltaX);
  const absDeltaY = Math.abs(deltaY);
  
  // Calculate overall distance (used for speed magnitude)
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  // Get config values
  const config = await getScrollConfig();
  
  // If overall distance is too small, don't scroll at all
  if (distance < config.minDistance) {
    return { deltaX: 0, deltaY: 0 };
  }
  
  // Linear normalization of speed between 0 and 1 based on distance
  const linearNormalizedSpeed = Math.min(
    (distance - config.minDistance) / (config.maxDistance - config.minDistance), 
    1
  );
  
  // Apply exponential curve if set in options
  const normalizedSpeed = Math.pow(linearNormalizedSpeed, config.speedExponent);
  
  // Calculate the base speed magnitude  
  const speedMagnitude = normalizedSpeed * config.baseSpeed * speedMultiplier;
  
  // Apply speed in each direction, but only if the specific axis delta exceeds minimum
  let speedX = 0;
  let speedY = 0;
  
  // Only apply horizontal scrolling if horizontal distance exceeds minimum
  if (absDeltaX >= config.minDistance) {
    speedX = (deltaX / distance) * speedMagnitude;
  }
  
  // Only apply vertical scrolling if vertical distance exceeds minimum  
  if (absDeltaY >= config.minDistance) {
    speedY = (deltaY / distance) * speedMagnitude;
  }
  
  return { deltaX: speedX, deltaY: speedY };
}

/**
 * Checks if an element can scroll further in the specified direction.
 * @param element The element to check for scrollability.
 * @param deltaX The horizontal scroll direction and speed.
 * @param deltaY The vertical scroll direction and speed.
 * @returns True if the element can scroll further in the specified direction, false otherwise.
 */
export function canScrollFurther(
  element: HTMLElement, 
  deltaX: number, 
  deltaY: number
): boolean {
  if (!element) return false;
  
  // A small buffer to prevent edge-case issues with tiny fractions
  const TOLERANCE = 1;
  
  // Check horizontal scrolling
  if (deltaX < 0 && element.scrollLeft > 0) {
    return true; // Can scroll left
  }
  if (deltaX > 0 && element.scrollLeft + element.clientWidth < element.scrollWidth - TOLERANCE) {
    return true; // Can scroll right
  }
  
  // Check vertical scrolling
  if (deltaY < 0 && element.scrollTop > 0) {
    return true; // Can scroll up
  }
  if (deltaY > 0 && element.scrollTop + element.clientHeight < element.scrollHeight - TOLERANCE) {
    return true; // Can scroll down
  }
  
  return false; // Cannot scroll further in the requested direction
}
