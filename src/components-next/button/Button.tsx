import { useTailwind } from '@/theme/useTailwind';
import React, { useCallback } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { ThemeTailwind } from '@/theme/useTailwind';
import { useHaptic, useScaleAnimation } from '@/utils';

type ButtonProps = {
  isDestructive?: boolean;
  text: string;
  handlePress?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  isLoading?: boolean;
};

const getButtonStyles = (tailwind: ThemeTailwind, isPrimary: boolean, pressed: boolean) => {
  const baseStyles = 'py-[11px] flex items-center justify-center rounded-[13px]';
  const variantStyles = isPrimary ? 'bg-blue-800' : tailwind.isDark ? 'bg-gray-200' : 'bg-gray-50';
  const pressedStyles = isPrimary ? 'opacity-95' : pressed ? 'bg-gray-100' : '';

  return tailwind.style(baseStyles, variantStyles, pressedStyles);
};

const getTextStyles = (tailwind: ThemeTailwind, isPrimary: boolean, isDestructive: boolean) => {
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
  isLoading = false,
}: ButtonProps) => {
  const tailwind = useTailwind();
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
        accessibilityState={{ disabled, busy: isLoading }}
        style={({ pressed }) => getButtonStyles(tailwind, isPrimary, pressed)}
        {...handlers}>
        <Animated.Text
          style={[
            getTextStyles(tailwind, isPrimary, isDestructive),
            isLoading ? tailwind.style('opacity-0') : null,
          ]}>
          {text}
        </Animated.Text>
        {isLoading ? (
          <ActivityIndicator
            color={tailwind.color(isPrimary ? 'text-white' : 'text-gray-950')}
            style={tailwind.style('absolute inset-0')}
          />
        ) : null}
      </Pressable>
    </Animated.View>
  );
};
