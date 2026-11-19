import type { CallTone } from '../constants/callTheme';

export const callTone = (isOnHold: boolean, isConnected: boolean): CallTone =>
  isOnHold ? 'held' : isConnected ? 'live' : 'ringing';
