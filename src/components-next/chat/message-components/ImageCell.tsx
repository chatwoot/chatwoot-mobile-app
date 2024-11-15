import React, { useMemo } from 'react';
import { Alert, Dimensions, Text } from 'react-native';
import Animated, { Easing, FadeIn } from 'react-native-reanimated';
import { LightBox, LightBoxProps } from '@alantoa/lightbox';
import { Image, ImageBackground } from 'expo-image';

import { CannedResponseIcon, CopyIcon, LinkIcon, TranslateIcon, Trash } from '@/svg-icons';
import { tailwind } from '@/theme';
import { Channel, Message, MessageStatus, UnixTimestamp } from '@/types';
import { unixTimestampToReadableTime } from '@/utils';
import { Avatar } from '@/components-next/common';
import { MenuOption, MessageMenu } from '../message-menu';
import { MESSAGE_TYPES } from '../TextMessageCell';
import { DeliveryStatus } from './DeliveryStatus';

const { width, height } = Dimensions.get('screen');

const AnimatedExpoImage = Animated.createAnimatedComponent(Image);

type ImageCellProps = {
  imageSrc: string;
  shouldRenderAvatar: boolean;
  messageType: number;
  sender: Message['sender'];
  timeStamp: UnixTimestamp;
  status: MessageStatus;
  channel?: Channel;
  isPrivate: boolean;
  sourceId?: string | null;
  handleQuoteReply: () => void;
};

type ImageContainerProps = Pick<ImageCellProps, 'imageSrc'> &
  Pick<LightBoxProps, 'width' | 'height'>;

export const ImageContainer = (props: ImageContainerProps) => {
  const { imageSrc, height: lightboxH, width: lightboxW } = props;
  return (
    <LightBox
      width={lightboxW}
      height={lightboxH}
      imgLayout={{ height: height / 1.3, width }}
      tapToClose={false}>
      <AnimatedExpoImage
        source={{ uri: imageSrc }}
        contentFit="cover"
        style={[tailwind.style('h-full w-full bg-gray-100 overflow-hidden')]}
      />
    </LightBox>
  );
};

export const ImageCell = (props: ImageCellProps) => {
  const {
    imageSrc,
    shouldRenderAvatar,
    messageType,
    sender,
    timeStamp,
    channel,
    handleQuoteReply,
    isPrivate,
    sourceId,
    status,
  } = props;

  const isIncoming = messageType === MESSAGE_TYPES.INCOMING;
  const isOutgoing = messageType === MESSAGE_TYPES.OUTGOING;

  const commonOptions = useMemo(
    () =>
      [
        {
          title: 'Reply',
          handleOnPressMenuOption: handleQuoteReply,
        },
        {
          title: 'Copy',
          icon: <CopyIcon />,
          handleOnPressMenuOption: () => Alert.alert('Copy'),
        },
        {
          title: 'Translate',
          icon: <TranslateIcon />,
          handleOnPressMenuOption: () => Alert.alert('Translate'),
        },
        {
          title: 'Copy link to message',
          icon: <LinkIcon />,
          handleOnPressMenuOption: () => Alert.alert('Copy link to message'),
        },
      ] as MenuOption[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const outgoingMessageOptions = useMemo(
    () =>
      [
        ...commonOptions,
        {
          title: 'Add to canned responses',
          icon: <CannedResponseIcon />,
          handleOnPressMenuOption: () => Alert.alert('Add to canned responses'),
        },
        {
          title: 'Delete message',
          icon: <Trash />,
          handleOnPressMenuOption: () => Alert.alert('Delete message'),
          destructive: true,
        },
      ] as MenuOption[],
    [commonOptions],
  );

  return (
    <Animated.View
      entering={FadeIn.duration(300).easing(Easing.ease)}
      style={tailwind.style(
        'w-full my-[1px]',
        isIncoming ? 'items-start ml-3' : '',
        isOutgoing ? 'items-end pr-3' : '',
        !shouldRenderAvatar && isIncoming ? 'ml-10' : '',
        !shouldRenderAvatar && isOutgoing ? 'pr-10' : '',
        shouldRenderAvatar ? 'pb-2' : '',
      )}>
      <Animated.View style={tailwind.style('flex flex-row')}>
        {sender?.thumbnail && sender?.name && isIncoming && shouldRenderAvatar ? (
          <Animated.View style={tailwind.style('flex items-end justify-end mr-1')}>
            <Avatar size={'md'} src={{ uri: sender?.thumbnail }} name={sender?.name} />
          </Animated.View>
        ) : null}
        <MessageMenu menuOptions={isIncoming ? commonOptions : outgoingMessageOptions}>
          <Animated.View
            style={tailwind.style(
              'relative w-[300px] rounded-[14px] overflow-hidden',
              shouldRenderAvatar
                ? isOutgoing
                  ? 'rounded-br-none'
                  : isIncoming
                    ? 'rounded-bl-none'
                    : ''
                : '',
            )}>
            <ImageContainer {...{ imageSrc }} width={300} height={215} />
            <Animated.View pointerEvents={'none'}>
              <ImageBackground
                source={require('../../../assets/local/ImageCellTimeStampOverlay.png')}
                style={tailwind.style(
                  'absolute bottom-0 right-0 h-15 w-33 z-10',
                  shouldRenderAvatar
                    ? isOutgoing
                      ? 'rounded-br-none'
                      : isIncoming
                        ? 'rounded-bl-none'
                        : ''
                    : '',
                )}>
                <Animated.View
                  style={tailwind.style('flex flex-row absolute right-3 bottom-[5px]')}>
                  <Text
                    style={tailwind.style(
                      'text-xs font-inter-420-20 tracking-[0.32px] leading-[14px] text-whiteA-A12 pr-1',
                    )}>
                    {unixTimestampToReadableTime(timeStamp)}
                  </Text>
                  <DeliveryStatus
                    messageType={messageType}
                    status={status}
                    channel={channel}
                    isPrivate={isPrivate}
                    sourceId={sourceId}
                  />
                </Animated.View>
              </ImageBackground>
            </Animated.View>
          </Animated.View>
        </MessageMenu>
        {sender?.thumbnail && sender?.name && isOutgoing && shouldRenderAvatar ? (
          <Animated.View style={tailwind.style('flex items-end justify-end ml-1')}>
            <Avatar size={'md'} src={{ uri: sender?.thumbnail }} name={sender?.name} />
          </Animated.View>
        ) : null}
      </Animated.View>
    </Animated.View>
  );
};
