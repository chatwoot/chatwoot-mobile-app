import React, { forwardRef, useCallback } from 'react';
import { Dimensions, Platform, Pressable, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  FadeIn,
  interpolate,
  interpolateColor,
  LinearTransition,
  runOnJS,
  SharedValue,
  SlideInDown,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { useHaptic } from '@/utils';
import { AnimatedNativeView } from '@/components-next/native-components';

const WIDTH = Dimensions.get('screen').width;

const SNAP_POINT = 96;
const FRICTION = 10;
const DRAG_TOSS = 0.05;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const rowCloseSpringConfig = { damping: 30, stiffness: 360, mass: 1 };
const overSwipedSpringConfig = { damping: 20, stiffness: 180 };

export type SwipeableProps = {
  /**
   * The content inside the Swipeable component.
   */
  children: React.ReactNode;
  /**
   * The index of the swipeable component.
   */
  index: number;
  /**
   * A shared value representing the index of the currently opened row,
   * or null if no row is opened.
   * A value to store the swipe state
   */
  openedRowIndex: SharedValue<number | null>;
  /**
   * Callback function invoked when the left element is pressed.
   */
  handleLeftElementPress?: () => void;
  /**
   * Callback function invoked when the right element is pressed.
   */
  handleRightElementPress?: () => void;
  /**
   * Callback function invoked overswiped in left direction.
   */
  handleOnLeftOverswiped?: () => void;
  /**
   * Callback function invoked overswiped in right direction.
   */
  handleOnRightOverswiped?: () => void;
  /**
   * The content of the left swipeable element.
   */
  leftElement?: React.ReactNode;
  /**
   * The content of the right swipeable element.
   */
  rightElement?: React.ReactNode;
  /**
   * Callback function invoked when a long press is detected on the swipeable component.
   */
  handleLongPress?: () => void;
  /**
   * Callback function invoked when a simple press is detected on the swipeable component.
   */
  handlePress: () => void;
  /**
   * Spacing in the left and right
   */
  spacing: number;
  /**
   * A boolean to test if you want to trigger the overswipe callbacks when flicked
   * @defaults to false
   */
  triggerOverswipeOnFlick?: boolean;
  /**
   * No of pointers
   */
  noOfPointers?: number;
  /**
   * Background color for the left swipeable element
   * @default 'bg-blue-800'
   */
  leftElementBgColor?: string;
  /**
   * Background color for the right swipeable element
   * @default 'bg-green-800'
   */
  rightElementBgColor?: string;
};

// eslint-disable-next-line react/display-name
export const Swipeable = forwardRef((props: SwipeableProps, _ref) => {
  const {
    children,
    openedRowIndex,
    index,
    handleLeftElementPress,
    handleOnLeftOverswiped,
    handleRightElementPress,
    handleOnRightOverswiped,
    leftElement,
    rightElement,
    handleLongPress,
    handlePress,
    spacing,
    triggerOverswipeOnFlick = false,
    noOfPointers = 1,
    leftElementBgColor = 'bg-blue-800',
    rightElementBgColor = 'bg-green-800',
  } = props;

  const hapticWarning = useHaptic('success');
  const hapticSelection = useHaptic();

  const animStatePos = useSharedValue(0);
  const isGestureActive = useSharedValue(false);

  const maxTranslation = WIDTH * 0.6;
  const tappedBgStyle = tailwind.color('bg-gray-200') as string;
  const maxSnapPointLeft = -maxTranslation;
  const maxSnapPointRight = maxTranslation;

  const swipingLeft = useDerivedValue(() => animStatePos.value < 0, [animStatePos]);
  const swipingRight = useDerivedValue(() => animStatePos.value > 0, [animStatePos]);

  const percentOpenLeft = useDerivedValue(() => {
    return swipingLeft.value && maxSnapPointLeft
      ? Math.abs(animStatePos.value / maxSnapPointLeft)
      : 0;
  }, [maxSnapPointLeft]);

  const percentOpenRight = useDerivedValue(() => {
    return swipingRight.value && maxSnapPointRight
      ? Math.abs(animStatePos.value / maxSnapPointRight)
      : 0;
  }, [maxSnapPointRight]);

  const startX = useSharedValue(0);
  const dragOverSwiped = useSharedValue(false);

  const overSwipedState = useSharedValue(0);

  const isTapped = useSharedValue(0);

  const hasLeftElement = useDerivedValue(() => leftElement !== undefined);
  const hasRightElement = useDerivedValue(() => rightElement !== undefined);

  const closeRow = () => {
    'worklet';
    animStatePos.value = withSpring(0, rowCloseSpringConfig);
    startX.value = 0;
  };

  const commonOnPressEffect = useCallback(() => {
    closeRow();
    openedRowIndex.value = -1;
    hapticSelection && hapticSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useAnimatedReaction(
    () => openedRowIndex.value,
    (currentValue, previousValue) => {
      if (currentValue !== index && previousValue !== null) {
        closeRow();
      }
    },
    [openedRowIndex.value],
  );

  useAnimatedReaction(
    () => dragOverSwiped.value,
    (currentValue, previousValue) => {
      // Drag has been overswiped and beyond max translation
      if (currentValue !== previousValue && currentValue) {
        hapticWarning && runOnJS(hapticWarning)();
      }
    },
  );

  const longPressGesture = Gesture.LongPress()
    .enabled(handleLongPress !== undefined)
    .minDuration(250)
    .maxDistance(20)
    .onStart(() => handleLongPress && runOnJS(handleLongPress)())
    .onFinalize(() => (isTapped.value = withSpring(0, { damping: 25, stiffness: 120 })));

  const tapGesture = Gesture.Tap()
    .onBegin(() => (isTapped.value = withSpring(1, { damping: 25, stiffness: 120 })))
    .onEnd(() => runOnJS(handlePress)())
    .onFinalize(() => (isTapped.value = withSpring(0, { damping: 25, stiffness: 120 })));

  const panGesture = Gesture.Pan()
    .maxPointers(noOfPointers)
    .activeOffsetX([-20, 20])
    .onBegin(() => {
      dragOverSwiped.value = false;
    })
    .onStart(() => {
      isTapped.value = withSpring(0, { damping: 25, stiffness: 120 });
      startX.value = animStatePos.value;
      isGestureActive.value = true;
      openedRowIndex.value = index;
    })
    .onUpdate(evt => {
      const translationX = (evt.translationX + DRAG_TOSS * evt.velocityX) / 1!;
      const rawVal = translationX + startX.value;
      const clampedVal = interpolate(
        rawVal,
        [-maxTranslation - 1, -maxTranslation, maxTranslation, maxTranslation + 1],
        [-maxTranslation - 0.3, -maxTranslation, maxTranslation, maxTranslation + 0.3],
      );
      // Need to include case where we have to handle the overswipe case
      // Calculate damping based on the distance from the max translation
      const maxStiffness = 200;
      const maxDamping = 18;
      let stiffnessValue = maxStiffness;
      let dampingValue = maxDamping;

      if (Math.abs(clampedVal) > maxTranslation && Math.abs(evt.velocityX) < 500) {
        // We might have to trigger the overswipe action when it is swiped in higher speed
        // Setting a variable to know that its going to an over swiped case
        dragOverSwiped.value = true;
        overSwipedState.value = withSpring(1, overSwipedSpringConfig);
        // Calculate a higher spring config for the rubber band effect
        const distanceBeyondMax = Math.abs(clampedVal) - maxTranslation;
        const springFactor = distanceBeyondMax * FRICTION;

        dampingValue += springFactor;
        stiffnessValue += springFactor;
      } else {
        if (dragOverSwiped.value) {
          overSwipedState.value = withSpring(0, overSwipedSpringConfig, finished => {
            if (finished) {
              dragOverSwiped.value = false;
            }
          });
          stiffnessValue = maxStiffness;
          dampingValue = maxDamping;
        }
      }

      // Clamped Value > 0 - for Left Element
      // Clamped Value < 0 - for Right Element
      if (clampedVal > 0 && hasLeftElement.value) {
        animStatePos.value = withSpring(clampedVal, {
          damping: dampingValue,
          stiffness: stiffnessValue,
        });
      }
      if (clampedVal < 0 && hasRightElement.value) {
        animStatePos.value = withSpring(clampedVal, {
          damping: dampingValue,
          stiffness: stiffnessValue,
        });
      }
    })
    .onEnd(evt => {
      /**
       * The below two conditions takes care of triggering the over swipe
       * when `triggerOverswipeOnFlick` is set to true
       */
      if (hasLeftElement.value && evt.translationX > maxSnapPointRight && triggerOverswipeOnFlick) {
        // The case where you are swiping towards right and the left element is present
        handleOnLeftOverswiped && runOnJS(handleOnLeftOverswiped)();
        if (!dragOverSwiped.value) {
          // trigger haptic in cases where the drag isnt overswiped but is flicked to trigger action
          hapticWarning && runOnJS(hapticWarning)();
        }
        animStatePos.value = withSpring(
          0,
          { ...rowCloseSpringConfig, velocity: evt.velocityX / 15 },
          finished => {
            if (finished) {
              isGestureActive.value = false;
              overSwipedState.value = 0;
              dragOverSwiped.value = false;
            }
          },
        );
        return;
      }
      if (hasRightElement.value && evt.translationX < maxSnapPointLeft && triggerOverswipeOnFlick) {
        // The case where you are swiping towards left and the right element is present
        handleOnRightOverswiped && runOnJS(handleOnRightOverswiped)();
        if (!dragOverSwiped.value) {
          // trigger haptic in cases where the drag isnt overswiped but is flicked to trigger action
          hapticWarning && runOnJS(hapticWarning)();
        }
        animStatePos.value = withSpring(
          0,
          { ...rowCloseSpringConfig, velocity: evt.velocityX / 15 },
          finished => {
            if (finished) {
              isGestureActive.value = false;
              overSwipedState.value = 0;
              dragOverSwiped.value = false;
            }
          },
        );
        return;
      }
      if (dragOverSwiped.value) {
        // Pane is overswiped and the direction is towards right and it has left element
        if (hasLeftElement.value && swipingRight.value) {
          handleOnLeftOverswiped && runOnJS(handleOnLeftOverswiped)();
        }
        // Pane is overswiped and the direction is towards left and it has right element
        if (hasRightElement.value && swipingLeft.value) {
          handleOnRightOverswiped && runOnJS(handleOnRightOverswiped)();
        }
        animStatePos.value = withSpring(
          0,
          { ...rowCloseSpringConfig, velocity: evt.velocityX / 15 },
          finished => {
            if (finished) {
              isGestureActive.value = false;
              overSwipedState.value = 0;
              dragOverSwiped.value = false;
            }
          },
        );
      } else {
        const isLeftOpen = swipingLeft.value;
        const isRightOpen = swipingRight.value;

        /**
         * A case where we need to snap to the closest snap point
         */
        const velocityModifiedPosition = animStatePos.value + evt.velocityX / 8;
        // Conditional Snap points so that we dont open the
        const allSnapPoints = [
          0,
          !hasLeftElement.value ? 0 : isLeftOpen ? 0 : SNAP_POINT,
          !hasRightElement.value ? 0 : isRightOpen ? 0 : -SNAP_POINT,
        ];

        const closestSnapPoint = allSnapPoints.reduce((acc, cur) => {
          const diff = Math.abs(velocityModifiedPosition - cur);
          const prevDiff = Math.abs(velocityModifiedPosition - acc);
          return diff < prevDiff ? cur : acc;
        }, Infinity);

        animStatePos.value = withSpring(
          closestSnapPoint,
          { damping: 30, stiffness: 360, mass: 1 },
          finished => {
            if (finished) {
              isGestureActive.value = false;
            }
          },
        );
      }
    });

  const overlayStyle = useAnimatedStyle(() => {
    const transform = [{ translateX: animStatePos.value }];

    return { transform };
  }, [animStatePos]);

  const leftStyle = useAnimatedStyle(() => {
    const opacity = percentOpenRight.value > 0 ? 1 : 0;
    const zIndex = percentOpenRight.value > 0 ? 10 : 0;

    return { opacity, zIndex };
  });

  const rightStyle = useAnimatedStyle(() => {
    const opacity = percentOpenLeft.value > 0 ? 1 : 0;
    const zIndex = percentOpenLeft.value > 0 ? 10 : 0;

    return { opacity, zIndex };
  });

  const leftTranslation = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: dragOverSwiped.value
            ? interpolate(overSwipedState.value, [0, 1], [0, animStatePos.value - SNAP_POINT])
            : interpolate(
                animStatePos.value,
                [0, SNAP_POINT],
                [-SNAP_POINT, 0],
                Extrapolation.CLAMP,
              ),
        },
      ],
    };
  });

  const rightTranslation = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: dragOverSwiped.value
            ? interpolate(overSwipedState.value, [0, 1], [0, animStatePos.value + SNAP_POINT])
            : interpolate(
                animStatePos.value,
                [0, -SNAP_POINT],
                [SNAP_POINT, 0],
                Extrapolation.CLAMP,
              ),
        },
      ],
    };
  });

  const tappedCellStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(isTapped.value, [0, 1], ['white', tappedBgStyle]),
    };
  });

  const handleOnPressLeft = () => {
    commonOnPressEffect();
    handleLeftElementPress?.();
  };

  const handleOnPressRight = () => {
    commonOnPressEffect();
    handleRightElementPress?.();
  };

  const flingGesture = Gesture.Fling();

  const cellGestures = Gesture.Race(panGesture, tapGesture, longPressGesture, flingGesture);

  return (
    <AnimatedNativeView style={tailwind.style('flex flex-row')}>
      <AnimatedPressable
        onPress={handleOnPressLeft}
        style={[
          StyleSheet.absoluteFillObject,
          tailwind.style('flex justify-center items-start', leftElementBgColor),
          leftStyle,
        ]}>
        <AnimatedNativeView style={[tailwind.style(`pl-[${spacing}px]`), leftTranslation]}>
          {leftElement}
        </AnimatedNativeView>
      </AnimatedPressable>
      <AnimatedPressable
        onPress={handleOnPressRight}
        style={[
          StyleSheet.absoluteFillObject,
          tailwind.style('flex justify-center items-end', rightElementBgColor),
          rightStyle,
        ]}>
        <AnimatedNativeView style={[tailwind.style(`pr-[${spacing}px]`), rightTranslation]}>
          {rightElement}
        </AnimatedNativeView>
      </AnimatedPressable>
      <GestureDetector gesture={cellGestures}>
        <AnimatedNativeView
          entering={
            Platform.OS === 'ios'
              ? SlideInDown.delay(index * 20)
                  .springify()
                  .damping(20)
                  .stiffness(120)
              : FadeIn
          }
          layout={LinearTransition.springify().damping(28).stiffness(200)}
          style={[tailwind.style('flex-1 z-10', `w-[${WIDTH}px]`), overlayStyle, tappedCellStyle]}>
          {children}
        </AnimatedNativeView>
      </GestureDetector>
    </AnimatedNativeView>
  );
});
