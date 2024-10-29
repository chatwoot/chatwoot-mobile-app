import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { useHaptic, useScaleAnimation } from '@/utils';

type FullWidthButtonProps = {
  /**
   * An optional prop to denote if the button is used for a destructive action
   * Depending on this the haptic would change, text color would change
   */
  isDestructive?: boolean;
  /**
   * A required prop to display text in Button
   */
  text: string;
  /**
   * A callback function called onPress of the button
   * @returns void
   */
  handlePress?: () => void;
};

export const FullWidthButton = (props: FullWidthButtonProps) => {
  const { text, isDestructive = false, handlePress } = props;

  const { handlers, animatedStyle } = useScaleAnimation();
  const haptic = useHaptic(isDestructive ? 'medium' : 'selection');

  const handleButtonPressCallback = useCallback(() => {
    haptic?.();
    handlePress?.();
  }, [handlePress, haptic]);

  return (
    <Animated.View style={[tailwind.style('px-4'), animatedStyle]}>
      <Pressable
        onPress={handleButtonPressCallback}
        style={({ pressed }) => [
          tailwind.style(
            'bg-gray-50 py-[11px] flex items-center justify-center rounded-[13px]',
            pressed ? 'bg-gray-100' : '',
          ),
        ]}
        {...handlers}>
        <Animated.Text
          style={[
            tailwind.style(
              'text-base font-inter-medium-24 tracking-[0.16px] leading-[22px]',
              isDestructive ? ' text-tomato-800' : 'text-gray-950',
            ),
          ]}>
          {text}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
};
