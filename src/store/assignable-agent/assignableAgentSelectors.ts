import type { RootState } from '@/store';
import { assignableAgentAdapter } from './assignableAgentSlice';
import { createSelector } from '@reduxjs/toolkit';

export const selectAssignableAgentsState = (state: RootState) => state.assignableAgents;

export const { selectAll: selectAllAssignableAgents } =
  assignableAgentAdapter.getSelectors<RootState>(selectAssignableAgentsState);

export const isAssignableAgentFetching = createSelector(
  [selectAssignableAgentsState],
  state => state.uiFlags.isLoading,
);

export const filterAssignableAgents = createSelector(
  [selectAllAssignableAgents, (state: RootState, searchTerm: string) => searchTerm],
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
