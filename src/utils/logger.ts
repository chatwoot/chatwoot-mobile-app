const DEBUG = __DEV__;

export const logger = {
  log: (...args: unknown[]) => {
    if (DEBUG) {
      console.log('[Kanban]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    console.error('[Kanban]', ...args);
  },
  warn: (...args: unknown[]) => {
    if (DEBUG) {
      console.warn('[Kanban]', ...args);
    }
  },
};

