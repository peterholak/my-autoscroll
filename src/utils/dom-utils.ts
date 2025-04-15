/**
 * DOM utility functions for the auto-scroll feature
 */

import { scrollConfig } from './config';

/**
 * Check if an element is scrollable (has overflow)
 */
export function isScrollable(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  const overflowX = style.getPropertyValue('overflow-x');
  const overflowY = style.getPropertyValue('overflow-y');
  
  return (
    (overflowX === 'auto' || overflowX === 'scroll' || 
     overflowY === 'auto' || overflowY === 'scroll') &&
    (element.scrollHeight > element.clientHeight || 
     element.scrollWidth > element.clientWidth)
  );
}

/**
 * Find the innermost scrollable element at a given position
 */
export function findScrollableElementAtPosition(x: number, y: number): HTMLElement | null {
  // Get the element at the position
  const element = document.elementFromPoint(x, y) as HTMLElement;
  if (!element) {
    console.log('DOM Utils: No element found at position', x, y);
    return null;
  }
  
  console.log('DOM Utils: Element at position:', element.tagName, element.className);
  
  // First, check if the element itself is scrollable
  if (element !== document.documentElement && element !== document.body && isScrollable(element)) {
    console.log('DOM Utils: Element itself is scrollable');
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
  
  console.log('DOM Utils: Found', scrollableAncestors.length, 'scrollable ancestors');
  
  // If we found scrollable ancestors, return the innermost one (first in the array)
  if (scrollableAncestors.length > 0) {
    console.log('DOM Utils: Using innermost scrollable ancestor:', 
                scrollableAncestors[0].tagName, scrollableAncestors[0].className);
    return scrollableAncestors[0];
  }
  
  // If no scrollable element is found, use the document for scrolling
  console.log('DOM Utils: No scrollable elements found, using document');
  return document.scrollingElement as HTMLElement || document.documentElement;
}

/**
 * Get all scrollable parent elements in order from innermost to outermost
 */
export function getScrollableParents(element: HTMLElement): HTMLElement[] {
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
 * Calculate scroll direction and speed based on mouse position relative to the circle
 */
export function calculateScrollVector(
  mouseX: number, 
  mouseY: number, 
  circleX: number, 
  circleY: number, 
  speedMultiplier: number
): { deltaX: number; deltaY: number } {
  // Calculate distance from circle center
  const deltaX = mouseX - circleX;
  const deltaY = mouseY - circleY;
  
  // Calculate distance (used for speed)
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  // Calculate speed based on distance (with a minimum threshold)
  const minDistance = scrollConfig.minDistance;
  const maxDistance = scrollConfig.maxDistance;
  
  if (distance < minDistance) {
    return { deltaX: 0, deltaY: 0 }; // No scrolling when very close to center
  }
  
  // Normalize the speed between 0 and 1 based on distance
  const normalizedSpeed = Math.min(
    (distance - minDistance) / (maxDistance - minDistance), 
    1
  );
  
  // Apply speed multiplier and direction
  const baseSpeed = scrollConfig.baseSpeed;
  const speedX = (deltaX / distance) * normalizedSpeed * baseSpeed * speedMultiplier;
  const speedY = (deltaY / distance) * normalizedSpeed * baseSpeed * speedMultiplier;
  
  return { deltaX: speedX, deltaY: speedY };
}

/**
 * Check if an element can scroll further in a given direction
 */
export function canScrollFurther(
  element: HTMLElement, 
  deltaX: number, 
  deltaY: number
): boolean {
  // Check horizontal scrolling
  if (deltaX < 0 && element.scrollLeft > 0) {
    return true; // Can scroll left
  }
  if (deltaX > 0 && element.scrollLeft + element.clientWidth < element.scrollWidth) {
    return true; // Can scroll right
  }
  
  // Check vertical scrolling
  if (deltaY < 0 && element.scrollTop > 0) {
    return true; // Can scroll up
  }
  if (deltaY > 0 && element.scrollTop + element.clientHeight < element.scrollHeight) {
    return true; // Can scroll down
  }
  
  return false; // Cannot scroll further in the requested direction
}
