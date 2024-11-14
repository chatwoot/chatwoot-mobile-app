import React from 'react';
import { Text } from 'react-native';

import { tailwind } from '@/theme';
import { NativeView } from '@/components-next/native-components';
import {
  //   AudioIcon,
  //   ImageAttachmentIcon,
  //   DocumentAttachmentIcon,
  //   PrivateNote,
  //   LockIcon,
  //   PrivateNoteIcon,
  OutgoingIcon,
} from '@/svg-icons';
import { Icon } from '@/components-next';

type ConversationLastMessageProps = {
  numberOfLines: number;
  lastMessageContent: string;
};

export const ConversationLastMessage = (props: ConversationLastMessageProps) => {
  const { numberOfLines, lastMessageContent } = props;
  return (
    <NativeView style={tailwind.style('flex-1 flex-row gap-1 items-start')}>
      <Icon icon={<OutgoingIcon />} style={tailwind.style('mt-0.5')} />
      <Text
        numberOfLines={numberOfLines}
        style={tailwind.style(
          'text-md flex-1 font-inter-420-20 tracking-[0.32px] leading-[21px] text-gray-900',
        )}>
        {lastMessageContent}
      </Text>
    </NativeView>
  );
};
