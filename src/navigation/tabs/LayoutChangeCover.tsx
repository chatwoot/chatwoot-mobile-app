import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { useIsSplitLayout } from '@/utils';

/**
 * Covers the app while the Duo folds or unfolds: the layout switches between one column and
 * the split view, and screens close, open and re-measure over a few frames. A white cover
 * hides those in-between frames, then fades out once the new layout has settled.
 */
export const LayoutChangeCover = () => {
  const isSplit = useIsSplitLayout();
  const wasSplit = React.useRef(isSplit);
  const opacity = useSharedValue(0);
  React.useEffect(() => {
    if (wasSplit.current === isSplit) return;
    wasSplit.current = isSplit;
    opacity.value = 1;
    opacity.value = withDelay(220, withTiming(0, { duration: 250 }));
  }, [isSplit, opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.cover, style]} />
  );
};

const styles = StyleSheet.create({
  cover: { backgroundColor: '#FFFFFF', zIndex: 100 },
});
