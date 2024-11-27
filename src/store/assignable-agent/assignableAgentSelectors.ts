import type { RootState } from '@/store';

import { createSelector } from '@reduxjs/toolkit';

export const selectAssignableAgentsState = (state: RootState) => state.assignableAgents;

export const isAssignableAgentFetching = createSelector(
  [selectAssignableAgentsState],
  state => state.uiFlags.isLoading,
);

export const selectAssignableAgents = createSelector(
  [selectAssignableAgentsState],
  state => state.records,
);

export const selectAssignableAgentsByInboxId = createSelector(
  [
    selectAssignableAgents,
    (_state: RootState, inboxIds: number | number[]) =>
      Array.isArray(inboxIds) ? inboxIds : [inboxIds],
    (_state: RootState, _inboxIds: number | number[], searchTerm: string) => searchTerm,
  ],
  (state, inboxIds, searchTerm) => {
    const agents = inboxIds.flatMap(id => state[id] || []);
    const agentsList = [
      {
        confirmed: true,
        name: 'None',
        id: 0,
        role: 'agent',
        accountId: 0,
      },
      ...agents,
    ];
    return searchTerm ? agentsList.filter(agent => agent?.name?.includes(searchTerm)) : agentsList;
  },
);
