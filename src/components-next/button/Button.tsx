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

type ThemedButtonStyles = ReturnType<typeof useThemedStyles>['btnPrimary'];

const getButtonStyles = (pressed: boolean, disabled: boolean, btnStyles: ThemedButtonStyles) => {
  const baseStyles = tailwind.style('py-[11px] flex items-center justify-center rounded-[13px]');

  if (disabled) {
    return [baseStyles, btnStyles.bgDisabled];
  }

  if (pressed) {
    return [baseStyles, btnStyles.bgPressed];
  }

  return [baseStyles, btnStyles.bg];
};

const getTextStyles = (
  isPrimary: boolean,
  isDestructive: boolean,
  disabled: boolean,
  btnStyles: ThemedButtonStyles,
  destructiveTextStyle: { color: string },
) => {
  const baseStyles = tailwind.style('text-base font-medium tracking-[0.16px] leading-[22px]');

  if (disabled) {
    return [baseStyles, btnStyles.textDisabled];
  }

  if (!isPrimary && isDestructive) {
    return [baseStyles, destructiveTextStyle];
  }

  return [baseStyles, btnStyles.text];
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
  const { btnPrimary, btnSecondary, stateError } = useThemedStyles();

  const handleButtonPress = useCallback(() => {
    if (!disabled) {
      haptic?.();
      handlePress?.();
    }
  }, [disabled, handlePress, haptic]);

  const isPrimary = variant === 'primary';
  const buttonStyles = isPrimary ? btnPrimary : btnSecondary;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handleButtonPress}
        disabled={disabled}
        accessible
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        style={({ pressed }) => getButtonStyles(pressed, disabled, buttonStyles)}
        {...handlers}
      >
        <Animated.Text
          style={getTextStyles(isPrimary, isDestructive, disabled, buttonStyles, stateError)}
        >
          {text}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
};
