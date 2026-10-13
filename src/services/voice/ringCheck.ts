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

// Whether a call a chat bubble still shows ringing is ringing on the server. Asked before
// an answer that would end the call the agent is on, so a bubble left stale by a missed
// update does not cost them that call. A check that cannot be made leaves it to the join.
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
    // A call the server no longer has is not ringing; any other failure leaves it to the join
    return (error as { response?: { status?: number } })?.response?.status !== 404;
  }
};
