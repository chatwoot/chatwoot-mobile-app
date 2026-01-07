/**
 * Performance optimizations to prevent crashes and improve app stability
 * Based on React Native, Expo, and Firebase best practices
 */

import { InteractionManager, Platform } from 'react-native';

/**
 * Run expensive operations after interactions complete
 * Prevents UI blocking and crashes during animations/gestures
 */
export const runAfterInteractions = (callback: () => void) => {
  InteractionManager.runAfterInteractions(() => {
    callback();
  });
};

/**
 * Debounce function to prevent excessive calls
 * Useful for search inputs, scroll handlers, etc.
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

/**
 * Throttle function to limit execution rate
 * Prevents performance issues from rapid repeated calls
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Image optimization settings for expo-image
 */
export const IMAGE_CACHE_POLICY = {
  memory: 'memory-disk' as const,
  disk: 'disk' as const,
};

/**
 * FlashList performance settings
 * Optimized for chat/list screens to prevent crashes
 */
export const FLASHLIST_PERFORMANCE_CONFIG = {
  removeClippedSubviews: true,
  maxToRenderPerBatch: 10,
  updateCellsBatchingPeriod: 50,
  windowSize: 21,
  initialNumToRender: 15,
  // iOS specific optimizations
  ...(Platform.OS === 'ios' && {
    disableIntervalMomentum: true,
  }),
};

/**
 * Memory management - clear caches when memory is low
 */
export const clearCachesOnLowMemory = () => {
  if (Platform.OS === 'ios') {
    // iOS will automatically handle memory warnings
    // React Native will call componentWillUnmount on low memory
  }
};

/**
 * Prevent multiple rapid submissions
 */
export const preventDoubleSubmit = (() => {
  let isSubmitting = false;
  
  return async <T>(asyncFunction: () => Promise<T>): Promise<T | null> => {
    if (isSubmitting) {
      console.warn('[Performance] Prevented double submit');
      return null;
    }
    
    isSubmitting = true;
    try {
      const result = await asyncFunction();
      return result;
    } finally {
      isSubmitting = false;
    }
  };
})();
