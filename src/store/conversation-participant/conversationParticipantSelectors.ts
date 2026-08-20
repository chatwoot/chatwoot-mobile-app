import type { RootState } from '@/store';
import type { Agent } from '@/types';

import { createSelector } from '@reduxjs/toolkit';

// Shared instance so conversations without fetched participants keep a stable
// reference between renders.
const NO_PARTICIPANTS: Agent[] = [];

export const selectConversationParticipantsState = (state: RootState) =>
  state.conversationParticipants;

export const selectConversationParticipants = createSelector(
  [selectConversationParticipantsState],
  state => state.records,
);

export const selectConversationParticipantsByConversationId = createSelector(
  [selectConversationParticipants, (_state: RootState, conversationId: number) => conversationId],
  (state, conversationId) => state[conversationId] ?? NO_PARTICIPANTS,
);
