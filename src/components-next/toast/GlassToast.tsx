import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import { useSideTabBarLayout } from '@/utils';

import { tailwind } from '@/theme';
import { subscribeToToasts, type ToastMessage } from '@/utils/toastEvents';

// iOS toast: a small frosted glass capsule that stays about two seconds and fades away. On
// iPhone it drops down under the Dynamic Island (swipe up to dismiss); on iPhone Duo, where
// the status bar is on the side, it rises near the bottom above the reply bar and keyboard
// (swipe down to dismiss). It never blocks taps elsewhere; a new message replaces the old.

const useLiquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();
const VISIBLE_MS = 2200;

/** Renders the toasts; place once above the app's screens. */
export const GlassToastHost = () => {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const { top, bottom, left, right } = useSafeAreaInsets();
  const { height: keyboardHeight } = useReanimatedKeyboardAnimation();
  const fromBottom = useSideTabBarLayout() !== null;
  const progress = useSharedValue(0);
  const dragY = useSharedValue(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => setToast(null);
  const hide = () => {
    progress.value = withTiming(0, { duration: 220 }, finished => {
      if (finished) runOnJS(clear)();
    });
  };

  useEffect(() => {
    const listener = (next: ToastMessage) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      dragY.value = 0;
      setToast(next);
      progress.value = withSpring(1, { damping: 20, stiffness: 260 });
      hideTimer.current = setTimeout(hide, VISIBLE_MS);
    };
    const unsubscribe = subscribeToToasts(listener);
    return () => {
      unsubscribe();
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swipe toward the edge it came from to dismiss.
  const swipeAway = Gesture.Pan()
    .onUpdate(event => {
      dragY.value = fromBottom ? Math.max(0, event.translationY) : Math.min(0, event.translationY);
    })
    .onEnd(event => {
      const away = fromBottom
        ? event.translationY > 20 || event.velocityY > 400
        : event.translationY < -20 || event.velocityY < -400;
      if (away) runOnJS(hide)();
      else dragY.value = withSpring(0);
    });

  // From the bottom it rises with the keyboard (its height is negative while open).
  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        translateY: fromBottom
          ? (1 - progress.value) * 24 + dragY.value + keyboardHeight.value
          : (1 - progress.value) * -24 + dragY.value,
      },
    ],
  }));

  if (!toast) return null;

  // Top: just below the Dynamic Island. Bottom (Duo): clear of the reply bar.
  // Centered on the content, not the whole display: clear of the side status column (Duo).
  const position = {
    left,
    right,
    ...(fromBottom ? { bottom: bottom + 64 } : { top: top + 6 }),
  };

  return (
    <View pointerEvents="box-none" style={[styles.host, position]}>
      <GestureDetector gesture={swipeAway}>
        <Animated.View
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={[
            tailwind.style(
              'min-h-11 max-w-[88%] px-4 py-2.5 rounded-[22px] items-center justify-center',
              useLiquidGlass ? '' : 'bg-white border-[0.5px] border-blackA-A6',
            ),
            useLiquidGlass ? null : styles.shadow,
            style,
          ]}>
          {useLiquidGlass ? (
            <GlassView
              glassEffectStyle="regular"
              style={[StyleSheet.absoluteFill, { borderRadius: 22 }]}
            />
          ) : null}
          <Text
            numberOfLines={3}
            style={tailwind.style(
              'text-[15px] leading-[20px] font-inter-medium-24 text-gray-950 text-center',
            )}>
            {toast.text}
          </Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  host: { position: 'absolute', alignItems: 'center', zIndex: 200 },
  shadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
});
