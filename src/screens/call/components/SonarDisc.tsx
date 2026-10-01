import React, { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { tailwind } from '@/theme';

const SONAR_PERIOD_MS = 3200;

// One translucent disc that swells out from behind the avatar and dissolves, on a loop
export const SonarDisc = ({ colour, delay }: { colour: string; delay: number }) => {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: SONAR_PERIOD_MS, easing: Easing.bezier(0.2, 0.6, 0.3, 1) }),
        -1,
        false,
      ),
    );
  }, [delay, progress]);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + progress.value * 1.1 }],
    opacity: 0.45 * (1 - progress.value),
  }));
  return (
    <Animated.View
      style={[tailwind.style('absolute inset-0 rounded-full'), { backgroundColor: colour }, style]}
      pointerEvents="none"
    />
  );
};
