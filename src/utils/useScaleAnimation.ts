import { useCallback, useMemo } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
  withTiming,
  WithTimingConfig,
} from 'react-native-reanimated';

type AnimationValue = {
  /**
   * The scale value to which the component should resize onPressIn
   * @default 0.95
   */
  value: number;
};

type SpringAnimation = AnimationValue & {
  /**
   * The animation type
   * @default "spring"
   */
  type: 'spring';
  config: WithSpringConfig;
};

type TimingAnimation = AnimationValue & {
  /**
   * The animation type
   * @default "spring"
   */
  type: 'timing';
  config: WithTimingConfig;
};

type AnimationTypes = SpringAnimation | TimingAnimation;

const DefaultSpringConfig: WithSpringConfig = {
  mass: 1,
  damping: 17,
  stiffness: 250,
  overshootClamping: false,
  restSpeedThreshold: 0.001,
  restDisplacementThreshold: 0.001,
};

const DefaultAnimationType: AnimationTypes = {
  type: 'spring',
  config: DefaultSpringConfig,
  value: 0.96,
};

export const useScaleAnimation = (scaleAnimationConfig: AnimationTypes = DefaultAnimationType) => {
  const scale = useSharedValue(1);
  const { type, config, value } = scaleAnimationConfig;

  const getAnimation = useCallback((animationValue: number) => {
    if (type === 'spring') {
      return withSpring(animationValue, config);
    } else {
      return withTiming(animationValue, config);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPressIn = useCallback(() => {
    scale.value = getAnimation(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPressOut = useCallback(() => {
    scale.value = getAnimation(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const scaleAnimationHandler = useMemo(() => {
    return {
      handlers: { onPressIn, onPressOut },
      animatedStyle,
    };
  }, [animatedStyle, onPressIn, onPressOut]);

  return scaleAnimationHandler;
};
