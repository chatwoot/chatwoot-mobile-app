import type { CallTone } from '../constants/callTheme';

// Which phase colours the screen
export const callTone = (isOnHold: boolean, isConnected: boolean): CallTone =>
  isOnHold ? 'held' : isConnected ? 'live' : 'ringing';
