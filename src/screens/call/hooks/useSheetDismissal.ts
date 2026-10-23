import { useCallback, useMemo, useRef, useState } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { SHEET_CLOSE_MS, SHEET_DISMISS_DRAG, SHEET_SCRIM_FADE_MS } from '../constants/sheet';

// How the incoming-calls sheet leaves: a drag down collapses it to the strip at once, and
// closeSheet drops it away with the scrim fading, after which only the strip remains
export const useSheetDismissal = (onClosed: () => void, startCollapsed = false) => {
  const [collapsed, setCollapsed] = useState(startCollapsed);
  const dragY = useSharedValue(0);
  const closeY = useSharedValue(0);
  const scrim = useSharedValue(1);
  const closingRef = useRef(false);

  const closeSheet = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    scrim.value = withTiming(0, { duration: SHEET_SCRIM_FADE_MS });
    closeY.value = withTiming(900, {
      duration: SHEET_CLOSE_MS,
      easing: Easing.bezier(0.4, 0.2, 0.2, 1),
    });
    setTimeout(() => {
      closingRef.current = false;
      setCollapsed(true);
      onClosed();
      closeY.value = 0;
      scrim.value = 1;
    }, SHEET_CLOSE_MS);
  }, [closeY, onClosed, scrim]);

  const collapse = useCallback(() => setCollapsed(true), []);
  const expand = useCallback(() => setCollapsed(false), []);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY(12)
        .failOffsetX([-10, 10])
        .onUpdate(event => {
          dragY.value = Math.max(0, event.translationY);
        })
        .onEnd(() => {
          if (dragY.value > SHEET_DISMISS_DRAG) runOnJS(collapse)();
          dragY.value = withSpring(0, { damping: 20, stiffness: 220 });
        }),
    [collapse, dragY],
  );
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dragY.value + closeY.value }],
  }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrim.value }));

  return { collapsed, collapse, expand, closeSheet, pan, sheetStyle, scrimStyle };
};
