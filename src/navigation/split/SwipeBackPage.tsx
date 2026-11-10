import React, { PropsWithChildren } from 'react';
import { StyleProp, useWindowDimensions, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export const SwipeBackPage = ({
  onBack,
  style,
  children,
}: PropsWithChildren<{ onBack: () => void; style?: StyleProp<ViewStyle> }>) => {
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .hitSlop({ left: 0, width: 24 })
    .activeOffsetX(8)
    .failOffsetY([-12, 12])
    .onUpdate(event => {
      translateX.value = Math.max(0, event.translationX);
    })
    .onEnd(event => {
      if (event.translationX > width / 3 || event.velocityX > 800) {
        translateX.value = withTiming(width, { duration: 200 }, finished => {
          if (finished) runOnJS(onBack)();
        });
      } else {
        translateX.value = withSpring(0, { damping: 26, stiffness: 260 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </GestureDetector>
  );
};
