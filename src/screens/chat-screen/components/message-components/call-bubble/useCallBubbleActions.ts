import { useState } from 'react';

import { VOICE_CALL_PROVIDERS, VOICE_CALL_STATUS } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { store } from '@/store';
import { selectUserId } from '@/store/auth/authSelectors';
import {
  selectActiveCall,
  selectCalls,
  selectHasActiveCall,
  selectHasIncomingCall,
  selectIsJoining,
} from '@/store/call/callSelectors';
import { addCall } from '@/store/call/callSlice';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { isStillRinging } from '@/services/voice/ringCheck';
import { systemCall } from '@/services/voice/systemCall';
import type { Message } from '@/types';
import { placeOutboundCall } from '@/utils/placeOutboundCall';
import { isRingStillOpen, type getVoiceCallDisplay } from '@/utils/voiceCallUtils';
import { reportAnswerFailure, toastJoinOutcome } from '@/utils/voiceCallFeedback';

type Display = ReturnType<typeof getVoiceCallDisplay>;

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
  const ringStillOpen = isRingStillOpen(call?.provider, item.createdAt);

  const canJoinCall =
    display.status === VOICE_CALL_STATUS.RINGING &&
    ringStillOpen &&
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
    (call?.provider === VOICE_CALL_PROVIDERS.WHATSAPP ||
      !!conversation?.meta?.sender?.phoneNumber) &&
    !!inboxId &&
    !!item.conversationId &&
    !hasActiveCall &&
    !hasIncomingCall;

  const joinCall = async () => {
    if (!canJoinCall || isJoining || !call || !callSid || !inboxId) return;
    // Stale bubbles must not end calls.
    const target = { callSid, callId: call.id, provider: call.provider, createdAt: item.createdAt };
    const stillRinging = selectHasActiveCall(store.getState())
      ? await isStillRinging(target)
      : isRingStillOpen(call.provider, item.createdAt);
    if (!stillRinging) {
      toastJoinOutcome('already_ended');
      return;
    }
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
      const { status } = await systemCall.answer(store, entry);
      toastJoinOutcome(status);
    } catch (error) {
      reportAnswerFailure(error);
    }
  };

  const callBack = async () => {
    if (!canCallBack || isCallingBack || !call || !inboxId) return;
    setIsCallingBack(true);
    await placeOutboundCall(dispatch, {
      provider: call.provider,
      conversationId: item.conversationId,
      inboxId,
      contactId: conversation?.meta?.sender?.id,
    });
    setIsCallingBack(false);
  };

  return { canJoinCall, joinCall, isJoining, canCallBack, callBack, isCallingBack };
};
