import { isTwilioAnswerStatus } from '@/utils/voiceCallUtils';

// Socket events for a call this device is placing can arrive before the request that
// places it returns, while the app does not yet know the call's id. They are held here for
// a short while and applied once the call exists.

const HOLD_MS = 60_000;

type Early = { sdpAnswer?: string; accepted?: boolean; providerStatus?: string; at: number };

const held = new Map<string, Early>();

const prune = () => {
  const cutoff = Date.now() - HOLD_MS;
  held.forEach((entry, callSid) => {
    if (entry.at < cutoff) held.delete(callSid);
  });
};

export const holdEarlyAnswer = (callSid: string, sdpAnswer: string) => {
  prune();
  held.set(callSid, { ...held.get(callSid), sdpAnswer, at: Date.now() });
};

export const holdEarlyAccept = (callSid: string) => {
  prune();
  held.set(callSid, { ...held.get(callSid), accepted: true, at: Date.now() });
};

// Twilio's own status for the call; an answer already seen is not replaced by an earlier
// stage delivered late
export const holdEarlyProviderStatus = (callSid: string, providerStatus: string) => {
  prune();
  const current = held.get(callSid)?.providerStatus;
  if (isTwilioAnswerStatus(current) && !isTwilioAnswerStatus(providerStatus)) return;
  held.set(callSid, { ...held.get(callSid), providerStatus, at: Date.now() });
};

// What arrived for this call before it was known, removed once taken
export const takeEarlyOutboundEvents = (callSid: string) => {
  prune();
  const entry = held.get(callSid);
  held.delete(callSid);
  return {
    sdpAnswer: entry?.sdpAnswer,
    accepted: !!entry?.accepted,
    providerStatus: entry?.providerStatus,
  };
};
