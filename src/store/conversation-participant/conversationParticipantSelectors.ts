import type { RootState } from '@/store';

import { createSelector } from '@reduxjs/toolkit';

export const selectConversationParticipantsState = (state: RootState) =>
  state.conversationParticipants;

export const isConversationParticipantsFetching = createSelector(
  [selectConversationParticipantsState],
  state => state.uiFlags.loading,
);

export const selectConversationParticipants = createSelector(
  [selectConversationParticipantsState],
  state => state.records,
);

export const selectConversationParticipantsByConversationId = createSelector(
  [selectConversationParticipants, (_state: RootState, conversationId: number) => conversationId],
  // Undefined until the fetch for this conversation succeeds. An empty array
  // means the conversation genuinely has no participants, so the two cannot be
  // collapsed: updates replace the whole set.
  (state, conversationId) => state[conversationId],
);
