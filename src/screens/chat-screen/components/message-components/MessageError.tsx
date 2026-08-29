import React from 'react';
import { Pressable, Text } from 'react-native';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { Icon } from '@/components-next/common';
import { RetryIcon } from '@/svg-icons';
import { ORIENTATION } from '@/constants';
import { canRetryMessage } from '@/utils/messageUtils';
import { Message } from '@/types';
import i18n from '@/i18n';

type MessageErrorProps = {
  message: Message;
  orientation: string;
  onRetry: () => void;
  canSendPublicReply: boolean;
};

export const MessageError = ({
  message,
  orientation,
  onRetry,
  canSendPublicReply,
}: MessageErrorProps) => {
  const canRetry = canRetryMessage(message, canSendPublicReply);

  return (
    <Animated.View
      style={tailwind.style(
        'flex flex-row items-center gap-1.5 pt-1',
        orientation === ORIENTATION.RIGHT ? 'justify-end' : 'justify-start',
      )}>
      <Text
        style={tailwind.style(
          'text-xs text-ruby-900 font-inter-420-20 tracking-[0.32px] leading-[14px]',
        )}>
        {i18n.t('CONVERSATION.FAILED_TO_SEND')}
      </Text>
      {canRetry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={i18n.t('CONVERSATION.RETRY_MESSAGE')}
          hitSlop={8}
          onPress={onRetry}
          style={tailwind.style('h-5 w-5 items-center justify-center rounded-md bg-blackA-A3')}>
          <Icon icon={<RetryIcon stroke={tailwind.color('text-ruby-900')} />} size={14} />
        </Pressable>
      ) : null}
    </Animated.View>
  );
};
