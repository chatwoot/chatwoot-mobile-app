import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { useRefsContext } from '../../context';
import { useConversationListFilterState } from '../../store';
import { GridIcon, TickIcon } from '../../svg-icons';
import { tailwind } from '../../theme';
import { ChannelCollection } from '../../types';
import { getChannelTypeIcon, useHaptic } from '../../utils';
import { BottomSheetHeader, Icon } from '../common';

export const channels: ChannelCollection[] = [
  {
    name: 'All Inboxes',
    type: 'All',
    icon: <GridIcon />,
  },
  {
    name: 'Telegram',
    type: 'Channel::Telegram',
    icon: getChannelTypeIcon('Channel::Telegram'),
  },
  {
    name: 'Website',
    type: 'Channel::WebWidget',
    icon: getChannelTypeIcon('Channel::WebWidget'),
  },
  {
    name: 'Facebook',
    type: 'Channel::FacebookPage',
    icon: getChannelTypeIcon('Channel::FacebookPage'),
  },
  {
    name: 'X',
    type: 'Channel::TwitterProfile',
    icon: getChannelTypeIcon('Channel::TwitterProfile'),
  },
  {
    name: 'Whatsapp',
    type: 'Channel::Whatsapp',
    icon: getChannelTypeIcon('Channel::Whatsapp'),
  },
];

type ChannelCellProps = {
  value: ChannelCollection;
  index: number;
};

const ChannelCell = (props: ChannelCellProps) => {
  const { filtersModalSheetRef } = useRefsContext();
  const { value, index } = props;
  const { filtersApplied, setFilterApplied } = useConversationListFilterState();

  const hapticSelection = useHaptic();

  const handleStatusPress = () => {
    setFilterApplied('inbox', value.name);
    hapticSelection?.();
    setTimeout(() => filtersModalSheetRef.current?.dismiss({ overshootClamping: true }), 1);
  };

  return (
    <Pressable onPress={handleStatusPress} style={tailwind.style('flex flex-row items-center')}>
      <Animated.View>
        <Icon icon={value.icon} size={24} />
      </Animated.View>
      <Animated.View
        style={tailwind.style(
          'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
          index !== channels.length - 1 ? 'border-b-[1px] border-blackA-A3' : '',
        )}>
        <Animated.Text
          style={[
            tailwind.style(
              'text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px]',
            ),
          ]}>
          {value.name}
        </Animated.Text>
        {filtersApplied.inbox === value.name ? <Icon icon={<TickIcon />} size={20} /> : null}
      </Animated.View>
    </Pressable>
  );
};

type ChannelStackProps = {
  channelList: ChannelCollection[];
};

const ChannelStack = (props: ChannelStackProps) => {
  const { channelList } = props;
  return (
    <Animated.View style={tailwind.style('py-1 pl-3')}>
      {channelList.map((value, index) => (
        <ChannelCell key={index} {...{ value, index }} />
      ))}
    </Animated.View>
  );
};

export const ChannelListComponent = () => {
  return (
    <Animated.View>
      <BottomSheetHeader headerText="Filter by inbox" />
      <ChannelStack channelList={channels} />
    </Animated.View>
  );
};
