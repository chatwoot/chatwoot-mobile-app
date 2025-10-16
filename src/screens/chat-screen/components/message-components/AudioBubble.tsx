import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { PlayBackType } from 'react-native-audio-recorder-player';
import Animated, { FadeIn, FadeOut, useSharedValue } from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';
import * as Sentry from '@sentry/react-native';

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
// eslint-disable-next-line import/no-unresolved
import { convertOggToWav } from '@/utils/audioConverter';

// eslint-disable-next-line react/display-name
const PlayIcon = React.memo(({ fill, fillOpacity }: IconProps) => {
  return (
    <Svg width="10" height="13" viewBox="0 0 10 13" fill="none">
      <Path d="M0 13V0L10 6.80952L0 13Z" fill={fill} fillOpacity={fillOpacity} />
    </Svg>
  );
});
// eslint-disable-next-line react/display-name
const PauseIcon = React.memo(({ fill, fillOpacity }: IconProps) => {
  return (
    <Svg width="10" height="12" viewBox="0 0 10 12" fill="none">
      <Rect width="3" height="12" fill={fill} fillOpacity={fillOpacity} />
      <Rect x="7" width="3" height="12" fill={fill} fillOpacity={fillOpacity} />
    </Svg>
  );
});

type AudioBubbleProps = {
  audioSrc: string;
  variant: string;
};

type AudioPlayerProps = Pick<AudioBubbleProps, 'audioSrc'> & {
  variant: string;
};

// eslint-disable-next-line react/display-name
export const AudioBubblePlayer = React.memo((props: AudioPlayerProps) => {
  const { audioSrc, variant } = props;

  const [isSoundLoading, setIsSoundLoading] = useState(false);
  const [isAudioPlaying, setAudioPlaying] = useState(false);
  const [convertedAudioSrc, setConvertedAudioSrc] = useState(audioSrc);

  const dispatch = useDispatch();
  const currentPlayingAudioSrc = useAppSelector(selectCurrentPlayingAudioSrc);

  const currentPosition = useSharedValue(0);
  const totalDuration = useSharedValue(0);

  const audioPlayBackStatus = useCallback(
    (data: { data: PlayBackType }) => {
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
    },
    [currentPosition, totalDuration, dispatch],
  );

  useEffect(() => {
    const prepareAudio = async () => {
      if (Platform.OS === 'ios' && audioSrc.toLowerCase().endsWith('.ogg')) {
        setIsSoundLoading(true);
        try {
          const convertedSrc = await convertOggToWav(audioSrc);
          setConvertedAudioSrc(convertedSrc);
        } catch (error) {
          Sentry.captureException(error);
        } finally {
          setIsSoundLoading(false);
        }
      }
    };
    prepareAudio();
  }, [audioSrc]);

  const togglePlayback = useCallback(() => {
    if (convertedAudioSrc === currentPlayingAudioSrc) {
      if (isAudioPlaying) {
        pausePlayer();
      } else {
        resumePlayer();
      }
      setAudioPlaying(!isAudioPlaying);
    } else {
      setIsSoundLoading(true);
      startPlayer(convertedAudioSrc, audioPlayBackStatus).then(() => {
        setIsSoundLoading(false);
        setAudioPlaying(true);
        dispatch(setCurrentPlayingAudioSrc(convertedAudioSrc));
      });
    }
  }, [convertedAudioSrc, currentPlayingAudioSrc, isAudioPlaying, dispatch, audioPlayBackStatus]);

  const manualSeekTo = useCallback(async (manualSeekPosition: number) => {
    seekTo(manualSeekPosition).then(() => {
      resumePlayer();
    });
  }, []);

  const pauseAudio = useCallback(async () => {
    await pausePlayer();
  }, []);

  const isCurrentAudioSrcPlaying = useMemo(
    () => currentPlayingAudioSrc === convertedAudioSrc && isAudioPlaying,
    [convertedAudioSrc, currentPlayingAudioSrc, isAudioPlaying],
  );

  useEffect(() => {
    if (currentPlayingAudioSrc !== audioSrc) {
      currentPosition.value = 0;
      totalDuration.value = 0;
    }
  }, [currentPlayingAudioSrc, audioSrc, currentPosition, totalDuration]);

  useEffect(() => {
    return () => {
      stopPlayer()
        .then()
        .finally(() => {
          setAudioPlaying(false);
          dispatch(setCurrentPlayingAudioSrc(''));
        });
    };
  }, [dispatch]);

  const sliderProps = useMemo(
    () => ({
      trackColor: variant === MESSAGE_VARIANTS.USER ? 'bg-whiteA-A9' : 'bg-gray-500',
      filledTrackColor: variant === MESSAGE_VARIANTS.USER ? 'bg-white' : 'bg-blue-700',
      knobStyle: variant === MESSAGE_VARIANTS.USER ? 'border-blue-300' : 'border-blue-700',
      manualSeekTo,
      currentPosition,
      totalDuration,
      pauseAudio,
    }),
    [variant, manualSeekTo, currentPosition, totalDuration, pauseAudio],
  );

  return (
    <View style={tailwind.style('w-full flex flex-row items-center flex-1')}>
      <Pressable disabled={isSoundLoading} hitSlop={10} onPress={togglePlayback}>
        {isSoundLoading ? (
          <Animated.View>
            <Spinner size={13} stroke={variant === MESSAGE_VARIANTS.USER ? 'white' : 'black'} />
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
      <Slider {...sliderProps} />
    </View>
  );
});

// eslint-disable-next-line react/display-name
export const AudioBubble = React.memo<AudioBubbleProps>(props => {
  const { audioSrc, variant } = props;

  return (
    <Animated.View style={tailwind.style('w-full flex flex-row items-center')}>
      <AudioBubblePlayer audioSrc={audioSrc} variant={variant} />
    </Animated.View>
  );
});
