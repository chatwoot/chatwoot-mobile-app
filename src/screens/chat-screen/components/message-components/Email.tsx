import React from 'react';
import { Animated, Text, Dimensions } from 'react-native';
import AutoHeightWebView from 'react-native-autoheight-webview';

import { tailwind } from '@/theme';
import { Channel, Message, MessageStatus, MessageType } from '@/types';
import { unixTimestampToReadableTime } from '@/utils';

import { MESSAGE_STATUS } from '@/constants';
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
  const FormattedEmail = text.replace('height:100%;', '');

  const windowWidth = Dimensions.get('window').width;
  const WIDTH = windowWidth - 52; // 52 is the sum of the left and right padding (12 + 12) and avatar width (24) and gap between avatar and message (4)

  return (
    <Animated.View
      style={[
        tailwind.style(
          'relative pl-3 pr-2.5 py-2 rounded-2xl overflow-hidden bg-gray-100',
          `max-w-[${WIDTH}px]`,
          isMessageFailed ? 'bg-ruby-700' : '',
          isAvatarRendered
            ? isOutgoing
              ? 'rounded-br-none'
              : isIncoming
                ? 'rounded-bl-none'
                : ''
            : '',
        ),
      ]}
    >
      {contentAttributes && <EmailMeta {...{ contentAttributes, sender }} />}
      <Animated.View style={[tailwind.style('flex bg-white rounded-2xl w-full')]}>
        <Animated.View style={tailwind.style('px-4 py-2 w-full')}>
          <AutoHeightWebView
            style={{ width: '100%', minHeight: 1, minWidth: '100%' }}
            scrollEnabled={false}
            customStyle={`
        * {
          font-family: system,-apple-system,".SFNSText-Regular","San Francisco",Roboto,"Segoe UI","Helvetica Neue","Lucida Grande",sans-serif;
          font-size: 14px;
        } 
        img{
          max-width: 100% !important;
        }
      `}
            source={{
              html: FormattedEmail,
            }}
            viewportContent={'width=device-width, user-scalable=no'}
          />
        </Animated.View>
      </Animated.View>
      <Animated.View
        style={tailwind.style('h-[21px] pt-[6px] pb-0.5 flex flex-row items-center justify-end')}
      >
        <Text
          style={tailwind.style(
            'text-xs font-inter-420-20 tracking-[0.32px] pr-1 text-gray-700',
            isMessageFailed ? 'text-whiteA-A11' : '',
          )}
        >
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
