import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';

import { tailwind } from '@/theme';
import { IconProps } from '@/types';
import { Icon, Slider } from '@/components-next/common';
import { FileErrorIcon } from '@/svg-icons';
import i18n from '@/i18n';
import { Spinner } from '@/components-next/spinner';
import { MESSAGE_VARIANTS } from '@/constants';

import { useAudioBubblePlayback } from './useAudioBubblePlayback';

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

// eslint-disable-next-line react/display-name
export const AudioBubblePlayer = React.memo((props: AudioBubbleProps) => {
  const { audioSrc, contentType, extension, variant } = props;

  const source = useMemo(
    () => ({ dataUrl: audioSrc, contentType, extension }),
    [audioSrc, contentType, extension],
  );
  const { state, currentPosition, totalDuration, toggle, pause, seekTo } =
    useAudioBubblePlayback(source);

  const isUserVariant = variant === MESSAGE_VARIANTS.USER;
  const iconFill = isUserVariant ? 'white' : 'black';
  const iconFillOpacity = isUserVariant ? '1' : '0.565';

  const sliderProps = useMemo(
    () => ({
      trackColor: isUserVariant ? 'bg-whiteA-A9' : 'bg-gray-500',
      filledTrackColor: isUserVariant ? 'bg-white' : 'bg-blue-700',
      knobStyle: isUserVariant ? 'border-blue-300' : 'border-blue-700',
      manualSeekTo: seekTo,
      currentPosition,
      totalDuration,
      pauseAudio: pause,
    }),
    [isUserVariant, seekTo, currentPosition, totalDuration, pause],
  );

  if (state === 'failed') {
    return (
      <View style={tailwind.style('w-full flex flex-row items-center gap-1 flex-1')}>
        <Icon icon={<FileErrorIcon fill={tailwind.color('text-gray-900')} />} size={16} />
        <Animated.Text style={tailwind.style('text-cxs font-inter-420-20 text-gray-900')}>
          {i18n.t('CONVERSATION.AUDIO_NOT_AVAILABLE')}
        </Animated.Text>
      </View>
    );
  }

  return (
    <View style={tailwind.style('w-full flex flex-row items-center flex-1')}>
      <Pressable disabled={state === 'loading'} hitSlop={10} onPress={toggle}>
        {state === 'loading' ? (
          <Animated.View>
            <Spinner size={13} stroke={iconFill} />
          </Animated.View>
        ) : state === 'playing' ? (
          <Animated.View
            style={tailwind.style('pl-0.5 pr-0.5')}
            entering={FadeIn}
            exiting={FadeOut}>
            <Icon icon={<PauseIcon fillOpacity={iconFillOpacity} fill={iconFill} />} size={13} />
          </Animated.View>
        ) : (
          <Animated.View
            style={tailwind.style('pl-0.5 pr-0.5')}
            entering={FadeIn}
            exiting={FadeOut}>
            <PlayIcon fillOpacity={iconFillOpacity} fill={iconFill} />
          </Animated.View>
        )}
      </Pressable>
      <Slider {...sliderProps} />
    </View>
  );
});

// eslint-disable-next-line react/display-name
export const AudioBubble = React.memo<AudioBubbleProps>(props => {
  return (
    <Animated.View style={tailwind.style('w-full flex flex-row items-center')}>
      <AudioBubblePlayer {...props} />
    </Animated.View>
  );
});
