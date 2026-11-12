import { useTailwind } from '@/theme/useTailwind';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Platform, Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useSharedValue } from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';

import {
  selectCurrentPlayingAudioSrc,
  setCurrentPlayingAudioSrc,
} from '@/store/conversation/audioPlayerSlice';

import { IconProps } from '@/types';
import { Icon, Slider } from '@/components-next/common';
import { FileErrorIcon } from '@/svg-icons';
import i18n from '@/i18n';
import { Spinner } from '@/components-next/spinner';
import {
  AudioStatus,
  pausePlayer,
  resumePlayer,
  seekTo,
  startPlayer,
  stopPlayer,
  type Callback,
} from '../audio-recorder';
import { MESSAGE_VARIANTS } from '@/constants';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/hooks';
import { preparePlayableAudio } from '@/utils/audioConverter';
import { iosNeedsConversion } from '@/utils/audioSource';
import { useCloudflareMedia } from '@/hooks/useCloudflareMedia';

// eslint-disable-next-line react/display-name
export const PlayIcon = React.memo(({ fill, fillOpacity }: IconProps) => {
  return (
    <Svg width="10" height="13" viewBox="0 0 10 13" fill="none">
      <Path d="M0 13V0L10 6.80952L0 13Z" fill={fill} fillOpacity={fillOpacity} />
    </Svg>
  );
});
// eslint-disable-next-line react/display-name
export const PauseIcon = React.memo(({ fill, fillOpacity }: IconProps) => {
  return (
    <Svg width="10" height="12" viewBox="0 0 10 12" fill="none">
      <Rect width="3" height="12" fill={fill} fillOpacity={fillOpacity} />
      <Rect x="7" width="3" height="12" fill={fill} fillOpacity={fillOpacity} />
    </Svg>
  );
});

type AudioBubbleProps = {
  audioSrc: string;
  contentType?: string | null;
  extension?: string | null;
  variant: string;
};

type AudioPlayerProps = AudioBubbleProps;

