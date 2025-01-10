import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { PlayBackType } from 'react-native-audio-recorder-player';
import Animated, { FadeIn, FadeOut, useSharedValue } from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';

import {
  selectCurrentPlayingAudioSrc,
  setCurrentPlayingAudioSrc,
} from '@/store/conversation/audioPlayerSlice';

import { tailwind } from '@/theme';
import { IconProps } from '@/types';
import { Icon, Slider } from '@/components-next/common';
import { Spinner } from '@/components-next/spinner';
import { pausePlayer, resumePlayer, seekTo, startPlayer, stopPlayer } from '../audio-recorder';
import { MESSAGE_VARIANTS } from '@/constants';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/hooks';

const PlayIcon = ({ fill, fillOpacity }: IconProps) => {
  return (
    <Svg width="10" height="13" viewBox="0 0 10 13" fill="none">
      <Path d="M0 13V0L10 6.80952L0 13Z" fill={fill} fillOpacity={fillOpacity} />
    </Svg>
  );
};

const PauseIcon = ({ fill, fillOpacity }: IconProps) => {
  return (
    <Svg width="10" height="12" viewBox="0 0 10 12" fill="none">
      <Rect width="3" height="12" fill={fill} fillOpacity={fillOpacity} />
      <Rect x="7" width="3" height="12" fill={fill} fillOpacity={fillOpacity} />
    </Svg>
  );
};

type AudioBubbleProps = {
  audioSrc: string;
  variant: string;
};

type AudioPlayerProps = Pick<AudioBubbleProps, 'audioSrc'> & {
  variant: string;
};

export const AudioBubblePlayer = (props: AudioPlayerProps) => {
  const { audioSrc, variant } = props;

  const [isSoundLoading, setIsSoundLoading] = useState(false);
  const [isAudioPlaying, setAudioPlaying] = useState(false);

  const dispatch = useDispatch();
  const currentPlayingAudioSrc = useAppSelector(selectCurrentPlayingAudioSrc);

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
        dispatch(setCurrentPlayingAudioSrc(''));
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
        dispatch(setCurrentPlayingAudioSrc(audioSrc));
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
          dispatch(setCurrentPlayingAudioSrc(''));
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
                  fillOpacity={variant === MESSAGE_VARIANTS.USER ? '1' : '0.565'}
                  fill={variant === MESSAGE_VARIANTS.USER ? 'white' : 'black'}
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
              fillOpacity={variant === MESSAGE_VARIANTS.USER ? '1' : '0.565'}
              fill={variant === MESSAGE_VARIANTS.USER ? 'white' : 'black'}
            />
          </Animated.View>
        )}
      </Pressable>
      <Slider
        trackColor={variant === MESSAGE_VARIANTS.USER ? 'bg-whiteA-A9' : 'bg-gray-500'}
        filledTrackColor={variant === MESSAGE_VARIANTS.USER ? 'bg-white' : 'bg-blue-700'}
        knobStyle={variant === MESSAGE_VARIANTS.USER ? 'border-blue-300' : 'border-blue-700'}
        {...{ manualSeekTo, currentPosition, totalDuration, pauseAudio }}
      />
    </View>
  );
};

export const AudioBubble: React.FC<AudioBubbleProps> = props => {
  const { audioSrc, variant } = props;

  return <AudioBubblePlayer audioSrc={audioSrc} variant={variant} />;
};
