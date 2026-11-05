import { useTailwind } from '@/theme/useTailwind';
import React from 'react';
import Animated, { LinearTransition, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { Icon } from '@/components-next/common';
import { AddIcon } from '@/svg-icons';
import { useScaleAnimation } from '@/utils';
import { AddCommandButtonProps } from '../types';
import { ReplyGlassCircle } from './ReplyGlassCircle';

export const AddCommandButton = ({
  derivedAddMenuOptionStateValue,
  glass = false,
  ...otherProps
}: AddCommandButtonProps) => {
  const tailwind = useTailwind();
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
      layout={LinearTransition.springify().mass(1).damping(15).stiffness(105)}
      style={animatedStyle}>
      <Pressable
        {...otherProps}
        style={({ pressed }) => [tailwind.style(pressed ? 'opacity-70' : '')]}
        {...handlers}>
        {glass ? (
          <ReplyGlassCircle>
            <Animated.View style={addIconAnimation}>
              <Icon icon={<AddIcon stroke={tailwind.color('text-gray-950')} />} size={22} />
            </Animated.View>
          </ReplyGlassCircle>
        ) : (
          <Animated.View
            style={[
              tailwind.style('flex items-center justify-center h-10 w-10 rounded-2xl'),
              addIconAnimation,
            ]}>
            <Icon icon={<AddIcon stroke={tailwind.color('text-gray-950')} />} size={24} />
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
};
