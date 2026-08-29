import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface UseTargetMessageAnimationParams {
  isTargetMessage: boolean;
}

/**
 * Zoom + highlight animation for a target message. The caller sets the target
 * only after the scroll settles, so the animation plays in place: a single
 * gentle scale pulse and a highlight overlay that fades out.
 */
export function useTargetMessageAnimation({ isTargetMessage }: UseTargetMessageAnimationParams) {
  const scale = useSharedValue(1);
  const highlightOpacity = useSharedValue(0);

  useEffect(() => {
    if (!isTargetMessage) {
      scale.value = 1;
      highlightOpacity.value = 0;
      return;
    }

    scale.value = withSequence(
      withTiming(1.03, { duration: 200, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 260, easing: Easing.inOut(Easing.quad) }),
    );
    highlightOpacity.value = withSequence(
      withTiming(0.35, { duration: 200, easing: Easing.out(Easing.quad) }),
      withDelay(250, withTiming(0, { duration: 450, easing: Easing.in(Easing.quad) })),
    );
  }, [isTargetMessage, scale, highlightOpacity]);

  const zoomStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const highlightStyle = useAnimatedStyle(() => ({
    opacity: highlightOpacity.value,
  }));

  return { zoomStyle, highlightStyle };
}
