import React from 'react';
import { Text } from 'react-native';
import Animated, { Easing, FadeIn } from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { Channel, Message, MessageStatus, UnixTimestamp } from '@/types';
import { unixTimestampToReadableTime } from '@/utils';
import { Avatar, Icon } from '@/components-next/common';
import { MenuOption, MessageMenu } from '../message-menu';
import { MESSAGE_STATUS, MESSAGE_TYPES, TEXT_MAX_WIDTH } from '@/constants';
import { DeliveryStatus } from './DeliveryStatus';
import { MapIcon } from '@/svg-icons';
import { openURL } from '@/utils/urlUtils';

type LocationCellProps = {
  shouldRenderAvatar: boolean;
  messageType: number;
  sender: Message['sender'];
  timeStamp: UnixTimestamp;
  status: MessageStatus;
  channel?: Channel;
  isPrivate: boolean;
  sourceId?: string | null;
  menuOptions: MenuOption[];
  errorMessage?: string;
  latitude: number | 0;
  longitude: number | 0;
};

export const LocationCell: React.FC<LocationCellProps> = props => {
  const {
    shouldRenderAvatar,
    messageType,
    sender,
    timeStamp,
    status,
    isPrivate,
    channel,
    sourceId,
    menuOptions,
    errorMessage,
    latitude,
    longitude,
  } = props;
  const isIncoming = messageType === MESSAGE_TYPES.INCOMING;
  const isOutgoing = messageType === MESSAGE_TYPES.OUTGOING;
  const isMessageFailed = status === MESSAGE_STATUS.FAILED;

  const mapUrl = `https://maps.google.com/?q=${latitude},${longitude}`;

  return (
    <Animated.View
      entering={FadeIn.duration(300).easing(Easing.ease)}
      style={tailwind.style(
        'w-full my-[1px]',
        isIncoming && 'items-start',
        isOutgoing && 'items-end',
        !shouldRenderAvatar && isIncoming ? 'ml-7' : '',
        !shouldRenderAvatar && isOutgoing ? 'pr-7' : '',
        shouldRenderAvatar ? 'pb-2' : '',
      )}
    >
      <Animated.View style={tailwind.style('flex flex-row')}>
        {sender?.name && isIncoming && shouldRenderAvatar ? (
          <Animated.View style={tailwind.style('flex items-end justify-end mr-1')}>
            <Avatar size={'md'} src={{ uri: sender?.thumbnail }} name={sender?.name} />
          </Animated.View>
        ) : null}
        <MessageMenu menuOptions={menuOptions}>
          <Animated.View
            style={[
              tailwind.style(
                'relative pl-3 pr-2.5 py-2 rounded-2xl overflow-hidden',
                `max-w-[${TEXT_MAX_WIDTH}px]`,
                isIncoming ? 'bg-blue-700' : '',
                isOutgoing ? 'bg-gray-100' : '',
                isMessageFailed ? 'bg-ruby-400' : '',
                shouldRenderAvatar
                  ? isOutgoing
                    ? 'rounded-br-none'
                    : isIncoming
                      ? 'rounded-bl-none'
                      : ''
                  : '',
              ),
            ]}
          >
            <Animated.View
              style={tailwind.style('flex flex-row justify-center items-center gap-1')}
            >
              <Icon icon={<MapIcon fill="white" />} size={24} />
              <Text
                onPress={() => openURL({ URL: mapUrl })}
                style={tailwind.style(
                  isIncoming || isOutgoing
                    ? 'text-base tracking-[0.32px] leading-[22px] font-inter-normal-20 underline'
                    : '',
                  isIncoming ? 'text-white' : '',
                  isOutgoing ? 'text-gray-950' : '',
                )}
              >
                See on map
              </Text>
            </Animated.View>

            <Animated.View
              style={tailwind.style(
                'h-[21px] pt-[5px] pb-0.5 flex flex-row items-center justify-end',
              )}
            >
              <Text
                style={tailwind.style(
                  'text-xs font-inter-420-20 tracking-[0.32px] pr-1',
                  isIncoming ? 'text-whiteA-A11' : '',
                  isOutgoing ? 'text-gray-700' : '',
                  isMessageFailed ? 'text-ruby-900' : '',
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
                errorMessage={errorMessage || ''}
                deliveredColor="text-gray-700"
                sentColor="text-gray-700"
              />
            </Animated.View>
          </Animated.View>
        </MessageMenu>
        {sender?.name && isOutgoing && shouldRenderAvatar ? (
          <Animated.View style={tailwind.style('flex items-end justify-end ml-1')}>
            <Avatar size={'md'} src={{ uri: sender?.thumbnail }} name={sender?.name} />
          </Animated.View>
        ) : null}
      </Animated.View>
    </Animated.View>
  );
};
