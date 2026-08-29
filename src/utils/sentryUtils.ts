import axios from 'axios';

/**
 * True when a request failed before any server response was received — offline
 * device, DNS/TLS failure, timeout, or a client-side cancellation.
 *
 * These carry no server-side detail to act on and their volume tracks device
 * connectivity rather than app defects, so they are excluded from error reporting.
 */
export const isTransportError = (error: unknown): boolean =>
  axios.isCancel(error) || (axios.isAxiosError(error) && !error.response);

/**
 * Push registration failures that no app-side change can resolve: the device
 * cannot reach Firebase, or has no Google Play Services to register with.
 *
 * Matched on the native message because Firebase collapses all of them into the
 * single `messaging/unknown` code.
 */
const UNACTIONABLE_PUSH_MESSAGES = [
  // Android: registration rejected, or Play Services missing entirely
  'SERVICE_NOT_AVAILABLE',
  'MISSING_INSTANCEID_SERVICE',
  'AUTHENTICATION_FAILED',
  'TOO_MANY_REGISTRATIONS',
  // iOS: the Firebase installations handshake never completed
  'The request timed out',
  'The network connection was lost',
  'The Internet connection appears to be offline',
];

const isFirebaseMessagingError = (error: unknown): boolean => {
  const code = (error as { code?: unknown })?.code;
  return typeof code === 'string' && code.startsWith('messaging/');
};

/**
 * True when a push token could not be fetched for reasons that track device
 * environment rather than app defects, so they are excluded from error reporting.
 */
export const isUnactionablePushError = (error: unknown): boolean => {
  if (!isFirebaseMessagingError(error)) {
    return false;
  }
  const message = error instanceof Error ? error.message : '';
  return UNACTIONABLE_PUSH_MESSAGES.some(pattern => message.includes(pattern));
};
