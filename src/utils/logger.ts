/**
 * Production-safe logger that disables console logs in production builds
 * This prevents performance issues and crashes from excessive logging
 */

const isDevelopment = __DEV__;

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    // Always log errors, but report to Sentry in production
    console.error(...args);
    
    if (!isDevelopment) {
      try {
        const Sentry = require('@sentry/react-native');
        Sentry.captureException(new Error(args.join(' ')));
      } catch (e) {
        // Sentry not available
      }
    }
  },
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
};

// Disable all console logs in production
if (!isDevelopment) {
  console.log = () => {};
  console.warn = () => {};
  console.info = () => {};
  // Keep console.error for critical issues
}
