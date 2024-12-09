import React from 'react';
import { Animated, Text } from 'react-native';

import { tailwind } from '@/theme';
import { Channel, Message, MessageStatus, MessageType } from '@/types';
import { unixTimestampToReadableTime } from '@/utils';

import { MESSAGE_STATUS, TEXT_MAX_WIDTH } from '@/constants';
import { DeliveryStatus } from './DeliveryStatus';
import { EmailMeta } from './EmailMeta';

type EmailProps = {
  text: string;
  timeStamp: number;
  isIncoming: boolean;
  isOutgoing: boolean;
  isActivity: boolean;
  status: MessageStatus;
  isAvatarRendered?: boolean;
  channel?: Channel;
  messageType: MessageType;
  sourceId?: string;
  isPrivate: boolean;
  errorMessage: string;
  sender: Message['sender'];
  contentAttributes: Message['contentAttributes'];
};

export const Email = (props: EmailProps) => {
  const {
    text,
    timeStamp,
    isIncoming,
    isOutgoing,
    status,
    isAvatarRendered,
    channel,
    messageType,
    sourceId,
    isPrivate,
    errorMessage,
    sender,
    contentAttributes,
  } = props;

  const isMessageFailed = status === MESSAGE_STATUS.FAILED;

  return (
    <Animated.View
      style={[
        tailwind.style(
          'relative pl-3 pr-2.5 py-2 rounded-2xl overflow-hidden bg-gray-100 w-full',
          `max-w-[${TEXT_MAX_WIDTH + 50}px]`,
          isMessageFailed ? 'bg-ruby-700' : '',
          isAvatarRendered
            ? isOutgoing
              ? 'rounded-br-none'
              : isIncoming
                ? 'rounded-bl-none'
                : ''
            : '',
        ),
      ]}>
      {contentAttributes && <EmailMeta {...{ contentAttributes, sender }} />}
      <Animated.View style={tailwind.style('h-[1px] my-2 bg-gray-300')} />
      <Animated.View style={[tailwind.style('flex bg-white rounded-2xl')]}>
        <Animated.View style={tailwind.style('px-4 py-2')}>
          <Animated.Text
            style={tailwind.style('text-sm text-gray-900 font-inter-normal-20 tracking-[0.32px]')}>
            {text}
          </Animated.Text>
        </Animated.View>
      </Animated.View>
      <Animated.View
        style={tailwind.style('h-[21px] pt-[6px] pb-0.5 flex flex-row items-center justify-end')}>
        <Text
          style={tailwind.style(
            'text-xs font-inter-420-20 tracking-[0.32px] pr-1 text-gray-700',
            isMessageFailed ? 'text-whiteA-A11' : '',
          )}>
          {unixTimestampToReadableTime(timeStamp)}
        </Text>
        <DeliveryStatus
          isPrivate={isPrivate}
          status={status}
          messageType={messageType}
          channel={channel}
          sourceId={sourceId}
          errorMessage={errorMessage}
          deliveredColor="text-gray-700"
          sentColor="text-gray-700"
        />
      </Animated.View>
    </Animated.View>
  );
};
