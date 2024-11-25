import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { useHaptic, useScaleAnimation } from '@/utils';

type ButtonProps = {
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
  /**
   * Variant of the button - primary or secondary
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary';
};

export const Button = (props: ButtonProps) => {
  const { text, isDestructive = false, handlePress, variant = 'primary' } = props;

  const { handlers, animatedStyle } = useScaleAnimation();
  const haptic = useHaptic(isDestructive ? 'medium' : 'selection');

  const handleButtonPressCallback = useCallback(() => {
    haptic?.();
    handlePress?.();
  }, [handlePress, haptic]);

  const isPrimary = variant === 'primary';

  return (
    <Animated.View style={[isPrimary ? null : tailwind.style('px-4'), animatedStyle]}>
      <Pressable
        onPress={handleButtonPressCallback}
        style={({ pressed }) => [
          tailwind.style(
            isPrimary
              ? 'bg-blue-800 py-[11px] flex items-center justify-center rounded-[13px]'
              : 'bg-gray-50 py-[11px] flex items-center justify-center rounded-[13px]',
            isPrimary ? (pressed ? 'bg-blue-800 opacity-95' : '') : pressed ? 'bg-gray-100' : '',
          ),
        ]}
        {...handlers}>
        <Animated.Text
          style={[
            tailwind.style(
              'text-base font-medium tracking-[0.16px] leading-[22px]',
              isPrimary
                ? isDestructive
                  ? 'text-tomato-800'
                  : 'text-white'
                : isDestructive
                  ? 'text-ruby-800'
                  : 'text-gray-950',
            ),
          ]}>
          {text}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
};
