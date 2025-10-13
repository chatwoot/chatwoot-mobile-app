import React from 'react';
import { Text } from 'react-native';

import { tailwind } from '@/theme';
import { NativeView } from '@/components-next/native-components';
import { Icon } from '@/components-next/common/icon';
import { getChannelIcon } from '@/utils';
import { Inbox } from '@/types/Inbox';
import { ConversationAdditionalAttributes } from '@/types/Conversation';
import { Channel } from '@/types';

import { StyleProp, ViewStyle } from 'react-native';

type ChannelIndicatorProps = {
  inbox: Inbox;
  additionalAttributes?: ConversationAdditionalAttributes;
  style?: StyleProp<ViewStyle>;
};

export const ChannelIndicator = (props: ChannelIndicatorProps) => {
  const { channelType = '', medium = '', name = '' } = props.inbox || {};
  const { type = '' } = props.additionalAttributes || {};
  const { style } = props;

  return (
    <NativeView
      style={[
        tailwind.style('pl-1 h-6 flex gap-1 flex-row justify-end items-center flex-shrink'),
        style,
      ]}>
      <Icon icon={getChannelIcon(channelType as Channel, medium, type)} size={16} />
      <Text
        numberOfLines={1}
        style={tailwind.style(
          'text-sm font-inter-420-20 tracking-[0.24px] text-gray-800 flex-shrink truncate',
        )}>
        {name}
      </Text>
    </NativeView>
  );
};
