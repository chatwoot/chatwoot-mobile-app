import React from 'react';
import Animated, { LinearTransition, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { Icon } from '@/components-next/common';
import { AddIcon } from '@/svg-icons';
import { useScaleAnimation } from '@/utils';
import { tailwind } from '@/theme';
import { AddCommandButtonProps } from '../types';

export const AddCommandButton = ({
  derivedAddMenuOptionStateValue,
  ...otherProps
}: AddCommandButtonProps) => {
  const { animatedStyle, handlers } = useScaleAnimation();

  const addIconAnimation = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${interpolate(derivedAddMenuOptionStateValue.value, [0, 1], [0, 45])}deg`,
        },
      ],
    };
  });

  return (
    <Animated.View
      layout={LinearTransition.springify().damping(20).stiffness(180)}
      style={animatedStyle}>
      <Pressable
        {...otherProps}
        style={({ pressed }) => [tailwind.style(pressed ? 'opacity-70' : '')]}
        {...handlers}>
        <Animated.View
          style={[
            tailwind.style('flex items-center justify-center h-10 w-10 rounded-2xl'),
            addIconAnimation,
          ]}>
          <Icon icon={<AddIcon />} size={24} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};
