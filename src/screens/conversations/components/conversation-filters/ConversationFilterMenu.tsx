import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { useAppDispatch, useAppSelector } from '@/hooks';
import i18n from '@/i18n';
import {
  defaultFilterState,
  resetFilters,
  selectFilters,
  setFilters,
} from '@/store/conversation/conversationFilterSlice';
import { selectAllInboxes } from '@/store/inbox/inboxSelectors';
import { AssigneeOptions, SortOptions, StatusOptions } from '@/types/common/ConversationStatus';
import { ConversationFilterOptions } from '@/types';

// Native iOS pull-down menu for conversation filters (Apple HIG, Menus / Pull-down
// buttons), like Mail and Files: one tap opens sections with checkmarks on the current
// choice, and picking an option applies it. Used with tabs on the side (iPhone Duo)
// instead of the filter mode with chips and bottom sheets.

// zeego's Label typings include web-only props; on iOS it only needs the section title.
const MenuLabel = DropdownMenu.Label as unknown as React.FC<{ children: string }>;

const optionLabel = (section: 'ASSIGNEE_TYPE' | 'STATUS' | 'SORT_BY', id: string) =>
  i18n.t(`CONVERSATION.FILTERS.${section}.OPTIONS.${id.toUpperCase()}`);

type SectionProps = {
  filterKey: ConversationFilterOptions;
  title: string;
  options: { id: string; label: string }[];
  selected: string;
  onSelect: (key: ConversationFilterOptions, value: string) => void;
};

// A plain function, not a component: zeego builds the native menu from its own elements
// and skips custom components, so sections must be returned as zeego elements directly.
const renderSection = ({ filterKey, title, options, selected, onSelect }: SectionProps) => (
  <DropdownMenu.Group key={`group-${filterKey}`}>
    <MenuLabel>{title}</MenuLabel>
    {options.map(option => (
      <DropdownMenu.CheckboxItem
        key={`${filterKey}-${option.id}`}
        value={selected === option.id ? 'on' : 'off'}
        onValueChange={() => onSelect(filterKey, option.id)}>
        <DropdownMenu.ItemIndicator />
        <DropdownMenu.ItemTitle>{option.label}</DropdownMenu.ItemTitle>
      </DropdownMenu.CheckboxItem>
    ))}
  </DropdownMenu.Group>
);

/** Wraps a header button so tapping it opens the filter menu. */
export const ConversationFilterMenu = ({ children }: PropsWithChildren) => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);
  const inboxes = useAppSelector(selectAllInboxes);
  const hasChanges = Object.keys(defaultFilterState).some(
    key =>
      filters[key as ConversationFilterOptions] !==
      defaultFilterState[key as ConversationFilterOptions],
  );

  const select = (key: ConversationFilterOptions, value: string) => {
    if (filters[key] !== value) dispatch(setFilters({ key, value }));
  };

  const toOptions = (
    section: 'ASSIGNEE_TYPE' | 'STATUS' | 'SORT_BY',
    record: Record<string, string>,
  ) => Object.keys(record).map(id => ({ id, label: optionLabel(section, id) }));

  const inboxOptions = [
    { id: '0', label: i18n.t('FILTER.ALL_INBOXES') },
    ...inboxes.map(inbox => ({ id: String(inbox.id), label: inbox.name })),
  ];
  const selectedInbox = inboxOptions.find(option => option.id === String(filters.inbox_id));

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <View accessibilityRole="button">{children}</View>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {renderSection({
          filterKey: 'assignee_type',
          title: i18n.t('CONVERSATION.FILTERS.ASSIGNEE_TYPE.TITLE'),
          options: toOptions('ASSIGNEE_TYPE', AssigneeOptions),
          selected: filters.assignee_type,
          onSelect: select,
        })}
        {renderSection({
          filterKey: 'status',
          title: i18n.t('CONVERSATION.FILTERS.STATUS.TITLE'),
          options: toOptions('STATUS', StatusOptions),
          selected: filters.status,
          onSelect: select,
        })}
        {renderSection({
          filterKey: 'sort_by',
          title: i18n.t('CONVERSATION.FILTERS.SORT_BY.TITLE'),
          options: toOptions('SORT_BY', SortOptions),
          selected: filters.sort_by,
          onSelect: select,
        })}
        <DropdownMenu.Group>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger key="inbox-trigger">
              <DropdownMenu.ItemTitle>
                {i18n.t('CONVERSATION.FILTERS.INBOX.TITLE')}
              </DropdownMenu.ItemTitle>
              <DropdownMenu.ItemSubtitle>{selectedInbox?.label ?? ''}</DropdownMenu.ItemSubtitle>
            </DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              {inboxOptions.map(option => (
                <DropdownMenu.CheckboxItem
                  key={`inbox-${option.id}`}
                  value={String(filters.inbox_id) === option.id ? 'on' : 'off'}
                  onValueChange={() => select('inbox_id', option.id)}>
                  <DropdownMenu.ItemIndicator />
                  <DropdownMenu.ItemTitle>{option.label}</DropdownMenu.ItemTitle>
                </DropdownMenu.CheckboxItem>
              ))}
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        </DropdownMenu.Group>
        {hasChanges ? (
          <DropdownMenu.Group>
            <DropdownMenu.Item key="reset" onSelect={() => dispatch(resetFilters())}>
              <DropdownMenu.ItemTitle>
                {i18n.t('CONVERSATION.FILTERS.RESET')}
              </DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
          </DropdownMenu.Group>
        ) : null}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
