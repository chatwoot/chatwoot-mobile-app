import { useState } from 'react';

import i18n from '@/i18n';
import { VOICE_CALL_PROVIDERS, VOICE_CALL_STATUS } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { store } from '@/store';
import { selectUserId } from '@/store/auth/authSelectors';
import { callActions } from '@/store/call/callActions';
import {
  selectActiveCall,
  selectCalls,
  selectHasActiveCall,
  selectHasIncomingCall,
  selectIsJoining,
} from '@/store/call/callSelectors';
import { addCall } from '@/store/call/callSlice';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { systemCall } from '@/services/voice/systemCall';
import type { Message } from '@/types';
import { showToast } from '@/utils/toastUtils';
import type { getVoiceCallDisplay } from '@/utils/voiceCallUtils';
import {
  reportAnswerFailure,
  reportOutboundFailure,
  toastJoinOutcome,
} from '@/utils/voiceCallFeedback';

type Display = ReturnType<typeof getVoiceCallDisplay>;

// What a call bubble lets the agent do with the call it describes. Same rules as the web
// bubble: join a ring nobody has taken that is meant for this agent; call back a missed
// inbound call when no other call is on.
export const useCallBubbleActions = (item: Message, display: Display) => {
  const dispatch = useAppDispatch();
  const [isCallingBack, setIsCallingBack] = useState(false);
  const activeCall = useAppSelector(selectActiveCall);
  const hasActiveCall = useAppSelector(selectHasActiveCall);
  const hasIncomingCall = useAppSelector(selectHasIncomingCall);
  const isJoining = useAppSelector(selectIsJoining);
  const currentUserId = useAppSelector(selectUserId);
  const conversation = useAppSelector(state => selectConversationById(state, item.conversationId));
  const call = item.call;
  const callSid = call?.providerCallId;
  const inboxId = item.inboxId ?? conversation?.inboxId;
  const assigneeId = conversation?.meta?.assignee?.id;

  const canJoinCall =
    display.status === VOICE_CALL_STATUS.RINGING &&
    !display.isOutbound &&
    !call?.acceptedByAgentId &&
    !!callSid &&
    !!inboxId &&
    !!item.conversationId &&
    !(hasActiveCall && activeCall?.callSid === callSid) &&
    (!assigneeId || assigneeId === currentUserId);
  const canCallBack =
    display.isFailed &&
    !display.isOutbound &&
    !!inboxId &&
    !!item.conversationId &&
    !hasActiveCall &&
    !hasIncomingCall;

  const joinCall = async () => {
    if (!canJoinCall || isJoining || !call || !callSid || !inboxId) return;
    // A ring that arrived while the agent was away is not in the store yet
    if (!selectCalls(store.getState()).some(entry => entry.callSid === callSid)) {
      dispatch(
        addCall({
          callSid,
          callId: call.id,
          provider: call.provider,
          conversationId: item.conversationId,
          inboxId,
          callDirection: 'inbound',
        }),
      );
    }
    const entry = selectCalls(store.getState()).find(candidate => candidate.callSid === callSid);
    if (!entry) return;
    try {
      const result = (await systemCall.answer(store, entry)) as { status?: string } | void;
      toastJoinOutcome(result?.status);
    } catch (error) {
      reportAnswerFailure(error);
    }
  };

  const callBack = async () => {
    if (!canCallBack || isCallingBack || !call || !inboxId) return;
    setIsCallingBack(true);
    const isWhatsapp = call.provider === VOICE_CALL_PROVIDERS.WHATSAPP;
    try {
      const result = await dispatch(
        callActions.startOutboundCall({
          provider: call.provider,
          conversationId: item.conversationId,
          inboxId,
          contactId: conversation?.meta?.sender?.id,
        }),
      ).unwrap();
      if (result.status === 'permission_requested') {
        showToast({ message: i18n.t('CONVERSATION.HEADER.WHATSAPP_CALL_PERMISSION_REQUESTED') });
      } else if (result.status === 'permission_pending') {
        showToast({ message: i18n.t('CONVERSATION.HEADER.WHATSAPP_CALL_PERMISSION_PENDING') });
      }
    } catch (error) {
      reportOutboundFailure(
        error,
        isWhatsapp
          ? 'CONVERSATION.HEADER.WHATSAPP_CALL_FAILED'
          : 'CONVERSATION.HEADER.VOICE_CALL_FAILED',
      );
    } finally {
      setIsCallingBack(false);
    }
  };

  return { canJoinCall, joinCall, isJoining, canCallBack, callBack, isCallingBack };
};
