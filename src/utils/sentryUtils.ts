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
