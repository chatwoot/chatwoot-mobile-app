import { isTwilioAnswerStatus } from '@/utils/voiceCallUtils';

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

export const holdEarlyProviderStatus = (callSid: string, providerStatus: string) => {
  prune();
  const current = held.get(callSid)?.providerStatus;
  if (isTwilioAnswerStatus(current) && !isTwilioAnswerStatus(providerStatus)) return;
  held.set(callSid, { ...held.get(callSid), providerStatus, at: Date.now() });
};

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
