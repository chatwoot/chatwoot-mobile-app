import i18n from '@/i18n';
import { VOICE_CALL_PROVIDERS } from '@/constants';
import type { AppDispatch } from '@/store';
import { callActions, type StartOutboundCallParams } from '@/store/call/callActions';

import { showToast } from './toastUtils';
import { reportOutboundFailure } from './voiceCallFeedback';

// Places a call from the conversation, telling the agent about a permission request sent
// to the contact or a call that could not start. Permission outcomes are information
// rather than failures.
export const placeOutboundCall = async (dispatch: AppDispatch, params: StartOutboundCallParams) => {
  try {
    const result = await dispatch(callActions.startOutboundCall(params)).unwrap();
    if (result.status === 'permission_requested') {
      showToast({ message: i18n.t('CONVERSATION.HEADER.WHATSAPP_CALL_PERMISSION_REQUESTED') });
    } else if (result.status === 'permission_pending') {
      showToast({ message: i18n.t('CONVERSATION.HEADER.WHATSAPP_CALL_PERMISSION_PENDING') });
    }
  } catch (error) {
    reportOutboundFailure(
      error,
      params.provider === VOICE_CALL_PROVIDERS.WHATSAPP
        ? 'CONVERSATION.HEADER.WHATSAPP_CALL_FAILED'
        : 'CONVERSATION.HEADER.VOICE_CALL_FAILED',
    );
  }
};
