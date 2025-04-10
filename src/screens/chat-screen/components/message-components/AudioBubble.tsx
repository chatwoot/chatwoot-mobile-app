import React, { useMemo, useCallback } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';

import { tailwind } from '@/theme';
import { IconProps } from '@/types';
import { Icon, Slider } from '@/components-next/common';
import { Spinner } from '@/components-next/spinner';
import { MESSAGE_VARIANTS } from '@/constants';
import { useAudio } from './useAudio';

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

  // Use our custom hook for audio functionality
  const { isLoading, isPlaying, currentPosition, totalDuration, togglePlayback, seekTo, pause } =
    useAudio(audioSrc);

  // Handle play/pause button press
  const handlePlayPausePress = useCallback(() => {
    if (!isLoading) {
      togglePlayback();
    }
  }, [isLoading, togglePlayback]);

  // Configure slider props based on variant and audio state
  const sliderProps = useMemo(
    () => ({
      trackColor: variant === MESSAGE_VARIANTS.USER ? 'bg-whiteA-A9' : 'bg-gray-500',
      filledTrackColor: variant === MESSAGE_VARIANTS.USER ? 'bg-white' : 'bg-blue-700',
      knobStyle: variant === MESSAGE_VARIANTS.USER ? 'border-blue-300' : 'border-blue-700',
      manualSeekTo: seekTo,
      currentPosition,
      totalDuration,
      pauseAudio: pause,
    }),
    [variant, seekTo, currentPosition, totalDuration, pause],
  );

  const iconColor = variant === MESSAGE_VARIANTS.USER ? 'white' : 'black';
  const iconOpacity = variant === MESSAGE_VARIANTS.USER ? '1' : '0.565';

  return (
    <View style={tailwind.style('w-full flex flex-row items-center flex-1')}>
      <Pressable hitSlop={10} onPress={handlePlayPausePress}>
        {isLoading ? (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <Spinner size={13} stroke={variant === MESSAGE_VARIANTS.USER ? 'white' : 'black'} />
          </Animated.View>
        ) : isPlaying ? (
          <Animated.View
            style={tailwind.style('pl-0.5 pr-0.5')}
            entering={FadeIn}
            exiting={FadeOut}>
            <Icon icon={<PauseIcon fillOpacity={iconOpacity} fill={iconColor} />} size={13} />
          </Animated.View>
        ) : (
          <Animated.View
            style={tailwind.style('pl-0.5 pr-0.5')}
            entering={FadeIn}
            exiting={FadeOut}>
            <PlayIcon fillOpacity={iconOpacity} fill={iconColor} />
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
