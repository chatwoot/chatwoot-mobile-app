import { useEffect, useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@/hooks';
import { VOICE_CALL_STATUS } from '@/constants';
import { store } from '@/store';
import { selectCurrentUserAvailability, selectUserId } from '@/store/auth/authSelectors';
import { selectDismissedCallSids, selectLocalCallSid } from '@/store/call/callSelectors';
import { addCall } from '@/store/call/callSlice';
import { selectAllConversations } from '@/store/conversation/conversationSelectors';
import { routeVoiceCallCreated } from '@/utils/voiceCallRouting';

import { RING_TIMEOUT_MS } from '../constants/ringTimeouts';

// Cable events are one-shot, so a call that rang while the app was closed or the phone
// was locked is only visible through its ringing message in the conversation cache.
// Re-seeds whenever the set of ringing calls in that cache changes. A message older than
// the ring timeout is a call nobody can still answer, so it is not re-surfaced.
export const useRingingCallsFromCache = () => {
  const dispatch = useAppDispatch();
  const conversations = useAppSelector(selectAllConversations);
  const currentUserId = useAppSelector(selectUserId);
  const currentUserAvailability = useAppSelector(selectCurrentUserAvailability);
  const dismissedCallSids = useAppSelector(selectDismissedCallSids);

  const ringingKey = useMemo(
    () =>
      conversations
        .flatMap(conversation =>
          (conversation.messages || [])
            .filter(message => message.call?.status === VOICE_CALL_STATUS.RINGING)
            .map(message => `${conversation.id}:${message.call?.providerCallId}`),
        )
        .sort()
        .join('|'),
    [conversations],
  );

  useEffect(() => {
    if (!ringingKey) return;
    const context = {
      currentUserId,
      currentUserAvailability,
      dismissedCallSids,
      localCallSid: selectLocalCallSid(store.getState()),
    };
    conversations.forEach(conversation => {
      (conversation.messages || []).forEach(message => {
        if (message.call?.status !== VOICE_CALL_STATUS.RINGING) return;
        const startedAt = Number(message.createdAt) * 1000;
        if (!Number.isFinite(startedAt) || Date.now() - startedAt > RING_TIMEOUT_MS) return;
        const decision = routeVoiceCallCreated(message, context);
        if (decision.action === 'add') dispatch(addCall({ ...decision.call, addedAt: startedAt }));
      });
    });
    // Keyed on the ringing calls present, not on every message update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ringingKey, currentUserId, currentUserAvailability]);
};
