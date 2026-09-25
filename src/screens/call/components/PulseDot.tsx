import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { tailwind } from '@/theme';

import { CALL_LINK } from '../constants/callTheme';

const PULSE_PERIOD_MS = 2000;

// A small blue dot with a sonar ring, marking a ring in progress
export const PulseDot = ({ size = 8 }: { size?: number }) => {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: PULSE_PERIOD_MS, easing: Easing.bezier(0.2, 0.6, 0.3, 1) }),
      -1,
      false,
    );
  }, [progress]);
  const halo = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + progress.value * 1.1 }],
    opacity: 0.5 * (1 - progress.value),
  }));
  const dot = { width: size, height: size, borderRadius: size / 2, backgroundColor: CALL_LINK };
  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[tailwind.style('absolute inset-0'), dot, halo]} />
      <View style={dot} />
    </View>
  );
};
