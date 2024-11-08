import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, Text } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut } from 'react-native-reanimated';
import {
  AVPlaybackStatus,
  ResizeMode,
  Video,
  VideoFullscreenUpdate,
  VideoFullscreenUpdateEvent,
} from 'expo-av';
import { Image, ImageBackground } from 'expo-image';

import { DoubleCheckIcon, LinkIcon, Trash } from '../../../svg-icons';
import { tailwind } from '../../../theme';
import { Message, MessageStatus, UnixTimestamp } from '../../../types';
import { unixTimestampToReadableTime } from '../../../utils';
import { Avatar, Icon } from '../../common';
import { Spinner } from '../../spinner';
import { MenuOption, MessageMenu } from '../message-menu';
import { MESSAGE_TYPES } from '../TextMessageCell';

type VideoCellProps = {
  videoSrc: string;
  shouldRenderAvatar: boolean;
  messageType: number;
  senderDetails: Pick<Message, 'sender'>;
  timeStamp: UnixTimestamp;
  status: MessageStatus;
  handleQuoteReply: () => void;
};

type VideoPlayerProps = Pick<VideoCellProps, 'videoSrc'> & {
  playerEnabled?: boolean;
};

export const VideoPlayer = (props: VideoPlayerProps) => {
  const { videoSrc, playerEnabled = true } = props;
  const video = React.useRef<Video>(null);
  const [playVideo, setPlayVideo] = useState(false);

  const [videoLoading, setVideoLoading] = useState(true);

  const [videoStatus, setVideoStatus] = React.useState<AVPlaybackStatus | null>(null);
  const handlePlayPress = () => {
    setPlayVideo(true);
    video.current?.presentFullscreenPlayer();
    video.current?.playAsync();
  };

  useEffect(() => {
    if (videoStatus?.isLoaded) {
      if (videoStatus?.didJustFinish) {
        video.current?.playFromPositionAsync(0);
        setPlayVideo(false);
      }
    }
  }, [videoStatus]);

  const handlePlaybackStatus = (status: AVPlaybackStatus) => {
    setVideoStatus(status);
  };

  const handleOnFullScreenUpdate = (event: VideoFullscreenUpdateEvent) => {
    if (event.fullscreenUpdate === VideoFullscreenUpdate.PLAYER_WILL_DISMISS) {
      setPlayVideo(false);
    }
  };

  // To have a loader while the Video is loaded, and
  // thumbnail is shown
  const handleOnLoadStart = useCallback(() => {
    setVideoLoading(true);
  }, []);

  const handleOnLoad = useCallback(() => {
    setVideoLoading(false);
  }, []);

  return (
    <React.Fragment>
      <Video
        style={tailwind.style('w-full ios:h-full aspect-video')}
        ref={video}
        source={{
          uri: videoSrc,
        }}
        shouldPlay={playVideo}
        resizeMode={Platform.OS === 'android' ? ResizeMode.CONTAIN : ResizeMode.COVER}
        onLoadStart={handleOnLoadStart}
        onLoad={handleOnLoad}
        onPlaybackStatusUpdate={handlePlaybackStatus}
        onFullscreenUpdate={handleOnFullScreenUpdate}
      />
      {videoLoading ? (
        <Animated.View style={tailwind.style('absolute inset-0 flex items-center justify-center')}>
          <Spinner size={20} />
        </Animated.View>
      ) : null}
      {!playVideo && playerEnabled ? (
        <Animated.View
          entering={FadeIn.duration(300).easing(Easing.ease)}
          exiting={FadeOut.duration(300).easing(Easing.ease)}
          style={tailwind.style('absolute inset-0 flex items-center justify-center')}>
          <Pressable
            onPress={handlePlayPress}
            style={tailwind.style('h-full w-full flex items-center justify-center')}>
            <Image
              source={require('../../../assets/local/PlayIcon.png')}
              style={tailwind.style('h-12 w-12 z-10')}
            />
          </Pressable>
        </Animated.View>
      ) : null}
    </React.Fragment>
  );
};

export const VideoCell = (props: VideoCellProps) => {
  const {
    shouldRenderAvatar,
    status: messageStatus,
    timeStamp,
    messageType,
    videoSrc,
    senderDetails: sender,
    handleQuoteReply,
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
          title: 'Copy link to message',
          icon: <LinkIcon />,
          handleOnPressMenuOption: () => Alert.alert('Copy link to message'),
        },
        // {
        //   title: "Download",
        //   handleOnPressMenuOption: () => Alert.alert("Download"),
        // },
      ] as MenuOption[],
    [handleQuoteReply],
  );

  const outgoingMessageOptions = useMemo(
    () =>
      [
        ...commonOptions,
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
        {sender?.thumbnail && isIncoming && shouldRenderAvatar ? (
          <Animated.View style={tailwind.style('flex items-end justify-end mr-1')}>
            <Avatar size={'md'} src={{ uri: sender?.thumbnail }} name={sender?.name} />
          </Animated.View>
        ) : null}
        <MessageMenu menuOptions={isIncoming ? commonOptions : outgoingMessageOptions}>
          <Animated.View
            style={tailwind.style(
              'relative w-[300px] aspect-video rounded-[14px] overflow-hidden',
              shouldRenderAvatar
                ? isOutgoing
                  ? 'rounded-br-none'
                  : isIncoming
                    ? 'rounded-bl-none'
                    : ''
                : '',
            )}>
            <VideoPlayer
              {...{
                videoSrc,
              }}
            />
            <Animated.View
              pointerEvents={'none'}
              entering={FadeIn.duration(300).easing(Easing.ease)}
              exiting={FadeOut.duration(300).easing(Easing.ease)}>
              <ImageBackground
                source={require('../../../assets/local/ImageCellTimeStampOverlay.png')}
                style={tailwind.style(
                  'absolute bottom-0 right-0 h-15 w-33 z-20 ',
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
                  {isOutgoing ? (
                    <Icon
                      icon={
                        <DoubleCheckIcon
                          renderSecondTick={messageStatus !== 'sent'}
                          stroke={
                            messageStatus === 'read'
                              ? tailwind.color('text-blue-800')
                              : tailwind.color('text-whiteA-A12')
                          }
                        />
                      }
                      size={14}
                    />
                  ) : null}
                </Animated.View>
              </ImageBackground>
            </Animated.View>
          </Animated.View>
        </MessageMenu>
        {sender?.thumbnail && isOutgoing && shouldRenderAvatar ? (
          <Animated.View style={tailwind.style('flex items-end justify-end ml-1')}>
            <Avatar size={'md'} src={{ uri: sender?.thumbnail }} name={sender?.name} />
          </Animated.View>
        ) : null}
      </Animated.View>
    </Animated.View>
  );
};
