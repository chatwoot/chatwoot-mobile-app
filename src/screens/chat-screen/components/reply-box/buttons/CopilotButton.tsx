import React, { useEffect } from 'react';
import Animated, {
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { PressableProps } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';

import { Icon } from '@/components-next/common';
import { SparkleIcon, AnimatedSparkleIcon } from '@/svg-icons';
import { useScaleAnimation } from '@/utils';
import { tailwind } from '@/theme';

type CopilotButtonProps = PressableProps & {
  isActive?: boolean;
  isThinking?: boolean;
};

export const CopilotButton = ({ isActive = false, isThinking = false, ...props }: CopilotButtonProps) => {
  const { animatedStyle, handlers } = useScaleAnimation();
  const starPhase = useSharedValue(0);

  useEffect(() => {
    if (isThinking) {
      starPhase.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(0, { duration: 600 }),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(starPhase);
      starPhase.value = 0;
    }
  }, [isThinking, starPhase]);

  const smallStarStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + starPhase.value * 0.7,
    transform: [{ scale: 0.7 + starPhase.value * 0.3 }],
  }));

  const largeStarStyle = useAnimatedStyle(() => ({
    opacity: 1 - starPhase.value * 0.7,
    transform: [{ scale: 1 - starPhase.value * 0.3 }],
  }));

  return (
    <Animated.View
      layout={LinearTransition.springify().damping(20).stiffness(180)}
      style={animatedStyle}>
      <Pressable
        {...props}
        style={({ pressed }) => [tailwind.style(pressed ? 'opacity-70' : '')]}
        {...(props.disabled ? {} : handlers)}>
        <Animated.View
          style={tailwind.style('flex items-center justify-center h-10 w-10 rounded-2xl')}>
          {isThinking ? (
            <AnimatedSparkleIcon
              smallStarStyle={smallStarStyle}
              largeStarStyle={largeStarStyle}
            />
          ) : (
            <Icon icon={<SparkleIcon filled={isActive} />} size={24} />
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};
