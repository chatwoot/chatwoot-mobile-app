import type { RootState } from '@/store';
import { teamAdapter } from './teamSlice';
import { createSelector } from '@reduxjs/toolkit';
import i18n from '@/i18n';
import { selectLocale } from '@/store/settings/settingsSelectors';

export const selectTeamsState = (state: RootState) => state.teams;

export const selectLoading = createSelector([selectTeamsState], state => state.isLoading);

export const { selectAll: selectAllTeams } = teamAdapter.getSelectors<RootState>(selectTeamsState);

export const filterTeams = createSelector(
  [
    selectAllTeams,
    // Forces re-memoization on locale change — see selectAssignableAgentsByInboxId.
    selectLocale,
    (_state: RootState, searchTerm: string) => searchTerm,
  ],
  (teams, _locale, searchTerm) => {
    const teamsList = [
      {
        id: '0',
        name: i18n.t('CONVERSATION.ACTIONS.NONE'),
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
