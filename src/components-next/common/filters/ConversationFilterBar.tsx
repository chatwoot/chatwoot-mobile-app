import React from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectAllInboxes } from '@/store/inbox/inboxSelectors';
import { setBottomSheetState } from '@/store/conversation/conversationHeaderSlice';
import { selectFilters } from '@/store/conversation/conversationFilterSlice';
import { FilterBar } from './FilterBar';
import { AllStatusTypes, AssigneeTypes, FilterOption, SortTypes } from '@/types';

export const AssigneeOptions: Record<AssigneeTypes, string> = {
  me: 'Mine',
  unassigned: 'Unassigned',
  all: 'All',
};

export const StatusOptions: Record<AllStatusTypes, string> = {
  all: 'All',
  open: 'Open',
  resolved: 'Resolved',
  pending: 'Pending',
  snoozed: 'Snoozed',
};

export const SortOptions: Record<SortTypes, string> = {
  latest: 'Latest',
  sort_on_created_at: 'Created At',
  sort_on_priority: 'Priority',
};

export const filterOptions: (
  | FilterOption<'assignee_type'>
  | FilterOption<'status'>
  | FilterOption<'sort_by'>
  | FilterOption<'inbox_id'>
)[] = [
  {
    type: 'assignee_type',
    options: AssigneeOptions,
    defaultFilter: 'All',
  },
  {
    type: 'status',
    options: StatusOptions,
    defaultFilter: 'Open',
  },
  {
    type: 'sort_by',
    options: SortOptions,
    defaultFilter: 'Latest',
  },
];

const getInboxOptions = (inboxes: { id: number; name: string }[]) => {
  const options: Record<string, string> = {
    '0': 'All Inboxes',
  };
  inboxes.forEach(inbox => {
    options[inbox.id] = inbox.name;
  });
  return options;
};

export const ConversationFilterBar = () => {
  const dispatch = useAppDispatch();
  const inboxes = useAppSelector(selectAllInboxes);
  const selectedFilters = useAppSelector(selectFilters);

  const dynamicFilterOptions = [
    ...filterOptions,
    {
      type: 'inbox_id' as const,
      options: getInboxOptions(inboxes),
      defaultFilter: 'All Inboxes',
    },
  ];

  const handleFilterButtonPress = (type: 'assignee_type' | 'status' | 'sort_by' | 'inbox_id') => {
    dispatch(setBottomSheetState(type));
  };

  return (
    <FilterBar
      allFilters={dynamicFilterOptions}
      selectedFilters={selectedFilters}
      onFilterPress={handleFilterButtonPress}
    />
  );
};
