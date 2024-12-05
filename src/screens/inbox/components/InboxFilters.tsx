import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { useRefsContext } from '@/context';
import { TickIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useHaptic } from '@/utils';
import { BottomSheetHeader, Icon } from '@/components-next';
import i18n from '@/i18n';
import { InboxSortTypes, InboxSortOptions } from '@/store/notification/notificationTypes';
import { selectSortOrder, setFilters } from '@/store/notification/notificationFilterSlice';
import { useAppDispatch, useAppSelector } from '@/hooks';

type SortByCellProps = {
  value: string;
  index: number;
  onChange: (value: InboxSortTypes) => void;
  sortOrder: InboxSortTypes;
};

const sortByList = Object.keys(InboxSortOptions) as InboxSortTypes[];

const SortByCell = (props: SortByCellProps) => {
  const { value, index, sortOrder, onChange } = props;

  const hapticSelection = useHaptic();

  const handlePreferredSortPress = () => {
    hapticSelection?.();
    onChange(value as InboxSortTypes);
  };

  return (
    <Pressable
      onPress={handlePreferredSortPress}
      style={tailwind.style('flex flex-row items-center')}>
      <Animated.View
        style={tailwind.style(
          'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
          index !== 1 ? 'border-b-[1px] border-blackA-A3' : '',
        )}>
        <Animated.Text
          style={tailwind.style(
            'text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px] capitalize',
          )}>
          {i18n.t(`NOTIFICATION.FILTERS.SORT_BY.OPTIONS.${value.toUpperCase()}`)}
        </Animated.Text>
        {sortOrder === value ? <Icon icon={<TickIcon />} size={20} /> : null}
      </Animated.View>
    </Pressable>
  );
};

export const InboxFilters = () => {
  const sortOrder = useAppSelector(selectSortOrder);
  const dispatch = useAppDispatch();
  const { inboxFiltersSheetRef } = useRefsContext();

  const handleChangeFilters = (value: InboxSortTypes) => {
    dispatch(setFilters({ key: value }));
    setTimeout(() => inboxFiltersSheetRef.current?.dismiss({ overshootClamping: true }), 1);
  };

  return (
    <Animated.View>
      <BottomSheetHeader headerText={i18n.t('CONVERSATION.FILTERS.SORT_BY.TITLE')} />
      <Animated.View style={tailwind.style('py-1 pl-3')}>
        {sortByList.map((value, index) => (
          <SortByCell
            key={index}
            {...{ value, index }}
            sortOrder={sortOrder}
            onChange={handleChangeFilters}
          />
        ))}
      </Animated.View>
    </Animated.View>
  );
};
