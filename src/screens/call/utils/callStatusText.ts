import i18n from '@/i18n';
import type { LiveCall } from '@/store/call/callTypes';
import { isOutboundCallRinging } from '@/utils/voiceCallUtils';

export type CallStatusFlags = {
  isOnHold?: boolean;
  isConnected: boolean;
  isConnecting?: boolean;
  isIncoming?: boolean;
};

// The line above the caller: the timer while connected, the phase otherwise
export const callStatusText = (call: LiveCall, duration: string, flags: CallStatusFlags) => {
  if (flags.isOnHold) return i18n.t('CONVERSATION.VOICE_WIDGET.ON_HOLD');
  if (flags.isConnected) return duration;
  if (flags.isConnecting) return i18n.t('CONVERSATION.VOICE_WIDGET.CONNECTING');
  if (flags.isIncoming) return i18n.t('CONVERSATION.VOICE_WIDGET.INCOMING_CALL');
  return i18n.t(
    isOutboundCallRinging(call)
      ? 'CONVERSATION.VOICE_WIDGET.RINGING'
      : 'CONVERSATION.VOICE_WIDGET.CALLING',
  );
};
