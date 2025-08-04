import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { useHaptic, useScaleAnimation } from '@/utils';
import { Icon } from '../common';
import { PhoneIcon } from '@/svg-icons';

type ButtonProps = {
  isDestructive?: boolean;
  text: string;
  handlePress?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

const getButtonStyles = (isPrimary: boolean, pressed: boolean) => {
  const baseStyles = 'py-[11px] flex-row items-center justify-center rounded-[13px] gap-4';
  const variantStyles = isPrimary ? 'bg-brand-600' : 'bg-gray-50';
  const pressedStyles = isPrimary ? 'opacity-95' : pressed ? 'bg-gray-100' : '';

  return tailwind.style(baseStyles, variantStyles, pressedStyles);
};

const getTextStyles = (isPrimary: boolean, isDestructive: boolean) => {
  const baseStyles = 'text-base font-medium tracking-[0.16px] leading-[22px]';
  const colorStyles = isPrimary
    ? isDestructive
      ? 'text-tomato-800'
      : 'text-blue-800'
    : isDestructive
      ? 'text-ruby-800'
      : 'text-blue-800';

  return tailwind.style(baseStyles, colorStyles);
};

export const IconButton = ({
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
        <Icon
          icon={<PhoneIcon strokeWidth={2} stroke={tailwind.color('bg-blue-800')} />}
          size={24}
        />
        <Animated.Text style={getTextStyles(isPrimary, isDestructive)}>{text}</Animated.Text>
      </Pressable>
    </Animated.View>
  );
};
