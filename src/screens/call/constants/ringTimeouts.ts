// How long this device rings an unanswered call before it stops and waits for the
// server's own status update. It matches the server's window for both providers, so a
// phone never gives up while the caller is still being rung.
export const RING_TIMEOUT_MS = 60_000;
