import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { tailwind } from '../../theme';
import { Channel } from '../../types';
import { getChannelTypeIcon } from '../../utils';
import { Icon } from '../common';

type PreviousConversationListType = {
  name: string;
  id: string;
  dateTime: string;
  channelType: Channel;
  message: string;
};

const previousConversationList: PreviousConversationListType[] = [
  {
    name: 'Jacob Jones',
    id: '151',
    dateTime: 'Nov 21',
    channelType: 'Channel::Telegram',
    message: 'Trying to get a refund for my order #291591. Please help me out',
  },
  {
    name: 'Jacob Jones',
    id: '121',
    dateTime: 'Oct 18',
    channelType: 'Channel::Whatsapp',
    message: 'There are several issues with my account these past few days',
  },
  {
    name: 'Jacob Jones',
    id: '112',
    dateTime: 'Oct 18',
    channelType: 'Channel::FacebookPage',
    message: 'Not really sure what’s happening with my account can anyone',
  },
];

type PreviousConversationItemProps = {
  item: PreviousConversationListType;
  index: number;
  isLastItem: boolean;
};

const PreviousConversationItem = (props: PreviousConversationItemProps) => {
  const { item, index, isLastItem } = props;
  return (
    <Pressable
      style={({ pressed }) => [
        tailwind.style(
          pressed ? 'bg-gray-100' : '',
          index === 0 ? 'rounded-t-[13px]' : '',
          isLastItem ? 'rounded-b-[13px]' : '',
        ),
      ]}
      key={index}>
      <Animated.View
        style={tailwind.style(
          'py-3 pr-4 ml-3',
          !isLastItem ? 'border-b-[1px] border-b-blackA-A3' : '',
        )}>
        <Animated.View style={tailwind.style('flex flex-row justify-between')}>
          <Animated.View style={tailwind.style('flex flex-row items-center')}>
            <Animated.Text
              style={tailwind.style(
                'text-base font-inter-medium-24 leading-[17px] tracking-[0.24px] text-gray-950',
              )}>
              {item.name}
            </Animated.Text>
            <Animated.Text
              style={tailwind.style(
                'text-cxs font-inter-420-20 leading-[15px] tracking-[0.32px] text-gray-700 pl-1',
              )}>
              #{item.id}
            </Animated.Text>
          </Animated.View>
          <Animated.View style={tailwind.style('flex flex-row items-center')}>
            <Icon icon={getChannelTypeIcon(item.channelType)} size={16} />
            <Animated.Text
              style={tailwind.style(
                'text-sm font-inter-420-20 leading-[16px] tracking-[0.32px] text-gray-700 pl-1',
              )}>
              {item.dateTime}
            </Animated.Text>
          </Animated.View>
        </Animated.View>
        <Animated.View style={tailwind.style('pt-1.5')}>
          <Animated.Text
            numberOfLines={1}
            style={tailwind.style(
              'text-md font-inter-normal-24 leading-[17px] tracking-[0.32px] text-gray-900',
            )}>
            {item.message}
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export const PreviousConversationList = () => {
  return (
    <Animated.View>
      <Animated.Text
        style={tailwind.style(
          'text-sm font-inter-medium-24 leading-[16px] tracking-[0.32px] text-gray-700 pl-4 pb-3',
        )}>
        Previous conversations
      </Animated.Text>
      <Animated.View style={[tailwind.style('rounded-[13px] mx-4 bg-white'), styles.listShadow]}>
        {previousConversationList.map((item, index) => (
          <PreviousConversationItem
            key={index}
            {...{ item, index }}
            isLastItem={index === previousConversationList.length - 1}
          />
        ))}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  listShadow: {
    // box-shadow: 0px 0.15000000596046448px 2px 0px #00000040;
    // box-shadow: [horizontal offset] [vertical offset] [blur radius] [optional spread radius] [color];
    shadowColor: '#00000040',
    shadowOffset: { width: 0, height: 0.15 },
    shadowRadius: 2,
    shadowOpacity: 0.35,
    elevation: 2,
  },
});
