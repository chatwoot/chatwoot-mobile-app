import { PropsWithChildren, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

const FADE_HEIGHT = 20;
const APPEAR_DISTANCE = 12;

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
}>;

export const ScrollEdgeHeader = ({
  scrollY,
  onHeightChange,
  insetSides = false,
  children,
}: ScrollEdgeHeaderProps) => {
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
      <View style={insetSides ? { paddingLeft: left, paddingRight: right } : null}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  effect: { position: 'absolute', top: 0, left: 0, right: 0 },
  blur: { position: 'absolute', top: 0, left: 0, right: 0 },
});
