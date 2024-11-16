import type { RootState } from '@/store';
import { inboxAgentAdapter } from './inboxAgentSlice';
import { createSelector } from '@reduxjs/toolkit';

export const selectInboxAgentsState = (state: RootState) => state.inboxAgents;

export const { selectAll: selectAllInboxAgents } =
  inboxAgentAdapter.getSelectors<RootState>(selectInboxAgentsState);

export const isInboxAgentFetching = createSelector(
  [selectInboxAgentsState],
  state => state.uiFlags.isLoading,
);
