import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

export const PullToRefreshIndicator = ({
  scrollY,
  isDragging,
  top,
  refreshing,
}: {
  scrollY: SharedValue<number>;
  isDragging: SharedValue<number>;
  top: number;
  refreshing: boolean;
}) => {
  // Reset tracking; refreshes can drop events.
  useEffect(() => {
    isDragging.value = 0;
    scrollY.value = 0;
    return () => {
      isDragging.value = 0;
      scrollY.value = 0;
    };
  }, [isDragging, scrollY]);
  useEffect(() => {
    if (!refreshing) isDragging.value = 0;
  }, [refreshing, isDragging]);

  const style = useAnimatedStyle(() => {
    const pull = Math.max(-scrollY.value, 0);
    const pullOpacity = interpolate(pull, [8, 48], [0, 1], Extrapolation.CLAMP);
    const visible = refreshing || isDragging.value === 1;
    return {
      height: visible ? pull : 0,
      opacity: refreshing ? 1 : visible ? pullOpacity : 0,
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[refreshStyles.refresh, { top }, style]}>
      <ActivityIndicator animating />
    </Animated.View>
  );
};

const refreshStyles = StyleSheet.create({
  refresh: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
