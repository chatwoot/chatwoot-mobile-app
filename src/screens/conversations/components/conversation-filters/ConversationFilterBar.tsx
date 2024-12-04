import React from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectAllInboxes } from '@/store/inbox/inboxSelectors';
import { BottomSheetType, setBottomSheetState } from '@/store/conversation/conversationHeaderSlice';
import { selectFilters } from '@/store/conversation/conversationFilterSlice';
import { BaseFilterOption, FilterBar } from '@/components-next';
import { AssigneeOptions, StatusOptions, SortOptions } from '@/types/common/ConversationStatus';

export const ConversationFilterOptions: BaseFilterOption[] = [
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
    ...ConversationFilterOptions,
    {
      type: 'inbox_id' as const,
      options: getInboxOptions(inboxes),
      defaultFilter: 'All Inboxes',
    },
  ];

  const handleFilterButtonPress = (type: string) => {
    dispatch(setBottomSheetState(type as BottomSheetType));
  };

  return (
    <FilterBar
      allFilters={dynamicFilterOptions}
      selectedFilters={selectedFilters}
      onFilterPress={handleFilterButtonPress}
    />
  );
};
