import { MESSAGE_TYPES } from '@/constants';
import type { RootState } from '@/store';
import { createSelector } from '@reduxjs/toolkit';
import { selectConversationById } from '@/store/conversation/conversationSelectors';

export const selectUnreadIncomingCount = createSelector(
  [
    (state: RootState, conversationId: number | undefined) =>
      conversationId ? selectConversationById(state, conversationId) : undefined,
  ],
  (conversation) => {
    if (!conversation) return 0;
    const { messages, agentLastSeenAt } = conversation;
    if (!messages || messages.length === 0) return 0;

    if (!agentLastSeenAt) {
      return messages.filter(m => m.messageType === MESSAGE_TYPES.INCOMING).length;
    }

    const lastSeenIndex = messages.findIndex(m => m.createdAt > agentLastSeenAt);
    if (lastSeenIndex === -1) return 0;

    return messages.slice(lastSeenIndex).filter(m => m.messageType === MESSAGE_TYPES.INCOMING).length;
  },
);

export const selectHasUnreadIncomingMessages = createSelector(
  [
    (state: RootState, conversationId: number | undefined) =>
      selectUnreadIncomingCount(state, conversationId),
  ],
  (count) => count > 0,
);

