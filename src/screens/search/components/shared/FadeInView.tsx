import React, { useEffect } from 'react';
import type { ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

type FadeInViewProps = ViewProps & {
  duration?: number;
  delay?: number;
};

// Fades a view in on mount by animating opacity from 0 to 1.
export const FadeInView = ({
  duration = 200,
  delay = 0,
  style,
  children,
  ...rest
}: FadeInViewProps) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration }));
  }, [opacity, delay, duration]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[style, animatedStyle]} {...rest}>
      {children}
    </Animated.View>
  );
};
