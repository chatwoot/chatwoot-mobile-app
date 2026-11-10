import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTailwind } from '@/theme/useTailwind';

import { useCallTheme } from '../constants/callTheme';

type PulseDotProps = {
  colour?: string;
  size?: number;
  periodMs?: number;
  // Ring expansion relative to dot size.
  spread?: number;
  paused?: boolean;
};

export const PulseDot = ({
  colour,
  size = 8,
  periodMs = 2000,
  spread = 1.1,
  paused = false,
}: PulseDotProps) => {
  const tailwind = useTailwind();
  const { CALL_LINK } = useCallTheme();
  const progress = useSharedValue(0);
  useEffect(() => {
    if (paused) {
      cancelAnimation(progress);
      progress.value = 0;
      return;
    }
    progress.value = withRepeat(
      withTiming(1, { duration: periodMs, easing: Easing.bezier(0.2, 0.6, 0.3, 1) }),
      -1,
      false,
    );
  }, [paused, periodMs, progress]);
  const halo = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + progress.value * spread }],
    opacity: 0.5 * (1 - progress.value),
  }));
  const dot = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: colour ?? CALL_LINK,
  };
  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[tailwind.style('absolute inset-0'), dot, halo]} />
      <View style={dot} />
    </View>
  );
};
