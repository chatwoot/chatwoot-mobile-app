import { VOICE_CALL_PROVIDERS } from '@/constants';

// Meta drops unanswered WhatsApp calls after roughly 30 to 60 s; Twilio keeps ringing
// until the caller gives up. Past these, this device stops ringing and waits for the
// server's own status update.
const RING_TIMEOUT_MS: Record<string, number> = {
  [VOICE_CALL_PROVIDERS.WHATSAPP]: 45_000,
  [VOICE_CALL_PROVIDERS.TWILIO]: 60_000,
};

const DEFAULT_RING_TIMEOUT_MS = 60_000;

export const ringTimeoutFor = (provider?: string | null) =>
  RING_TIMEOUT_MS[provider ?? ''] ?? DEFAULT_RING_TIMEOUT_MS;
