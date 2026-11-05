import { useTailwind } from '@/theme/useTailwind';
import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { BlurView } from '@react-native-community/blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

// A floating header with an iOS "scroll edge effect" (Apple HIG, Scroll views): the list
// scrolls underneath, and once content is behind the header it's blurred and faded so
// the title and buttons stay legible. There's no solid bar or divider (HIG: reduce
// toolbar backgrounds). The header has a text title outside glass buttons, so this uses
// a fairly opaque effect, like the system's automatic style.

// How far below the header the effect fades out.
const FADE_HEIGHT = 20;
// Scroll distance over which the effect appears.
const APPEAR_DISTANCE = 12;

/**
 * Space at the top of a list that sits under a ScrollEdgeHeader. When the header grows
 * or shrinks (e.g. the filter bar opens) the space springs to the new height, so the
 * list glides instead of jumping. The first height applies immediately.
 */
export const HeaderSpacer = ({ height }: { height: number }) => {
  const animatedHeight = useSharedValue(height);
  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      animatedHeight.value = height;
      return;
    }
    // Same spring the list used when the header pushed it down.
    animatedHeight.value = withSpring(height, { damping: 22, stiffness: 180 });
  }, [height, animatedHeight]);
  const style = useAnimatedStyle(() => ({ height: animatedHeight.value }));
  return <Animated.View style={style} />;
};

/**
 * Pull-to-refresh spinner for a list under a ScrollEdgeHeader. The system spinner can't
 * sit below a floating header (iOS reserves its space at the very top, behind the
 * header), so the list hides it (transparent tint) and this one is drawn in the gap that
 * opens below the header as you pull, centered in it while refreshing.
 */
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
  // A refresh can swap the list out for a loader mid-pull, so the "finger lifted" and
  // final scroll events never arrive. Reset the tracking when this list mounts or
  // unmounts and whenever a refresh finishes, so nothing is left on screen.
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

  // Visible only during an active pull or a running refresh.
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
    <Animated.View pointerEvents="none" style={[styles.refresh, { top }, style]}>
      <ActivityIndicator animating />
    </Animated.View>
  );
};

/** Tracks the list's scroll position for ScrollEdgeHeader. */
export const useScrollEdge = () => {
  const scrollY = useSharedValue(0);
  // 1 while a finger is on the list, so the refresh spinner only follows an active pull.
  const isDragging = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
    onBeginDrag: () => {
      isDragging.value = 1;
    },
    onEndDrag: () => {
      isDragging.value = 0;
    },
  });
  return { scrollY, isDragging, onScroll };
};

type ScrollEdgeHeaderProps = PropsWithChildren<{
  scrollY: SharedValue<number>;
  // Reports the header's height so the list can start below it.
  onHeightChange: (height: number) => void;
  // Keep the content clear of the side safe areas (e.g. the side status column on the closed
  // Duo); the blur still spans the full width.
  insetSides?: boolean;
}>;

export const ScrollEdgeHeader = ({
  scrollY,
  onHeightChange,
  insetSides = false,
  children,
}: ScrollEdgeHeaderProps) => {
  const tailwind = useTailwind();
  const [height, setHeight] = useState(0);
  // The header starts at the top of the screen so the blur also covers the status bar; its
  // content sits below the status bar.
  const { top, left, right } = useSafeAreaInsets();

  const effectStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, APPEAR_DISTANCE], [0, 1], Extrapolation.CLAMP),
  }));

  const total = height + FADE_HEIGHT;
  // Where the header ends within the gradient (0–1).
  const headerEnd = total > 0 ? height / total : 0;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { paddingTop: top }]}
      onLayout={e => {
        const h = Math.round(e.nativeEvent.layout.height);
        setHeight(h);
        onHeightChange(h);
      }}>
      {height > 0 ? (
        <Animated.View pointerEvents="none" style={[styles.effect, { height: total }, effectStyle]}>
          <BlurView
            blurType={tailwind.isDark ? 'dark' : 'light'}
            blurAmount={16}
            style={[styles.blur, { height }]}
          />
          <Svg width="100%" height={total} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="scrollEdge" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={tailwind.color('bg-white')} stopOpacity={0.9} />
                <Stop
                  offset={headerEnd}
                  stopColor={tailwind.color('bg-white')}
                  stopOpacity={0.72}
                />
                <Stop offset="1" stopColor={tailwind.color('bg-white')} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height={total} fill="url(#scrollEdge)" />
          </Svg>
        </Animated.View>
      ) : null}
      <View style={insetSides ? { paddingLeft: left, paddingRight: right } : null}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  effect: { position: 'absolute', top: 0, left: 0, right: 0 },
  blur: { position: 'absolute', top: 0, left: 0, right: 0 },
  refresh: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
