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

import { tailwind } from '@/theme';

import { CALL_LINK } from '../constants/callTheme';

type PulseDotProps = {
  colour?: string;
  size?: number;
  periodMs?: number;
  // How far the ring swells, as a multiple of the dot
  spread?: number;
  // The ring rests while nobody can see it
  paused?: boolean;
};

// A small dot with a sonar ring, marking a call that is ringing or live
export const PulseDot = ({
  colour = CALL_LINK,
  size = 8,
  periodMs = 2000,
  spread = 1.1,
  paused = false,
}: PulseDotProps) => {
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
  const dot = { width: size, height: size, borderRadius: size / 2, backgroundColor: colour };
  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[tailwind.style('absolute inset-0'), dot, halo]} />
      <View style={dot} />
    </View>
  );
};
