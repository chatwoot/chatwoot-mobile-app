import React from 'react';
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Icon } from '@/components-next';
import { TickIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import type { Inbox } from '@/types/Inbox';
import type { ContactableInbox } from '@/store/contact/contactTypes';
import { getChannelIcon } from '@/utils';

type InboxListRowInbox = Inbox | ContactableInbox;

type InboxListRowProps<TInbox extends InboxListRowInbox> = {
  inbox: TInbox;
  subtitle?: string;
  isSelected?: boolean;
  card?: boolean;
  showDivider?: boolean;
  onPress: (inbox: TInbox) => void;
};

const getInboxIcon = (inbox: InboxListRowInbox) =>
  getChannelIcon(
    inbox.channelType,
    inbox.medium,
    inbox.additionalAttributes?.type || inbox.provider || '',
    inbox.medium,
  );

export const InboxListRow = <TInbox extends InboxListRowInbox>({
  inbox,
  subtitle,
  isSelected = false,
  card = false,
  showDivider = false,
  onPress,
}: InboxListRowProps<TInbox>) => {
  if (card) {
    return (
      <Pressable
        key={`${inbox.id}-${'sourceId' in inbox ? inbox.sourceId : inbox.id}`}
        onPress={() => onPress(inbox)}
        style={({ pressed }) =>
          tailwind.style(
            'flex-row items-center py-3 px-3 rounded-xl border border-gray-100 bg-white mb-2',
            pressed ? 'bg-gray-50' : '',
          )
        }>
        <Animated.View
          style={tailwind.style('h-9 w-9 rounded-full bg-gray-50 items-center justify-center')}>
          <Icon icon={getInboxIcon(inbox)} size={20} />
        </Animated.View>
        <Animated.View style={tailwind.style('ml-3 flex-1 min-w-0')}>
          <Animated.Text
            numberOfLines={1}
            style={tailwind.style('text-sm font-inter-medium-24 text-gray-950')}>
            {inbox.name}
          </Animated.Text>
          {!!subtitle && (
            <Animated.Text
              numberOfLines={1}
              style={tailwind.style('text-xs font-inter-420-20 text-gray-700 pt-1')}>
              {subtitle}
            </Animated.Text>
          )}
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => onPress(inbox)}
      style={({ pressed }) =>
        tailwind.style('flex-row items-center pl-3', pressed ? 'bg-gray-50' : '')
      }>
      <Icon
        icon={getInboxIcon(inbox)}
        size={18}
        style={tailwind.style('my-auto flex items-center justify-center')}
      />
      <Animated.View
        style={tailwind.style(
          'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
          showDivider ? 'border-b-[1px] border-blackA-A3' : '',
        )}>
        <View style={tailwind.style('flex-1 min-w-0 pr-3')}>
          <Animated.Text
            numberOfLines={1}
            style={tailwind.style(
              'text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px]',
            )}>
            {inbox.name}
          </Animated.Text>
          {!!subtitle && (
            <Animated.Text
              numberOfLines={1}
              style={tailwind.style('pt-1 text-sm font-inter-420-20 text-gray-700')}>
              {subtitle}
            </Animated.Text>
          )}
        </View>
        {isSelected ? <Icon icon={<TickIcon />} size={20} /> : null}
      </Animated.View>
    </Pressable>
  );
};
