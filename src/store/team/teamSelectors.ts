import type { RootState } from '@/store';
import { teamAdapter } from './teamSlice';
import { createSelector } from '@reduxjs/toolkit';

export const selectTeamsState = (state: RootState) => state.teams;

export const { selectAll: selectAllTeams } = teamAdapter.getSelectors<RootState>(selectTeamsState);

export const filterTeams = createSelector(
  [selectAllTeams, (state: RootState, searchTerm: string) => searchTerm],
  (teams, searchTerm) => {
    const teamsList = [
      {
        id: '0',
        name: 'None',
        description: null,
        allowAutoAssign: false,
        accountId: 0,
        isMember: false,
      },
      ...teams,
    ];

    return searchTerm ? teamsList.filter(team => team?.name?.includes(searchTerm)) : teamsList;
  },
);
