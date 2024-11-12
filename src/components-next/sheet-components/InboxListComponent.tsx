import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { useRefsContext } from '@/context';
import { TickIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useHaptic } from '@/utils';
import { BottomSheetHeader, Icon } from '@/components-next/common';
import { selectFilters, setFilters } from '@/store/conversation/conversationFilterSlice';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectAllInboxes } from '@/store/inbox/inboxSelectors';

type InboxCellProps = {
  value: { id: number; name: string };
  index: number;
};

const InboxCell = (props: InboxCellProps) => {
  const { filtersModalSheetRef } = useRefsContext();
  const dispatch = useAppDispatch();
  const { value, index } = props;

  const inboxes = useAppSelector(selectAllInboxes);
  const inboxList = inboxes.map(inbox => ({
    id: inbox.id,
    name: inbox.name,
  }));

  const filters = useAppSelector(selectFilters);
  const hapticSelection = useHaptic();

  const handlePreferredAssigneeTypePress = () => {
    hapticSelection?.();
    dispatch(setFilters({ key: 'inbox_id', value: value.id.toString() }));
    setTimeout(() => filtersModalSheetRef.current?.dismiss({ overshootClamping: true }), 1);
  };

  return (
    <Pressable
      onPress={handlePreferredAssigneeTypePress}
      style={tailwind.style('flex flex-row items-center')}>
      <Animated.View
        style={tailwind.style(
          'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
          index !== inboxList.length - 1 ? 'border-b-[1px] border-blackA-A3' : '',
        )}>
        <Animated.Text
          style={tailwind.style(
            'text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px] capitalize',
          )}>
          {value.name}
        </Animated.Text>
        {filters.inbox_id === value.id.toString() ? <Icon icon={<TickIcon />} size={20} /> : null}
      </Animated.View>
    </Pressable>
  );
};

type InboxStackProps = {
  list: { id: number; name: string }[];
};

const InboxStack = (props: InboxStackProps) => {
  const { list } = props;
  return (
    <Animated.View style={tailwind.style('py-1 pl-3')}>
      {list.map((value, index) => (
        <InboxCell key={index} {...{ value, index }} />
      ))}
    </Animated.View>
  );
};

export const InboxListComponent = () => {
  const inboxes = useAppSelector(selectAllInboxes);
  const inboxList = inboxes.map(inbox => ({
    id: inbox.id,
    name: inbox.name,
  }));

  return (
    <Animated.View>
      <BottomSheetHeader headerText={'Filter by inbox'} />
      <InboxStack list={inboxList} />
    </Animated.View>
  );
};
