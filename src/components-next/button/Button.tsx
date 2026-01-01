import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { tailwind, useThemedStyles } from '@/theme';
import { useHaptic, useScaleAnimation } from '@/utils';

type ButtonProps = {
  isDestructive?: boolean;
  text: string;
  handlePress?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

const getButtonStyles = (
  isPrimary: boolean,
  pressed: boolean,
  disabled: boolean,
  btnStyles: any,
) => {
  const baseStyles = tailwind.style('py-[11px] flex items-center justify-center rounded-[13px]');

  if (isPrimary) {
    if (disabled) {
      return [baseStyles, btnStyles.bgDisabled];
    }
    if (pressed) {
      return [baseStyles, btnStyles.bgPressed];
    }
    return [baseStyles, btnStyles.bg];
  }

  // Secondary button (keep original behavior)
  const bgColor = pressed ? 'bg-oceanCoral-100' : 'bg-oceanCoral-50';
  return tailwind.style('py-[11px] flex items-center justify-center rounded-[13px]', bgColor);
};

const getTextStyles = (
  isPrimary: boolean,
  isDestructive: boolean,
  disabled: boolean,
  btnStyles: any,
) => {
  const baseStyles = tailwind.style('text-base font-medium tracking-[0.16px] leading-[22px]');

  if (isPrimary) {
    if (disabled) {
      return [baseStyles, btnStyles.textDisabled];
    }

    if (isDestructive) {
      return tailwind.style(
        'text-base font-medium tracking-[0.16px] leading-[22px]',
        'text-tomato-800',
      );
    }

    return [baseStyles, btnStyles.text];
  }

  // Secondary button
  if (disabled) {
    return tailwind.style(
      'text-base font-medium tracking-[0.16px] leading-[22px]',
      'text-oceanCoral-600',
    );
  }

  const colorStyles = isDestructive ? 'text-ruby-800' : 'text-text-primary';
  return tailwind.style('text-base font-medium tracking-[0.16px] leading-[22px]', colorStyles);
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
  const { btnPrimary } = useThemedStyles();

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
        style={({ pressed }) => getButtonStyles(isPrimary, pressed, disabled, btnPrimary)}
        {...handlers}
      >
        <Animated.Text style={getTextStyles(isPrimary, isDestructive, disabled, btnPrimary)}>
          {text}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
};
