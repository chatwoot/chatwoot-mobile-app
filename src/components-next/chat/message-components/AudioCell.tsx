import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { PlayBackType } from 'react-native-audio-recorder-player';
import Animated, { Easing, FadeIn, FadeOut, useSharedValue } from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';

import { useAudioPlayer } from '@/storev2';
import { tailwind } from '@/theme';
import { Channel, IconProps, Message, MessageStatus, UnixTimestamp } from '@/types';
import { unixTimestampToReadableTime } from '@/utils';
import { Avatar, Icon, Slider } from '@/components-next/common';
import { Spinner } from '@/components-next/spinner';
import {
  pausePlayer,
  resumePlayer,
  seekTo,
  startPlayer,
  stopPlayer,
} from '@/components-next/chat/audio-recorder';
import { MenuOption, MessageMenu } from '../message-menu';
import { MESSAGE_TYPES } from '@/constants';
import { DeliveryStatus } from './DeliveryStatus';

export const PlayIcon = ({ fill, fillOpacity }: IconProps) => {
  return (
    <Svg width="10" height="13" viewBox="0 0 10 13" fill="none">
      <Path d="M0 13V0L10 6.80952L0 13Z" fill={fill} fillOpacity={fillOpacity} />
    </Svg>
  );
};

export const PauseIcon = ({ fill, fillOpacity }: IconProps) => {
  return (
    <Svg width="10" height="12" viewBox="0 0 10 12" fill="none">
      <Rect width="3" height="12" fill={fill} fillOpacity={fillOpacity} />
      <Rect x="7" width="3" height="12" fill={fill} fillOpacity={fillOpacity} />
    </Svg>
  );
};

type AudioCellProps = {
  audioSrc: string;
  shouldRenderAvatar: boolean;
  messageType: number;
  sender: Message['sender'];
  timeStamp: UnixTimestamp;
  status: MessageStatus;
  channel?: Channel;
  isPrivate: boolean;
  sourceId?: string | null;
  menuOptions: MenuOption[];
};

type AudioPlayerProps = Pick<AudioCellProps, 'audioSrc'> & {
  isIncoming: boolean;
  isOutgoing: boolean;
};

