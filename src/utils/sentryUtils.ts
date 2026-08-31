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
 * HTTP statuses the app has no fix for: an expired session, which the response
 * interceptor turns into a logout, and server-side failures, which the user
 * already sees as an error toast.
 */
const isExpectedHttpError = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) {
    return false;
  }
  const status = error.response?.status;
  return status === 401 || (!!status && status >= 500);
};

/**
 * True when an error tracks the device, the network, or the server rather than
 * an app defect. Used by `beforeSend` to keep such errors out of reporting.
 */
export const isUnreportableError = (error: unknown): boolean =>
  isTransportError(error) || isExpectedHttpError(error);

/**
 * Push registration failures that no app-side change can resolve: the device
 * cannot reach Firebase, has no Google Play Services to register with, or never
 * received an APNS token.
 *
 * Matched on the native message. Firebase collapses these into the single
 * `messaging/unknown` code, and some arrive from the native layer with no code
 * at all.
 */
const UNACTIONABLE_PUSH_MESSAGES = [
  // Android: registration rejected, or Play Services missing entirely
  'SERVICE_NOT_AVAILABLE',
  'MISSING_INSTANCEID_SERVICE',
  'AUTHENTICATION_FAILED',
  'TOO_MANY_REGISTRATIONS',
  'FIS_AUTH_ERROR',
  // iOS: the Firebase installations handshake never completed
  'The request timed out',
  'The network connection was lost',
  'The Internet connection appears to be offline',
  'A TLS error caused the secure connection to fail',
  'An SSL error has occurred',
  'A server with the specified hostname could not be found',
  'No APNS token specified',
];

/**
 * True when a push token could not be fetched for reasons that track device
 * environment rather than app defects, so they are excluded from error reporting.
 *
 * Scoped to the push token flow: the messages above also describe ordinary
 * network failures elsewhere, which are reported.
 */
export const isUnactionablePushError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : '';
  return UNACTIONABLE_PUSH_MESSAGES.some(pattern => message.includes(pattern));
};
