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
import { getChannelTypeIcon } from '@/utils';
import { Channel } from '@/types';

type InboxCellProps = {
  value: { id: number; name: string; channelType: Channel };
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
    channelType: inbox.channelType,
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
        <Animated.View style={tailwind.style('flex-row items-center')}>
          <Icon
            icon={getChannelTypeIcon(value.channelType)}
            size={18}
            style={tailwind.style('my-auto flex items-center justify-center')}
          />

          <Animated.Text
            style={tailwind.style(
              'text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px] capitalize ml-2',
            )}>
            {value.name}
          </Animated.Text>
        </Animated.View>
        {filters.inbox_id === value.id.toString() ? <Icon icon={<TickIcon />} size={20} /> : null}
      </Animated.View>
    </Pressable>
  );
};

type InboxStackProps = {
  list: { id: number; name: string; channelType: Channel }[];
};

const InboxStack = (props: InboxStackProps) => {
  const { list } = props;
  return (
    <Animated.ScrollView style={tailwind.style('pl-3 pb-4')}>
      {list.map((value, index) => (
        <InboxCell key={index} {...{ value, index }} />
      ))}
    </Animated.ScrollView>
  );
};

export const InboxListComponent = () => {
  const inboxes = useAppSelector(selectAllInboxes);
  const inboxList = inboxes.map(inbox => ({
    id: inbox.id,
    name: inbox.name,
    channelType: inbox.channelType,
  }));

  return (
    <Animated.ScrollView>
      <BottomSheetHeader headerText={'Filter by Inbox'} />
      <InboxStack list={inboxList} />
    </Animated.ScrollView>
  );
};
