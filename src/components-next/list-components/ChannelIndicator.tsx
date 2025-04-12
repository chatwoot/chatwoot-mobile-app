import React from 'react';

import { tailwind } from '@/theme';
import { NativeView } from '@/components-next/native-components';
import { Icon } from '@/components-next/common/icon';
import { getChannelIcon } from '@/utils';
import { Inbox } from '@/types/Inbox';
import { ConversationAdditionalAttributes } from '@/types/Conversation';
import { Channel } from '@/types';
import { Text } from 'react-native';
type ChannelIndicatorProps = {
  inbox: Inbox;
  additionalAttributes?: ConversationAdditionalAttributes;
};

export const ChannelIndicator = (props: ChannelIndicatorProps) => {
  const { channelType = '', medium = '', name = '' } = props.inbox || {};
  const { type = '' } = props.additionalAttributes || {};

  return (
    <NativeView style={tailwind.style('pl-1 gap-1 flex flex-row justify-center items-center w-20')}>
      <Icon icon={getChannelIcon(channelType as Channel, medium, type)} size={16} />
      <Text
        style={tailwind.style('text-sm font-inter-420-20 text-gray-700 overflow-hidden capitalize')}
        numberOfLines={1}
        ellipsizeMode="tail">
        {name}
      </Text>
    </NativeView>
  );
};
