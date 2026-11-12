import { useEffect, useRef } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export const HeaderSpacer = ({ height }: { height: number }) => {
  const animatedHeight = useSharedValue(height);
  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      animatedHeight.value = height;
      return;
    }
    animatedHeight.value = withSpring(height, { damping: 22, stiffness: 180 });
  }, [height, animatedHeight]);
  const style = useAnimatedStyle(() => ({ height: animatedHeight.value }));
  return <Animated.View style={style} />;
};
