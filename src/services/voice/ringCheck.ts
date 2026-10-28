import { VOICE_CALL_PROVIDERS } from '@/constants';
import { CallService } from '@/store/call/callService';
import { isRingStillOpen } from '@/utils/voiceCallUtils';

type RingTarget = {
  callSid: string;
  callId?: number;
  provider?: string;
  accountId?: number;
  createdAt: unknown;
};

// Verify ringing before replacing another call.
export const isStillRinging = async (target: RingTarget) => {
  if (!isRingStillOpen(target.provider, target.createdAt)) return false;
  try {
    if (target.provider === VOICE_CALL_PROVIDERS.WHATSAPP && target.callId) {
      const details = await CallService.getWhatsappCall(target.callId, target.accountId);
      return details.status === 'ringing';
    }
    const ringing = await CallService.getRingingCalls();
    return ringing.some(call => call.call_id === target.callSid);
  } catch (error) {
    // Let the join handle transient failures.
    return (error as { response?: { status?: number } })?.response?.status !== 404;
  }
};
