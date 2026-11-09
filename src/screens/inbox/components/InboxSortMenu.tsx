import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { useAppDispatch, useAppSelector } from '@/hooks';
import i18n from '@/i18n';
import {
  defaultFilterState,
  selectSortOrder,
  setFilters,
} from '@/store/notification/notificationFilterSlice';
import { InboxSortOptions, InboxSortTypes } from '@/store/notification/notificationTypes';

// zeego's Label typings include web-only props; on iOS it only needs the section title.
const MenuLabel = DropdownMenu.Label as unknown as React.FC<{ children: string }>;

const sortOrders = Object.keys(InboxSortOptions) as InboxSortTypes[];

export const useIsInboxSortChanged = () =>
  useAppSelector(selectSortOrder) !== defaultFilterState.sortOrder;

export const InboxSortMenu = ({ children }: PropsWithChildren) => {
  const dispatch = useAppDispatch();
  const sortOrder = useAppSelector(selectSortOrder);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <View accessibilityRole="button">{children}</View>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Group>
          <MenuLabel>{i18n.t('CONVERSATION.FILTERS.SORT_BY.TITLE')}</MenuLabel>
          {sortOrders.map(value => (
            <DropdownMenu.CheckboxItem
              key={`sort-${value}`}
              value={sortOrder === value ? 'on' : 'off'}
              onValueChange={() => {
                if (sortOrder !== value) dispatch(setFilters({ key: value }));
              }}>
              <DropdownMenu.ItemIndicator />
              <DropdownMenu.ItemTitle>
                {i18n.t(`NOTIFICATION.FILTERS.SORT_BY.OPTIONS.${value.toUpperCase()}`)}
              </DropdownMenu.ItemTitle>
            </DropdownMenu.CheckboxItem>
          ))}
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
