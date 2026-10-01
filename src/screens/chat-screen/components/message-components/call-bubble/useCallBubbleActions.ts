import { useState } from 'react';

import { VOICE_CALL_STATUS } from '@/constants';
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
import { systemCall } from '@/services/voice/systemCall';
import type { Message } from '@/types';
import { placeOutboundCall } from '@/utils/placeOutboundCall';
import type { getVoiceCallDisplay } from '@/utils/voiceCallUtils';
import { reportAnswerFailure, toastJoinOutcome } from '@/utils/voiceCallFeedback';

type Display = ReturnType<typeof getVoiceCallDisplay>;

// What a call bubble lets the agent do with the call it describes: join a ring nobody
// has taken that is meant for this agent; call back a missed inbound call when no other
// call is on.
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
