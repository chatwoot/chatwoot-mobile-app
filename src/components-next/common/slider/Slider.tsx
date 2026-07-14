import React from 'react';
import { LayoutChangeEvent, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  WithSpringConfig,
} from 'react-native-reanimated';

import { tailwind } from '@/theme';

const DefaultSpringConfig: WithSpringConfig = {
  mass: 1,
  damping: 18,
  stiffness: 280,
};

const PROGRESS_TWEEN_DURATION = 100;

type SliderProps = {
  currentPosition: SharedValue<number>;
  totalDuration: SharedValue<number>;
  manualSeekTo: (manualSeekPosition: number) => void;
  pauseAudio: () => void;
  trackColor: string;
  filledTrackColor: string;
  knobStyle: string;
};

export const Slider = (props: SliderProps) => {
  const {
    currentPosition,
    totalDuration,
    manualSeekTo,
    pauseAudio,
    trackColor,
    filledTrackColor,
    knobStyle,
  } = props;

  const sliderActive = useSharedValue(0);

  const sliderMaxWidth = useSharedValue(0);

  const translationX = useSharedValue(0);

  const context = useSharedValue({ x: 0 });

  useAnimatedReaction(
    () => currentPosition.value,
    (next, _prev) => {
      const target =
        totalDuration.value > 0
          ? interpolate(
              next,
              [0, totalDuration.value],
              [0, sliderMaxWidth.value - 16],
              Extrapolation.CLAMP,
            )
          : 0;
      translationX.value = withTiming(target, {
        duration: PROGRESS_TWEEN_DURATION,
        easing: Easing.linear,
      });
    },
    [],
  );

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      runOnJS(pauseAudio)();
      sliderActive.value = withSpring(1, DefaultSpringConfig);
      context.value = { x: translationX.value };
    })
    .onUpdate(event => {
      translationX.value = clamp(
        event.translationX + context.value.x,
        0,
        sliderMaxWidth.value - 16, // because the knob width is 16
      );
    })
    .onEnd(() => {
      const seekToValue = interpolate(
        translationX.value,
        [0, sliderMaxWidth.value - 16],
        [0, totalDuration.value],
        Extrapolation.CLAMP,
      );
      runOnJS(manualSeekTo)(seekToValue);
    })
    .onFinalize(() => (sliderActive.value = withSpring(0, DefaultSpringConfig)));

  const handleLayout = (e: LayoutChangeEvent) =>
    (sliderMaxWidth.value = e.nativeEvent.layout.width);

  const animatedKnobOneStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateX: translationX.value,
        },
      ],
      borderWidth: sliderActive.value ? withSpring(2) : withSpring(0),
    }),
    [],
  );

  const animatedFilledTrack = useAnimatedStyle(() => {
    const maxWidth = sliderMaxWidth.value;
    return {
      width: maxWidth,
      transformOrigin: 'left',
      transform: [{ scaleX: maxWidth > 0 ? (translationX.value + 8) / maxWidth : 0 }],
    };
  });

  return (
    <Animated.View style={tailwind.style('flex flex-row flex-1 mx-1.5')}>
      <Animated.View
        onLayout={handleLayout}
        style={tailwind.style('relative rounded-2xl flex-1 h-1', trackColor)}
      />
      <Animated.View
        style={[tailwind.style('absolute rounded-2xl h-1', filledTrackColor), animatedFilledTrack]}
      />
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            tailwind.style(
              'absolute justify-center items-center h-4 w-4 bg-white rounded-full -bottom-1.5',
              knobStyle,
            ),
            styles.knobShadow,
            animatedKnobOneStyle,
          ]}
        />
      </GestureDetector>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  knobShadow: {
    // box-shadow: 0px 1px 2px 0px #00000026;
    // box-shadow: 0px 0px 1px 0px #00000066;
    // box-shadow: [horizontal offset] [vertical offset] [blur radius] [optional spread radius] [color];
    shadowColor: '#00000066',
    shadowOffset: { width: 0, height: 0.35 },
    shadowRadius: 4,
    shadowOpacity: 0.6,
    elevation: 2,
  },
});
