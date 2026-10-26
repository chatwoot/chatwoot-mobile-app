import React, { PropsWithChildren, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { BlurView } from '@react-native-community/blur';
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

/** Tracks the list's scroll position for ScrollEdgeHeader. */
export const useScrollEdge = () => {
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });
  return { scrollY, onScroll };
};

type ScrollEdgeHeaderProps = PropsWithChildren<{
  scrollY: SharedValue<number>;
  // Reports the header's height so the list can start below it.
  onHeightChange: (height: number) => void;
}>;

export const ScrollEdgeHeader = ({ scrollY, onHeightChange, children }: ScrollEdgeHeaderProps) => {
  const [height, setHeight] = useState(0);

  const effectStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, APPEAR_DISTANCE], [0, 1], Extrapolation.CLAMP),
  }));

  const total = height + FADE_HEIGHT;
  // Where the header ends within the gradient (0–1).
  const headerEnd = total > 0 ? height / total : 0;

  return (
    <View
      pointerEvents="box-none"
      style={styles.container}
      onLayout={e => {
        const h = Math.round(e.nativeEvent.layout.height);
        setHeight(h);
        onHeightChange(h);
      }}>
      {height > 0 ? (
        <Animated.View pointerEvents="none" style={[styles.effect, { height: total }, effectStyle]}>
          <BlurView blurType="light" blurAmount={16} style={[styles.blur, { height }]} />
          <Svg width="100%" height={total} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="scrollEdge" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.9} />
                <Stop offset={headerEnd} stopColor="#FFFFFF" stopOpacity={0.72} />
                <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height={total} fill="url(#scrollEdge)" />
          </Svg>
        </Animated.View>
      ) : null}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  effect: { position: 'absolute', top: 0, left: 0, right: 0 },
  blur: { position: 'absolute', top: 0, left: 0, right: 0 },
});