// eslint-disable-next-line react/display-name
export const AudioBubblePlayer = React.memo((props: AudioPlayerProps) => {
  const tailwind = useTailwind();
  const { audioSrc, contentType, extension, variant } = props;
  const onFilledBubble = variant === MESSAGE_VARIANTS.USER || variant === MESSAGE_VARIANTS.ERROR;
  const iconColor = onFilledBubble ? 'white' : tailwind.color('text-gray-950');

  const [isSoundLoading, setIsSoundLoading] = useState(false);
  const [isAudioPlaying, setAudioPlaying] = useState(false);
  const [convertedAudioSrc, setConvertedAudioSrc] = useState('');
  const [hasConversionFailed, setHasConversionFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const media = useCloudflareMedia(audioSrc, retryCount);

  const dispatch = useDispatch();
  const currentPlayingAudioSrc = useAppSelector(selectCurrentPlayingAudioSrc);

  const currentPosition = useSharedValue(0);
  const totalDuration = useSharedValue(0);

  const audioPlayBackStatus = useCallback<Callback>(
    ({ status, data: playBackData }) => {
      if (status === AudioStatus.PAUSED && playBackData) setAudioPlaying(false);
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
    let active = true;
    if (!media.uri) {
      setConvertedAudioSrc('');
      setIsSoundLoading(media.loading);
      setHasConversionFailed(media.failed);
      return;
    }
    const source = { dataUrl: media.uri, contentType, extension };

    const prepareAudio = async () => {
      // Every run starts from the incoming source with no loading or failure state.
      setIsSoundLoading(false);
      setHasConversionFailed(false);
      setConvertedAudioSrc(media.uri ?? '');
      // Sources the metadata marks as natively playable skip the download.
      // Ogg/WebM and unidentified sources go through preparePlayableAudio.
      if (Platform.OS !== 'ios' || iosNeedsConversion(source) === false) {
        return;
      }
      setIsSoundLoading(true);
      try {
        const playableSrc = await preparePlayableAudio(source);
        if (active) {
          setConvertedAudioSrc(playableSrc);
        }
      } catch {
        // preparePlayableAudio reports to Sentry already.
        if (active) {
          setHasConversionFailed(true);
        }
      } finally {
        if (active) {
          setIsSoundLoading(false);
        }
      }
    };
    prepareAudio();

    return () => {
      active = false;
    };
  }, [media.uri, media.loading, media.failed, contentType, extension, retryCount]);

  const togglePlayback = useCallback(() => {
    if (!convertedAudioSrc || media.loading || media.failed) return;
    if (convertedAudioSrc === currentPlayingAudioSrc) {
      if (isAudioPlaying) {
        pausePlayer();
      } else {
        resumePlayer();
      }
      setAudioPlaying(!isAudioPlaying);
    } else {
      setIsSoundLoading(true);
      startPlayer(convertedAudioSrc, audioPlayBackStatus)
        .then(() => {
          setIsSoundLoading(false);
          setAudioPlaying(true);
          dispatch(setCurrentPlayingAudioSrc(convertedAudioSrc));
        })
        .catch(() => {
          setIsSoundLoading(false);
          setHasConversionFailed(true);
        });
    }
  }, [
    convertedAudioSrc,
    currentPlayingAudioSrc,
    isAudioPlaying,
    dispatch,
    audioPlayBackStatus,
    media.loading,
    media.failed,
  ]);

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
      trackColor: onFilledBubble
        ? 'bg-whiteA-A9'
        : tailwind.isDark
          ? 'bg-whiteA-A6'
          : 'bg-gray-500',
      filledTrackColor: onFilledBubble ? 'bg-white' : 'bg-blue-700',
      knobStyle: onFilledBubble ? 'border-blue-300' : 'border-blue-700',
      manualSeekTo,
      currentPosition,
      totalDuration,
      pauseAudio,
    }),
    [onFilledBubble, tailwind, manualSeekTo, currentPosition, totalDuration, pauseAudio],
  );

  if (hasConversionFailed) {
    const failureColor = onFilledBubble ? 'text-white' : 'text-gray-900';
    // Tapping the failure row runs the preparation again.
    return (
      <Pressable
        hitSlop={10}
        onPress={() => setRetryCount(count => count + 1)}
        style={tailwind.style('w-full flex flex-row items-center gap-1 flex-1')}>
        <Icon icon={<FileErrorIcon fill={tailwind.color(failureColor)} />} size={16} />
        <Animated.Text style={tailwind.style(`text-cxs font-inter-420-20 ${failureColor}`)}>
          {i18n.t('CONVERSATION.AUDIO_NOT_AVAILABLE')}
        </Animated.Text>
      </Pressable>
    );
  }

  return (
    <View style={tailwind.style('w-full flex flex-row items-center flex-1')}>
      <Pressable
        disabled={isSoundLoading || media.loading || media.failed || !convertedAudioSrc}
        hitSlop={10}
        onPress={togglePlayback}>
        {isSoundLoading ? (
          <Animated.View>
            <Spinner size={13} stroke={iconColor} />
          </Animated.View>
        ) : isCurrentAudioSrcPlaying ? (
          <Animated.View
            style={tailwind.style('pl-0.5 pr-0.5')}
            entering={FadeIn}
            exiting={FadeOut}>
            <Icon
              icon={<PauseIcon fillOpacity={onFilledBubble ? '1' : '0.565'} fill={iconColor} />}
              size={13}
            />
          </Animated.View>
        ) : (
          <Animated.View
            style={tailwind.style('pl-0.5 pr-0.5')}
            entering={FadeIn}
            exiting={FadeOut}>
            <PlayIcon fillOpacity={onFilledBubble ? '1' : '0.565'} fill={iconColor} />
          </Animated.View>
        )}
      </Pressable>
      <Slider {...sliderProps} />
    </View>
  );
});

// eslint-disable-next-line react/display-name
export const AudioBubble = React.memo<AudioBubbleProps>(props => {
  const tailwind = useTailwind();
  return (
    <Animated.View style={tailwind.style('w-full flex flex-row items-center')}>
      <AudioBubblePlayer {...props} />
    </Animated.View>
  );
});
