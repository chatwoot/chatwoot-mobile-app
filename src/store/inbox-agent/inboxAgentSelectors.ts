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

export const filterInboxAgents = createSelector(
  [selectAllInboxAgents, (state: RootState, searchTerm: string) => searchTerm],
  (agents, searchTerm) => {
    const agentsList = [
      {
        confirmed: true,
        name: 'None',
        id: 0,
        role: 'agent',
        accountId: 0,
        email: 'None',
      },
      ...agents,
    ];

    return searchTerm ? agentsList.filter(agent => agent?.name?.includes(searchTerm)) : agentsList;
  },
);
