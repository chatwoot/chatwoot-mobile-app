import i18n from '@/i18n';
import { isMediaUnavailableError } from '@/services/voice/callEngine';

import { showToast } from './toastUtils';

// Tells the agent how an answer that did not join played out
export const toastJoinOutcome = (status?: string) => {
  if (status === 'answered_elsewhere') {
    showToast({ message: i18n.t('CONVERSATION.VOICE_WIDGET.ANSWERED_ELSEWHERE') });
  } else if (status === 'already_ended') {
    showToast({ message: i18n.t('CONVERSATION.VOICE_WIDGET.CALL_ALREADY_ENDED') });
  }
};

// Why an answer failed: the microphone or media engine was unavailable, or the request itself
export const toastJoinError = (error: unknown) => {
  showToast({
    message: i18n.t(
      isMediaUnavailableError(error)
        ? 'CONVERSATION.VOICE_WIDGET.ANSWER_UNAVAILABLE'
        : 'CONVERSATION.VOICE_WIDGET.JOIN_FAILED',
    ),
  });
};
