import { useLayoutEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

// Ids whose entrance already played; a recycled or remounted row starts fully
// visible instead of re-initialising to opacity 0.
const enteredIds = new Set<number>();

// Fades a message row in on mount the first time its id is seen. Runs in a
// layout effect so the fade starts before the first paint (matching the feel of
// a native entering animation) rather than a frame later.
export function useMessageEntrance(itemId: number) {
  const opacity = useSharedValue(enteredIds.has(itemId) ? 1 : 0);

  useLayoutEffect(() => {
    if (enteredIds.has(itemId)) {
      opacity.value = 1;
      return;
    }
    enteredIds.add(itemId);
    opacity.value = withTiming(1, { duration: 350 });
  }, [itemId, opacity]);

  return useAnimatedStyle(() => ({ opacity: opacity.value }));
}
