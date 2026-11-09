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

const FADE_HEIGHT = 20;
const APPEAR_DISTANCE = 12;

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

export const useScrollEdge = () => {
  const scrollY = useSharedValue(0);
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
  onHeightChange: (height: number) => void;
  insetSides?: boolean;
  background?: string;
}>;

export const ScrollEdgeHeader = ({
  scrollY,
  onHeightChange,
  insetSides = false,
  background = 'bg-white',
  children,
}: ScrollEdgeHeaderProps) => {
  const tailwind = useTailwind();
  const backgroundColor = tailwind.color(background);
  const [height, setHeight] = useState(0);
  const { top, left, right } = useSafeAreaInsets();

  const effectStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, APPEAR_DISTANCE], [0, 1], Extrapolation.CLAMP),
  }));

  const total = height + FADE_HEIGHT;
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
                <Stop offset="0" stopColor={backgroundColor} stopOpacity={0.9} />
                <Stop offset={headerEnd} stopColor={backgroundColor} stopOpacity={0.72} />
                <Stop offset="1" stopColor={backgroundColor} stopOpacity={0} />
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
