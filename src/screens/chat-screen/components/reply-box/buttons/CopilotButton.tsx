import React from 'react';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { Pressable, PressableProps } from 'react-native';
import { Icon } from '@/components-next/common';
import { SparkleIcon } from '@/svg-icons';
import { useScaleAnimation } from '@/utils';
import { tailwind } from '@/theme';

type CopilotButtonProps = PressableProps & {
  isActive?: boolean;
};

export const CopilotButton = ({ isActive = false, ...props }: CopilotButtonProps) => {
  const { animatedStyle, handlers } = useScaleAnimation();

  return (
    <Animated.View
      layout={LinearTransition.springify().damping(20).stiffness(180)}
      style={animatedStyle}>
      <Pressable
        {...props}
        style={({ pressed }) => [tailwind.style(pressed ? 'opacity-70' : '')]}
        {...handlers}>
        <Animated.View
          style={tailwind.style('flex items-center justify-center h-10 w-10 rounded-2xl')}>
          <Icon icon={<SparkleIcon filled={isActive} />} size={24} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};
