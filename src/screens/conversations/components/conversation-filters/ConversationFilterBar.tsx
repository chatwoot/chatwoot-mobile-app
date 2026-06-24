import React from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectAllInboxes } from '@/store/inbox/inboxSelectors';
import { BottomSheetType, setBottomSheetState } from '@/store/conversation/conversationHeaderSlice';
import { selectFilters } from '@/store/conversation/conversationFilterSlice';
import { BaseFilterOption, FilterBar } from '@/components-next';
import { AssigneeOptions, StatusOptions, SortOptions } from '@/types/common/ConversationStatus';
import i18n from '@/i18n';
import { sortInboxesByName } from '@/utils/inboxSortUtils';
import type { Inbox } from '@/types/Inbox';
import { getInboxFilterIds } from '@/utils/conversationUtils';

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

type ConversationFilterBarProps = {
  prioritizeInbox?: boolean;
};

export const ConversationFilterBar = ({ prioritizeInbox = false }: ConversationFilterBarProps) => {
  const dispatch = useAppDispatch();
  const inboxes = useAppSelector(selectAllInboxes);
  const selectedFilters = useAppSelector(selectFilters);

  const getInboxOptions = (inboxes: Inbox[]) => {
    const options: Record<string, string> = {
      '0': i18n.t('FILTER.ALL_INBOXES'),
    };
    sortInboxesByName(inboxes).forEach(inbox => {
      options[inbox.id] = inbox.name;
    });
    const selectedInboxIds = getInboxFilterIds(selectedFilters.inbox_id);
    if (selectedInboxIds.length > 1) {
      options[selectedFilters.inbox_id] = i18n.t('CHANNELS.SELECTED_COUNT', {
        count: selectedInboxIds.length,
      });
    }

    return options;
  };

  const inboxFilterOption = {
    type: 'inbox_id' as const,
    options: getInboxOptions(inboxes),
    defaultFilter: i18n.t('FILTER.ALL_INBOXES'),
  };

  const channelFilterOptions = [
    inboxFilterOption,
    ConversationFilterOptions[0],
    ConversationFilterOptions[2],
    ConversationFilterOptions[1],
  ];

  const dynamicFilterOptions = prioritizeInbox
    ? channelFilterOptions
    : [...ConversationFilterOptions, inboxFilterOption];

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
