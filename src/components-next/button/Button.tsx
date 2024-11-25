import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { useHaptic, useScaleAnimation } from '@/utils';

type ButtonProps = {
  isDestructive?: boolean;
  text: string;
  handlePress?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

const getButtonStyles = (isPrimary: boolean, pressed: boolean) => {
  const baseStyles = 'py-[11px] flex items-center justify-center rounded-[13px]';
  const variantStyles = isPrimary ? 'bg-blue-800' : 'bg-gray-50';
  const pressedStyles = isPrimary ? 'opacity-95' : pressed ? 'bg-gray-100' : '';

  return tailwind.style(baseStyles, variantStyles, pressedStyles);
};

const getTextStyles = (isPrimary: boolean, isDestructive: boolean) => {
  const baseStyles = 'text-base font-medium tracking-[0.16px] leading-[22px]';
  const colorStyles = isPrimary
    ? isDestructive
      ? 'text-tomato-800'
      : 'text-white'
    : isDestructive
      ? 'text-ruby-800'
      : 'text-gray-950';

  return tailwind.style(baseStyles, colorStyles);
};

export const Button = ({
  text,
  isDestructive = false,
  handlePress,
  variant = 'primary',
  disabled = false,
}: ButtonProps) => {
  const { handlers, animatedStyle } = useScaleAnimation();
  const haptic = useHaptic(isDestructive ? 'medium' : 'selection');

  const handleButtonPress = useCallback(() => {
    if (!disabled) {
      haptic?.();
      handlePress?.();
    }
  }, [disabled, handlePress, haptic]);

  const isPrimary = variant === 'primary';

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handleButtonPress}
        disabled={disabled}
        accessible
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        style={({ pressed }) => getButtonStyles(isPrimary, pressed)}
        {...handlers}>
        <Animated.Text style={getTextStyles(isPrimary, isDestructive)}>{text}</Animated.Text>
      </Pressable>
    </Animated.View>
  );
};
