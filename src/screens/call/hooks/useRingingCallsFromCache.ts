import { useEffect } from 'react';
import { createSelector } from '@reduxjs/toolkit';

import { useAppDispatch, useAppSelector } from '@/hooks';
import { VOICE_CALL_STATUS } from '@/constants';
import { store } from '@/store';
import { selectCurrentUserReceivesCalls, selectUserId } from '@/store/auth/authSelectors';
import { selectDismissedCallSids, selectLocalCallSid } from '@/store/call/callSelectors';
import { addCall } from '@/store/call/callSlice';
import { selectAllConversations } from '@/store/conversation/conversationSelectors';
import { routeVoiceCallCreated } from '@/utils/voiceCallRouting';

import { RING_TIMEOUT_MS } from '../constants/ringTimeouts';

const selectRingingKey = createSelector(selectAllConversations, conversations =>
  conversations
    .flatMap(conversation =>
      (conversation.messages || [])
        .filter(message => message.call?.status === VOICE_CALL_STATUS.RINGING)
        .map(
          message =>
            `${conversation.id}:${message.call?.providerCallId}:${conversation.meta?.assignee?.id ?? ''}`,
        ),
    )
    .sort()
    .join('|'),
);

// Cable events are not replayed automatically.
export const useRingingCallsFromCache = () => {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector(selectUserId);
  const receivesCalls = useAppSelector(selectCurrentUserReceivesCalls);
  const dismissedCallSids = useAppSelector(selectDismissedCallSids);

  const ringingKey = useAppSelector(selectRingingKey);

  useEffect(() => {
    if (!ringingKey) return;
    const context = {
      currentUserId,
      receivesCalls,
      dismissedCallSids,
      localCallSid: selectLocalCallSid(store.getState()),
    };
    selectAllConversations(store.getState()).forEach(conversation => {
      (conversation.messages || []).forEach(message => {
        if (message.call?.status !== VOICE_CALL_STATUS.RINGING) return;
        const startedAt = Number(message.createdAt) * 1000;
        if (!Number.isFinite(startedAt) || Date.now() - startedAt > RING_TIMEOUT_MS) return;
        // Cached assignments supersede older socket payloads.
        const decision = routeVoiceCallCreated({ ...message, conversation }, context);
        if (decision.action === 'add') dispatch(addCall({ ...decision.call, addedAt: startedAt }));
      });
    });
    // Dependencies track ringing identity and assignment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ringingKey, currentUserId, receivesCalls]);
};
