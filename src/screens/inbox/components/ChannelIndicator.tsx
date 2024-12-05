import React from 'react';

import { tailwind } from '@/theme';
import { NativeView } from '@/components-next/native-components';
import { Icon } from '@/components-next';
import { getChannelIcon } from '@/utils';
import { Inbox } from '@/types/Inbox';
import { ConversationAdditionalAttributes } from '@/types/Conversation';
import { Channel } from '@/types';

type ChannelIndicatorProps = {
  inbox: Inbox;
  additionalAttributes?: ConversationAdditionalAttributes;
};

export const ChannelIndicator = (props: ChannelIndicatorProps) => {
  const { channelType = '', medium = '' } = props.inbox || {};
  const { type = '' } = props.additionalAttributes || {};

  return (
    <NativeView style={tailwind.style('pl-1 h-4 w-4  justify-center items-center')}>
      <Icon icon={getChannelIcon(channelType as Channel, medium, type)} size={16} />
    </NativeView>
  );
};
