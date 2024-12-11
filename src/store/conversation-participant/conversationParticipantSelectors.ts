import type { RootState } from '@/store';

import { createSelector } from '@reduxjs/toolkit';

export const selectConversationParticipantsState = (state: RootState) =>
  state.conversationParticipants;

export const selectConversationParticipants = createSelector(
  [selectConversationParticipantsState],
  state => state.records,
);

export const selectConversationParticipantsByConversationId = createSelector(
  [selectConversationParticipants, (_state: RootState, conversationId: number) => conversationId],
  (state, conversationId) => state[conversationId],
);
