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

const SIZE = 8;

// A dot with a ring swelling out of it, marking a call that is live or still ringing
export const LiveDot = ({ colour, periodMs }: { colour: string; periodMs: number }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: periodMs, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
  }, [periodMs, progress]);

  const halo = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + progress.value * 1.6 }],
    opacity: 0.55 * (1 - progress.value),
  }));
  const dot = { width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: colour };

  return (
    <View style={{ width: SIZE, height: SIZE }}>
      <Animated.View style={[tailwind.style('absolute inset-0'), dot, halo]} />
      <View style={dot} />
    </View>
  );
};