export const AudioPlayer = (props: AudioPlayerProps) => {
  const { audioSrc, isIncoming } = props;

  const [isSoundLoading, setIsSoundLoading] = useState(false);
  const [isAudioPlaying, setAudioPlaying] = useState(false);

  const { setCurrentPlayingAudioSrc, currentPlayingAudioSrc } = useAudioPlayer();

  const currentPosition = useSharedValue(0);
  const totalDuration = useSharedValue(0);

  const audioPlayBackStatus = (data: any) => {
    const playBackData = data.data as PlayBackType;
    if (playBackData) {
      currentPosition.value = playBackData.currentPosition;
      totalDuration.value = playBackData.duration;
      if (playBackData.currentPosition === playBackData.duration) {
        currentPosition.value = 0;
        totalDuration.value = 0;
        setAudioPlaying(false);
        setCurrentPlayingAudioSrc('');
      }
    }
  };

  const togglePlayback = () => {
    if (audioSrc === currentPlayingAudioSrc) {
      // The current playing audio file is same as the component audio src so
      // we will have to just toggle the audio playing
      if (isAudioPlaying) {
        pausePlayer();
      } else {
        resumePlayer();
      }
      setAudioPlaying(!isAudioPlaying);
    } else {
      setIsSoundLoading(true);

      startPlayer(audioSrc, audioPlayBackStatus).then(() => {
        setIsSoundLoading(false);
        setAudioPlaying(true);
        setCurrentPlayingAudioSrc(audioSrc);
      });
    }
  };

  const manualSeekTo = async (manualSeekPosition: number) => {
    seekTo(manualSeekPosition).then(() => {
      resumePlayer();
    });
  };

  const pauseAudio = async () => {
    await pausePlayer();
  };

  const isCurrentAudioSrcPlaying = useMemo(
    () => currentPlayingAudioSrc === audioSrc && isAudioPlaying,
    [audioSrc, currentPlayingAudioSrc, isAudioPlaying],
  );

  useEffect(() => {
    if (currentPlayingAudioSrc !== audioSrc) {
      currentPosition.value = 0;
      totalDuration.value = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayingAudioSrc]);

  useEffect(() => {
    return () => {
      stopPlayer()
        .then()
        .finally(() => {
          setAudioPlaying(false);
          setCurrentPlayingAudioSrc('');
        });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={tailwind.style('flex flex-row items-center flex-1')}>
      <Pressable disabled={isSoundLoading} hitSlop={10} onPress={togglePlayback}>
        {isSoundLoading ? (
          <Animated.View>
            <Spinner size={13} />
          </Animated.View>
        ) : isCurrentAudioSrcPlaying ? (
          <Animated.View
            style={tailwind.style('pl-0.5 pr-0.5')}
            entering={FadeIn}
            exiting={FadeOut}>
            <Icon
              icon={
                <PauseIcon
                  fillOpacity={isIncoming ? '1' : '0.565'}
                  fill={isIncoming ? 'white' : 'black'}
                />
              }
              size={13}
            />
          </Animated.View>
        ) : (
          <Animated.View
            style={tailwind.style('pl-0.5 pr-0.5')}
            entering={FadeIn}
            exiting={FadeOut}>
            <PlayIcon
              fillOpacity={isIncoming ? '1' : '0.565'}
              fill={isIncoming ? 'white' : 'black'}
            />
          </Animated.View>
        )}
      </Pressable>
      <Slider
        trackColor={isIncoming ? 'bg-whiteA-A9' : 'bg-gray-500'}
        filledTrackColor={isIncoming ? 'bg-white' : 'bg-blue-700'}
        knobStyle={isIncoming ? 'border-blue-300' : 'border-blue-700'}
        {...{ manualSeekTo, currentPosition, totalDuration, pauseAudio }}
      />
    </View>
  );
};

export const AudioCell: React.FC<AudioCellProps> = props => {
  const {
    audioSrc,
    shouldRenderAvatar,
    messageType,
    sender,
    timeStamp,
    status,
    isPrivate,
    channel,
    sourceId,
    menuOptions,
  } = props;
  const isIncoming = messageType === MESSAGE_TYPES.INCOMING;
  const isOutgoing = messageType === MESSAGE_TYPES.OUTGOING;

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
        <MessageMenu menuOptions={menuOptions}>
          <Animated.View
            style={[
              tailwind.style(
                'relative flex flex-row items-center w-[300px] pl-3 pr-2.5 py-2 rounded-2xl overflow-hidden',
                isIncoming ? 'bg-blue-700' : '',
                isOutgoing ? 'bg-gray-100' : '',
                shouldRenderAvatar
                  ? isOutgoing
                    ? 'rounded-br-none'
                    : isIncoming
                      ? 'rounded-bl-none'
                      : ''
                  : '',
              ),
            ]}>
            <AudioPlayer {...{ audioSrc, isIncoming, isOutgoing }} />
            <Animated.View
              style={tailwind.style(
                'h-[21px] pt-[5px] pb-0.5 flex flex-row items-center self-end pl-1.5',
              )}>
              <Text
                style={tailwind.style(
                  'text-xs font-inter-420-20 tracking-[0.32px] leading-[14px] pr-1',
                  isIncoming ? 'text-whiteA-A11' : '',
                  isOutgoing ? 'text-gray-700' : '',
                )}>
                {unixTimestampToReadableTime(timeStamp)}
              </Text>
              <DeliveryStatus
                isPrivate={isPrivate}
                status={status}
                messageType={messageType}
                channel={channel}
                sourceId={sourceId}
                deliveredColor="text-gray-700"
                sentColor="text-gray-700"
              />
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
