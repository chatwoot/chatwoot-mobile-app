import React, { useEffect } from 'react';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { CircleNotchIcon } from '@/svg-icons';

const TURN_MS = 900;

// An open ring turning steadily, shown while a call action is in flight
export const SpinningNotch = ({ color, size }: { color: string; size: number }) => {
  const turn = useSharedValue(0);
  useEffect(() => {
    turn.value = withRepeat(withTiming(1, { duration: TURN_MS, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(turn);
  }, [turn]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value * 360}deg` }] }));
  return (
    <Animated.View style={[{ width: size, height: size }, style]}>
      <CircleNotchIcon color={color} size={size} />
    </Animated.View>
  );
};
